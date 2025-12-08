import axios from "axios";
import jwt from "jsonwebtoken";

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;

const tokenEndpoint = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
const introspectEndpoint = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`;
const logoutEndpoint = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

export const keycloakService = {
  async loginWithPassword(username, password) {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);
    params.append("username", username);
    params.append("password", password);

    const { data } = await axios.post(tokenEndpoint, params);
    return data; // contains access_token, refresh_token, expires_in
  },

  async refreshToken(refreshToken) {
    const params = new URLSearchParams();
    params.append("grant_type", "refresh_token");
    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);

    const { data } = await axios.post(tokenEndpoint, params);
    return data;
  },

  async logout(refreshToken) {
    const params = new URLSearchParams();
    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);
    params.append("refresh_token", refreshToken);
    await axios.post(logoutEndpoint, params);
  },

  async introspect(token) {
    const params = new URLSearchParams();
    params.append("token", token);
    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);

    const { data } = await axios.post(introspectEndpoint, params);
    return data; // { active: boolean, sub, preferred_username, exp, ... }
  },

  decodeUserId(accessToken) {
    try {
      const decoded = jwt.decode(accessToken, { complete: true }) || {};
      return decoded?.payload?.sub || null;
    } catch (err) {
      return null;
    }
  },

  async createUser(username, email, password, firstName = "", lastName = "") {
    console.log("in keycloak service create user1")
    const adminToken = await this.getAdminToken();
    console.log("in keycloak service create user2")
    const usersEndpoint = `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users`;
    console.log("in keycloak service create user3" + usersEndpoint)

    await axios.post(
      usersEndpoint,
      {
        username,
        email,
        firstName,
        lastName,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("got it");
    // After user creation, log them in
    return this.loginWithPassword(username, password);
  },

  async getAdminToken() {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", KEYCLOAK_CLIENT_ID);
    params.append("client_secret", KEYCLOAK_CLIENT_SECRET);

    const { data } = await axios.post(tokenEndpoint, params);
    return data.access_token;
  },

  async findUserByEmail(email) {
    const adminToken = await this.getAdminToken();
    const usersEndpoint = `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users`;
    
    const { data } = await axios.get(usersEndpoint, {
      params: { email, exact: true },
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    
    return data.length > 0 ? data[0] : null;
  },

  async resetUserPassword(userId, newPassword) {
    const adminToken = await this.getAdminToken();
    const passwordEndpoint = `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/reset-password`;
    
    await axios.put(
      passwordEndpoint,
      {
        type: "password",
        value: newPassword,
        temporary: false,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  }
};
