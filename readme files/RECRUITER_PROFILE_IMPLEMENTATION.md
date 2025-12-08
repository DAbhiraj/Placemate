# Recruiter Profile & Data Persistence Implementation

## Overview

After KYC approval, recruiter details and company information are now stored in localStorage, and a dedicated profile page has been created.

## Changes Made

### 1. **RecruiterVerificationPending.jsx** (UPDATED)

- When KYC approval is detected, all company and recruiter data is stored in localStorage:
  - `company` - Company Name
  - `companyWebsite` - Company Website
  - `companyAddress` - Company Address
  - `panNumber` - PAN Number
  - `hrContactNumber` - HR Contact Number
  - `linkedinProfile` - LinkedIn Profile URL
  - `yearsOfExperience` - Years of Experience

### 2. **RecruiterProfile.jsx** (NEW)

A complete recruiter profile page with:

#### Features:

- **Profile Header** with user avatar, name, email, and recruiter ID
- **Edit Profile Functionality** - Can edit HR contact number and LinkedIn profile
- **Recruiter Details Section**:

  - Years of Experience (read-only)
  - HR Contact Number (editable)
  - LinkedIn Profile URL (editable with link preview)

- **Company Details Section** (read-only):

  - Company Name
  - Company Website (clickable link)
  - Company Address
  - PAN Number

- **Sidebar Widgets**:

  - Account Status (Verified badge)
  - Quick Actions (Navigate to Dashboard/ViewJobs)

- **Logout Functionality** - Clear all localStorage and redirect to login

#### Design:

- Modern gradient background
- Responsive layout (3-column on desktop, 1-column on mobile)
- Icons for each field using lucide-react
- Professional card-based UI
- Color-coded sections (Blue for recruiter, Indigo for company)

### 3. **App.jsx** (UPDATED)

- Added import for RecruiterProfile component
- Added route: `/recruiter/profile` → RecruiterProfile component

## localStorage Keys Reference

After KYC approval, the following keys are populated:

```javascript
// Personal Details (Already existed)
localStorage.getItem("name"); // Recruiter name
localStorage.getItem("email"); // Recruiter email
localStorage.getItem("id"); // Recruiter ID
localStorage.getItem("role"); // 'recruiter'

// Recruiter Details (NEW - populated on approval)
localStorage.getItem("yearsOfExperience"); // e.g., "5"
localStorage.getItem("hrContactNumber"); // e.g., "+919876543210"
localStorage.getItem("linkedinProfile"); // e.g., "https://linkedin.com/in/..."

// Company Details (NEW - populated on approval)
localStorage.getItem("company"); // e.g., "TCS"
localStorage.getItem("companyWebsite"); // e.g., "https://tcs.com"
localStorage.getItem("companyAddress"); // e.g., "123 Main St, City"
localStorage.getItem("panNumber"); // e.g., "AAAPA5055K"
```

## User Flow

1. **Recruiter fills KYC form** → 2-step multi-step form
2. **Submits KYC** → Goes to RecruiterVerificationPending
3. **KYC gets approved by admin** → Data stored in localStorage
4. **Auto-redirects to dashboard** → `/recruiter/dashboard`
5. **Access profile** → Click profile icon or navigate to `/recruiter/profile`
6. **On profile page**:
   - View all personal, recruiter, and company details
   - Edit HR contact number and LinkedIn profile
   - Logout
   - Quick navigate to dashboard or view jobs

## Usage

### Accessing the Profile Page

```javascript
// Navigate to profile
navigate("/recruiter/profile");

// Or direct link
window.location.href = "/recruiter/profile";
```

### Reading Data from localStorage

```javascript
const companyName = localStorage.getItem("company");
const yearsExp = localStorage.getItem("yearsOfExperience");
```

## Security Features

- All sensitive data is stored in localStorage (note: consider moving to sessionStorage for production)
- Edit only allows HR contact and LinkedIn profile changes
- Logout clears all data
- All other fields are read-only
- Profile requires recruitment role to access

## Next Steps

1. **Add profile button to header/navbar** - Link to `/recruiter/profile`
2. **Add profile picture upload** - Store in backend and retrieve
3. **Add activity history** - Show job postings, applications, etc.
4. **Add KYC document download** - Allow recruiter to view/download submitted PAN document
5. **Email notifications** - Send profile update confirmations

## Notes

- Currently localStorage is used for client-side storage
- For production, consider moving sensitive data to sessionStorage
- Implement proper backend session management
- Add field-level edit permissions as needed
