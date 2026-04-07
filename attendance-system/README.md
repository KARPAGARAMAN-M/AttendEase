# AttendEase - College Attendance Management System

AttendEase is a role-based attendance system with:
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Java `HttpServer` + JDBC + JSON REST APIs
- Database: MySQL

## Roles
- Admin
- Teacher / Faculty
- Student
- HOD / Principal

## Default Ports
- Backend API: `http://localhost:8080`
- Frontend: serve `frontend/` with any static server (for example `http://localhost:5500`)

## 1) Database Setup
1. Create the schema and seed demo data:
   ```sql
   SOURCE path/to/attendance-system/database/schema.sql;
   ```
2. Or import directly:
   ```bash
   mysql -u root -p < attendance-system/database/schema.sql
   ```

## 2) Backend Dependencies
Copy these jars into `backend/lib/`:
- `mysql-connector-j-8.x.x.jar`
- `gson-2.x.x.jar`
- `itextpdf-5.x.x.jar` (or compatible iText 5 package)
- `poi-5.x.x.jar`
- `poi-ooxml-5.x.x.jar`
- `commons-collections4-4.x.jar`
- `commons-compress-1.x.jar`
- `xmlbeans-5.x.jar`
- `commons-io-2.x.jar`

## 3) Backend Run
From `attendance-system/backend`:

PowerShell compile + run example:
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/attendease?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USER="root"
$env:DB_PASSWORD="root"

$cp = ".;lib/*;src"
javac -cp $cp src/Main.java src/server/AppServer.java src/handlers/*.java src/db/DBConnection.java src/models/*.java src/utils/*.java
java -cp $cp Main
```

## 4) Frontend Run
From `attendance-system/frontend`:
```bash
python -m http.server 5500
```
Open: `http://localhost:5500`

## 5) Demo Login Accounts
- Admin: `admin / admin123`
- Teacher: `teacher.cse / teacher123`
- Student: `student.cse.001 / student123`
- HOD: `hod.cse / hod123`

## API Summary
- `POST /api/login`
- `GET /api/me`
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`
- `GET /api/teachers`
- `POST /api/teachers`
- `GET /api/subjects`
- `POST /api/subjects`
- `GET /api/departments`
- `POST /api/departments`
- `POST /api/attendance`
- `GET /api/attendance/report?student_id=&subject_id=`
- `GET /api/attendance/monthly?department_id=&month=`
- `GET /api/attendance/alert?threshold=75`
- `GET /api/attendance/export/pdf`
- `GET /api/attendance/export/excel`

## Notes
- Demo build uses plain-text passwords for local development convenience.
- Attendance percentage counts both `Present` and `Late` as attended classes.
- All backend JSON routes include CORS headers for frontend integration.
