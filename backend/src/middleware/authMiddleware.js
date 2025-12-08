import { keycloakService } from "../services/keycloakService.js";

const ACCESS_TOKEN_COOKIE = "pm_access_token";

export const requireAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies[ACCESS_TOKEN_COOKIE];
    if (!accessToken) {
      console.log("No access token found in cookies:", Object.keys(req.cookies));
      return res.status(401).json({ message: "Not authenticated" });
    }

    const introspection = await keycloakService.introspect(accessToken);
    if (!introspection?.active) {
      console.log("Token inactive, introspection result:", introspection);
      return res.status(401).json({ message: "Token inactive" });
    }

    req.user = {
      id: introspection.sub,
      username: introspection.username || introspection.preferred_username,
      exp: introspection.exp,
    };
    next();
  } catch (err) {
    console.error("Auth middleware error", err?.response?.data || err.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
