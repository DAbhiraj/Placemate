# The "Not Applied" Logic: Your Insight Visualized

## Your Question Visualized

```
WHEN STUDENT HASN'T APPLIED
════════════════════════════════════════════════

applications table:
┌──────────────┬────────┬──────────┐
│ user_id      │ job_id │ status   │
├──────────────┼────────┼──────────┤
│              │        │          │
│   (EMPTY!)   │        │          │ ← NO ROW AT ALL!
│              │        │          │
└──────────────┴────────┴──────────┘

Your Point:
  "How can we check if status = NULL
   when there's no row to check?"

Answer:
  We DON'T check status!
  We check: Does the ROW exist?
  → If NO row exists = "Not Applied" ✓
  → If row exists = "Applied" or later stage ✓
```

---

## The Three Types of Checks

### Check Type 1: "Did student apply at all?"

**What we're checking:**
  Does a row exist for this (student, job) pair?

**How the query works:**
```sql
SELECT j.* FROM jobs j
LEFT JOIN applications a ON j.job_id = a.job_id AND a.user_id = ?
WHERE a.user_id IS NULL  ← NO ROW EXISTS = a.user_id gets NULL
```

**When it returns results:**
  - Jobs where no application row exists
  - Meaning: Student hasn't applied

**Status field involvement:**
  NONE! ← Your key insight!
  (No row = can't check status anyway)

---

### Check Type 2: "What stage is the student in?"

**What we're checking:**
  The status field in the existing row

**How the query works:**
```sql
SELECT j.* FROM jobs j
INNER JOIN applications a ON j.job_id = a.job_id AND a.user_id = ?
WHERE a.status = 'applied'  ← Row exists AND status = 'applied'
```

**When it returns results:**
  - Jobs where row exists with status = 'applied'
  - Meaning: Student applied, waiting for assessment

**Status field involvement:**
  YES! ← This is where status matters!
  (Row exists = we can check status value)

---

### Check Type 3: "Is student shortlisted?"

**What we're checking:**
  The status field has specific value

**How the query works:**
```sql
SELECT j.* FROM jobs j
INNER JOIN applications a ON j.job_id = a.job_id AND a.user_id = ?
WHERE a.status = 'shortlisted'  ← Check specific status value
```

**Status field involvement:**
  CRITICAL! ← Must be set!

---

## The Logical Flow (Your Understanding)

```
┌────────────────────────────────────────────────┐
│ FRONTEND: "Show me jobs student hasn't       │
│           applied to yet"                     │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│ BACKEND QUERY: Find jobs with no              │
│ application row for this student              │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│ SQL: LEFT JOIN applications                  │
│      WHERE a.user_id IS NULL                 │
│                                               │
│ Explanation:                                   │
│ • LEFT JOIN keeps all jobs                    │
│ • If no app row: a.user_id = NULL             │
│ • NULL means: row doesn't exist               │
│ • Row doesn't exist = not applied             │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────┐
│ RESULT: Jobs where (student, job) pair       │
│ doesn't exist in applications table           │
│                                               │
│ = Student hasn't applied ✓                    │
└────────────────────────────────────────────────┘
```

---

## Key Insight: The Two Different NULLs

Your insight reveals we're using NULL in two ways:

### NULL Type 1: Row Doesn't Exist

```
applications table:
┌──────────────┬────────┬──────────┐
│ user_id      │ job_id │ status   │
├──────────────┼────────┼──────────┤
│              │        │          │
│ (no row)     │ (null) │ (null)   │ ← Entire row is missing!
│              │        │          │
└──────────────┴────────┴──────────┘

What a NULL value means here:
  "No row exists"
  (Not just the field is NULL, the whole row is missing)

What we check:
  a.user_id IS NULL  (which means the join found nothing)

What it tells us:
  Student hasn't applied
```

### NULL Type 2: Status Field Not Set

```
applications table:
┌────────────────────┬────────┬──────────┐
│ user_id            │ job_id │ status   │
├────────────────────┼────────┼──────────┤
│ student123         │ 1      │ NULL     │ ← Row EXISTS but status=NULL
└────────────────────┴────────┴──────────┘

What a NULL value means here:
  "Row exists, but status not set"
  (The row is there, just status field is NULL)

What we check:
  a.status IS NULL  (status field is literally NULL)

What it tells us:
  Row exists = student applied
  Status is NULL = status field not set (problem!)
```

---

## The Problem Your Insight Reveals

```
Query Type: "application" (show not applied jobs)
└─ Uses: a.user_id IS NULL
└─ Meaning: Row doesn't exist
└─ Works because: No row = no status field to worry about ✓

Query Type: "assessment" (show assessment deadlines)
└─ Uses: a.status IS NULL
└─ Meaning: Status field is NULL
└─ Works because: Row exists, status happens to be NULL ✓
└─ Problem: Status field is NULL for WRONG reason!
└─ Should be: a.status = 'applied' (explicit)
```

---

## Why Setting Status = 'applied' Still Matters

Even though "not applied" is checked by row existence, not status:

### Current System (Status = NULL when created)

```
Assessment Query:
  WHERE a.status IS NULL
  
This works but confuses:
  - NULL means no status field set? (our intention)
  - Or NULL means something else? (confusing)

Semantically wrong:
  Student DID apply (row exists)
  But we're checking status = NULL
  Like saying: "Applied students have NULL status"
  Which is wrong!
```

### Fixed System (Status = 'applied' when created)

```
Assessment Query:
  WHERE a.status = 'applied'
  
This is clear:
  - 'applied' is explicit status value
  - Row exists with status = 'applied'
  - Student is in "applied" phase waiting for assessment

Semantically correct:
  Student DID apply
  Status = 'applied'
  Waiting for assessment deadline
```

---

## Visual Summary: Where Status Matters

```
ROW EXISTENCE                       STATUS FIELD
(always checked)                    (checked only if row exists)

No Row                              (no field to check)
  ↓                                 
  "Not Applied"                     ∅
  (checked: a.user_id IS NULL)
        
        │
        │ Student applies
        ▼

Row Exists                          status = 'applied'
  ↓                                 ↓
  "Applied"                         "Waiting for Assessment"
  (row exists)                      (status field set)
  
        │
        │ Admin: Shortlisted
        ▼

Row Exists                          status = 'shortlisted'
  ↓                                 ↓
  "In Progress"                     "Shortlisted"
  (row exists)                      (status field set)
  
        │
        │ Admin: Selected/Rejected
        ▼

Row Exists                          status = 'selected'/'rejected'
  ↓                                 ↓
  "Decision Made"                   "Selected/Rejected"
  (row exists)                      (status field set)
```

---

## Your Question Answered Completely

**Question:**
> "As the table is not created, you cannot check if it is not applied or not (NULL value) as there is no table. What do you say?"

**Answer:**

✅ **Correct!** You can't check a status field that doesn't exist.

**But here's the elegant system design:**

1. **"Not Applied" is determined by row non-existence**, not by NULL status
   - Query: `WHERE a.user_id IS NULL` (row join returns nothing)
   - No need to check status field (no row = no field to check)

2. **Once row exists, status field determines the stage**
   - Row exists = student applied
   - Status field = what stage in process

3. **Therefore, setting status = 'applied' makes sense:**
   - Even though "not applied" doesn't rely on status
   - Once student applies, status field should be explicit
   - All subsequent checks (assessment, interview, selection) use status
   - Prevents confusion from NULL values

**Conclusion:**
- Your insight is right: "not applied" uses row existence, not status
- But status field is still needed for subsequent phases
- Setting it on create is good practice for consistency

