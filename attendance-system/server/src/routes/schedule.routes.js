import express from "express";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import Schedule from "../models/Schedule.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCseDepartmentId } from "../utils/cse.js";
import { badRequest, notFound } from "../utils/errors.js";
import {
  parseObjectId,
  parseOptionalNumber,
  parseRequiredNumber,
  parseRequiredString,
} from "../utils/parsers.js";

const router = express.Router();

function normalizeTime(value, fieldName) {
  const time = parseRequiredString(value, fieldName);
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw badRequest(`${fieldName} must be in HH:MM format`);
  }
  const [hour, minute] = time.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw badRequest(`${fieldName} is invalid`);
  }
  return time;
}

function toMinutes(time) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function validateRange(startTime, endTime) {
  if (toMinutes(endTime) <= toMinutes(startTime)) {
    throw badRequest("end_time must be later than start_time");
  }
}

function mapSchedule(row) {
  return {
    id: row.id,
    department_id: row.department?.id || null,
    department_name: row.department?.name || "",
    year: row.year,
    semester: row.semester,
    section: row.section,
    day_of_week: row.dayOfWeek,
    start_time: row.startTime,
    end_time: row.endTime,
    subject_id: row.subject?.id || null,
    subject_name: row.subject?.name || "",
    teacher_id: row.teacher?.id || null,
    teacher_name: row.teacher?.name || "",
    room: row.room,
    academic_year: row.academicYear,
    active: Boolean(row.active),
  };
}

async function validateTeacherAndSubject(teacherId, subjectId, cseDepartmentId, scheduleYear) {
  const [teacher, subject] = await Promise.all([
    User.findById(teacherId).select("role"),
    Subject.findById(subjectId).select("department teacher year"),
  ]);

  if (!teacher || teacher.role !== ROLES.TEACHER) {
    throw badRequest("teacher_id must belong to a valid teacher account");
  }

  if (!subject || subject.department?.toString() !== cseDepartmentId) {
    throw badRequest("subject_id must belong to CSE department");
  }

  if (subject.teacher && subject.teacher.toString() !== teacherId) {
    throw badRequest("teacher_id must match the assigned teacher of the subject");
  }

  if (Number.isInteger(subject.year) && subject.year !== scheduleYear) {
    throw badRequest("subject_id year does not match the selected schedule year");
  }
}

router.get(
  "/schedules",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const filter = { department: cseDepartmentId };

    const year = parseOptionalNumber(req.query.year, "year");
    const semester = parseOptionalNumber(req.query.semester, "semester");
    const dayOfWeek = parseOptionalNumber(req.query.day_of_week, "day_of_week");
    const section = String(req.query.section || "").trim();
    const active = String(req.query.active || "").trim().toLowerCase();

    if (year !== null) {
      filter.year = year;
    }
    if (semester !== null) {
      filter.semester = semester;
    }
    if (dayOfWeek !== null) {
      filter.dayOfWeek = dayOfWeek;
    }
    if (section) {
      filter.section = section;
    }
    if (active === "true") {
      filter.active = true;
    }
    if (active === "false") {
      filter.active = false;
    }

    if (req.user.role === ROLES.STUDENT) {
      const student = await Student.findOne({ user: req.user._id, department: cseDepartmentId }).select(
        "year semester section",
      );
      if (!student) {
        throw notFound("Student profile not found");
      }
      filter.year = student.year;
      filter.semester = student.semester;
      filter.section = student.section;
    }

    if (req.user.role === ROLES.TEACHER) {
      filter.teacher = req.user._id;
    }

    const rows = await Schedule.find(filter)
      .populate("department", "name")
      .populate("subject", "name")
      .populate("teacher", "name")
      .sort({ dayOfWeek: 1, startTime: 1, section: 1 });

    res.json(rows.map(mapSchedule));
  }),
);

router.post(
  "/schedules",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const year = parseRequiredNumber(req.body?.year, "year");
    const semester = parseRequiredNumber(req.body?.semester, "semester");
    const section = parseRequiredString(req.body?.section, "section");
    const dayOfWeek = parseRequiredNumber(req.body?.day_of_week, "day_of_week");
    const startTime = normalizeTime(req.body?.start_time, "start_time");
    const endTime = normalizeTime(req.body?.end_time, "end_time");
    const subjectId = parseObjectId(req.body?.subject_id, "subject_id");
    const teacherId = parseObjectId(req.body?.teacher_id, "teacher_id");
    const room = parseRequiredString(req.body?.room, "room");
    const academicYear = parseRequiredString(req.body?.academic_year, "academic_year");
    validateRange(startTime, endTime);
    await validateTeacherAndSubject(teacherId, subjectId, cseDepartmentId, year);

    const created = await Schedule.create({
      department: cseDepartmentId,
      year,
      semester,
      section,
      dayOfWeek,
      startTime,
      endTime,
      subject: subjectId,
      teacher: teacherId,
      room,
      academicYear,
      active: req.body?.active === undefined ? true : Boolean(req.body.active),
    });

    res.status(201).json({
      success: true,
      message: "Academic schedule created successfully",
      id: created.id,
    });
  }),
);

router.put(
  "/schedules/:id",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const scheduleId = parseObjectId(req.params.id, "schedule id");
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule || schedule.department?.toString() !== cseDepartmentId) {
      throw notFound("Schedule not found");
    }

    const year = parseRequiredNumber(req.body?.year, "year");
    const semester = parseRequiredNumber(req.body?.semester, "semester");
    const section = parseRequiredString(req.body?.section, "section");
    const dayOfWeek = parseRequiredNumber(req.body?.day_of_week, "day_of_week");
    const startTime = normalizeTime(req.body?.start_time, "start_time");
    const endTime = normalizeTime(req.body?.end_time, "end_time");
    const subjectId = parseObjectId(req.body?.subject_id, "subject_id");
    const teacherId = parseObjectId(req.body?.teacher_id, "teacher_id");
    const room = parseRequiredString(req.body?.room, "room");
    const academicYear = parseRequiredString(req.body?.academic_year, "academic_year");
    validateRange(startTime, endTime);
    await validateTeacherAndSubject(teacherId, subjectId, cseDepartmentId, year);

    schedule.year = year;
    schedule.semester = semester;
    schedule.section = section;
    schedule.dayOfWeek = dayOfWeek;
    schedule.startTime = startTime;
    schedule.endTime = endTime;
    schedule.subject = subjectId;
    schedule.teacher = teacherId;
    schedule.room = room;
    schedule.academicYear = academicYear;
    schedule.active = req.body?.active === undefined ? schedule.active : Boolean(req.body.active);
    await schedule.save();

    res.json({ success: true, message: "Academic schedule updated successfully" });
  }),
);

router.delete(
  "/schedules/:id",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const scheduleId = parseObjectId(req.params.id, "schedule id");
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule || schedule.department?.toString() !== cseDepartmentId) {
      throw notFound("Schedule not found");
    }

    await Schedule.findByIdAndDelete(schedule._id);
    res.json({ success: true, message: "Academic schedule deleted successfully" });
  }),
);

export default router;
