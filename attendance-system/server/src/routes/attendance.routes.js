import express from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCseDepartmentId } from "../utils/cse.js";
import { badRequest, forbidden } from "../utils/errors.js";
import { parseObjectId, parseOptionalObjectId } from "../utils/parsers.js";
import { normalizeDay, toIsoDate } from "../utils/time.js";

const router = express.Router();

function normalizeStatus(status) {
  const lower = String(status || "").trim().toLowerCase();
  if (lower === "present") {
    return "Present";
  }
  if (lower === "absent") {
    return "Absent";
  }
  if (lower === "late") {
    return "Late";
  }
  return "";
}

router.post(
  "/attendance",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const subjectId = parseObjectId(req.body?.subject_id, "subject_id");
    const attendanceDate = normalizeDay(req.body?.date || new Date());
    if (!attendanceDate) {
      throw badRequest("date must be in YYYY-MM-DD format");
    }

    const entries = Array.isArray(req.body?.entries) ? req.body.entries : null;
    if (!entries || entries.length === 0) {
      throw badRequest("entries array is required and cannot be empty");
    }

    const subject = await Subject.findById(subjectId).select("teacher department");
    if (!subject) {
      throw badRequest("subject_id is invalid");
    }
    if (subject.department?.toString() !== cseDepartmentId) {
      throw badRequest("Attendance can only be marked for CSE department subjects");
    }

    if (
      req.user.role === ROLES.TEACHER &&
      (!subject.teacher || subject.teacher.toString() !== req.user.id)
    ) {
      throw forbidden("Teacher is not assigned to the selected subject");
    }

    let count = 0;
    for (const item of entries) {
      const studentId = parseObjectId(item?.student_id, "student_id");
      const status = normalizeStatus(item?.status);
      if (!status) {
        throw badRequest("Invalid status (allowed: Present, Absent, Late)");
      }

      const exists = await Student.exists({ _id: studentId, department: cseDepartmentId });
      if (!exists) {
        throw badRequest(`Invalid student_id for CSE department: ${studentId}`);
      }

      await Attendance.findOneAndUpdate(
        { student: studentId, subject: subjectId, attendanceDate },
        {
          student: studentId,
          subject: subjectId,
          attendanceDate,
          status,
          markedBy: req.user._id,
        },
        { upsert: true, new: true, runValidators: true },
      );
      count += 1;
    }

    res.json({
      success: true,
      message: "Attendance saved successfully",
      subject_id: subjectId,
      date: toIsoDate(attendanceDate),
      records: count,
    });
  }),
);

router.get(
  "/attendance",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const filter = {};
    const studentId = parseOptionalObjectId(req.query.student_id, "student_id");
    const subjectId = parseOptionalObjectId(req.query.subject_id, "subject_id");
    const date = req.query.date ? normalizeDay(req.query.date) : null;

    if (req.query.date && !date) {
      throw badRequest("date must be in YYYY-MM-DD format");
    }

    if (studentId) {
      filter.student = studentId;
    }
    if (subjectId) {
      const subject = await Subject.findById(subjectId).select("department");
      if (!subject || subject.department?.toString() !== cseDepartmentId) {
        throw badRequest("subject_id must belong to the CSE department");
      }
      filter.subject = subjectId;
    }
    if (date) {
      filter.attendanceDate = date;
    }

    if (!filter.student) {
      const cseStudents = await Student.find({ department: cseDepartmentId }).select("_id");
      filter.student = { $in: cseStudents.map((row) => row._id) };
    } else {
      const isCseStudent = await Student.exists({ _id: filter.student, department: cseDepartmentId });
      if (!isCseStudent) {
        return res.json([]);
      }
    }

    const rows = await Attendance.find(filter)
      .populate({
        path: "student",
        select: "rollNo department",
        populate: [
          { path: "user", select: "name" },
          { path: "department", select: "name" },
        ],
      })
      .populate("subject", "name department")
      .sort({ attendanceDate: -1 });

    res.json(
      rows
        .filter(
          (row) =>
            row.student?.department?.id === cseDepartmentId &&
            row.subject?.department?.toString() === cseDepartmentId,
        )
        .map((row) => ({
          id: row.id,
          student_id: row.student?.id || null,
          student_name: row.student?.user?.name || "",
          roll_no: row.student?.rollNo || "",
          subject_id: row.subject?.id || null,
          subject_name: row.subject?.name || "",
          date: toIsoDate(row.attendanceDate),
          status: row.status,
          marked_by: row.markedBy ? row.markedBy.toString() : null,
        })),
    );
  }),
);

export default router;
