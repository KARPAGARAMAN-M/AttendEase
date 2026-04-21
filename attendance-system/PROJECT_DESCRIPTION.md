# AttendEase - College Attendance Management System

## Project Overview

AttendEase is a comprehensive **College Attendance Management System** built using the MERN Stack (MongoDB, Express, React, Node.js). It provides a centralized platform for managing student attendance, generating attendance reports, and monitoring compliance across departments in a college or university.

---

## System Features & Capabilities

### 🎯 **Core Functionality**

#### **1. Role-Based Access Control**

The system supports **three main user roles** with distinct permissions and workflows:

- **Admin** - Complete system administration
- **Teacher/Faculty** - Attendance marking and reporting
- **Student** - View personal attendance records
- **HOD/Principal** - Department-wide monitoring and compliance

#### **2. User Authentication & Authorization**

- Secure JWT-based authentication
- Role-based dashboard routing
- Session persistence with localStorage
- Password hashing with bcryptjs
- Protected routes preventing unauthorized access

---

## User Roles & Their Features

### **ADMIN**

**Responsibilities:** System administration and data management

**Features:**

- ✅ Create and manage **Departments**
  - Add new departments (CSE, ECE, ME, etc.)
  - View all departments in the system
- ✅ Create and manage **Teachers/Faculty**
  - Add new teacher accounts
  - Assign teachers to subjects
  - View all faculty members
- ✅ Create and manage **Subjects/Courses**
  - Add subjects with department and teacher assignment
  - Link subjects to departments
  - Assign teachers to subject handling
- ✅ Create and manage **Student Accounts**
  - Add student accounts (username, password, name, email)
  - Assign department, year, semester, section
  - Edit student details
  - Delete student accounts and associated records
- ✅ View student list with filtering options

**Dashboard View:**

- 4 main sections: Departments, Teachers, Subjects, Students
- CRUD operations (Create, Read, Update, Delete) for all entities
- Real-time feedback messages for each operation

---

### **TEACHER / FACULTY**

**Responsibilities:** Marking attendance and generating reports

**Features:**

- ✅ **Mark Attendance**
  - Select department, year, semester, section, subject, and date
  - Load students from selected class
  - Mark individual student attendance (Present, Absent, Late)
  - Submit multiple attendance records in one action
  - Bulk attendance marking interface
- ✅ **Student-Wise Report**
  - View attendance records for specific students or all students
  - Filter by subject
  - See overall attendance percentage
  - Subject-wise attendance breakdown
  - Attendance history with status details
- ✅ **Monthly Department Report**
  - View department-level attendance statistics
  - Analyze by department, subject, year, semester, section
  - Identify class-wise attendance trends
  - Percentage-based compliance tracking
- ✅ **Alerts & Export Reports**
  - Identify students below 75% attendance threshold
  - Export alerts as PDF documents
  - Export reports as Excel spreadsheets
  - Download-ready attendance compliance reports

**Dashboard View:**

- 4 main sections: Mark Attendance, Student Report, Monthly Report, Alerts & Exports
- Interactive forms with filters and dropdowns
- Real-time report generation

---

### **STUDENT**

**Responsibilities:** Monitor personal attendance

**Features:**

- ✅ **Overall Attendance View**
  - See total classes attended
  - View overall attendance percentage
  - Visual warning if below 75% threshold
- ✅ **Subject-Wise Summary**
  - Attendance percentage per subject
  - Total classes and attended classes per subject
  - Status badge (Safe/Below 75%)
  - Quick identification of weak subjects
- ✅ **Attendance History**
  - Recent attendance records (last 25 entries)
  - Date, subject, and status (Present/Absent/Late)
  - Chronological view of attendance data
- ✅ **Compliance Alerts**
  - Automatic warning if any subject attendance < 75%
  - Overall attendance warnings
  - Color-coded status indicators

**Dashboard View:**

- 3 main sections: Overview, Subject Attendance, History
- Read-only view (no modification permissions)
- Refresh button to update data
- Clean tabular presentation

---

### **HOD / PRINCIPAL**

**Responsibilities:** Department monitoring and compliance oversight

**Features:**

- ✅ **Department-Wise Monthly Report**
  - View attendance statistics by department
  - Filter by department and month
  - See year, semester, section, subject breakdown
  - Compliance percentage per class and subject
- ✅ **Subject-Wise Summary**
  - Aggregate attendance across all subjects
  - Total and attended classes per subject
  - Identify problematic subjects needing attention
- ✅ **Semester-Wise Summary**
  - Attendance trends by academic year and semester
  - Identify which semesters have compliance issues
  - Comparative analysis across semesters
- ✅ **Students Below Threshold**
  - Identify students with < 75% attendance
  - Customizable threshold setting
  - Student name, roll number, department view
  - Color-coded compliance status
- ✅ **Report Exports**
  - Export alerts as PDF documents
  - Export reports as Excel spreadsheets
  - High-quality formatted reports for management

**Dashboard View:**

- 5 main sections: Department Report, Subject Summary, Semester Summary, Low Attendance, Exports
- Advanced filtering and reporting capabilities
- Executive-level data visualization

---

## Database Structure

### **Collections:**

1. **Users** - Authentication & user management
   - username, password (hashed), role, name, email
2. **Students** - Student profiles
   - user reference, roll number, department, year, semester, section
3. **Departments** - Academic departments
   - department name
4. **Subjects** - Courses/Subjects
   - subject name, department, teacher reference
5. **Attendance** - Attendance records
   - student, subject, date, status (Present/Absent/Late), marked by teacher
   - Unique index on (student, subject, date) to prevent duplicates

---

## User Flow & Navigation

### **Authentication Flow:**

```
Welcome Page (Default)
    ↓ (Click any role card)
Login Page
    ↓ (Enter credentials)
Dashboard (Role-specific)
    ↓ (Logout)
Welcome Page
```

### **Key Navigation Rules:**

- ✅ Welcome page is the **default landing page**
- ✅ Unauthenticated users cannot access dashboards
- ✅ Authenticated users are **automatically redirected to their role's dashboard**
- ✅ Login page is **only accessible when not authenticated**
- ✅ Dashboard access is **protected by role-based middleware**
- ✅ Logout clears session and redirects to welcome page

---

## Technology Stack

### **Frontend:**

- React 18 with Hooks
- React Router v6 for navigation
- Vite as build tool
- Axios-like HTTP client for API calls
- localStorage for session persistence

### **Backend:**

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled for frontend communication
- ExcelJS for spreadsheet generation
- PDFKit for PDF document generation

### **Development Tools:**

- Git for version control
- npm for package management
- Morgan for HTTP request logging

---

## Key Algorithms & Logic

### **Attendance Percentage Calculation:**

```
Percentage = (Attended Classes / Total Classes) × 100
```

Where:

- Attended = Present + Late
- Total = All recorded attendance entries

### **Status Indicators:**

- 🟢 **Safe:** ≥ 75% attendance
- 🟡 **Warning:** < 75% attendance
- 🔴 **Critical:** No classes recorded

### **Report Generation:**

- Student-wise: Individual performance metrics
- Monthly: Department and class-level aggregates
- Alert: Students below customizable threshold
- Export: PDF and Excel formats for sharing

---

## Demo Credentials

Use these test accounts to explore the system:

```
Admin Account:
  Username: admin
  Password: admin123

Teacher Account:
  Username: teacher.cse
  Password: teacher123

Student Account:
  Username: student.cse.001
  Password: student123

HOD Account:
  Username: hod.cse
  Password: hod123
```

**Demo Data Included:**

- 3 Departments (CSE, ECE, ME)
- 3 Teachers
- 3 Students
- 3 Subjects with assignments
- 12 Attendance records

---

## Installation & Running

### **Prerequisites:**

- Node.js (v18+)
- MongoDB (running locally or connection string)
- npm or yarn package manager

### **Setup Backend:**

```bash
cd attendance-system/server
npm install
# Create .env file with required variables
npm run seed          # Optional: populate demo data
npm run dev           # Start development server
```

### **Setup Frontend:**

```bash
cd attendance-system/client
npm install
npm run dev           # Start development server
```

### **Access Application:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- API Health Check: http://localhost:8080/api/health

---

## API Endpoints Summary

### **Authentication:**

- `POST /api/login` - User login
- `GET /api/me` - Get current user profile

### **Catalog Management:**

- `GET /api/departments` - List departments
- `POST /api/departments` - Create department
- `GET /api/teachers` - List teachers
- `POST /api/teachers` - Create teacher
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject

### **Student Management:**

- `GET /api/students` - List students with filters
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### **Attendance:**

- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records

### **Reports:**

- `GET /api/attendance/report` - Student attendance report
- `GET /api/attendance/monthly` - Monthly department report
- `GET /api/attendance/alert` - Alert report (below threshold)
- `GET /api/attendance/export/pdf` - Export as PDF
- `GET /api/attendance/export/excel` - Export as Excel

---

## Security Features

✅ **Password Hashing:** bcryptjs with salt rounds  
✅ **JWT Authentication:** Secure token-based auth  
✅ **Role-Based Authorization:** Middleware-enforced access control  
✅ **Input Validation:** Server-side validation on all endpoints  
✅ **CORS Protection:** Whitelist origin configuration  
✅ **Error Handling:** Comprehensive error messages and logging  
✅ **Data Integrity:** Unique constraints and schema validation

---

## Scalability & Future Enhancements

### **Possible Improvements:**

- 🔄 Real-time notifications for low attendance
- 📱 Mobile app for attendance marking
- 📊 Advanced analytics and predictive insights
- 🌐 Multi-college support
- 📧 Email notifications to students/parents
- 🔐 Two-factor authentication
- 📅 Holiday/leave management
- 👥 Class wise bulk operations
- 📈 Historical trend analysis

---

## Conclusion

AttendEase is a **production-ready attendance management system** designed for colleges to efficiently track, manage, and report on student attendance. With role-based features for Admins, Teachers, Students, and HODs, it provides a complete solution for attendance compliance and monitoring.

**Perfect for:** College mini projects, institutional deployments, and attendance management needs.

---

**Version:** 1.0.0  
**Last Updated:** April 18, 2026  
**Status:** ✅ Fully Functional
