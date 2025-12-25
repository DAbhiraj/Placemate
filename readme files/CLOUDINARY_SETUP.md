# Cloudinary Resume Upload Implementation

## Overview

This implementation migrates resume file uploads from local filesystem storage to Cloudinary cloud storage. This provides better scalability, reliability, and eliminates the need to manage local file storage.

## Changes Made

### 1. Package Installation

- Installed `cloudinary` npm package

### 2. New Files Created

#### `backend/src/utils/cloudinary.js`

Cloudinary configuration and utility functions:

- `uploadToCloudinary(fileBuffer, options)` - Upload files to Cloudinary
- `deleteFromCloudinary(publicId)` - Delete files from Cloudinary
- `getCloudinaryUrl(publicId)` - Generate Cloudinary URLs

### 3. Modified Files

#### `backend/src/controllers/uploadController.js`

- Updated `uploadDocument()` to upload files to Cloudinary instead of local filesystem
- Added automatic cleanup of temporary files
- Returns Cloudinary URL and public_id in response

#### `backend/src/services/profileService.js`

- **uploadResume()**: Now uploads resumes to Cloudinary and stores the public_id
- **deleteResume()**: Deletes resumes from Cloudinary using public_id
- **getResumeFile()**: Returns Cloudinary URL instead of local file path

#### `backend/src/controllers/profileController.js`

- **getResume()**: Returns Cloudinary URL as JSON response instead of downloading local file

#### `backend/src/db/schema.sql`

- Added `resume_public_id TEXT` column to Users table

#### `backend/.env`

- Added Cloudinary configuration variables

### 4. Database Migration

Created `backend/src/db/migrations/add_cloudinary_support.sql` to add the new column to existing databases.

## Setup Instructions

### Step 1: Get Cloudinary Credentials

1. Sign up for a free account at [https://cloudinary.com](https://cloudinary.com)
2. Navigate to your Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Configure Environment Variables

Update your `backend/.env` file with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Step 3: Run Database Migration

If you have an existing database, run the migration:

```bash
# Using psql
psql -d your_database_name -f backend/src/db/migrations/add_cloudinary_support.sql

# Or using your preferred PostgreSQL client
# Execute the SQL in: backend/src/db/migrations/add_cloudinary_support.sql
```

### Step 4: Install Dependencies

The cloudinary package has already been installed, but if you're setting up fresh:

```bash
cd backend
npm install
```

### Step 5: Restart Backend Server

```bash
cd backend
npm run dev
```

## File Storage Structure in Cloudinary

Resumes are organized in Cloudinary with the following structure:

- **Folder**: `placemate/resumes/`
- **File naming**: `resume-{userId}-{timestamp}`
- **Format**: PDF (auto-detected)

Documents (other uploads) are stored in:

- **Folder**: `placemate/documents/`

## API Changes

### GET /profile/resume

**Before**: Downloaded file directly
**After**: Returns JSON with Cloudinary URL

```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/...",
    "filename": "resume.pdf",
    "uploadDate": "2025-12-19T..."
  }
}
```

### POST /profile/resume

**Before**: Saved to local `uploads/` folder
**After**: Uploads to Cloudinary and saves URL + public_id

Response includes:

```json
{
  "success": true,
  "resume_url": "https://res.cloudinary.com/...",
  "public_id": "placemate/resumes/resume-123-456789"
}
```

## Benefits

1. **Scalability**: No disk space limitations
2. **Reliability**: Cloudinary handles backup and redundancy
3. **CDN**: Fast global file delivery
4. **Security**: Built-in access control and secure URLs
5. **Maintenance**: No need to manage local file storage

## Rollback Instructions

If you need to rollback to local storage:

1. Revert the changes to:

   - `uploadController.js`
   - `profileService.js`
   - `profileController.js`

2. Remove Cloudinary imports

3. Keep the `resume_public_id` column (it will just be NULL for local files)

## Testing Checklist

- [ ] Upload a resume through the profile page
- [ ] View the resume (should return Cloudinary URL)
- [ ] Delete the resume (should remove from Cloudinary)
- [ ] Upload a document through `/upload/document` endpoint
- [ ] Verify files appear in your Cloudinary dashboard under `placemate/` folder

## Troubleshooting

### Error: "Cloudinary configuration is missing"

- Ensure all three environment variables are set in `.env`
- Restart the backend server after updating `.env`

### Error: "Invalid API key"

- Double-check your Cloudinary credentials
- Ensure there are no extra spaces in the `.env` file

### Uploads fail silently

- Check backend console for error messages
- Verify Cloudinary account is active
- Check file size limits (Cloudinary free tier has limits)

## Support

For Cloudinary-specific issues, refer to:

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Reference](https://cloudinary.com/documentation/node_integration)
