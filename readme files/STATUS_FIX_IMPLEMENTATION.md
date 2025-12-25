# Status Progression Fix Implementation Guide

## Overview

The status progression system has **4 critical issues** that prevent proper status updates. This guide shows exact code changes needed.

---

## ISSUE #1: Status Not Set on Application Creation

### Problem
When student clicks "Apply", the `status` column in database remains `NULL`.

### Location
File: `backend/src/repo/applicationRepo.js` (Line 9-14)

### Current Code ❌
```javascript
create: async (studentId, jobId, answers, resumeUrl) => {
  const result = await pool.query(
    `INSERT INTO applications (user_id, job_id, answers, resume_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [studentId, jobId, answers, resumeUrl]
  );
  return result.rows[0];
},
```

### Fixed Code ✅
```javascript
create: async (studentId, jobId, answers, resumeUrl) => {
  const result = await pool.query(
    `INSERT INTO applications (user_id, job_id, answers, resume_url, status)
     VALUES ($1, $2, $3, $4, 'applied') RETURNING *`,
    [studentId, jobId, answers, resumeUrl]
  );
  return result.rows[0];
},
```

### Impact
- ✅ When student applies, status becomes `"applied"` in DB
- ✅ Frontend receives `application_status: "applied"` from API
- ✅ StatusBadge displays "Applied" with blue color
- ✅ Stat card "Applied" count increments

---

## ISSUE #2: Status Mismatch - "interview_shortlist" vs "shortlisted"

### Problem
Backend stores `"interview_shortlist"` but frontend expects `"shortlisted"`

### Location
File: `backend/src/controllers/applicationController.js` (Line 130-147)

### Current Code ❌
```javascript
} else if (type === "interview") {
  // CASE 3 & 4: User shortlisted or selected -> show interview dates if upcoming
  query = `SELECT 
    j.job_id               AS job_id,
    ...
    a.status AS application_status
FROM jobs j
INNER JOIN applications a
    ON j.job_id = a.job_id
    AND a.user_id = $1
WHERE
    ($2 = ANY(j.eligible_branches))
    AND (j.min_cgpa <= $3)
    AND (a.status = 'interview_shortlist' OR a.status = 'selected')  // ← Mismatch
    AND j.interview_dates IS NOT NULL
    AND j.interview_dates[1] >= CURRENT_TIMESTAMP
ORDER BY j.interview_dates[1] ASC;`
```

### Fixed Code ✅ (Option A - Recommended)

**Change the query to use consistent naming:**

```javascript
} else if (type === "interview") {
  // CASE 3 & 4: User shortlisted or selected -> show interview dates if upcoming
  query = `SELECT 
    j.job_id               AS job_id,
    ...
    a.status AS application_status
FROM jobs j
INNER JOIN applications a
    ON j.job_id = a.job_id
    AND a.user_id = $1
WHERE
    ($2 = ANY(j.eligible_branches))
    AND (j.min_cgpa <= $3)
    AND (a.status = 'shortlisted' OR a.status = 'selected')  // ✅ Changed
    AND j.interview_dates IS NOT NULL
    AND j.interview_dates[1] >= CURRENT_TIMESTAMP
ORDER BY j.interview_dates[1] ASC;`
```

### Also Update adminRepo.js
**Location:** `backend/src/repo/adminRepo.js` (Line 147)

**Before:**
```javascript
AND (a.status = 'interview_shortlist' OR a.status = 'selected')
```

**After:**
```javascript
AND (a.status = 'shortlisted' OR a.status = 'selected')
```

### Also Update Assessment Query
**Location:** `backend/src/controllers/applicationController.js` (Line 119)

**Before:**
```javascript
} else if (type === "assessment") {
  query = `SELECT ...
  FROM jobs j
  INNER JOIN applications a
  WHERE ...
  AND a.status is NULL  // ← Wrong! Status is NULL now
  AND j.online_assessment_date >= CURRENT_TIMESTAMP`
```

**After:**
```javascript
} else if (type === "assessment") {
  query = `SELECT ...
  FROM jobs j
  INNER JOIN applications a
  WHERE ...
  AND a.status = 'applied'  // ✅ Changed - only show applied candidates
  AND j.online_assessment_date >= CURRENT_TIMESTAMP`
```

### Impact
- ✅ Consistent status names across frontend and backend
- ✅ Admin status updates use standard names
- ✅ Database queries find correct records
- ✅ Frontend filtering/sorting works correctly

---

## ISSUE #3: NULL Status in Assessment Phase Returns Wrong Status

### Problem
Assessment query looks for `a.status IS NULL` but returns the NULL value, frontend then defaults to "not applied"

### Locations
1. **Query in applicationController.js** (Line ~119)
2. **Frontend filtering in Upcoming.jsx** (Line ~337)

### Current Flow ❌
```
Backend Query:   WHERE a.status IS NULL
Backend Return:  a.status AS application_status → NULL
Frontend:        status: job?.application_status ?? "not applied" → "not applied" ❌
```

### Fixed Flow ✅
```
Backend Query:   WHERE a.status = 'applied'
Backend Return:  a.status AS application_status → "applied"
Frontend:        status: job?.application_status ?? "not applied" → "applied" ✅
```

### Code Changes Required
Already included in ISSUE #2 fix above

### Impact
- ✅ Assessment deadlines show with "applied" status (not "not applied")
- ✅ Status progression is visible to student
- ✅ Stat cards count correctly

---

## ISSUE #4: Interview Phase Query Doesn't Handle All Statuses

### Problem
Query only checks for `'interview_shortlist' OR 'selected'` but should be `'shortlisted'`

### Location
File: `backend/src/controllers/applicationController.js` (Line 147)

### Current Code ❌
```javascript
AND (a.status = 'interview_shortlist' OR a.status = 'selected')
```

### Fixed Code ✅
```javascript
AND (a.status = 'shortlisted' OR a.status = 'selected')
```

### Impact
- ✅ Interview queries work after admin marks students as "shortlisted"
- ✅ Students see interview deadlines correctly

---

## Summary Table: All Required Changes

| Issue | File | Line(s) | Change | Priority |
|-------|------|---------|--------|----------|
| #1 | `applicationRepo.js` | 9-14 | Add `status` column and set to `'applied'` on insert | **HIGH** |
| #2a | `applicationController.js` | 119 | Change `a.status IS NULL` to `a.status = 'applied'` | **HIGH** |
| #2b | `applicationController.js` | 147 | Change `'interview_shortlist'` to `'shortlisted'` | **HIGH** |
| #2c | `adminRepo.js` | 147 | Change `'interview_shortlist'` to `'shortlisted'` | **HIGH** |
| #3 | `Upcoming.jsx` (frontend) | All | Status values already correct - no change needed | **OK** |

---

## Expected Behavior After Fixes

### Student Apply Flow
```
1. Student clicks "Apply"
   → Backend: INSERT with status = 'applied'
   → DB: applications.status = 'applied'
   → API Response: application_status = 'applied'
   → Frontend: Shows "Applied" badge (blue)
   → Stat Card: Applied count = 1

2. Student sees Assessment Deadline
   → API Query: WHERE a.status = 'applied'
   → Returns job with status = 'applied'
   → Frontend: Shows "Applied" status for assessment deadline

3. Admin marks Shortlisted
   → Admin: PUT /admin/applications/:id/status
   → Backend: UPDATE applications SET status = 'shortlisted'
   → DB: applications.status = 'shortlisted'
   → Frontend: Shows "Shortlisted" badge (yellow)
   → Stat Card: Shortlisted count = 1

4. Student sees Interview Deadline
   → API Query: WHERE a.status = 'shortlisted'
   → Returns job with status = 'shortlisted'
   → Frontend: Shows "Shortlisted" status for interview

5. Admin marks Selected
   → Backend: UPDATE applications SET status = 'selected'
   → Frontend: Shows "Selected" badge (green)
   → Stat Card: Selected count = 1

6. Admin marks Rejected
   → Backend: UPDATE applications SET status = 'rejected'
   → Frontend: Shows "Rejected" badge (red)
```

---

## Verification Steps

After implementing all fixes, run this test sequence:

### Test 1: Application Creation
```
1. Login as student
2. Go to Jobs page
3. Click "Apply" for a job
4. Verify in DB: SELECT * FROM applications WHERE user_id = 'xxx'
   → status column should be 'applied' (not NULL)
5. Refresh dashboard
6. Verify "Applied" stat card incremented
7. Verify row shows "Applied" status badge
```

### Test 2: Assessment Deadline Visibility
```
1. Same student, assume job has assessment deadline tomorrow
2. Go to Upcoming Deadlines tab
3. Verify deadline shows with "Applied" status (not "Not Applied")
4. Verify deadline is in the list
```

### Test 3: Admin Status Update
```
1. Login as admin
2. Update same application status to "Shortlisted"
3. Verify in DB: SELECT * FROM applications WHERE...
   → status = 'shortlisted'
4. Student refreshes dashboard
5. Verify row now shows "Shortlisted" badge (yellow)
6. Verify "Shortlisted" stat card updated
```

### Test 4: Interview Deadline
```
1. Same application, verify job has interview date tomorrow
2. Student goes to Upcoming Deadlines
3. Verify interview deadline shows in the list
4. Verify status shows "Shortlisted"
```

### Test 5: Selection
```
1. Admin updates application status to "Selected"
2. Verify in DB: status = 'selected'
3. Student dashboard: "Selected" badge (green)
4. Verify "Selected" stat card = 1
```

### Test 6: Rejection
```
1. Admin updates application status to "Rejected"
2. Verify in DB: status = 'rejected'
3. Student dashboard: "Rejected" badge (red)
4. Row still visible in Applications tab
```

---

## Additional Notes

### Status Progression Rules
```
not applied  → (student applies) → applied
applied      → (passes screening) → shortlisted
shortlisted  → (takes interview) → selected OR rejected
```

### NULL Values
- ❌ Never use NULL for status - always set a value
- ✅ Use default values: 'applied', 'shortlisted', etc.

### Database Consistency
- All status values must match between:
  - Database inserts/updates
  - Backend queries (WHERE clauses)
  - Frontend expectations (filter, sort, display)

