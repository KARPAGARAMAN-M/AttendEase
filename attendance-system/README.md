# AttendEase (MERN, CSE-Only)

AttendEase is a role-based College Attendance Management System built with MERN:
- `client/` -> React (Vite)
- `server/` -> Node.js + Express + MongoDB (Mongoose)

This build is configured for **CSE department only**.

## Roles and Responsibilities
- Admin: manages CSE users, subjects, schedules, and system operations.
- Teacher: marks attendance, views reports, exports data, and sends low-attendance alerts.
- HOD / Principal: monitors trends, reviews faculty activity, approves leave/correction requests, and exports institutional reports.
- Student: views attendance, receives shortage alerts, and submits leave/correction requests.

## Default Ports
- API server: `http://localhost:8080`
- React app: `http://localhost:5173`

## 1) Prerequisites
- Node.js 18+
- MongoDB running locally (or a remote MongoDB URI)

## 2) Backend Setup
From `attendance-system/server`:

```bash
npm install
```

Create `.env` from `.env.example`:

```env
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/attendease
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:5173
```

Seed sample data:

```bash
npm run seed
```

Run backend:

```bash
npm run dev
```

## 3) Frontend Setup
From `attendance-system/client`:

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

`vite.config.js` proxies `/api` to `http://localhost:8080`.

## 4) API Summary
- Auth: `POST /api/login`, `GET /api/me`
- Catalog: `GET /api/departments`, `GET/POST /api/teachers`, `GET/POST /api/subjects`
- Students: `GET/POST /api/students`, `PUT/DELETE /api/students/:id`
- Attendance: `POST /api/attendance`, `GET /api/attendance`
- Reports: `GET /api/attendance/report`, `GET /api/attendance/monthly`, `GET /api/attendance/alert`, `GET /api/attendance/export/pdf`, `GET /api/attendance/export/excel`
- Schedules: `GET/POST /api/schedules`, `PUT/DELETE /api/schedules/:id`
- Requests: `GET/POST /api/attendance-requests`, `PATCH /api/attendance-requests/:id/review`
- Notifications: `GET /api/notifications`, `POST /api/notifications/low-attendance`, `PATCH /api/notifications/:id/read`
- Management: `GET /api/faculty/activity`

## Notes
- Passwords are hashed using `bcryptjs`.
- Attendance percentage treats `Present` and `Late` as attended.
- CSE-only validation is enforced in backend APIs.
