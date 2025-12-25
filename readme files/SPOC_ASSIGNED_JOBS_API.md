# SPOC Assigned Jobs API Implementation

## Overview
Created a complete API system to fetch and manage jobs assigned to SPOCs (Single Point of Contact) in the placement management system.

## Database Changes

### New Table: `spoc_job_assignments`
```sql
CREATE TABLE spoc_job_assignments (
    assignment_id SERIAL PRIMARY KEY,
    spoc_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(job_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'In Discussion',
    message_count INTEGER DEFAULT 0,
    has_changes BOOLEAN DEFAULT false,
    UNIQUE(spoc_id, job_id)
);
```

**Run this migration to create the table in your database.**

## Backend Implementation

### 1. Repository Layer (`backend/src/repo/spocRepo.js`)
- `getAssignedJobsBySpocId(spocId)` - Fetch all jobs assigned to a SPOC
- `assignJobToSpoc(spocId, jobId)` - Assign a job to a SPOC
- `updateAssignmentStatus(spocId, jobId, status)` - Update job status
- `updateMessageCount(spocId, jobId, count)` - Update message count
- `updateHasChanges(spocId, jobId, hasChanges)` - Toggle changes flag
- `removeAssignment(spocId, jobId)` - Remove assignment

### 2. Service Layer (`backend/src/services/spocService.js`)
Handles business logic and data formatting:
- Formats PostgreSQL arrays (location, branches, interview dates)
- Converts dates to ISO format
- Maps database fields to frontend-friendly names

### 3. Controller Layer (`backend/src/controllers/spocController.js`)
HTTP request handlers for all SPOC operations

### 4. Routes (`backend/src/routes.js`)
```javascript
// Get assigned jobs
GET /spoc/:spocId/assigned-jobs

// Assign a job (Admin)
POST /spoc/assign-job
Body: { spocId, jobId }

// Update status
PUT /spoc/:spocId/jobs/:jobId/status
Body: { status: "In Discussion" | "Awaiting Review" | "Finalized" }

// Update message count
PUT /spoc/:spocId/jobs/:jobId/messages
Body: { count: number }

// Update changes flag
PUT /spoc/:spocId/jobs/:jobId/changes
Body: { hasChanges: boolean }

// Remove assignment
DELETE /spoc/:spocId/jobs/:jobId
```

## Frontend Implementation

### Updated Component: `frontend/src/pages/spoc/SpocAssignedJobs.jsx`

**Features:**
- Fetches assigned jobs from the API on component mount
- Loading and error states
- Real-time status updates when clicking "Finalize" button
- Gets SPOC user ID from localStorage

**Key Functions:**
- `fetchAssignedJobs()` - Loads jobs from API
- `handleStatusUpdate(jobId, newStatus)` - Updates job status

## Usage

### For SPOC Users:
1. The component automatically fetches jobs assigned to the logged-in SPOC
2. View all assigned jobs with details (company, location, salary, deadlines, etc.)
3. Click "Finalize" to mark a job as finalized
4. Click "Negotiate" to open messaging (to be implemented)

### For Admins (to assign jobs):
```javascript
// Example API call to assign a job
await axios.post(`${API_URL}/spoc/assign-job`, {
  spocId: "spoc-user-id",
  jobId: 123
});
```

## Testing the Implementation

### 1. Create the Database Table
Run the SQL migration in your PostgreSQL database.

### 2. Insert Test Data
```sql
-- Insert a test assignment
INSERT INTO spoc_job_assignments (spoc_id, job_id, status, message_count, has_changes)
VALUES ('your-spoc-user-id', 1, 'In Discussion', 3, false);
```

### 3. Test the Frontend
1. Set a SPOC user ID in localStorage: `localStorage.setItem("userId", "your-spoc-user-id")`
2. Navigate to `/spoc/assignedjobs`
3. Jobs should load automatically

## Data Flow

```
Frontend (SpocAssignedJobs.jsx)
    ↓
API Call: GET /spoc/:spocId/assigned-jobs
    ↓
Routes (routes.js)
    ↓
Controller (spocController.js)
    ↓
Service (spocService.js)
    ↓
Repository (spocRepo.js)
    ↓
Database (PostgreSQL)
```

## Environment Variables
Ensure `VITE_API_URL` is set in your frontend `.env` file:
```
VITE_API_URL=http://localhost:3000
```

## Notes
- User ID is currently retrieved from localStorage with a fallback to "spoc-1" for testing
- Consider implementing proper authentication middleware
- The "Negotiate" button functionality needs to be connected to the messaging system
- Add proper error handling and user feedback for all operations
