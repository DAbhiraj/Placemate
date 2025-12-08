# Job Status Automation Implementation Summary

## Overview

Implemented automatic job status tracking system with 7 predefined stages that update based on SPOC assignments and system events.

## Job Status Flow

### Status Stages (in order):

1. **"in initial stage"** (default) - Job created by recruiter
2. **"in review"** (auto) - SPOC assigned to job
3. **"in negotiation"** (SPOC manual) - Terms being discussed
4. **"applications opened"** (SPOC manual) - Ready for student applications
5. **"ot conducted"** (system auto) - OT date has passed
6. **"interview"** (system auto) - Interview date has passed
7. **"completed the drive"** (system auto) - All interviews completed

## Implementation Details

### Backend Changes

#### 1. Database (`schema.sql`)

- ✅ Added `job_status VARCHAR(100) DEFAULT 'in initial stage'` to jobs table

#### 2. SPOC Repository (`spocRepo.js`)

- ✅ Updated `assignJobToSpoc()` to:
  - Change job status to 'in review' automatically
  - Send notification to recruiter about SPOC assignment
  - Send notification to SPOC about new job assignment
  - Use transaction for data integrity
- ✅ Added `updateJobStatus()` - SPOC can update to 'in negotiation' or 'applications opened'
- ✅ Added `getJobsForAutoUpdate()` - Fetch jobs that need auto-updates
- ✅ Added `autoUpdateJobStatus()` - System updates based on dates
- ✅ Updated `getAssignedJobsBySpocId()` to include `job_status` field

#### 3. SPOC Service (`spocService.js`)

- ✅ Updated job formatting to include `job_status` field
- ✅ Added `updateJobStatus()` - Validates and processes SPOC status updates
- ✅ Added `autoUpdateJobStatuses()` - Daily automated status updates:
  - **'applications opened' → 'ot conducted'** when OT date passes
  - **'ot conducted' → 'interview'** when first interview date passes
  - **'interview' → 'completed the drive'** when all interview dates pass

#### 4. SPOC Controller (`spocController.js`)

- ✅ Added `updateJobStatus()` endpoint - Handle SPOC manual updates
- ✅ Added `autoUpdateJobStatuses()` endpoint - Manual trigger for auto-updates

#### 5. Routes (`routes.js`)

- ✅ Added `PUT /spoc/:spocId/jobs/:jobId/job-status` - SPOC status update
- ✅ Added `POST /system/auto-update-job-statuses` - System auto-update trigger

#### 6. Job Status Scheduler (`utils/jobStatusScheduler.js`)

- ✅ Created cron job scheduler
- ✅ Runs daily at midnight (00:00)
- ✅ Runs every 6 hours for frequent updates
- ✅ Automatically updates job statuses based on dates

#### 7. Server (`server.js`)

- ✅ Integrated job status scheduler on server startup

#### 8. Recruiter Repository (`recruiterRepo.js`)

- ✅ Updated `createJob()` to accept and insert `job_status` parameter

#### 9. Recruiter Service (`recruiterService.js`)

- ✅ Updated `createJob()` to include `job_status` in job data extraction

### Frontend Changes

#### 1. Recruiter - CreateJob (`CreateJob.jsx`)

- ✅ Added `JOB_STATUSES` constant with 7 predefined stages
- ✅ Updated form state to include `jobStatus: 'in initial stage'`
- ✅ Added job status dropdown field in form
- ✅ Updated payload to include `job_status`
- ✅ Updated form reset to include jobStatus

#### 2. Recruiter - ViewJobs (`ViewJobs.jsx`)

- ✅ Added `getJobStatusColor()` helper function with color mapping:
  - in initial stage: gray
  - in review: blue
  - in negotiation: orange
  - applications opened: green
  - ot conducted: purple
  - interview: red
  - completed the drive: emerald
- ✅ Updated job mapping to include `jobStatus` field
- ✅ Added job status badge display in job cards
- ✅ Updated edit handler to include `jobStatus` in jobData

#### 3. SPOC - SpocAssignedJobs (`SpocAssignedJobs.jsx`)

- ✅ Added `handleJobStatusUpdate()` function for SPOC manual updates
- ✅ Added `getJobStatusColor()` function (same color scheme)
- ✅ Updated job card to display job status badge
- ✅ Added job status update dropdown (visible when status is 'in review' or 'in negotiation')
- ✅ SPOC can only update to: 'in negotiation' or 'applications opened'
- ✅ Added helpful hints for when to update status

## Required Package Installation

**IMPORTANT**: Install `node-cron` package for scheduler:

```bash
cd backend
npm install node-cron
```

## API Endpoints

### New Endpoints:

1. **PUT** `/api/spoc/:spocId/jobs/:jobId/job-status`

   - Body: `{ "job_status": "in negotiation" }`
   - SPOC manual update (only 'in negotiation' or 'applications opened')

2. **POST** `/api/system/auto-update-job-statuses`
   - No body required
   - Manually trigger auto-update (also runs automatically via cron)

## Notifications

### Auto-generated notifications:

1. **On SPOC Assignment**:
   - Recruiter: "A SPOC has been assigned to your job posting: {role}. Status updated to 'In Review'."
   - SPOC: "You have been assigned to job: {role} at {company}."

## Testing Checklist

- [ ] Install node-cron: `npm install node-cron`
- [ ] Restart backend server
- [ ] Create new job as recruiter (should default to 'in initial stage')
- [ ] Admin assigns SPOC to job (should auto-change to 'in review')
- [ ] Check notifications sent to recruiter and SPOC
- [ ] SPOC updates status to 'in negotiation'
- [ ] SPOC updates status to 'applications opened'
- [ ] Verify SPOC cannot update to other statuses (should show error)
- [ ] Wait for OT date to pass OR manually call `/api/system/auto-update-job-statuses`
- [ ] Verify status changes to 'ot conducted'
- [ ] Wait for interview date to pass OR manually trigger update
- [ ] Verify status changes to 'interview'
- [ ] Wait for all interview dates to pass OR manually trigger
- [ ] Verify status changes to 'completed the drive'
- [ ] Check color coding on both recruiter and SPOC pages

## Color Coding Reference

| Status              | Color   | Badge Class                       |
| ------------------- | ------- | --------------------------------- |
| in initial stage    | Gray    | `bg-gray-100 text-gray-700`       |
| in review           | Blue    | `bg-blue-100 text-blue-700`       |
| in negotiation      | Orange  | `bg-orange-100 text-orange-700`   |
| applications opened | Green   | `bg-green-100 text-green-700`     |
| ot conducted        | Purple  | `bg-purple-100 text-purple-700`   |
| interview           | Red     | `bg-red-100 text-red-700`         |
| completed the drive | Emerald | `bg-emerald-100 text-emerald-700` |

## Automatic Update Logic

### Daily Cron Job (00:00 and every 6 hours):

```javascript
// 1. OT Completion Check
if (job_status === 'applications opened' && today > online_assessment_date) {
  → Update to 'ot conducted'
}

// 2. Interview Started Check
if (job_status === 'ot conducted' && today > any_interview_date) {
  → Update to 'interview'
}

// 3. Drive Completion Check
if (job_status === 'interview' && today > all_interview_dates) {
  → Update to 'completed the drive'
}
```

## Files Modified

### Backend:

1. `backend/src/db/schema.sql`
2. `backend/src/repo/spocRepo.js`
3. `backend/src/repo/recruiterRepo.js`
4. `backend/src/services/spocService.js`
5. `backend/src/services/recruiterService.js`
6. `backend/src/controllers/spocController.js`
7. `backend/src/routes.js`
8. `backend/src/server.js`
9. `backend/src/utils/jobStatusScheduler.js` (NEW)

### Frontend:

1. `frontend/src/pages/recruiter/CreateJob.jsx`
2. `frontend/src/pages/recruiter/ViewJobs.jsx`
3. `frontend/src/pages/spoc/SpocAssignedJobs.jsx`

## Next Steps

1. Install `node-cron` package in backend
2. Restart backend server to initialize scheduler
3. Test complete flow from job creation to completion
4. Monitor cron job logs for auto-updates
5. Consider adding email notifications for status changes (future enhancement)
