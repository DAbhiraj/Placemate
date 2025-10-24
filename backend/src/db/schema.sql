CREATE TABLE Users (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    branch VARCHAR,
    cgpa NUMERIC(3,2),
    email VARCHAR UNIQUE,
    password VARCHAR(200),
    role VARCHAR(200),
    application_type TEXT,
    google_id TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_completed TEXT,
    skills TEXT,
    resume_filename TEXT,
    resume_upload_date TIMESTAMP,
    ats_score NUMERIC(5,2),
    ats_score_date TIMESTAMP,
    ats_feedback TEXT
);

select * from Users;

CREATE TABLE Companies (
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
    status TEXT,
    created_at TEXT
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_name TEXT,
    role TEXT,
    description TEXT,
    custom_questions JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location TEXT[],
    application_deadline DATE,
    online_assessment_date DATE,
    interview_dates DATE[],
    min_cgpa NUMERIC(3, 2),
    eligible_branches TEXT[],
    package_range VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_logo VARCHAR(255)
);

CREATE TABLE applications (
    appl_id SERIAL PRIMARY KEY,
    id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- User ID
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE, -- Job ID
    answers JSONB DEFAULT '{}',
    resume_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE, -- User ID
    message TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title TEXT
);

CREATE TABLE alumni_stories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    batch VARCHAR(20),
    branch VARCHAR(100),
    company VARCHAR(100),
    package VARCHAR(50),
    image TEXT,
    currentrole VARCHAR(100),
    story TEXT,
    tips TEXT[]
);


