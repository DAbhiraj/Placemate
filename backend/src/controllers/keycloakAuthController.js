import { keycloakService } from "../services/keycloakService.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { query } from "../db/db.js";

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const ACCESS_TOKEN_COOKIE = "pm_access_token";
const REFRESH_TOKEN_COOKIE = "pm_refresh_token";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Lax for development
  path: "/",
};

const setAuthCookies = (res, tokens) => {
  const { access_token, refresh_token, expires_in } = tokens;
  const maxAgeMs = expires_in ? expires_in * 1000 : 15 * 60 * 1000; // default 15m

  res.cookie(ACCESS_TOKEN_COOKIE, access_token, { ...cookieOptions, maxAge: maxAgeMs });
  if (refresh_token) {
    // Keycloak default refresh ~30d; set long maxAge
    res.cookie(REFRESH_TOKEN_COOKIE, refresh_token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
};

export const keycloakAuthController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const tokens = await keycloakService.loginWithPassword(username, password);
      setAuthCookies(res, tokens);

      const userId = keycloakService.decodeUserId(tokens.access_token);
      return res.json({ user: { id: userId, username } });
    } catch (err) {
      console.error("Keycloak login error", err?.response?.data || err.message);
      return res.status(401).json({ message: "Invalid credentials" });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
      console.log("Refresh attempt - cookies present:", Object.keys(req.cookies));
      console.log("Refresh token exists:", !!refreshToken);
      
      if (!refreshToken) {
        return res.status(401).json({ message: "Missing refresh token" });
      }
      const tokens = await keycloakService.refreshToken(refreshToken);
      setAuthCookies(res, tokens);
      const userId = keycloakService.decodeUserId(tokens.access_token);
      console.log("Refresh successful for user:", userId);
      return res.json({ user: { id: userId } });
    } catch (err) {
      console.error("Keycloak refresh error", err?.response?.data || err.message);
      return res.status(401).json({ message: "Refresh failed" });
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
      if (refreshToken) {
        await keycloakService.logout(refreshToken);
      }
      res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
      res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
      return res.json({ message: "Logged out" });
    } catch (err) {
      console.error("Keycloak logout error", err?.response?.data || err.message);
      return res.status(500).json({ message: "Logout failed" });
    }
  },

  async me(req, res) {
    try {
      const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
      if (!accessToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const introspection = await keycloakService.introspect(accessToken);
      if (!introspection?.active) {
        return res.status(401).json({ message: "Token inactive" });
      }
      return res.json({
        user: {
          id: introspection.sub,
          username: introspection.username || introspection.preferred_username,
          exp: introspection.exp,
        },
      });
    } catch (err) {
      console.error("Keycloak me error", err?.response?.data || err.message);
      return res.status(401).json({ message: "Not authenticated" });
    }
  },

  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      const tokens = await keycloakService.createUser(username, email, password, firstName, lastName);
      setAuthCookies(res, tokens);

      // Use Keycloak ID as database user_id
      const userId = keycloakService.decodeUserId(tokens.access_token);
      
      // Create user in database with Keycloak ID as user_id
      await query(
        `INSERT INTO users (user_id, email, role, first_name, last_name, profile_completed)
         VALUES ($1, $2, $3, $4, $5, false)
         ON CONFLICT(email) DO NOTHING`,
        [userId, email, "Staff", firstName || "", lastName || ""]
      );

      return res.json({
        user: {
          id: userId,
          username,
          email,
          firstName,
          lastName,
        },
      });
    } catch (err) {
      console.error("Keycloak registration error", err?.response?.data || err.message);
      const status = err?.response?.status || 400;
      const message = err?.response?.data?.errorMessage || "Registration failed";
      return res.status(status).json({ message });
    }
  },
  async googleLogin(req, res) {
    try {
      const { idToken, role } = req.body;
      if (!googleClient) {
        return res.status(500).json({ message: "Google client not configured" });
      }
      if (!idToken) return res.status(400).json({ message: "Missing idToken" });

      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const firstName = payload.given_name || null;
      const lastName = payload.family_name || null;
      const fullName = payload.name || `${firstName || ""} ${lastName || ""}`.trim();
      const userRole = role || "Student"; // Use role from frontend or default to Student

      // Check if user exists in database
      const result = await query(
        "SELECT user_id as id, name, email, role, google_id, first_name, last_name, profile_completed, branch, cgpa, is_verified FROM users WHERE google_id = $1 OR email = $2",
        [googleId, email]
      );
      let user = result.rows[0];

      let tokens = null;
      const googleOAuthPassword = process.env.KEYCLOAK_GOOGLE_OAUTH_PASSWORD || "GoogleOAuth123!";

      if (!user) {
        // New user: create in both Keycloak and database
        const username = email.split("@")[0] + "_" + Date.now();
        
        try {
          tokens = await keycloakService.createUser(username, email, googleOAuthPassword, firstName || "", lastName || "");
        } catch (keycloakErr) {
          console.error("❌ Keycloak user creation failed:", keycloakErr?.response?.data || keycloakErr.message);
          return res.status(500).json({ message: "Failed to create user in Keycloak" });
        }

        // Extract keycloak ID and use it as database user_id
        const userId = keycloakService.decodeUserId(tokens.access_token);

        // Create user in database with Keycloak ID as user_id
        const insert = await query(
        `INSERT INTO users (
            user_id, email, role, google_id, first_name, last_name, name, profile_completed
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, false)
        RETURNING user_id as id, email, role, google_id, first_name, last_name, name, profile_completed, branch, cgpa, is_verified`,
        [userId, email, userRole, googleId, firstName, lastName, fullName]
        );

        user = insert.rows[0];
      } else {
        // Existing user: check if they exist in Keycloak and update role if needed
        try {
          const keycloakUser = await keycloakService.findUserByEmail(email);
          
          if (keycloakUser) {
            // User exists in Keycloak, reset password to known value and login
            await keycloakService.resetUserPassword(keycloakUser.id, googleOAuthPassword);
            tokens = await keycloakService.loginWithPassword(keycloakUser.username, googleOAuthPassword);
          } else {
            // User doesn't exist in Keycloak, create them and update database user_id
            const username = email.split("@")[0] + "_" + user.id;
            tokens = await keycloakService.createUser(username, email, googleOAuthPassword, user.first_name || "", user.last_name || "");
            const keycloakId = keycloakService.decodeUserId(tokens.access_token);
            
            // Update database user_id to Keycloak ID
            await query("UPDATE users SET user_id = $1 WHERE email = $2", [keycloakId, email]);
            user.id = keycloakId;
          }
          
          // Update role if it changed
          if (user.role !== userRole) {
            await query("UPDATE users SET role = $1 WHERE user_id = $2", [userRole, user.id]);
            user.role = userRole;
          }
        } catch (keycloakErr) {
          console.error("❌ Keycloak authentication failed:", keycloakErr?.response?.data || keycloakErr.message);
          return res.status(500).json({ message: "Failed to authenticate with Keycloak" });
        }
      }

      // Set Keycloak tokens in HttpOnly cookies
      setAuthCookies(res, tokens);

      // If user is verified, fetch company data from KYC
      let company = null;
      if (user.is_verified && user.role === 'recruiter') {
        const kycResult = await query(
          "SELECT company_name FROM recruiter_kyc WHERE recruiter_id = $1 ORDER BY created_at DESC LIMIT 1",
          [user.id]
        );
        if (kycResult.rows.length > 0) {
          company = kycResult.rows[0].company_name;
        }
      }

     
      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          profile_completed: user.profile_completed,
          branch: user.branch,
          cgpa: user.cgpa,
          is_verified: user.is_verified,
          company: company
        }
      });
    } catch (error) {
      console.error("❌ Error in googleLogin:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
};
