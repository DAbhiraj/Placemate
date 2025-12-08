# LinkedIn OAuth Setup Instructions

## Backend Environment Variables

Add these to your `backend/.env` file:

```env
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# Existing variables
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

## Frontend Environment Variables

Add these to your `frontend/.env` file:

```env
# LinkedIn OAuth Configuration
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/auth/linkedin/callback

# Existing variables
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:4000/api
```

## How to Get LinkedIn OAuth Credentials

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - App name: Your App Name
   - LinkedIn Page: Select or create a company page
   - Privacy policy URL: Your privacy policy URL
   - App logo: Upload your logo
4. After creating the app, go to the "Auth" tab
5. Under "OAuth 2.0 settings":
   - Add redirect URL: `http://localhost:5173/auth/linkedin/callback`
   - For production: Add your production URL
6. Under "OAuth 2.0 scopes", request:
   - `openid`
   - `profile`
   - `email`
7. Copy your **Client ID** and **Client Secret**

## Database Migration

Run this SQL to add the linkedin_id column to your users table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_id TEXT;
```

Or if you're setting up fresh, the schema is already updated in `schema.sql`.

## Testing

1. Make sure both frontend and backend servers are running
2. Navigate to the login page
3. Click on "Recruiter" card
4. In the modal, click "Sign in with LinkedIn"
5. Complete the LinkedIn OAuth flow
6. You should be redirected to the recruiter dashboard

## Production Deployment

For production, update the redirect URIs in both:

- LinkedIn Developer Console
- Environment variables (frontend and backend)

Example production redirect URI:

```
https://yourdomain.com/auth/linkedin/callback
```
