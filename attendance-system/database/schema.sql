CREATE DATABASE IF NOT EXISTS attendease;
USE attendease;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'TEACHER', 'STUDENT', 'HOD') NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  department_id INT NOT NULL,
  teacher_id INT,
  UNIQUE KEY uk_subject_dept (name, department_id),
  CONSTRAINT fk_subject_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  roll_no VARCHAR(40) NOT NULL UNIQUE,
  department_id INT NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL,
  section VARCHAR(20) NOT NULL,
  CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  CONSTRAINT chk_year CHECK (year BETWEEN 1 AND 4),
  CONSTRAINT chk_semester CHECK (semester BETWEEN 1 AND 8)
);

CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late') NOT NULL,
  marked_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_daily_attendance (student_id, subject_id, attendance_date),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_marker FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (id, username, password, role, name, email) VALUES
(1, 'admin', 'admin123', 'ADMIN', 'System Admin', 'admin@attendease.local'),
(2, 'teacher.cse', 'teacher123', 'TEACHER', 'Priya Menon', 'priya@attendease.local'),
(3, 'teacher.ece', 'teacher123', 'TEACHER', 'Ravi Kumar', 'ravi@attendease.local'),
(4, 'hod.cse', 'hod123', 'HOD', 'Dr. Shalini Rao', 'shalini@attendease.local'),
(5, 'student.cse.001', 'student123', 'STUDENT', 'Arjun S', 'arjun@attendease.local'),
(6, 'student.cse.002', 'student123', 'STUDENT', 'Nivetha R', 'nivetha@attendease.local'),
(7, 'student.ece.001', 'student123', 'STUDENT', 'Karthik V', 'karthik@attendease.local');

INSERT INTO departments (id, name) VALUES
(1, 'Computer Science and Engineering'),
(2, 'Electronics and Communication Engineering'),
(3, 'Mechanical Engineering');

INSERT INTO subjects (id, name, department_id, teacher_id) VALUES
(1, 'Data Structures', 1, 2),
(2, 'Database Management Systems', 1, 2),
(3, 'Signals and Systems', 2, 3);

INSERT INTO students (id, user_id, roll_no, department_id, year, semester, section) VALUES
(1, 5, 'CSE23A001', 1, 2, 3, 'A'),
(2, 6, 'CSE23A002', 1, 2, 3, 'A'),
(3, 7, 'ECE23B001', 2, 2, 3, 'B');

INSERT INTO attendance (student_id, subject_id, attendance_date, status, marked_by) VALUES
(1, 1, '2026-03-01', 'Present', 2),
(1, 1, '2026-03-02', 'Late', 2),
(1, 1, '2026-03-03', 'Absent', 2),
(2, 1, '2026-03-01', 'Present', 2),
(2, 1, '2026-03-02', 'Present', 2),
(2, 1, '2026-03-03', 'Present', 2),
(1, 2, '2026-03-01', 'Present', 2),
(1, 2, '2026-03-02', 'Present', 2),
(2, 2, '2026-03-01', 'Absent', 2),
(2, 2, '2026-03-02', 'Late', 2),
(3, 3, '2026-03-01', 'Present', 3),
(3, 3, '2026-03-02', 'Absent', 3);
