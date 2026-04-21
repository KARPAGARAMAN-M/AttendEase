import express from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Subject from "../models/Subject.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertCseDepartment, getCseDepartmentId } from "../utils/cse.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { parseOptionalObjectId, parseOptionalNumber } from "../utils/parsers.js";
import { parseYearMonth, toIsoDate } from "../utils/time.js";

const router = express.Router();

function round2(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function isAttended(status) {
  return status === "Present" || status === "Late";
}

async function getStudentIdByUserId(userId, cseDepartmentId) {
  const student = await Student.findOne({ user: userId, department: cseDepartmentId }).select("_id");
  return student ? student.id : null;
}

async function fetchStudentReportData(studentId, subjectId, cseDepartmentId) {
  const filter = {};
  if (studentId) {
    filter.student = studentId;
  }
  if (subjectId) {
    filter.subject = subjectId;
  }

  const attendanceRows = await Attendance.find(filter)
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

  const records = [];
  const summaryMap = new Map();
  let overallTotal = 0;
  let overallAttended = 0;

  for (const row of attendanceRows) {
    if (
      !row.student ||
      !row.subject ||
      row.student.department?.id !== cseDepartmentId ||
      row.subject.department?.toString() !== cseDepartmentId
    ) {
      continue;
    }

    const studentKey = row.student.id;
    const subjectKey = row.subject.id;
    const key = `${studentKey}::${subjectKey}`;

    records.push({
      id: row.id,
      student_id: studentKey,
      student_name: row.student.user?.name || "",
      roll_no: row.student.rollNo || "",
      subject_id: subjectKey,
      subject_name: row.subject.name || "",
      date: toIsoDate(row.attendanceDate),
      status: row.status,
    });

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        student_id: studentKey,
        student_name: row.student.user?.name || "",
        roll_no: row.student.rollNo || "",
        subject_id: subjectKey,
        subject_name: row.subject.name || "",
        total_classes: 0,
        attended_classes: 0,
      });
    }

    const bucket = summaryMap.get(key);
    bucket.total_classes += 1;
    if (isAttended(row.status)) {
      bucket.attended_classes += 1;
    }

    overallTotal += 1;
    if (isAttended(row.status)) {
      overallAttended += 1;
    }
  }

  const subjectSummary = Array.from(summaryMap.values())
    .map((row) => ({
      ...row,
      percentage: row.total_classes
        ? round2((row.attended_classes * 100) / row.total_classes)
        : 0,
    }))
    .sort((a, b) => `${a.student_name}-${a.subject_name}`.localeCompare(`${b.student_name}-${b.subject_name}`));

  const overall = {
    total_classes: overallTotal,
    attended_classes: overallAttended,
    percentage: overallTotal ? round2((overallAttended * 100) / overallTotal) : 0,
  };

  return { records, subject_summary: subjectSummary, overall };
}

async function fetchMonthlyRows(monthValue, departmentId) {
  const parsed = parseYearMonth(monthValue);
  if (!parsed) {
    throw badRequest("month must be in YYYY-MM format");
  }

  const rows = await Attendance.find({
    attendanceDate: {
      $gte: parsed.start,
      $lt: parsed.end,
    },
  })
    .populate({
      path: "student",
      select: "department year semester section",
      populate: [{ path: "department", select: "name" }],
    })
    .populate("subject", "name");

  const grouped = new Map();
  for (const row of rows) {
    if (!row.student || !row.subject || !row.student.department) {
      continue;
    }
    if (departmentId && row.student.department.id !== departmentId) {
      continue;
    }

    const key = [
      row.student.department.id,
      row.student.year,
      row.student.semester,
      row.student.section,
      row.subject.id,
    ].join("::");

    if (!grouped.has(key)) {
      grouped.set(key, {
        department_id: row.student.department.id,
        department_name: row.student.department.name,
        year: row.student.year,
        semester: row.student.semester,
        section: row.student.section,
        subject_id: row.subject.id,
        subject_name: row.subject.name,
        total_classes: 0,
        attended_classes: 0,
      });
    }

    const bucket = grouped.get(key);
    bucket.total_classes += 1;
    if (isAttended(row.status)) {
      bucket.attended_classes += 1;
    }
  }

  const out = Array.from(grouped.values())
    .map((row) => ({
      ...row,
      percentage: row.total_classes
        ? round2((row.attended_classes * 100) / row.total_classes)
        : 0,
    }))
    .sort((a, b) =>
      `${a.department_name}-${a.year}-${a.semester}-${a.section}-${a.subject_name}`.localeCompare(
        `${b.department_name}-${b.year}-${b.semester}-${b.section}-${b.subject_name}`,
      ),
    );

  return { month: parsed.value, rows: out };
}

async function fetchAlertRows(threshold, departmentId) {
  const studentFilter = {};
  if (departmentId) {
    studentFilter.department = departmentId;
  }

  const students = await Student.find(studentFilter)
    .populate("user", "name")
    .populate("department", "name");

  const studentIds = students.map((item) => item._id);
  const attendanceRows = await Attendance.find({ student: { $in: studentIds } }).select(
    "student status",
  );

  const metrics = new Map();
  for (const student of students) {
    metrics.set(student.id, { total: 0, attended: 0 });
  }

  for (const row of attendanceRows) {
    const key = row.student.toString();
    if (!metrics.has(key)) {
      continue;
    }
    const metric = metrics.get(key);
    metric.total += 1;
    if (isAttended(row.status)) {
      metric.attended += 1;
    }
  }

  const result = [];
  for (const student of students) {
    const metric = metrics.get(student.id) || { total: 0, attended: 0 };
    const percentage = metric.total ? round2((metric.attended * 100) / metric.total) : 0;
    if (metric.total === 0 || percentage < threshold) {
      result.push({
        student_id: student.id,
        student_name: student.user?.name || "",
        roll_no: student.rollNo,
        department_name: student.department?.name || "",
        total_classes: metric.total,
        attended_classes: metric.attended,
        percentage,
      });
    }
  }

  return result.sort((a, b) => {
    const pct = a.percentage - b.percentage;
    if (pct !== 0) {
      return pct;
    }
    return a.student_name.localeCompare(b.student_name);
  });
}

router.get(
  "/attendance/report",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    let studentId = parseOptionalObjectId(req.query.student_id, "student_id");
    const subjectId = parseOptionalObjectId(req.query.subject_id, "subject_id");
    const cseDepartmentId = await getCseDepartmentId();

    if (studentId) {
      const isCseStudent = await Student.exists({ _id: studentId, department: cseDepartmentId });
      if (!isCseStudent) {
        throw badRequest("student_id must belong to the CSE department");
      }
    }

    if (subjectId) {
      const subject = await Subject.findById(subjectId).select("department");
      if (!subject || subject.department?.toString() !== cseDepartmentId) {
        throw badRequest("subject_id must belong to the CSE department");
      }
    }

    if (req.user.role === ROLES.STUDENT) {
      const ownStudentId = await getStudentIdByUserId(req.user._id, cseDepartmentId);
      if (!ownStudentId) {
        throw notFound("Student profile not found for logged-in user");
      }
      if (studentId && studentId !== ownStudentId) {
        throw forbidden("Students can only view their own report");
      }
      studentId = ownStudentId;
    }

    const payload = await fetchStudentReportData(studentId, subjectId, cseDepartmentId);
    res.json(payload);
  }),
);

router.get(
  "/attendance/monthly",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const monthValue =
      String(req.query.month || "").trim() || new Date().toISOString().slice(0, 7);
    const requestedDepartmentId = parseOptionalObjectId(req.query.department_id, "department_id");
    const cseDepartmentId = await getCseDepartmentId();

    if (requestedDepartmentId) {
      await assertCseDepartment(requestedDepartmentId, "department_id");
    }

    const report = await fetchMonthlyRows(monthValue, cseDepartmentId);
    res.json({
      month: report.month,
      department_id: cseDepartmentId,
      rows: report.rows,
    });
  }),
);

router.get(
  "/attendance/alert",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const threshold = parseOptionalNumber(req.query.threshold, "threshold");
    const requestedDepartmentId = parseOptionalObjectId(req.query.department_id, "department_id");
    const cseDepartmentId = await getCseDepartmentId();
    if (requestedDepartmentId) {
      await assertCseDepartment(requestedDepartmentId, "department_id");
    }
    const safeThreshold = threshold === null ? 75 : threshold;

    const rows = await fetchAlertRows(safeThreshold, cseDepartmentId);
    res.json({ threshold: safeThreshold, rows });
  }),
);

router.get(
  "/attendance/export/pdf",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const threshold = parseOptionalNumber(req.query.threshold, "threshold");
    const requestedDepartmentId = parseOptionalObjectId(req.query.department_id, "department_id");
    const cseDepartmentId = await getCseDepartmentId();
    if (requestedDepartmentId) {
      await assertCseDepartment(requestedDepartmentId, "department_id");
    }
    const safeThreshold = threshold === null ? 75 : threshold;
    const rows = await fetchAlertRows(safeThreshold, cseDepartmentId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="attendance-alert-report.pdf"');

    const doc = new PDFDocument({ margin: 32, size: "A4" });
    doc.pipe(res);
    doc.fontSize(16).text("Attendance Alert Report", { align: "left" });
    doc.moveDown(0.2);
    doc.fontSize(11).text(`Threshold: ${safeThreshold}%`);
    doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`);
    doc.moveDown(1);

    doc.fontSize(10).text("Student");
    doc.moveDown(0.2);
    for (const row of rows) {
      const line = `${row.student_name} (${row.roll_no}) | ${row.department_name} | Total: ${row.total_classes} | Attended: ${row.attended_classes} | ${row.percentage}%`;
      doc.text(line);
    }

    doc.end();
  }),
);

router.get(
  "/attendance/export/excel",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD),
  asyncHandler(async (req, res) => {
    const threshold = parseOptionalNumber(req.query.threshold, "threshold");
    const requestedDepartmentId = parseOptionalObjectId(req.query.department_id, "department_id");
    const cseDepartmentId = await getCseDepartmentId();
    if (requestedDepartmentId) {
      await assertCseDepartment(requestedDepartmentId, "department_id");
    }
    const safeThreshold = threshold === null ? 75 : threshold;
    const rows = await fetchAlertRows(safeThreshold, cseDepartmentId);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance Alert");
    sheet.columns = [
      { header: "Student ID", key: "student_id", width: 28 },
      { header: "Name", key: "student_name", width: 24 },
      { header: "Roll No", key: "roll_no", width: 14 },
      { header: "Department", key: "department_name", width: 30 },
      { header: "Total", key: "total_classes", width: 12 },
      { header: "Attended", key: "attended_classes", width: 12 },
      { header: "Percentage", key: "percentage", width: 12 },
    ];
    rows.forEach((row) => sheet.addRow(row));
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", 'attachment; filename="attendance-alert-report.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  }),
);

export default router;
