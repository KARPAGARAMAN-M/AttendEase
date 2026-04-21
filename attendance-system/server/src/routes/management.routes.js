import express from "express";
import Attendance from "../models/Attendance.js";
import Subject from "../models/Subject.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCseDepartmentId } from "../utils/cse.js";
import { badRequest } from "../utils/errors.js";
import { normalizeDay, toIsoDate } from "../utils/time.js";

const router = express.Router();

function parseDate(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  const parsed = normalizeDay(value);
  if (!parsed) {
    throw badRequest(`${fieldName} must be in YYYY-MM-DD format`);
  }
  return parsed;
}

router.get(
  "/faculty/activity",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const fromDate = parseDate(req.query.from, "from");
    const toDate = parseDate(req.query.to, "to");

    const cseSubjects = await Subject.find({ department: cseDepartmentId }).select("_id");
    const subjectIds = cseSubjects.map((row) => row._id);
    if (subjectIds.length === 0) {
      return res.json({ rows: [] });
    }

    const filter = { subject: { $in: subjectIds } };
    if (fromDate || toDate) {
      filter.attendanceDate = {};
      if (fromDate) {
        filter.attendanceDate.$gte = fromDate;
      }
      if (toDate) {
        const nextDay = new Date(toDate.getTime() + 24 * 60 * 60 * 1000);
        filter.attendanceDate.$lt = nextDay;
      }
    }

    const rows = await Attendance.find(filter)
      .populate("markedBy", "name email")
      .populate("subject", "name")
      .sort({ attendanceDate: -1 });

    const metrics = new Map();
    rows.forEach((row) => {
      if (!row.markedBy) {
        return;
      }
      const key = row.markedBy.id;
      if (!metrics.has(key)) {
        metrics.set(key, {
          teacher_id: row.markedBy.id,
          teacher_name: row.markedBy.name || "",
          teacher_email: row.markedBy.email || "",
          attendance_entries: 0,
          absent_marked: 0,
          late_marked: 0,
          class_session_keys: new Set(),
          student_keys: new Set(),
          last_marked_on: "",
        });
      }

      const bucket = metrics.get(key);
      bucket.attendance_entries += 1;
      if (row.status === "Absent") {
        bucket.absent_marked += 1;
      }
      if (row.status === "Late") {
        bucket.late_marked += 1;
      }
      bucket.class_session_keys.add(`${row.subject?.id || ""}::${toIsoDate(row.attendanceDate)}`);
      bucket.student_keys.add(row.student?.toString() || "");
      const date = toIsoDate(row.attendanceDate);
      if (!bucket.last_marked_on || date > bucket.last_marked_on) {
        bucket.last_marked_on = date;
      }
    });

    const output = Array.from(metrics.values())
      .map((row) => ({
        teacher_id: row.teacher_id,
        teacher_name: row.teacher_name,
        teacher_email: row.teacher_email,
        classes_marked: row.class_session_keys.size,
        attendance_entries: row.attendance_entries,
        unique_students_covered: row.student_keys.size,
        absent_marked: row.absent_marked,
        late_marked: row.late_marked,
        last_marked_on: row.last_marked_on || null,
      }))
      .sort((a, b) => b.classes_marked - a.classes_marked || a.teacher_name.localeCompare(b.teacher_name));

    res.json({ rows: output });
  }),
);

export default router;
