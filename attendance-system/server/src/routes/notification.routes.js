import express from "express";
import Attendance from "../models/Attendance.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCseDepartmentId } from "../utils/cse.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { parseObjectId, parseOptionalNumber } from "../utils/parsers.js";

const router = express.Router();

function isAttended(status) {
  return status === "Present" || status === "Late";
}

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function parseThreshold(rawValue) {
  const value = parseOptionalNumber(rawValue, "threshold");
  const threshold = value === null ? 75 : value;
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 100) {
    throw badRequest("threshold must be between 1 and 100");
  }
  return threshold;
}

async function getLowAttendanceStudents(threshold, cseDepartmentId) {
  const students = await Student.find({ department: cseDepartmentId })
    .populate("user", "name")
    .sort({ rollNo: 1 });

  const studentIds = students.map((row) => row._id);
  const attendanceRows = await Attendance.find({ student: { $in: studentIds } }).select(
    "student status",
  );

  const metrics = new Map();
  students.forEach((student) => {
    metrics.set(student.id, { total: 0, attended: 0 });
  });

  attendanceRows.forEach((row) => {
    const key = row.student.toString();
    const metric = metrics.get(key);
    if (!metric) {
      return;
    }
    metric.total += 1;
    if (isAttended(row.status)) {
      metric.attended += 1;
    }
  });

  return students
    .map((student) => {
      const metric = metrics.get(student.id) || { total: 0, attended: 0 };
      const percentage = metric.total ? round2((metric.attended * 100) / metric.total) : 0;
      return {
        student_id: student.id,
        user_id: student.user?.id || null,
        student_name: student.user?.name || "",
        roll_no: student.rollNo,
        total_classes: metric.total,
        attended_classes: metric.attended,
        percentage,
      };
    })
    .filter((row) => row.total_classes === 0 || row.percentage < threshold)
    .sort((a, b) => a.percentage - b.percentage);
}

router.post(
  "/notifications/low-attendance",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const threshold = parseThreshold(req.body?.threshold);
    const rows = await getLowAttendanceStudents(threshold, cseDepartmentId);

    const docs = rows
      .filter((row) => row.user_id)
      .map((row) => ({
        recipient: row.user_id,
        student: row.student_id,
        type: "LOW_ATTENDANCE",
        title: "Low Attendance Alert",
        message: `Your current attendance is ${row.percentage}%. Please improve it to stay above ${threshold}%.`,
        meta: {
          threshold,
          percentage: row.percentage,
          total_classes: row.total_classes,
          attended_classes: row.attended_classes,
        },
      }));

    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }

    res.json({
      success: true,
      sent: docs.length,
      threshold,
      recipients: rows.map((row) => ({
        student_id: row.student_id,
        student_name: row.student_name,
        roll_no: row.roll_no,
        percentage: row.percentage,
      })),
    });
  }),
);

router.get(
  "/notifications",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const limit = Math.min(parseThreshold(req.query.limit || 25), 100);
    const filter = {};

    if (req.user.role === ROLES.STUDENT) {
      filter.recipient = req.user._id;
    }

    const rows = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("recipient", "name");

    res.json(
      rows.map((row) => ({
        id: row.id,
        recipient_id: row.recipient?.id || null,
        recipient_name: row.recipient?.name || "",
        type: row.type,
        title: row.title,
        message: row.message,
        is_read: Boolean(row.isRead),
        meta: row.meta || {},
        created_at: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      })),
    );
  }),
);

router.patch(
  "/notifications/:id/read",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const notificationId = parseObjectId(req.params.id, "notification id");
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw notFound("Notification not found");
    }
    if (
      req.user.role === ROLES.STUDENT &&
      notification.recipient?.toString() !== req.user._id.toString()
    ) {
      throw forbidden("You are not allowed to modify this notification");
    }

    notification.isRead = true;
    await notification.save();
    res.json({ success: true, message: "Notification marked as read" });
  }),
);

export default router;
