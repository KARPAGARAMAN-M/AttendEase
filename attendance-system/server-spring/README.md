# AttendEase - Java Spring Boot Backend (MySQL)

This is the migrated backend for the AttendEase attendance management system, now using **Java Spring Boot** with **MySQL** database.

## Project Structure

```
server-spring/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/attendease/
│   │   │   ├── AttendEaseApplication.java
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   ├── service/
│   │   │   └── util/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/migration/
│   └── test/
└── README.md
```

## Prerequisites

- **Java 17+**
- **MySQL 8.0+**
- **Maven 3.6+**

## Setup Instructions

### 1. Database Setup

```sql
-- Create database
CREATE DATABASE attendease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Environment Configuration

Create a `.env` file in the project root or set environment variables:

```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRATION=43200000
```

### 3. Build the Application

```bash
mvn clean install
```

### 4. Run the Application

```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080/api`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with credentials
- `GET /api/health` - Health check

### Users

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/role/{role}` - Get users by role

### Students

- `GET /api/students/{id}` - Get student by ID
- `GET /api/students/roll/{rollNo}` - Get student by roll number
- `GET /api/students/department/{departmentId}` - Get students by department
- `GET /api/students/class` - Get students by class
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student

### Subjects

- `GET /api/subjects/{id}` - Get subject by ID
- `GET /api/subjects/department/{departmentId}` - Get subjects by department
- `GET /api/subjects/department/{departmentId}/year/{year}` - Get subjects by department and year
- `GET /api/subjects/teacher/{teacherId}` - Get subjects by teacher
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/{id}` - Update subject

### Attendance

- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/{studentId}` - Get student attendance
- `GET /api/attendance/subject/{subjectId}` - Get subject attendance
- `GET /api/attendance/student/{studentId}/subject/{subjectId}` - Get attendance by student and subject
- `GET /api/attendance/range` - Get attendance by date range

### Departments

- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department by ID
- `GET /api/departments/name/{name}` - Get department by name
- `POST /api/departments` - Create department
- `PUT /api/departments/{id}` - Update department
- `DELETE /api/departments/{id}` - Delete department

## Database Migrations

Flyway automatically handles database migrations from SQL files in `src/main/resources/db/migration/`:

- **V1\_\_init_schema.sql** - Creates all tables and indexes
- **V2\_\_insert_seed_data.sql** - Inserts sample data

Default credentials:

- Username: `admin` / Password: `password123`
- Username: `teacher1` / Password: `password123`
- Username: `student1` / Password: `password123`

## Key Features

✅ JWT Authentication
✅ Role-based Access Control (ADMIN, HOD, TEACHER, STUDENT)
✅ MySQL with JPA/Hibernate ORM
✅ Automatic database migrations with Flyway
✅ RESTful API with proper error handling
✅ CORS enabled for React frontend
✅ Comprehensive DTOs for clean API contracts
✅ Lombok for reduced boilerplate

## Configuration (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/attendease
    username: root
    password: your_password
  jpa:
    hibernate.ddl-auto: validate
    properties.hibernate.dialect: org.hibernate.dialect.MySQL8Dialect

jwt:
  secret: your-secret-key
  expiration: 43200000
```

## Common Issues

### MySQL Connection Error

Ensure MySQL is running and the credentials are correct in `application.yml`.

### Flyway Migration Failed

Delete any migration files that failed and re-run. Check the `flyway_schema_history` table.

### JWT Token Invalid

Verify the `JWT_SECRET` environment variable matches between login and token validation.

## Frontend Integration

The React frontend should connect to:

- API Base URL: `http://localhost:8080/api`
- WebSocket: Not implemented yet

## Next Steps

- [ ] Implement Schedule management endpoints
- [ ] Add AttendanceRequest endpoints
- [ ] Add Notification system
- [ ] Implement file export (Excel/PDF)
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement WebSocket for real-time notifications
- [ ] Add comprehensive logging

## Development Notes

- Use `@Service` for business logic
- Use `@Repository` for data access (Spring Data JPA)
- Use DTOs for API contracts, not entities
- Always validate input in controllers
- Use custom exceptions for error handling
- Keep entities simple, move logic to services

---

For questions or issues, refer to the main project README.
