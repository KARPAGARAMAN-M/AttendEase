import express from "express";
import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertCseDepartment, getCseDepartmentId } from "../utils/cse.js";
import { notFound } from "../utils/errors.js";
import {
  parseObjectId,
  parseOptionalNumber,
  parseRequiredNumber,
  parseRequiredString,
} from "../utils/parsers.js";

const router = express.Router();

function mapStudent(student) {
  return {
    id: student.id,
    user_id: student.user?.id || null,
    username: student.user?.username || "",
    name: student.user?.name || "",
    email: student.user?.email || "",
    roll_no: student.rollNo,
    department_id: student.department?.id || null,
    department_name: student.department?.name || "",
    year: student.year,
    semester: student.semester,
    section: student.section,
  };
}

router.get(
  "/students",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.TEACHER, ROLES.HOD, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const filter = {};
    const cseDepartmentId = await getCseDepartmentId();

    if (req.query.department_id) {
      const requestedDepartmentId = parseObjectId(req.query.department_id, "department_id");
      await assertCseDepartment(requestedDepartmentId, "department_id");
    }
    filter.department = cseDepartmentId;

    const year = parseOptionalNumber(req.query.year, "year");
    if (year !== null) {
      filter.year = year;
    }

    const semester = parseOptionalNumber(req.query.semester, "semester");
    if (semester !== null) {
      filter.semester = semester;
    }

    const section = String(req.query.section || "").trim();
    if (section) {
      filter.section = section;
    }

    if (req.user.role === ROLES.STUDENT) {
      filter.user = req.user._id;
    }

    const students = await Student.find(filter)
      .populate("user", "username name email role")
      .populate("department", "name")
      .sort({ rollNo: 1 });

    const rows = students
      .map(mapStudent)
      .sort((a, b) =>
        `${a.department_name}-${a.year}-${a.semester}-${a.section}-${a.roll_no}`.localeCompare(
          `${b.department_name}-${b.year}-${b.semester}-${b.section}-${b.roll_no}`,
        ),
      );

    res.json(rows);
  }),
);

router.post(
  "/students",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const username = parseRequiredString(req.body?.username, "username");
    const password = parseRequiredString(req.body?.password, "password");
    const name = parseRequiredString(req.body?.name, "name");
    const email = parseRequiredString(req.body?.email, "email");
    const rollNo = parseRequiredString(req.body?.roll_no, "roll_no");
    const department = parseObjectId(req.body?.department_id, "department_id");
    await assertCseDepartment(department, "department_id");
    const year = parseRequiredNumber(req.body?.year, "year");
    const semester = parseRequiredNumber(req.body?.semester, "semester");
    const section = parseRequiredString(req.body?.section, "section");

    const user = await User.create({
      username,
      password,
      role: ROLES.STUDENT,
      name,
      email,
    });

    try {
      const student = await Student.create({
        user: user._id,
        rollNo,
        department,
        year,
        semester,
        section,
      });

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        id: student.id,
        user_id: user.id,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  }),
);

router.put(
  "/students/:id",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const studentId = parseObjectId(req.params.id, "student id");
    const student = await Student.findById(studentId);
    if (!student) {
      throw notFound("Student not found");
    }

    const username = parseRequiredString(req.body?.username, "username");
    const name = parseRequiredString(req.body?.name, "name");
    const email = parseRequiredString(req.body?.email, "email");
    const rollNo = parseRequiredString(req.body?.roll_no, "roll_no");
    const department = parseObjectId(req.body?.department_id, "department_id");
    await assertCseDepartment(department, "department_id");
    const year = parseRequiredNumber(req.body?.year, "year");
    const semester = parseRequiredNumber(req.body?.semester, "semester");
    const section = parseRequiredString(req.body?.section, "section");
    const password = String(req.body?.password || "").trim();

    const user = await User.findById(student.user).select("+password");
    if (!user) {
      throw notFound("Linked user not found");
    }

    user.username = username;
    user.name = name;
    user.email = email;
    if (password) {
      user.password = password;
    }
    await user.save();

    student.rollNo = rollNo;
    student.department = department;
    student.year = year;
    student.semester = semester;
    student.section = section;
    await student.save();

    res.json({ success: true, message: "Student updated successfully" });
  }),
);

router.delete(
  "/students/:id",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const studentId = parseObjectId(req.params.id, "student id");
    const student = await Student.findById(studentId);
    if (!student) {
      throw notFound("Student not found");
    }

    await Attendance.deleteMany({ student: student._id });
    await Student.findByIdAndDelete(student._id);
    await User.findByIdAndDelete(student.user);

    res.json({ success: true, message: "Student deleted successfully" });
  }),
);

export default router;
