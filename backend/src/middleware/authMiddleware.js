import { tokenService } from "../services/tokenService.js";

const ACCESS_TOKEN_COOKIE = "pm_access_token";

export const requireAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
    if (!accessToken) {
      console.log("No access token found in cookies:", Object.keys(req.cookies));
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify and decode the access token
    const decoded = tokenService.verifyAccessToken(accessToken);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      roles: decoded.roles,
      exp: decoded.exp,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
