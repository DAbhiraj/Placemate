# Quick Start: Cloudinary Resume Uploads

## What Changed?

Your backend now uploads all resume files to Cloudinary cloud storage instead of storing them locally.

## What You Need To Do:

### 1. Get Cloudinary Account (Free)

Sign up at: https://cloudinary.com/users/register_free

### 2. Add Your Credentials

Open `backend/.env` and replace these values:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Find these on your Cloudinary Dashboard after signing up.

### 3. Update Database

Run this SQL command on your database:

```sql
ALTER TABLE Users ADD COLUMN IF NOT EXISTS resume_public_id TEXT;
```

Or run: `backend/src/db/migrations/add_cloudinary_support.sql`

### 4. Restart Backend

```bash
cd backend
npm run dev
```

## That's It!

Your resume uploads will now automatically go to Cloudinary.

For detailed documentation, see: `CLOUDINARY_SETUP.md`
