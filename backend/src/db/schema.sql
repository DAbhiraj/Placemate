-- Step 1: Create ENUM type for roles
CREATE TYPE user_role AS ENUM ('Admin', 'Student');

-- Step 2: Create users table with role column
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  branch VARCHAR NOT NULL,
  cgpa NUMERIC(3,2) NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role user_role NOT NULL DEFAULT 'Student',  -- Admin or Student
  phone VARCHAR,
  skills TEXT[],
  resume_url VARCHAR,
  resume_filename VARCHAR,
  resume_upload_date TIMESTAMP,
  ats_score INTEGER,
  ats_score_date TIMESTAMP,
  ats_feedback TEXT
);

-- Step 3: Create companies table
CREATE TABLE companies (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  logo VARCHAR,
  package TEXT,
  location TEXT,
  eligible_branches TEXT[],
  min_cgpa NUMERIC(3,2),
  deadline DATE,
  job_type VARCHAR,
  description TEXT,
  requirements TEXT[],
  applied_count INTEGER DEFAULT 0
);

-- Step 4: Create applications table
CREATE TABLE applications (
  id VARCHAR PRIMARY KEY,
  student_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  company_id VARCHAR REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  applied_date DATE,
  last_update DATE
);

-- Step 5: Seed one Admin user and one company
INSERT INTO users (id, name, branch, cgpa, email, password, role)
VALUES ('u1', 'Abhiraj', 'Computer Science', 8.5, 'abhiraj@example.com', '$2a$10$hashedpasswordhere', 'Admin')
ON CONFLICT DO NOTHING;

INSERT INTO companies (id, name, logo, package, location, eligible_branches, min_cgpa, deadline, job_type, description, requirements, applied_count)
VALUES (
  '1',
  'Google',
  '🔍',
  '₹45-55 LPA',
  'Bangalore, Hyderabad',
  ARRAY['Computer Science','Electronics','Information Technology'],
  8.0,
  '2025-02-15',
  'Full-time',
  'Software Engineer role focusing on scalable systems and innovative solutions.',
  ARRAY['Strong programming skills','8.0+ CGPA','Problem-solving abilities'],
  156
)
ON CONFLICT DO NOTHING;
