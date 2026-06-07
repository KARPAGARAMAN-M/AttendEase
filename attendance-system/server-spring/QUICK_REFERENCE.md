# AttendEase Spring Boot - Quick Reference

## 🚀 Quick Commands

### Build

```bash
mvn clean install
```

### Run Development

```bash
mvn spring-boot:run
```

### Run Tests

```bash
mvn test
```

### Create JAR

```bash
mvn clean package
```

## 📊 Important Endpoints

```
Health Check:
GET http://localhost:8080/api/health

Login:
POST http://localhost:8080/api/auth/login
Body: { "username": "admin", "password": "password123" }
Response: { "token": "eyJ...", "username": "admin", "role": "ADMIN", "name": "System Admin", "id": 1 }

Get Current User:
GET http://localhost:8080/api/users/1
Header: Authorization: Bearer {token}
```

## 🔑 JWT Token Usage

Every request (except login and health) requires:

```
Authorization: Bearer {token}
```

## 📁 Key Files

- **application.yml** - Main configuration
- **application-dev.yml** - Development profile
- **pom.xml** - Maven dependencies
- **db/migration/V1\_\_init_schema.sql** - Database schema
- **db/migration/V2\_\_insert_seed_data.sql** - Sample data

## 🗄️ Database

### Tables

- users
- departments
- students
- subjects
- schedules
- attendance
- attendance_requests
- notifications

### Default User Credentials

```
Username: admin          | Password: password123 | Role: ADMIN
Username: teacher1       | Password: password123 | Role: TEACHER
Username: student1       | Password: password123 | Role: STUDENT
Username: hod1           | Password: password123 | Role: HOD
```

## 🔧 Profiles

### Development

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Production

```bash
java -jar target/attendease-server-1.0.0.jar --spring.profiles.active=prod
```

## 📦 Main Dependencies

- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security
- MySQL Connector/J 8.2.0
- JWT (JJWT 0.12.3)
- Flyway (Database Migrations)
- Lombok
- Apache POI (Excel Export)
- iText (PDF Export)

## 🐛 Common Issues

### Issue: Connection refused

**Solution**: Ensure MySQL is running

```bash
# macOS
brew services start mysql-community-server

# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

### Issue: Table already exists

**Solution**: Clear Flyway history

```sql
USE attendease;
DELETE FROM flyway_schema_history;
```

### Issue: JWT token invalid

**Solution**: Verify JWT_SECRET matches everywhere

## 📈 Performance Tuning

### Connection Pool

Edit `application.yml`:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10 # Increase for high load
      minimum-idle: 5
```

### Hibernate Batch Size

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc.batch_size: 20
        order_inserts: true
```

## 🚢 Deployment

### Docker Build

```bash
mvn clean install
docker build -t attendease-api:latest .
docker run -e DB_PASSWORD=yourpassword -p 8080:8080 attendease-api:latest
```

### Environment Variables

```
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/attendease
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_EXPIRATION=43200000
```

## 📚 Documentation

- [Server README](README.md)
- [Migration Guide](../MIGRATION_GUIDE.md)
- [Backend Setup](../BACKEND_SETUP.md)
- [Project Description](../PROJECT_DESCRIPTION.md)

## 📞 Support

- Check logs: `logs/attendease.log`
- Review configuration: `src/main/resources/application.yml`
- Test connectivity: `curl http://localhost:8080/api/health`

---

**Last Updated**: 2024-06-07
