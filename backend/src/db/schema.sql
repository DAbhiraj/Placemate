CREATE TABLE Users (
    user_id VARCHAR PRIMARY KEY,
    name VARCHAR,
    roll_no TEXT,
    phone TEXT,     
    branch VARCHAR,
    cgpa NUMERIC(3,2),
    email VARCHAR UNIQUE,
    password VARCHAR(200),
    role VARCHAR(200),
    application_type TEXT,
    google_id TEXT,
    linkedin_id TEXT,
    first_name TEXT,
    last_name TEXT,
    profile_completed TEXT,
    skills TEXT,
    resume_filename TEXT,
    resume_upload_date TIMESTAMP,
    resume_url TEXT,
    resume_public_id TEXT,
    is_verified BOOLEAN DEFAULT false
);


CREATE TABLE jobs (
    job_id SERIAL PRIMARY KEY,
    recruiter_id VARCHAR(255) REFERENCES users(user_id) ON DELETE SET NULL,
    job_type TEXT,
    company_name TEXT,
    role TEXT,
    description TEXT,
    requirements TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location TEXT[],
    application_deadline TIMESTAMP,
    online_assessment_date TIMESTAMP,
    interview_dates DATE[],
    min_cgpa NUMERIC(3, 2),
    eligible_branches TEXT[],
    package VARCHAR(255),
    job_description_url TEXT,
    job_description_public_id TEXT,
    job_description_filename TEXT,
    applied_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    company_logo VARCHAR(255),
    job_status VARCHAR(100) DEFAULT 'in initial stage'
);

CREATE TABLE applications (
    appl_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE, -- User ID
    job_id INTEGER REFERENCES jobs(job_id) ON DELETE CASCADE, -- Job ID
    answers JSONB DEFAULT '{}',
    resume_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT
);

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    sender_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE, -- User ID
    title TEXT,
    message TEXT,
    type TEXT,
    target_role VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_notification_status (
    user_id VARCHAR(255) NOT NULL,
    notification_id INTEGER NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NULL,
    
    PRIMARY KEY (user_id, notification_id),

    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES Users (user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notification
        FOREIGN KEY (notification_id)
        REFERENCES notifications (notification_id)
        ON DELETE CASCADE
);

-- Recommended Index for fast retrieval of unread count
    CREATE INDEX idx_user_unread_status 
    ON user_notification_status (user_id, is_read) 
WHERE is_read = FALSE;

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

CREATE TABLE spoc_job_assignments (
    assignment_id SERIAL PRIMARY KEY,
    spoc_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(job_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'In Discussion',
    message_count INTEGER DEFAULT 0,
    has_changes BOOLEAN DEFAULT false,
    UNIQUE(spoc_id, job_id)
);

CREATE TABLE recruiter_kyc (
    kyc_id SERIAL PRIMARY KEY,
    recruiter_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(255),
    company_address TEXT NOT NULL,
    pan_number VARCHAR(10) NOT NULL UNIQUE,
    pan_document_url TEXT NOT NULL,
    hr_contact_number VARCHAR(20) NOT NULL,
    linkedin_profile_url VARCHAR(500),
    years_of_experience INTEGER,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    approved_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
