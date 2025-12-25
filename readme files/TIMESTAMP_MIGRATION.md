# Database Migration: DATE to TIMESTAMP for Application Deadlines

## Overview

Changed `application_deadline` and `online_assessment_date` columns from `DATE` to `TIMESTAMP` to support time-specific deadlines.

## Changes Made

### 1. Database Schema (`backend/src/db/schema.sql`)

- ✅ Updated `application_deadline DATE` → `application_deadline TIMESTAMP`
- ✅ Updated `online_assessment_date DATE` → `online_assessment_date TIMESTAMP`

### 2. Migration File (`backend/src/db/migrations/003_change_date_to_timestamp.sql`)

Created a migration script that:

- Converts existing DATE columns to TIMESTAMP
- Preserves existing data (DATE values become TIMESTAMP at midnight)
- Adds column comments for documentation

### 3. Backend Code Updates (`backend/src/repo/recruiterRepo.js`)

- ✅ Added `formatDateTime()` function to format timestamps with time
- ✅ Updated job retrieval to use `formatDateTime()` for deadline fields
- ✅ Existing date handling logic remains compatible

## How to Run the Migration

### Option 1: Using the Migration Runner (Recommended)

```bash
cd backend
node src/db/runMigration.js
```

### Option 2: Using psql directly

```bash
psql -U your_username -d your_database -f backend/src/db/migrations/003_change_date_to_timestamp.sql
```

### Option 3: Using Docker

```bash
docker exec -i your_postgres_container psql -U your_username -d your_database < backend/src/db/migrations/003_change_date_to_timestamp.sql
```

## Data Format Changes

### Before (DATE)

```javascript
application_deadline: "2024-12-31";
online_assessment_date: "2024-12-25";
```

### After (TIMESTAMP)

```javascript
// Input format (ISO 8601)
application_deadline: "2024-12-31T23:59:00";
online_assessment_date: "2024-12-25T14:30:00";

// Output format (formatted)
application_deadline: "31/12/2024, 23:59";
online_assessment_date: "25/12/2024, 14:30";
```

## Frontend Considerations

The frontend code already uses `new Date()` for parsing, which will work seamlessly with TIMESTAMP values.

### Existing Code (No Changes Needed)

```javascript
// This will work with both DATE and TIMESTAMP
const deadline = new Date(job.application_deadline).getTime();
const oa = new Date(job.online_assessment_date).getTime();
```

### Input Fields (Update Recommended)

Change from:

```html
<input type="date" name="application_deadline" />
```

To:

```html
<input type="datetime-local" name="application_deadline" />
```

## Backward Compatibility

✅ **Fully backward compatible:**

- Existing DATE values are automatically converted to TIMESTAMP (at midnight 00:00:00)
- The application will continue to work with or without the migration
- Date-only values can still be inserted (will default to midnight)

## Testing Checklist

- [ ] Run migration successfully
- [ ] Verify column types changed to TIMESTAMP
- [ ] Test job creation with new datetime format
- [ ] Test job retrieval shows time correctly
- [ ] Test frontend date/time pickers
- [ ] Verify existing jobs display correctly
- [ ] Test application deadline comparisons

## Example Usage

### Creating a Job with Time

```javascript
const jobData = {
  company_name: "Tech Corp",
  role: "Software Engineer",
  application_deadline: "2024-12-31T23:59:00", // 11:59 PM on Dec 31
  online_assessment_date: "2025-01-05T14:00:00", // 2:00 PM on Jan 5
  // ... other fields
};
```

### Querying Jobs with Time Conditions

```sql
-- Jobs with deadline after current timestamp
SELECT * FROM jobs
WHERE application_deadline > CURRENT_TIMESTAMP;

-- Jobs with OA today
SELECT * FROM jobs
WHERE DATE(online_assessment_date) = CURRENT_DATE;

-- Jobs with deadline in next 24 hours
SELECT * FROM jobs
WHERE application_deadline BETWEEN CURRENT_TIMESTAMP
  AND CURRENT_TIMESTAMP + INTERVAL '24 hours';
```

## Rollback (If Needed)

If you need to revert:

```sql
ALTER TABLE jobs
ALTER COLUMN application_deadline TYPE DATE USING application_deadline::DATE;

ALTER TABLE jobs
ALTER COLUMN online_assessment_date TYPE DATE USING online_assessment_date::DATE;
```

⚠️ **Warning:** Rolling back will lose time information!

## Next Steps

1. ✅ Run the migration
2. Update frontend forms to use `datetime-local` input type
3. Update any hardcoded date comparisons to consider time
4. Test the changes in development
5. Deploy to production with migration

## Files Modified

- `backend/src/db/schema.sql` - Updated schema definition
- `backend/src/db/migrations/003_change_date_to_timestamp.sql` - Migration script
- `backend/src/repo/recruiterRepo.js` - Added formatDateTime function
- `backend/src/db/runMigration.js` - Migration runner utility
