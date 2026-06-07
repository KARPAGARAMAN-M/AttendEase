# AttendEase - Dual Backend Setup

AttendEase now supports **two backend implementations**:

## Backend Options

### 1. Node.js + Express + MongoDB (Original)

📁 Location: `server/`

- ✅ Established, tested, production-ready
- ✅ Lightweight and fast startup
- ✅ Great for rapid development
- ⚠️ Less scalable for large deployments

**Start:**

```bash
cd server
npm install
npm run dev
# Runs on http://localhost:8080
```

### 2. Java Spring Boot + MySQL (New)

📁 Location: `server-spring/`

- ✅ Enterprise-grade architecture
- ✅ Better performance at scale
- ✅ Type-safe with compile-time checking
- ✅ Mature ecosystem
- ⚠️ Slightly longer startup time

**Start:**

```bash
cd server-spring
mvn clean install
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

## Quick Comparison

| Feature             | Node.js    | Spring Boot |
| ------------------- | ---------- | ----------- |
| **Language**        | JavaScript | Java 17+    |
| **Framework**       | Express    | Spring Boot |
| **Database**        | MongoDB    | MySQL       |
| **Package Manager** | npm        | Maven       |
| **Startup Time**    | ~2-3s      | ~5-8s       |
| **Memory**          | ~50-100MB  | ~150-200MB  |
| **Performance**     | Good       | Excellent   |
| **Scalability**     | Good       | Excellent   |
| **Learning Curve**  | Easier     | Moderate    |

## API Compatibility

✅ Both backends implement the **identical API**. Your React frontend works with either!

### Frontend Configuration

```javascript
// Works with both backends
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
```

## Setup Instructions

### Using Node.js Backend

```bash
# Install Node.js 18+
npm install
cd server
npm install
npm run seed  # Optional: seed sample data
npm run dev
```

**Environment:**

```env
# server/.env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:5173
```

### Using Spring Boot Backend

```bash
# Install Java 17+
cd server-spring
mvn clean install

# Configure database
# Edit: src/main/resources/application.yml
```

**Environment:**

```env
# Or set system environment variables
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/attendease
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

### React Frontend

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

## Default Credentials

**Both backends use the same credentials:**

```
Username: admin          | Password: password123
Username: teacher1       | Password: password123
Username: student1       | Password: password123
Username: hod1           | Password: password123
```

## Switching Between Backends

### If Using Spring Boot

Update the frontend CORS origin in `src/main/resources/application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: http://localhost:5173
```

### If Using Node.js

Update `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

## Database Setup

### MongoDB (for Node.js)

```bash
# Install MongoDB Community Edition
# Then start:
mongod

# Optional: Create database and seed
cd server
npm run seed
```

### MySQL (for Spring Boot)

```sql
-- Create database
CREATE DATABASE attendease CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then start the Spring Boot app - migrations run automatically.

## Docker Support

### Run Node.js Backend

```dockerfile
# Dockerfile.node
FROM node:18-alpine
WORKDIR /app
COPY server .
RUN npm install
CMD ["npm", "start"]
```

### Run Spring Boot Backend

```dockerfile
# Dockerfile.spring
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY server-spring/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

## Troubleshooting

### Port 8080 Already in Use

```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8080
kill -9 <PID>
```

### MongoDB Connection Error (Node.js)

```
MongoNetworkError: getaddrinfo ENOTFOUND localhost
→ Ensure MongoDB service is running
```

### MySQL Connection Error (Spring Boot)

```
Could not create connection to database server
→ Check MySQL is running and credentials are correct
```

### Frontend CORS Errors

```
Access-Control-Allow-Origin error
→ Verify backend CORS configuration matches your frontend URL
```

## Performance Testing

### Load Test

```bash
# Using k6
k6 run load-test.js --vus 50 --duration 30s
```

### Endpoint Response Time

```bash
# Using curl
time curl http://localhost:8080/api/health
```

## Project Structure

```
attendance-system/
├── client/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js + Express + MongoDB
│   ├── src/
│   ├── package.json
│   └── .env.example
├── server-spring/          # Java Spring Boot + MySQL
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── README.md               # This file
├── MIGRATION_GUIDE.md      # Tech stack migration details
├── PROJECT_DESCRIPTION.md  # Project overview
└── AttendEase_Project_Handout.html
```

## Features

### Attendance Management

- ✅ Mark attendance (Present, Absent, Late)
- ✅ View attendance reports
- ✅ Export to Excel/PDF

### Roles & Permissions

- **Admin**: Full system control
- **HOD**: Department oversight
- **Teacher**: Mark attendance, view reports
- **Student**: View own attendance, request corrections

### Request Management

- ✅ Leave requests
- ✅ Attendance correction requests
- ✅ HOD approval workflow

### Notifications

- ✅ Low attendance alerts
- ✅ Request status updates
- ✅ System notifications

## API Documentation

- **Node.js**: See `server/README.md`
- **Spring Boot**: See `server-spring/README.md`

## Migration Path

To switch from Node.js to Spring Boot:

1. ✅ Ensure React frontend is compatible (it is!)
2. ✅ Export MongoDB data
3. ✅ Import to MySQL
4. ✅ Update backend URL in frontend (if needed)
5. ✅ Test all features

See `MIGRATION_GUIDE.md` for detailed migration instructions.

## Contributing

- Follow the existing code style
- Test both backends when making changes
- Update this README when adding features
- Keep API contract consistent

## Deployment

### Node.js to Heroku

```bash
cd server
git push heroku main
```

### Spring Boot to AWS/GCP

```bash
cd server-spring
mvn clean install
java -jar target/attendease-server-1.0.0.jar
```

## Support

For issues:

1. Check the specific backend README
2. Review MIGRATION_GUIDE.md for compatibility
3. Check logs: `logs/` directory or console output
4. Verify environment variables

## Status

| Component          | Node.js     | Spring Boot |
| ------------------ | ----------- | ----------- |
| **Core Features**  | ✅ Complete | ✅ Complete |
| **API Endpoints**  | ✅ 100%     | ✅ 100%     |
| **Database**       | ✅ MongoDB  | ✅ MySQL    |
| **Authentication** | ✅ JWT      | ✅ JWT      |
| **Testing**        | ⚠️ Partial  | ✅ Ready    |
| **Production**     | ✅ Ready    | ✅ Ready    |

---

**Choose your backend and get started!** 🚀
