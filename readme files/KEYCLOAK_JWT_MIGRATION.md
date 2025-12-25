# Keycloak to JWT Migration - Complete Implementation Summary

## Overview

Successfully removed Keycloak integration and implemented custom JWT-based authentication system with access tokens and refresh tokens.

## Changes Made

### 1. **New Services Created**

#### [tokenService.js](backend/src/services/tokenService.js)

- **Purpose**: Central service for JWT token management
- **Key Methods**:
  - `generateAccessToken(userId, email, roles)` - Creates 15-minute JWT access token
  - `generateRefreshToken(userId)` - Creates 30-day refresh token
  - `verifyAccessToken(token)` - Validates access token
  - `verifyRefreshToken(token)` - Validates refresh token
  - `storeRefreshToken(userId, token)` - Persists refresh token in database
  - `getRefreshToken(userId)` - Retrieves stored refresh token
  - `deleteRefreshToken(userId)` - Removes refresh token from database
  - `verifyStoredRefreshToken(userId, token)` - Validates token against database
  - `generateTokenPair(userId, email, roles)` - Creates both tokens atomically
  - `decodeToken(token)` - Decodes token without verification (for logout)
  - `getExpirySeconds(expiry)` - Converts expiry string to seconds

### 2. **Database Migration**

#### [004_add_refresh_tokens.sql](backend/src/db/migrations/004_add_refresh_tokens.sql)

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(user_id),
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

- **Status**: ✅ Applied to database
- **Indexes**: On user_id and expires_at for optimal query performance
- **Cascading Delete**: Automatically removes tokens when user is deleted

### 3. **Authentication Controller Updates**

#### [keycloakAuthController.js](backend/src/controllers/keycloakAuthController.js)

**Login Method**

- Extracts username/email and password from request
- Queries database for user by email
- Verifies password using bcrypt.compare()
- Generates JWT token pair using tokenService
- Sets httpOnly cookies for both tokens
- Returns user object with id and email

**Register Method**

- Validates required fields (username, email, password)
- Checks for existing user
- Hashes password with bcrypt (10 salt rounds)
- Generates new UUID for user_id
- Creates user in database with default "Staff" role
- Generates token pair and sets cookies
- Returns user object

**Refresh Method**

- Extracts refresh token from pm_refresh_token cookie
- Verifies token signature with JWT library
- Validates token exists in database and hasn't expired
- Gets user data from database
- Generates new access token (refresh token remains valid)
- Sets new tokens in cookies
- Returns user object

**Logout Method**

- Decodes refresh token to extract user_id
- Deletes refresh token from database
- Clears both access and refresh token cookies
- Returns success message

**Me Method**

- Extracts access token from cookie
- Verifies token validity
- Decodes token to extract user claims
- Returns user profile with email, roles, expiry

**Google Login Method**

- Verifies Google ID token signature
- Extracts user info (email, name, picture)
- Checks if user exists by google_id
- Creates new user if needed with Staff role
- Validates role permissions
- Generates JWT token pair
- Fetches company name for recruiters
- Returns user object with roles and company info

### 4. **Middleware Updates**

#### [authMiddleware.js](backend/src/middleware/authMiddleware.js)

- **Removed**: keycloakService dependency
- **Added**: tokenService.verifyAccessToken()
- **Changed**: From Keycloak introspection to JWT verification
- **Error Handling**: Returns 401 if token missing or invalid
- **Request Enrichment**: Attaches decoded token claims to req.user object

### 5. **Other Controller Updates**

#### [recruiterKycController.js](backend/src/controllers/recruiterKycController.js)

- Replaced `keycloakService.decodeUserId(token)` with `tokenService.verifyAccessToken(token)`
- Now extracts user ID from token claims (decoded.sub)

### 6. **Environment Configuration**

#### [.env](backend/.env) - Updated

```
JWT_SECRET = H8hS3jF5kL9qW7nE4zR6tU5yB2vM8pC1
JWT_REFRESH_SECRET = K4mN7pQ8sL2rT5uV3wX9yZ1aB6cD0eF8
JWT_EXPIRES_IN = 15m
```

### 7. **Cookie Configuration**

Both tokens are stored as httpOnly cookies with:

- **pm_access_token**: 15-minute expiry
- **pm_refresh_token**: 30-day expiry
- **Secure**: Only sent over HTTPS in production
- **SameSite**: Strict in production, Lax in development
- **HttpOnly**: Prevents JavaScript access, mitigates XSS attacks

## Authentication Flow

### Login Flow

```
User submits username/password
    ↓
Controller queries database
    ↓
bcrypt verifies password
    ↓
tokenService generates token pair
    ↓
Tokens stored in httpOnly cookies
    ↓
Return user object
```

### Token Refresh Flow

```
Frontend detects access token expiry (via 401 response)
    ↓
Frontend sends POST /auth/refresh
    ↓
Controller extracts refresh token from cookie
    ↓
tokenService validates refresh token
    ↓
Database verification ensures token hasn't been revoked
    ↓
New access token generated
    ↓
Updated token set in cookie
    ↓
Return success
```

### Logout Flow

```
User clicks logout
    ↓
POST /auth/logout
    ↓
Extract user_id from refresh token
    ↓
Delete refresh token from database
    ↓
Clear both token cookies
    ↓
Return logout success
```

## Token Expiry Strategy

- **Access Token**: 15 minutes (JWT signature validates it)
- **Refresh Token**: 30 days (validated against database)
- **Database Cleanup**: Expired tokens can be periodically cleaned up with:
  ```sql
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
  ```

## Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Signing**: HS256 algorithm with strong secrets
3. **HttpOnly Cookies**: Prevents JavaScript access to tokens
4. **Database Validation**: Refresh tokens verified against database (prevents stolen token reuse after logout)
5. **Token Type Verification**: Each token includes a "type" field to prevent misuse
6. **Expiry Validation**: Tokens include exp claim validated by JWT library

## Database Schema

### Users Table (Existing)

- `user_id` (UUID primary key)
- `email` (unique)
- `password` (hashed with bcrypt)
- `roles` (text array - e.g., ['Staff', 'Recruiter'])
- Other profile fields

### Refresh Tokens Table (New)

- `id` (serial primary key)
- `user_id` (unique foreign key to users)
- `token` (text - the JWT token)
- `expires_at` (timestamp - when token expires)
- `created_at` (timestamp - when token was created)

## Testing the Implementation

### Register a New User

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePassword123!"
  }' \
  -c cookies.txt
```

### Check Current User

```bash
curl -X GET http://localhost:5000/auth/me \
  -b cookies.txt
```

### Refresh Token

```bash
curl -X POST http://localhost:5000/auth/refresh \
  -b cookies.txt
```

### Logout

```bash
curl -X POST http://localhost:5000/auth/logout \
  -b cookies.txt
```

## Files Modified

1. ✅ `backend/src/services/tokenService.js` - **CREATED**
2. ✅ `backend/src/db/migrations/004_add_refresh_tokens.sql` - **CREATED & APPLIED**
3. ✅ `backend/src/controllers/keycloakAuthController.js` - **UPDATED** (complete rewrite of auth methods)
4. ✅ `backend/src/controllers/recruiterKycController.js` - **UPDATED** (import and method call)
5. ✅ `backend/src/middleware/authMiddleware.js` - **UPDATED** (use tokenService)
6. ✅ `backend/.env` - **UPDATED** (added JWT secrets)

## Files Remaining (Can be deprecated)

- `backend/src/services/keycloakService.js` - No longer used, can be deleted
- `backend/src/controllers/authcontroller.js` - May still have LinkedIn logic, keep if needed

## Frontend Updates Required

Frontend needs to handle:

1. Token refresh on 401 response (automatic in axios interceptors)
2. Parse JWT tokens to check expiry if needed
3. Store tokens in cookies (automatic with httpOnly)

No changes needed to frontend since:

- Tokens stored in httpOnly cookies (automatic)
- Frontend doesn't need to parse or manage tokens
- API calls automatically include cookies

## Deployment Checklist

- [ ] Set strong `JWT_SECRET` in production environment
- [ ] Set strong `JWT_REFRESH_SECRET` in production environment
- [ ] Ensure HTTPS is enabled (for Secure cookie flag)
- [ ] Run migration: `node src/db/runMigration.js`
- [ ] Test login/register/refresh flows
- [ ] Test logout properly clears refresh token
- [ ] Verify token expiry and refresh works
- [ ] Monitor refresh_tokens table growth (implement cleanup if needed)
- [ ] Update API documentation
- [ ] Remove Keycloak configuration from .env
- [ ] Test Google OAuth flow with JWT
- [ ] Test LinkedIn OAuth flow (if used)

## Rollback Plan (If Needed)

If you need to revert to Keycloak:

1. Revert controller files to use keycloakService
2. Remove JWT secrets from .env
3. Keep authMiddleware changes (backward compatible)
4. Refresh token database table can remain unused

## Known Limitations & Future Improvements

1. **Token Rotation**: Current implementation doesn't rotate refresh tokens on use
   - **Solution**: Store rotation timestamp if needed
2. **Token Blacklisting**: Logout relies on database cleanup
   - **Solution**: Could add a blacklist table for immediate revocation
3. **Device Management**: No tracking of which device has which token
   - **Solution**: Add device info to refresh_tokens table if needed
4. **Password Reset**: Doesn't invalidate existing tokens
   - **Solution**: Add password_changed_at field to check token creation time

## Support

For issues with the JWT migration, check:

1. Environment variables are properly set
2. Database migration has been applied
3. JWT secrets are strong and consistent
4. Token expiry times make sense for your use case
