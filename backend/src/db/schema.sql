-- create tables
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  branch VARCHAR NOT NULL,
  cgpa NUMERIC(3,2) NOT NULL,
  email VARCHAR UNIQUE
);

CREATE TABLE companies (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  logo VARCHAR,
  package TEXT,
  location TEXT,
  eligible_branches TEXT[],      -- array of branch names
  min_cgpa NUMERIC(3,2),
  deadline DATE,
  job_type VARCHAR,
  description TEXT,
  requirements TEXT[],
  applied_count INTEGER DEFAULT 0
);

CREATE TABLE applications (
  id VARCHAR PRIMARY KEY,
  student_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  company_id VARCHAR REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  applied_date DATE,
  last_update DATE
);

-- seed one user and one company (your sample)
INSERT INTO users (id, name, branch, cgpa, email) VALUES
('u1', 'Abhiraj', 'Computer Science', 8.5, 'abhiraj@example.com')
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
