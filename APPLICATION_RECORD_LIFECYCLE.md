# Application Record Lifecycle: Complete Flow

## Timeline of Database State

```
BEFORE STUDENT APPLIES
════════════════════════════════════════════════════════════════

jobs table:
┌──────┬───────────────┬────────┐
│job_id│ company_name  │ role   │
├──────┼───────────────┼────────┤
│ 1    │ Google        │ SDE    │
│ 2    │ Amazon        │ SDE II │
└──────┴───────────────┴────────┘

applications table:
┌────────┬─────────┬────────┬─────────┐
│appl_id │ user_id │ job_id │ status  │
├────────┼─────────┼────────┼─────────┤
│        │         │        │         │
│        │ (EMPTY) │        │         │
│        │         │        │         │
└────────┴─────────┴────────┴─────────┘

Frontend View:
- All jobs shown as "Not Applied" (synthesized, no DB record)
- Search term: "not applied"
- Stat card: Total = 0, Applied = 0


STUDENT CLICKS "APPLY" on Google SDE
════════════════════════════════════════════════════════════════

Action Triggered:
POST /applications/1/apply/student123
Body: { answers: {...}, resumeUrl: '...' }

Backend:
applicationService.submitOrUpdateApplication(
  studentId: 'student123',
  jobId: 1,
  answers: {...},
  resumeUrl: 'url'
)

Check if exists:
SELECT * FROM applications
WHERE user_id = 'student123' AND job_id = 1
→ NO RESULT (first time)

Execute CREATE:
INSERT INTO applications (user_id, job_id, answers, resume_url, status)
VALUES ('student123', 1, {...}, 'url', 'applied')
↓
NEW ROW CREATED IN DATABASE ✓

jobs table:
(unchanged)

applications table:
┌────────┬──────────────┬────────┬──────────┐
│appl_id │ user_id      │ job_id │ status   │
├────────┼──────────────┼────────┼──────────┤
│ 1      │ student123   │ 1      │ applied  │ ✓ NEW!
└────────┴──────────────┴────────┴──────────┘

Frontend View:
- Google SDE now shows "Applied" status
- No longer shows "Not Applied"
- Stat card: Applied = 1


STUDENT APPLIES TO AMAZON SDE II
════════════════════════════════════════════════════════════════

INSERT INTO applications (...)
VALUES ('student123', 2, {...}, 'url', 'applied')

applications table:
┌────────┬──────────────┬────────┬──────────┐
│appl_id │ user_id      │ job_id │ status   │
├────────┼──────────────┼────────┼──────────┤
│ 1      │ student123   │ 1      │ applied  │
│ 2      │ student123   │ 2      │ applied  │ ✓ NEW!
└────────┴──────────────┴────────┴──────────┘

Frontend View:
- 2 jobs now show "Applied"
- Remaining jobs show "Not Applied"
- Stat card: Applied = 2, Total = 2


ADMIN MARKS GOOGLE SDE AS SHORTLISTED
════════════════════════════════════════════════════════════════

Action:
PUT /admin/applications/1/status
Body: { status: 'shortlisted' }

Backend:
UPDATE applications
SET status = 'shortlisted'
WHERE appl_id = 1

applications table:
┌────────┬──────────────┬────────┬───────────────┐
│appl_id │ user_id      │ job_id │ status        │
├────────┼──────────────┼────────┼───────────────┤
│ 1      │ student123   │ 1      │ shortlisted   │ ✓ UPDATED!
│ 2      │ student123   │ 2      │ applied       │
└────────┴──────────────┴────────┴───────────────┘

Frontend View:
- Google SDE status changed to "Shortlisted" (yellow)
- Amazon SDE status stays "Applied" (blue)
- Stat card: Applied = 1, Shortlisted = 1


STUDENT COMPLETES ASSESSMENT
════════════════════════════════════════════════════════════════

Admin marks as "interviewed":
UPDATE applications SET status = 'interviewed' WHERE appl_id = 1

applications table:
┌────────┬──────────────┬────────┬───────────┐
│appl_id │ user_id      │ job_id │ status    │
├────────┼──────────────┼────────┼───────────┤
│ 1      │ student123   │ 1      │ interviewed │ ✓ UPDATED!
│ 2      │ student123   │ 2      │ applied   │
└────────┴──────────────┴────────┴───────────┘


FINAL DECISION: SELECTED
════════════════════════════════════════════════════════════════

UPDATE applications SET status = 'selected' WHERE appl_id = 1

applications table:
┌────────┬──────────────┬────────┬──────────┐
│appl_id │ user_id      │ job_id │ status   │
├────────┼──────────────┼────────┼──────────┤
│ 1      │ student123   │ 1      │ selected │ ✓ SELECTED!
│ 2      │ student123   │ 2      │ applied  │
└────────┴──────────────┴────────┴──────────┘

Frontend View:
- Google SDE: "Selected" (green) - Congratulations!
- Amazon SDE: "Applied" (blue) - Waiting
- Stat card: Applied = 1, Shortlisted = 0, Interviewed = 0, Selected = 1
```

---

## Query Matching with Record States

### Phase 1: Application (No DB Record Yet)

**User Action:** Student hasn't applied yet

**DB State:**
```
applications table:
(no row for this student-job pair)
```

**Backend Query Type: "application"**
```sql
SELECT j.* FROM jobs j
LEFT JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
WHERE a.user_id IS NULL  -- No application record exists
AND j.application_deadline >= NOW()
```

**Result:** Returns all jobs student hasn't applied to  
**Status Returned:** `NULL AS application_status`  
**Frontend Sees:** `application_status = null` → displays "Not Applied" ✓

---

### Phase 2: Applied (DB Record Created)

**User Action:** Student clicks "Apply"

**DB State:**
```
applications table:
┌──────────────┬────────┬─────────┐
│ user_id      │ job_id │ status  │
├──────────────┼────────┼─────────┤
│ student123   │ 1      │ applied │
└──────────────┴────────┴─────────┘
```

**Backend Query Type: "application" (Still)**
```sql
SELECT j.* FROM jobs j
LEFT JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
WHERE a.user_id IS NULL  -- Still matches jobs without records
```

**Result:** Returns remaining jobs student hasn't applied to  
**Status Returned:** `NULL AS application_status`

---

**Backend Query Type: "assessment"**
```sql
SELECT j.*, a.status FROM jobs j
INNER JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
WHERE a.status = 'applied'  -- Matches our record
AND j.online_assessment_date >= NOW()
```

**Result:** Returns jobs where student applied  
**Status Returned:** `a.status` = `'applied'`  
**Frontend Sees:** `application_status = "applied"` ✓

---

### Phase 3: Shortlisted (After Admin Update)

**Admin Action:** Marks as shortlisted

**DB State:**
```
applications table:
┌──────────────┬────────┬───────────────┐
│ user_id      │ job_id │ status        │
├──────────────┼────────┼───────────────┤
│ student123   │ 1      │ shortlisted   │
└──────────────┴────────┴───────────────┘
```

**Backend Query Type: "interview"**
```sql
SELECT j.*, a.status FROM jobs j
INNER JOIN applications a ON j.job_id = a.job_id AND a.user_id = $1
WHERE a.status = 'shortlisted'  -- Matches our record
AND j.interview_dates IS NOT NULL
AND j.interview_dates[1] >= NOW()
```

**Result:** Returns jobs where student is shortlisted  
**Status Returned:** `a.status` = `'shortlisted'`  
**Frontend Sees:** `application_status = "shortlisted"` ✓

---

### Phase 4: Selected/Rejected (Final Decision)

**Admin Action:** Marks as selected or rejected

**DB State:**
```
applications table:
┌──────────────┬────────┬──────────┐
│ user_id      │ job_id │ status   │
├──────────────┼────────┼──────────┤
│ student123   │ 1      │ selected │
└──────────────┴────────┴──────────┘
```

**Frontend:** Shows selected/rejected badge, updates all stat cards

---

## Key Insight: Your Point is Spot On ✅

```
        Job Posted
            │
            ├─ jobs table: ✓ Row created
            └─ applications table: ✗ NO CHANGE
                                    (empty for this student)
            │
        Student Views Job
            │
            ├─ Frontend: Shows as "Not Applied"
            │  (synthesized, not from DB)
            └─ applications table: ✗ Still empty
                                    (no record created)
            │
        Student APPLIES
            │
            ├─ Form submitted
            ├─ applicationRepository.create() called
            │
            └─ applications table: ✓ ROW CREATED FOR FIRST TIME
                                    (status = 'applied' after fix)
            │
        Admin Updates
            │
            ├─ UPDATE applications SET status = 'shortlisted'
            └─ applications table: ✓ SAME ROW UPDATED
                                    (status changed)
```

**The application record lifecycle is:**
1. Doesn't exist before student applies
2. Created when student submits apply form
3. Updated as admin marks progress (shortlist, interview, selected, rejected)

**Therefore:**
- Status field only matters AFTER application record is created
- Setting it to 'applied' on creation is THE crucial fix
- All subsequent queries and displays depend on this

