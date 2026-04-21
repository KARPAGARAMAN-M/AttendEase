import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import studentRoutes from "./routes/student.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import reportRoutes from "./routes/report.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import requestRoutes from "./routes/request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import managementRoutes from "./routes/management.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, stack: "MERN", time: new Date().toISOString() });
});

app.use("/api", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api", studentRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", reportRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", requestRoutes);
app.use("/api", notificationRoutes);
app.use("/api", managementRoutes);

app.use(notFoundHandler);

app.use((error, req, res, next) => {
  if (error?.name === "MongoServerError" && error.code === 11000) {
    const key = Object.keys(error.keyPattern || {})[0] || "field";
    error.status = 400;
    error.message = `${key} already exists`;
  }
  errorHandler(error, req, res, next);
});

export default app;
