# Recruiter KYC Onboarding Flow - Setup Guide

## Overview

Complete recruiter onboarding with KYC verification. After login, recruiters are redirected to KYC form if not verified. Once submitted, they see a pending screen until admin approves. After approval, they access the dashboard.

## Database Changes

Run these SQL migrations:

```sql
-- Add is_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create recruiter_kyc table
CREATE TABLE recruiter_kyc (
    kyc_id SERIAL PRIMARY KEY,
    recruiter_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(255),
    company_address TEXT NOT NULL,
    pan_number VARCHAR(10) NOT NULL UNIQUE,
    pan_document_url TEXT NOT NULL,
    hr_contact_number VARCHAR(20) NOT NULL,
    linkedin_profile_url VARCHAR(500),
    years_of_experience INTEGER,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    approved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Files Created/Updated

### Backend

1. **`backend/src/db/schema.sql`**

   - Added `is_verified` column to users table
   - Added `recruiter_kyc` table

2. **`backend/src/repo/recruiterKycRepo.js`** (NEW)

   - Repository for KYC database operations
   - Methods: createKyc, getKycByRecruiterId, updateKycStatus, etc.

3. **`backend/src/services/recruiterKycService.js`** (NEW)

   - Business logic for KYC operations
   - Validation and data processing

4. **`backend/src/controllers/recruiterKycController.js`** (NEW)

   - HTTP handlers for KYC endpoints
   - Submit, get, approve, reject KYC

5. **`backend/src/controllers/recruiterController.js`** (UPDATED)

   - Added `getRecruiter` method to fetch recruiter status

6. **`backend/src/controllers/uploadController.js`** (NEW)

   - Handles document uploads (PAN documents)

7. **`backend/src/routes.js`** (UPDATED)
   - Added recruiter KYC routes
   - Added upload endpoint

### Frontend

1. **`frontend/src/components/Recruiter/RecruiterKycForm.jsx`** (NEW)

   - KYC form with all required fields
   - File upload for PAN document
   - Form validation and submission
   - Error/success messages

2. **`frontend/src/components/Recruiter/RecruiterVerificationPending.jsx`** (NEW)

   - Pending verification page
   - Auto-checks KYC status every 5 seconds
   - Shows rejection reason if rejected
   - Auto-redirects on approval

3. **`frontend/src/pages/recruiter/RecruiterOnboarding.jsx`** (NEW)

   - Wrapper component for recruiter dashboard
   - Checks `is_verified` status
   - Routes to appropriate component (form, pending, or dashboard)

4. **`frontend/src/App.jsx`** (UPDATED)
   - Changed recruiter dashboard route to use RecruiterOnboarding wrapper

## API Endpoints

### Recruiter KYC Endpoints

**Submit KYC**

```
POST /api/recruiter/:recruiterId/kyc
Body: {
  company_name: string,
  company_website: string (optional),
  company_address: string,
  pan_number: string,
  pan_document_url: string,
  hr_contact_number: string,
  linkedin_profile_url: string (optional),
  years_of_experience: number
}
```

**Get KYC Status**

```
GET /api/recruiter/:recruiterId/kyc
Response: {
  kyc_id, recruiter_id, company_name,
  approval_status (pending/approved/rejected),
  rejection_reason (if rejected)
}
```

**Get Recruiter Info**

```
GET /api/recruiter/:recruiterId
Response: {
  id, name, email, is_verified
}
```

### Admin Endpoints

**Get Pending KYC Submissions**

```
GET /api/admin/recruiter-kyc/pending
```

**Approve KYC**

```
PUT /api/admin/recruiter-kyc/:kycId/approve
Body: { recruiterId: string }
```

**Reject KYC**

```
PUT /api/admin/recruiter-kyc/:kycId/reject
Body: { rejectionReason: string }
```

### Upload Endpoint

**Upload Document**

```
POST /api/upload/document
Content-Type: multipart/form-data
File: form field named 'file'
Response: {
  message, filename, url, mimetype, size
}
```

## User Flow

1. **Recruiter Logs In**

   - Navigates to `/recruiter/dashboard`
   - RecruiterOnboarding wrapper loads

2. **Check Verification Status**

   - If `is_verified === true` → Show Dashboard
   - If KYC submitted with `pending` status → Show Pending Page
   - If KYC submitted with `rejected` status → Show Pending Page with rejection reason
   - If no KYC submitted → Show KYC Form

3. **KYC Form Submission**

   - Recruiter fills form with:
     - Company details
     - PAN number
     - PAN document (upload)
     - HR contact & LinkedIn info
     - Years of experience
   - Form submits to `POST /api/recruiter/:recruiterId/kyc`
   - Shows success message: "Your KYC is under review. Verification usually takes 24 hours"
   - Redirects to pending page

4. **Pending Page**

   - Shows pending status with clock icon
   - Auto-checks KYC status every 5 seconds
   - If approved: Shows success and auto-redirects to dashboard
   - If rejected: Shows rejection reason

5. **Admin Approval**
   - Admin sees pending KYC submissions
   - Reviews PAN document
   - Approves or rejects
   - On approval: `is_verified` is set to true
   - Recruiter sees success and is redirected

## Features

- ✅ Read-only fields for name and email
- ✅ File upload with validation (PDF/Image, max 5MB)
- ✅ Form validation with error messages
- ✅ Unique PAN constraint in database
- ✅ Auto-refresh status every 5 seconds
- ✅ Rejection reason display
- ✅ Professional UI with gradients
- ✅ Loading and error states
- ✅ Prevents dashboard access until verified

## Testing

1. Create a recruiter account via Google/LinkedIn
2. Navigate to `/recruiter/dashboard`
3. Fill and submit KYC form
4. Verify data in `recruiter_kyc` table
5. As admin, approve the KYC
6. Verify `is_verified` becomes true
7. Recruiter auto-redirects to dashboard

## Security Considerations

- PAN document is stored with unique filename and timestamp
- Only recruiter can submit their own KYC
- Admin approval required to access dashboard
- JWT token verification on all protected endpoints
- File upload validation (size, type)
- Input validation on all fields

## Error Handling

- Network errors show user-friendly messages
- Form validation prevents submission of incomplete data
- File upload errors are clearly communicated
- KYC status check failures are gracefully handled
- Auto-retry on pending page

## Production Notes

- Implement email notifications on approval/rejection
- Add document storage to S3/cloud storage instead of local
- Implement rate limiting on file uploads
- Add admin notification system
- Consider document expiry after X years
- Implement audit logging for KYC approvals
