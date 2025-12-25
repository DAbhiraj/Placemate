import jwt from "jsonwebtoken";
import crypto from "crypto";
import { query } from "../db/db.js";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key-change-in-production";
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

export const tokenService = {
  /**
   * Generate access token
   */
  generateAccessToken(userId, email, roles) {
    return jwt.sign(
      {
        sub: userId,
        email,
        roles,
        type: "access"
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId) {
    const token = jwt.sign(
      {
        sub: userId,
        type: "refresh"
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    return token;
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired access token");
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch (err) {
      throw new Error("Invalid or expired refresh token");
    }
  },

  /**
   * Store refresh token in database
   */
  async storeRefreshToken(userId, token) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET token = $2, expires_at = $3, created_at = NOW()`,
      [userId, token, expiresAt]
    );
  },

  /**
   * Get refresh token from database
   */
  async getRefreshToken(userId) {
    const result = await query(
      `SELECT token, expires_at FROM refresh_tokens 
       WHERE user_id = $1 AND expires_at > NOW()`,
      [userId]
    );
    return result.rows[0];
  },

  /**
   * Delete refresh token from database
   */
  async deleteRefreshToken(userId) {
    await query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
  },

  /**
   * Verify refresh token against database
   */
  async verifyStoredRefreshToken(userId, token) {
    const stored = await this.getRefreshToken(userId);
    if (!stored || stored.token !== token) {
      throw new Error("Invalid refresh token");
    }
    return true;
  },

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(userId, email, roles) {
    const accessToken = this.generateAccessToken(userId, email, roles);
    const refreshToken = this.generateRefreshToken(userId);
    
    // Store refresh token in database
    await this.storeRefreshToken(userId, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.getExpirySeconds(ACCESS_TOKEN_EXPIRY)
    };
  },

  /**
   * Convert expiry string to seconds
   */
  getExpirySeconds(expiry) {
    if (typeof expiry === 'number') return expiry;
    
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 900; // 15 minutes default
    }
  },

  /**
   * Decode token without verification (for getting user ID from expired token)
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (err) {
      return null;
    }
  }
};
