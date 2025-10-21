-- Step 1: Create ENUM type for roles
CREATE TYPE user_role AS ENUM ('Admin', 'Student');

-- Step 2: Create users table with role column
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  branch VARCHAR,
  cgpa NUMERIC(3,2),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR, -- nullable for Google users
  role user_role NOT NULL DEFAULT 'Student',  -- Admin or Student
  phone VARCHAR,
  personal_email VARCHAR,
  college_email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  google_id VARCHAR UNIQUE,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
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
  applied_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create jobs table (updated with new fields)
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  description TEXT,
  custom_questions JSONB,
  application_deadline DATE,
  online_assessment_date DATE,
  interview_dates DATE[],
  min_cgpa NUMERIC(3,2),
  eligible_branches TEXT[],
  package_range VARCHAR,
  location VARCHAR,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 5: Create applications table (updated)
CREATE TABLE applications (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  answers JSONB,
  resume_url TEXT,
  status VARCHAR DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 6: Create notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 7: Seed one Admin user and sample data
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

-- Sample job data
INSERT INTO jobs (company_name, role, description, application_deadline, online_assessment_date, interview_dates, min_cgpa, eligible_branches, package_range, location)
VALUES (
  'Google',
  'Software Engineer',
  'Join our team to build scalable systems and innovative solutions.',
  '2025-02-15',
  '2025-02-20',
  ARRAY['2025-02-25', '2025-02-28'],
  8.0,
  ARRAY['Computer Science', 'Electronics', 'Information Technology'],
  '₹45-55 LPA',
  'Bangalore, Hyderabad'
)
ON CONFLICT DO NOTHING;
