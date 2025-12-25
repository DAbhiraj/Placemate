# Status Progression Flow Analysis & Issues Found

**Date:** December 6, 2025  
**Status:** 🔴 **CRITICAL INCONSISTENCY FOUND**

---

## Current Backend Status Values (Database)

Based on the backend code analysis, these are the **actual status values** stored in the database:

```
Application Status Progression:
NULL → (when student applies) → ?
      → (when passes assessment) → "interview_shortlist"
      → (when interviewed) → "selected" OR "rejected"
```

**Observations from Backend Code:**

1. **Line 147 in applicationController.js:**
   ```javascript
   AND (a.status = 'interview_shortlist' OR a.status = 'selected')
   ```
   This shows the backend recognizes: `interview_shortlist`, `selected`

2. **Line 21 in adminRepo.js:**
   ```javascript
   const result = await pool.query("SELECT COUNT(*) FROM applications WHERE status = 'selected'");
   ```
   This confirms: `selected` is a valid status

3. **Notification Service (notificationService.js):**
   - Handles: `APPLIED`, `SHORTLISTED`, `INTERVIEWED`, `SELECTED`, `REJECTED`
   - But the database uses: `interview_shortlist`, `selected`

---

## 🔴 ISSUE FOUND: Status Value Mismatch

### Frontend Expectations (Upcoming.jsx)

Current frontend expects:
```javascript
"applied"        // When student applies
"shortlisted"    // When passed assessment
"interviewed"    // When in interview round
"selected"       // When selected
"rejected"       // When rejected
"not applied"    // When hasn't applied (synthesized)
```

### Backend Database Reality

Actually stores:
```
NULL or NOT SET              // Initial state (no application)
???                          // After student applies (NO CLEAR STATUS!)
"interview_shortlist"        // After assessment pass
"selected"                   // After final selection
"rejected" (implied)         // After rejection
```

---

## 🔴 CRITICAL PROBLEM #1: Status on First Application

**When a student clicks "Apply":**

1. Frontend calls: `POST /applications/:jobId/apply/:studentId`
2. Backend executes (applicationService.js, line ~30):
   ```javascript
   application = await applicationRepository.create(studentId, jobId, answers, resumeUrl);
   ```

3. Repository (applicationRepo.js, line ~10):
   ```javascript
   INSERT INTO applications (user_id, job_id, answers, resume_url)
   VALUES ($1, $2, $3, $4) RETURNING *
   ```

**ISSUE:** ❌ **No status is SET when creating the application!**
- The `status` column remains `NULL` after creation
- But frontend expects `status: "applied"`

**Should be:**
```javascript
INSERT INTO applications (user_id, job_id, answers, resume_url, status)
VALUES ($1, $2, $3, $4, 'applied') RETURNING *
```

---

## 🔴 CRITICAL PROBLEM #2: Status Mapping Inconsistency

**Backend stores:** `interview_shortlist`  
**Frontend displays:** `shortlisted`

When `getUpcomingDeadline` is called (line 119 in applicationController.js):
```javascript
a.status AS application_status  // Could be "interview_shortlist"
```

But frontend filters for: `shortlisted` (line 337 in Upcoming.jsx)
```javascript
status: job?.application_status ?? "not applied"
```

**When backend returns:** `"interview_shortlist"`  
**Frontend sees:** `"interview_shortlist"` ≠ `"shortlisted"` ❌

---

## 🔴 CRITICAL PROBLEM #3: Status on Assessment Deadline

Line 119 in applicationController.js:
```javascript
WHERE ... a.status is NULL
AND j.online_assessment_date >= CURRENT_TIMESTAMP
```

This query returns applications where **status is NULL**, but the response maps:
```javascript
a.status AS application_status  // Returns NULL
```

Then frontend receives:
```javascript
status: job?.application_status ?? "not applied"  // Falls back to "not applied" ❌
```

**Should show:** `"applied"` (student has applied, waiting for assessment)  
**Actually shows:** `"not applied"` ❌

---

## Summary of All Status Issues

| Issue | Backend | Frontend | Impact |
|-------|---------|----------|--------|
| **After Apply** | NULL (not set) | expects "applied" | ❌ Shows "not applied" |
| **After Assessment** | "interview_shortlist" | expects "shortlisted" | ❌ Mismatch - filter fails |
| **After Interview** | "selected" or ?? | expects "selected"/"rejected" | ⚠️ Selected works, rejected missing |
| **Assessment Phase** | NULL status in query | expects "applied" | ❌ Shows "not applied" |

---

## Recommended Fixes

### Fix #1: Set Status on Application Creation

**File:** `backend/src/repo/applicationRepo.js` (Line ~10)

**Before:**
```javascript
INSERT INTO applications (user_id, job_id, answers, resume_url)
VALUES ($1, $2, $3, $4) RETURNING *
```

**After:**
```javascript
INSERT INTO applications (user_id, job_id, answers, resume_url, status)
VALUES ($1, $2, $3, $4, 'applied') RETURNING *
```

**Also update the update function:**
```javascript
UPDATE applications
SET answers = $1, resume_url = $2, updated_at = NOW()
WHERE appl_id = $3 RETURNING *
```
(No status change needed on update, keep existing)

---

### Fix #2: Normalize Backend Status Values

**Option A: Change backend to use frontend status names** (RECOMMENDED)

Update adminRepo.js and all queries to use:
- `"applied"` instead of NULL
- `"shortlisted"` instead of `"interview_shortlist"`
- `"interviewed"` instead of NULL in interview phase
- `"selected"` ✓ (already correct)
- `"rejected"` ✓ (already correct)

**Option B: Change frontend to match backend status names**

Update Upcoming.jsx to map:
- `"interview_shortlist"` → display as `"shortlisted"`
- Add translation layer

**Recommendation:** Use Option A (standardize backend to use simple status names)

---

### Fix #3: Handle NULL Status in Assessment Phase

**File:** `backend/src/controllers/applicationController.js` (Line ~119)

**Current (Wrong):**
```javascript
a.status AS application_status  // Returns NULL
```

**Fix:**
```javascript
COALESCE(a.status, 'applied') AS application_status  // Returns 'applied' when NULL
```

**Or better:** Change assessment query to:
```javascript
WHERE a.status = 'applied'  // Only show applications with "applied" status
AND j.online_assessment_date >= CURRENT_TIMESTAMP
```

---

### Fix #4: Validate Rejection Status

**File:** `backend/src/controllers/applicationController.js` (Line ~147)

**Current:**
```javascript
AND (a.status = 'interview_shortlist' OR a.status = 'selected')
```

**Should include rejection handling:**
```javascript
AND (a.status = 'shortlisted' OR a.status = 'selected' OR a.status = 'rejected')
```

---

## Correct Status Progression (After Fixes)

```
Timeline                      Status Value (DB)      Frontend Display
────────────────────────────────────────────────────────────────
Student hasn't applied        (no record)            "not applied" (synthesized)
Student applies               "applied"              "applied" ✅
Passes assessment             "shortlisted"          "shortlisted" ✅
Called for interview          "interviewed"          "interviewed" ✅
Selected after interview      "selected"             "selected" ✅
Rejected                      "rejected"             "rejected" ✅
```

---

## Implementation Priority

1. **HIGH:** Fix #1 - Set status to "applied" on application creation
2. **HIGH:** Fix #3 - Handle NULL status in assessment phase query
3. **MEDIUM:** Fix #2 - Standardize backend status names to match frontend
4. **MEDIUM:** Fix #4 - Validate all interview phase statuses

---

## Testing Checklist

After implementing fixes, verify:

- [ ] Student applies → status changes from "not applied" to "applied" in UI
- [ ] Admin marks as shortlisted → status changes to "shortlisted" in UI
- [ ] Admin marks as interviewed → status changes to "interviewed" in UI
- [ ] Admin marks as selected → status changes to "selected" in UI and stat card updates
- [ ] Admin marks as rejected → status changes to "rejected" in UI
- [ ] All status values sync between DB and frontend display
- [ ] StatusBadge colors update correctly for each status
- [ ] Stat cards count reflects correct statuses
- [ ] Status filter dropdown works for all statuses

