import { tokenService } from "../services/tokenService.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { query } from "../db/db.js";

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const ACCESS_TOKEN_COOKIE = "pm_access_token";
const REFRESH_TOKEN_COOKIE = "pm_refresh_token";
const isProdEnv = process.env.NODE_ENV === "production";
const isRender = Boolean(process.env.RENDER || process.env.RENDER_INTERNAL_HOSTNAME);
const cookieOptions = {
  httpOnly: true,
  // Force Secure+SameSite=None on Render/production so cross-site cookies persist
  secure: true,
  sameSite:"none",
  path: "/",
};

const setAuthCookies = (res, tokens) => {
  const { access_token, refresh_token, expires_in } = tokens;
  const maxAgeMs = expires_in ? expires_in * 1000 : 15 * 60 * 1000; // default 15m

  res.cookie(ACCESS_TOKEN_COOKIE, access_token, { ...cookieOptions, maxAge: maxAgeMs });
  if (refresh_token) {
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
      
      // Find user by email or username
      const result = await query(
        "SELECT user_id as id, email, password, roles FROM users WHERE email = $1 OR user_id = $1",
        [username]
      );
      
      const user = result.rows[0];
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log("in login by staff");
      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate tokens
      const tokens = await tokenService.generateTokenPair(user.id, user.email, user.roles);
      setAuthCookies(res, tokens);
      console.log("user done");
      return res.json({ user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error("Login error:", err.message);
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

      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);
      const userId = decoded.sub;

      // Verify token exists in database
      await tokenService.verifyStoredRefreshToken(userId, refreshToken);

      // Get user data
      const result = await query(
        "SELECT user_id as id, email, roles FROM users WHERE user_id = $1",
        [userId]
      );
      
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generate new tokens
      const tokens = await tokenService.generateTokenPair(user.id, user.email, user.roles);
      setAuthCookies(res, tokens);

      console.log("Refresh successful for user:", userId);
      return res.json({ user: { id: user.id } });
    } catch (err) {
      console.error("Refresh error:", err.message);
      return res.status(401).json({ message: "Refresh failed" });
    }
  },

  async logout(req, res) {
    try {
      const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
      if (refreshToken) {
        try {
          const decoded = tokenService.decodeToken(refreshToken);
          if (decoded?.sub) {
            await tokenService.deleteRefreshToken(decoded.sub);
          }
        } catch (err) {
          console.error("Error deleting refresh token:", err.message);
        }
      }
      res.clearCookie(ACCESS_TOKEN_COOKIE, cookieOptions);
      res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
      return res.json({ message: "Logged out" });
    } catch (err) {
      console.error("Logout error:", err.message);
      return res.status(500).json({ message: "Logout failed" });
    }
  },

  async me(req, res) {
    try {
      const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
      if (!accessToken) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const decoded = tokenService.verifyAccessToken(accessToken);
      
      return res.json({
        user: {
          id: decoded.sub,
          email: decoded.email,
          roles: decoded.roles,
          exp: decoded.exp,
        },
      });
    } catch (err) {
      console.error("Me error:", err.message);
      return res.status(401).json({ message: "Not authenticated" });
    }
  },

  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await query(
        "SELECT user_id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate unique user ID
      const userId = crypto.randomUUID();
      
      // Create user in database
      const result = await query(
        `INSERT INTO users (user_id, email, password, roles, first_name, last_name, name, profile_completed)
         VALUES ($1, $2, $3, ARRAY['Staff']::TEXT[], $4, $5, $6, false)
         RETURNING user_id as id, email, roles`,
        [userId, email, hashedPassword, firstName || "", lastName || "", `${firstName || ""} ${lastName || ""}`.trim()]
      );

      const user = result.rows[0];

      // Generate tokens
      const tokens = await tokenService.generateTokenPair(user.id, user.email, user.roles);
      setAuthCookies(res, tokens);

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName,
          lastName,
        },
      });
    } catch (err) {
      console.error("Registration error:", err.message);
      return res.status(400).json({ message: "Registration failed" });
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
      const userRole = role || "Student";

      // Check if user exists in database
      const result = await query(
        "SELECT user_id as id, name, email, roles, google_id, first_name, last_name, profile_completed, branch, cgpa, is_verified FROM users WHERE google_id = $1 OR email = $2",
        [googleId, email]
      );
      let user = result.rows[0];

      let tokens = null;

      if (!user) {
        // New user: create in database
        const userId = crypto.randomUUID();

        const insert = await query(
        `INSERT INTO users (
            user_id, email, roles, google_id, first_name, last_name, name, profile_completed
        )
        VALUES ($1, $2, ARRAY[$3]::TEXT[], $4, $5, $6, $7, false)
        RETURNING user_id as id, email, roles, google_id, first_name, last_name, name, profile_completed, branch, cgpa, is_verified`,
        [userId, email, userRole, googleId, firstName, lastName, fullName]
        );

        user = insert.rows[0];
      } else {
        // Existing user: validate role access
        const userRoles = user.roles || [];
        const canLoginWithRole = userRoles.includes(userRole) ||
                                 (userRole.toLowerCase() === 'student' && userRoles.some(r => r.toLowerCase() === 'student'));

        if (!canLoginWithRole) {
          return res.status(403).json({
            message: `You do not have permission to login as ${userRole}. Please contact admin if you believe this is an error.`
          });
        }
      }

      // Generate JWT tokens
      tokens = await tokenService.generateTokenPair(user.id, user.email, user.roles);
      setAuthCookies(res, tokens);

      // If user is verified recruiter, fetch company data from KYC
      let company = null;
      const userRolesArray = user.roles || [];
      const isRecruiter = userRolesArray.some(r => r.toLowerCase() === 'recruiter');
      if (user.is_verified && isRecruiter) {
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
          role: userRole,
          roles: user.roles || [],
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
