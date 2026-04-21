import express from "express";
import Attendance from "../models/Attendance.js";
import AttendanceRequest from "../models/AttendanceRequest.js";
import Notification from "../models/Notification.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getCseDepartmentId } from "../utils/cse.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { parseObjectId, parseRequiredString } from "../utils/parsers.js";
import { normalizeDay, toIsoDate } from "../utils/time.js";

const router = express.Router();

const REQUEST_TYPES = ["LEAVE", "CORRECTION"];
const REQUEST_STATUS = ["PENDING", "APPROVED", "REJECTED"];
const ATTENDANCE_STATUS = ["Present", "Absent", "Late"];

function parseRequestType(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!REQUEST_TYPES.includes(normalized)) {
    throw badRequest(`request_type must be one of: ${REQUEST_TYPES.join(", ")}`);
  }
  return normalized;
}

function parseReviewStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(normalized)) {
    throw badRequest("status must be APPROVED or REJECTED");
  }
  return normalized;
}

function parseAttendanceStatus(value, fieldName = "requested_status") {
  const normalized = String(value || "").trim();
  if (!ATTENDANCE_STATUS.includes(normalized)) {
    throw badRequest(`${fieldName} must be one of: ${ATTENDANCE_STATUS.join(", ")}`);
  }
  return normalized;
}

function mapRequest(row) {
  return {
    id: row.id,
    student_id: row.student?.id || null,
    student_name: row.student?.user?.name || "",
    roll_no: row.student?.rollNo || "",
    request_type: row.requestType,
    subject_id: row.subject?.id || null,
    subject_name: row.subject?.name || "",
    date: toIsoDate(row.attendanceDate),
    requested_status: row.requestedStatus || null,
    reason: row.reason,
    status: row.status,
    review_note: row.reviewNote || "",
    reviewed_at: row.reviewedAt ? new Date(row.reviewedAt).toISOString() : null,
    reviewed_by: row.reviewedBy?.name || null,
    created_at: row.createdAt ? new Date(row.createdAt).toISOString() : null,
  };
}

async function getStudentProfileByUserId(userId, cseDepartmentId) {
  const student = await Student.findOne({ user: userId, department: cseDepartmentId }).populate(
    "user",
    "name",
  );
  if (!student) {
    throw notFound("Student profile not found for logged-in user");
  }
  return student;
}

router.get(
  "/attendance-requests",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const requestedStatus = String(req.query.status || "").trim().toUpperCase();
    const filter = {};

    if (requestedStatus) {
      if (!REQUEST_STATUS.includes(requestedStatus)) {
        throw badRequest(`status must be one of: ${REQUEST_STATUS.join(", ")}`);
      }
      filter.status = requestedStatus;
    }

    if (req.user.role === ROLES.STUDENT) {
      const student = await getStudentProfileByUserId(req.user._id, cseDepartmentId);
      filter.student = student._id;
    } else if (req.user.role === ROLES.TEACHER) {
      const subjects = await Subject.find({
        teacher: req.user._id,
        department: cseDepartmentId,
      }).select("_id");

      if (!subjects.length) {
        return res.json({ rows: [] });
      }
      filter.subject = { $in: subjects.map((row) => row._id) };
    } else {
      const cseStudents = await Student.find({ department: cseDepartmentId }).select("_id");
      filter.student = { $in: cseStudents.map((row) => row._id) };
    }

    const rows = await AttendanceRequest.find(filter)
      .populate({
        path: "student",
        select: "rollNo",
        populate: [{ path: "user", select: "name" }],
      })
      .populate("subject", "name")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ rows: rows.map(mapRequest) });
  }),
);

router.post(
  "/attendance-requests",
  requireAuth,
  requireRoles(ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const student = await getStudentProfileByUserId(req.user._id, cseDepartmentId);
    const requestType = parseRequestType(req.body?.request_type);
    const reason = parseRequiredString(req.body?.reason, "reason");
    const attendanceDate = normalizeDay(req.body?.date);
    if (!attendanceDate) {
      throw badRequest("date must be in YYYY-MM-DD format");
    }

    let subjectId = null;
    let requestedStatus = null;

    if (requestType === "CORRECTION") {
      subjectId = parseObjectId(req.body?.subject_id, "subject_id");
      requestedStatus = parseAttendanceStatus(req.body?.requested_status, "requested_status");

      const subject = await Subject.findById(subjectId).select("department");
      if (!subject || subject.department?.toString() !== cseDepartmentId) {
        throw badRequest("subject_id must belong to CSE department");
      }
    }

    const duplicate = await AttendanceRequest.findOne({
      student: student._id,
      requestType,
      attendanceDate,
      subject: subjectId || null,
      status: "PENDING",
    }).select("_id");

    if (duplicate) {
      throw badRequest("A similar pending request already exists");
    }

    const created = await AttendanceRequest.create({
      student: student._id,
      requestType,
      subject: subjectId || null,
      attendanceDate,
      requestedStatus,
      reason,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      id: created.id,
    });
  }),
);

router.patch(
  "/attendance-requests/:id/review",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const cseDepartmentId = await getCseDepartmentId();
    const requestId = parseObjectId(req.params.id, "request id");
    const decision = parseReviewStatus(req.body?.status);
    const reviewNote = String(req.body?.review_note || "").trim();

    const request = await AttendanceRequest.findById(requestId)
      .populate({
        path: "student",
        select: "rollNo department user",
        populate: [{ path: "user", select: "name" }],
      })
      .populate("subject", "name");

    if (!request) {
      throw notFound("Attendance request not found");
    }
    if (request.student?.department?.toString() !== cseDepartmentId) {
      throw forbidden("Only CSE attendance requests can be reviewed");
    }
    if (request.status !== "PENDING") {
      throw badRequest("Only pending requests can be reviewed");
    }

    request.status = decision;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote;

    if (decision === "APPROVED" && request.requestType === "CORRECTION") {
      if (!request.subject || !request.requestedStatus) {
        throw badRequest("Correction request is missing subject/status details");
      }

      await Attendance.findOneAndUpdate(
        {
          student: request.student._id,
          subject: request.subject._id,
          attendanceDate: request.attendanceDate,
        },
        {
          student: request.student._id,
          subject: request.subject._id,
          attendanceDate: request.attendanceDate,
          status: request.requestedStatus,
          markedBy: req.user._id,
        },
        { upsert: true, new: true, runValidators: true },
      );
    }

    await request.save();

    await Notification.create({
      recipient: request.student.user,
      student: request.student._id,
      type: "REQUEST_STATUS",
      title: "Attendance Request Reviewed",
      message: `Your ${request.requestType.toLowerCase()} request for ${toIsoDate(request.attendanceDate)} was ${decision.toLowerCase()}.`,
      meta: {
        request_id: request.id,
        status: decision,
      },
    });

    res.json({ success: true, message: "Attendance request reviewed successfully" });
  }),
);

export default router;
