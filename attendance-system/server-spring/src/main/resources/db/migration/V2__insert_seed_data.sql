-- V2__insert_seed_data.sql
-- Seed data for initial setup

INSERT INTO departments (name) VALUES ('CSE') ON DUPLICATE KEY UPDATE name = name;

-- Default users: password hash for 'password123'
INSERT INTO users (username, password, role, name, email) 
VALUES 
('admin', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'ADMIN', 'System Admin', 'admin@attendease.com'),
('hod1', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'HOD', 'Dr. HOD', 'hod@attendease.com'),
('teacher1', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'TEACHER', 'Prof. Teacher One', 'teacher1@attendease.com'),
('teacher2', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'TEACHER', 'Prof. Teacher Two', 'teacher2@attendease.com'),
('student1', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'STUDENT', 'John Doe', 'student1@attendease.com'),
('student2', '$2a$10$FgzmFvabmM8YATbld9f6CegqJABN6WlBG9dde91goeuf2iW18KEHe', 'STUDENT', 'Jane Smith', 'student2@attendease.com')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Insert students
INSERT INTO students (user_id, roll_no, department_id, year, semester, section)
SELECT u.id, 'CSE2401', d.id, 2, 4, 'A'
FROM users u, departments d
WHERE u.username = 'student1' AND d.name = 'CSE'
ON DUPLICATE KEY UPDATE roll_no = roll_no;

INSERT INTO students (user_id, roll_no, department_id, year, semester, section)
SELECT u.id, 'CSE2402', d.id, 2, 4, 'A'
FROM users u, departments d
WHERE u.username = 'student2' AND d.name = 'CSE'
ON DUPLICATE KEY UPDATE roll_no = roll_no;

-- Insert subjects
INSERT INTO subjects (name, department_id, teacher_id, year)
SELECT 'Data Structures', d.id, u.id, 2
FROM departments d, users u
WHERE d.name = 'CSE' AND u.username = 'teacher1'
ON DUPLICATE KEY UPDATE subjects.name = VALUES(name);

INSERT INTO subjects (name, department_id, teacher_id, year)
SELECT 'Database Management Systems', d.id, u.id, 2
FROM departments d, users u
WHERE d.name = 'CSE' AND u.username = 'teacher2'
ON DUPLICATE KEY UPDATE subjects.name = VALUES(name);
