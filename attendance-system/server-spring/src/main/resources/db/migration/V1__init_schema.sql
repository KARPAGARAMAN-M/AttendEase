-- V1__init_schema.sql
-- Initial database schema for AttendEase

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments (id),
    INDEX idx_roll_no (roll_no),
    INDEX idx_department_year_semester (department_id, year, semester)
);

CREATE TABLE IF NOT EXISTS subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    teacher_id BIGINT,
    year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_subject_department FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES users (id),
    UNIQUE KEY uk_subject_name_dept_year (name, department_id, year),
    INDEX idx_department_year (department_id, year)
);

CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_id BIGINT NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(50) NOT NULL,
    day_of_week INT NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    room VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedule_department FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_schedule_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_schedule_teacher FOREIGN KEY (teacher_id) REFERENCES users (id),
    UNIQUE KEY uk_schedule (department_id, year, semester, section, day_of_week, start_time, end_time, subject_id),
    INDEX idx_teacher (teacher_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    marked_by_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_attendance_markedby FOREIGN KEY (marked_by_id) REFERENCES users (id),
    UNIQUE KEY uk_attendance (student_id, subject_id, attendance_date),
    INDEX idx_student_date (student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS attendance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    subject_id BIGINT,
    attendance_date DATE NOT NULL,
    requested_status VARCHAR(20),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by_id BIGINT,
    reviewed_at TIMESTAMP,
    review_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_request_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_request_subject FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_request_reviewer FOREIGN KEY (reviewed_by_id) REFERENCES users (id),
    INDEX idx_student_status (student_id, status),
    INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    student_id BIGINT,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    meta JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_id) REFERENCES users (id),
    CONSTRAINT fk_notification_student FOREIGN KEY (student_id) REFERENCES students (id),
    INDEX idx_recipient_created (recipient_id, created_at),
    INDEX idx_recipient_read (recipient_id, is_read)
);
