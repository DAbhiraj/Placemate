# Status Flow Diagram: Current vs Fixed

## Current System (BROKEN) ❌

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT APPLIES                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Backend: applicationRepo.create()     │
        │ INSERT applications (               │
        │   user_id, job_id, answers, resume │
        │   ← NO STATUS FIELD!                │
        │ )                                    │
        └──────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │ DATABASE                             │
         │ applications.status = NULL ❌        │
         │ (should be 'applied')               │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend calls API                   │
         │ GET /upcoming-deadlines/:userId     │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Backend Query (Line 119)             │
         │ WHERE a.status IS NULL ❌           │
         │ → Returns status = NULL             │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend Receives                    │
         │ {application_status: null}          │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend Logic (Upcoming.jsx L337)   │
         │ status: job?.application_status     │
         │         ?? "not applied"            │
         │ = "not applied" ❌ WRONG!           │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ DISPLAY TO STUDENT                  │
         │                                     │
         │ Status Badge: [NOT APPLIED] (gray)  │
         │ ✗ Stat Card: Applied count = 0     │
         │                                     │
         │ Expected: "Applied" (blue)          │
         │ Expected: Applied count = 1         │
         └─────────────────────────────────────┘
```

---

## Fixed System (CORRECT) ✅

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT APPLIES                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Backend: applicationRepo.create()     │
        │ INSERT applications (               │
        │   user_id, job_id, answers,         │
        │   resume, status ✅                 │
        │ ) VALUES ($1, $2, $3, $4, 'applied')│
        └──────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │ DATABASE                             │
         │ applications.status = 'applied' ✅  │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend calls API                   │
         │ GET /upcoming-deadlines/:userId     │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Backend Query (Line 119 - FIXED)     │
         │ WHERE a.status = 'applied' ✅       │
         │ → Returns status = 'applied'        │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend Receives                    │
         │ {application_status: "applied"}     │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ Frontend Logic (Upcoming.jsx L337)   │
         │ status: job?.application_status     │
         │         ?? "not applied"            │
         │ = "applied" ✅ CORRECT!             │
         └──────────────────┬──────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────┐
         │ DISPLAY TO STUDENT                  │
         │                                     │
         │ Status Badge: [APPLIED] (blue) ✅   │
         │ ✓ Stat Card: Applied count = 1 ✅  │
         │                                     │
         │ Correct status shown                │
         │ Correct stat updated                │
         └─────────────────────────────────────┘
```

---

## Admin Update Flow: Current vs Fixed

### Current (BROKEN) ❌

```
ADMIN MARKS AS SHORTLISTED
           │
           ▼
    ┌─────────────────────────┐
    │ Backend receives status  │
    │ Request: "shortlisted"   │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ UPDATE applications     │
    │ SET status = "shortlisted"  │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ DATABASE: status OK ✓   │
    │ = "shortlisted"         │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ Frontend fetches again   │
    │ Query interviews:        │
    │ WHERE status =          │
    │   'interview_shortlist' │ ← WRONG NAME!
    │   OR 'selected'         │
    │                         │
    │ Database has:           │
    │   'shortlisted' ✗       │
    │                         │
    │ → NOT FOUND ❌          │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ DISPLAY                 │
    │                         │
    │ Status still shows      │
    │ "Applied" ✗             │
    │ Interview deadlines     │
    │ don't appear ✗          │
    └─────────────────────────┘
```

### Fixed (CORRECT) ✅

```
ADMIN MARKS AS SHORTLISTED
           │
           ▼
    ┌─────────────────────────┐
    │ Backend receives status  │
    │ Request: "shortlisted"   │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ UPDATE applications     │
    │ SET status = "shortlisted"  │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ DATABASE: status OK ✓   │
    │ = "shortlisted"         │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ Frontend fetches again   │
    │ Query interviews:        │
    │ WHERE status =          │
    │   'shortlisted' ✓       │ ← CORRECT!
    │   OR 'selected'         │
    │                         │
    │ Database has:           │
    │   'shortlisted' ✓       │
    │                         │
    │ → FOUND! ✓              │
    └──────────┬──────────────┘
               │
               ▼
    ┌─────────────────────────┐
    │ DISPLAY                 │
    │                         │
    │ Status changes to       │
    │ "Shortlisted" ✓         │
    │ Interview deadlines     │
    │ appear correctly ✓      │
    │ Stat card updates ✓     │
    └─────────────────────────┘
```

---

## Complete Status Progression Timeline

### Current (BROKEN) ❌

```
Timeline            Frontend Shows        Database Value    Problem
─────────────────────────────────────────────────────────────────
1. No application   "Not Applied"        (no record)       ✓ OK

2. Student applies  "Not Applied" ❌     NULL ❌           WRONG!
   
3. Admin: Shorten   "Applied" ❌         "shortlisted" ❌  NAME MISMATCH!
   
4. Student views    Interview date       Returns NULL      WRONG STATUS
   assessment        shows "Not Applied" ❌
   
5. Admin: Interview "Applied" ❌         "interview_       QUERY FAILS
   deadline          (no deadline        shortlist"
                     shown)               ❌

6. Final decision   "Rejected" ✓         "rejected" ✓      OK but after
   (if they get                                            multiple failures
   there)
```

### Fixed (CORRECT) ✅

```
Timeline            Frontend Shows        Database Value    Result
─────────────────────────────────────────────────────────────────
1. No application   "Not Applied"        (no record)       ✓ Correct

2. Student applies  "Applied" ✅         "applied" ✅      ✓ Correct
   
3. Admin: Shorten   "Shortlisted" ✅     "shortlisted" ✅  ✓ Correct
   
4. Student views    Assessment date      "applied" ✅      ✓ Correct
   assessment       shows "Applied" ✅
   
5. Admin: Interview "Shortlisted" ✅     "shortlisted" ✅  ✓ Correct
   deadline        Interview shown ✅
   
6. Final decision   "Selected" ✅        "selected" ✅     ✓ Correct
   or "Rejected" ✅ "rejected" ✅
```

---

## Code Changes Required (Quick Reference)

### Change #1: applicationRepo.js (Line 9-14)
```diff
- INSERT INTO applications (user_id, job_id, answers, resume_url)
- VALUES ($1, $2, $3, $4) RETURNING *
+ INSERT INTO applications (user_id, job_id, answers, resume_url, status)
+ VALUES ($1, $2, $3, $4, 'applied') RETURNING *
```

### Change #2: applicationController.js (Line 119)
```diff
- WHERE ... a.status is NULL
+ WHERE ... a.status = 'applied'
```

### Change #3: applicationController.js (Line 147)
```diff
- AND (a.status = 'interview_shortlist' OR a.status = 'selected')
+ AND (a.status = 'shortlisted' OR a.status = 'selected')
```

### Change #4: adminRepo.js (Line 147)
```diff
- AND (a.status = 'interview_shortlist' OR a.status = 'selected')
+ AND (a.status = 'shortlisted' OR a.status = 'selected')
```

---

## Summary

| Issue | Impact | Fix |
|-------|--------|-----|
| Status not set on create | Applied shows as "Not Applied" | Add `status='applied'` to INSERT |
| Status name mismatch | Admin updates don't show | Change `interview_shortlist` → `shortlisted` |
| Assessment query wrong | Assessment deadlines show as "Not Applied" | Change `a.status IS NULL` → `a.status = 'applied'` |
| Interview query wrong | Interview deadlines not found | Same fix as above |

**All 4 issues have simple, one-line fixes in the backend!**

