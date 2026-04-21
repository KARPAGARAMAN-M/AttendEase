import express from "express";
import { CSE_DEPARTMENT_NAME } from "../constants/cse.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { requireAuth, requireRoles } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest } from "../utils/errors.js";
import { assertCseDepartment, getCseDepartmentId, getOrCreateCseDepartment } from "../utils/cse.js";
import {
  parseOptionalObjectId,
  parseRequiredString,
} from "../utils/parsers.js";

const router = express.Router();

router.get(
  "/teachers",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER),
  asyncHandler(async (req, res) => {
    const teachers = await User.find({ role: ROLES.TEACHER })
      .select("username role name email")
      .sort({ name: 1 });

    res.json(
      teachers.map((teacher) => ({
        id: teacher.id,
        username: teacher.username,
        role: teacher.role,
        name: teacher.name,
        email: teacher.email,
      })),
    );
  }),
);

router.post(
  "/teachers",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const username = parseRequiredString(req.body?.username, "username");
    const password = parseRequiredString(req.body?.password, "password");
    const name = parseRequiredString(req.body?.name, "name");
    const email = parseRequiredString(req.body?.email, "email");

    const teacher = await User.create({
      username,
      password,
      role: ROLES.TEACHER,
      name,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Teacher created successfully",
      id: teacher.id,
    });
  }),
);

router.get(
  "/departments",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const cseDepartment = await getOrCreateCseDepartment();
    res.json([{ id: cseDepartment.id, name: cseDepartment.name }]);
  }),
);

router.post(
  "/departments",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const name = parseRequiredString(req.body?.name, "name");
    if (name.toLowerCase() !== CSE_DEPARTMENT_NAME.toLowerCase()) {
      throw badRequest(`CSE-only mode is enabled. Department must be ${CSE_DEPARTMENT_NAME}.`);
    }

    const department = await getOrCreateCseDepartment();
    res.status(201).json({
      success: true,
      message: "Department is configured successfully",
      id: department.id,
    });
  }),
);

router.get(
  "/subjects",
  requireAuth,
  requireRoles(ROLES.ADMIN, ROLES.HOD, ROLES.TEACHER, ROLES.STUDENT),
  asyncHandler(async (req, res) => {
    const departmentId = parseOptionalObjectId(req.query.department_id, "department_id");
    const teacherId = parseOptionalObjectId(req.query.teacher_id, "teacher_id");
    const cseDepartmentId = await getCseDepartmentId();

    if (departmentId) {
      await assertCseDepartment(departmentId, "department_id");
    }

    const filter = { department: cseDepartmentId };
    if (teacherId) {
      filter.teacher = teacherId;
    }

    const subjects = await Subject.find(filter)
      .populate("department", "name")
      .populate("teacher", "name")
      .sort({ name: 1 });

    const rows = subjects
      .map((subject) => ({
        id: subject.id,
        name: subject.name,
        department_id: subject.department?.id || null,
        department_name: subject.department?.name || "",
        teacher_id: subject.teacher?.id || null,
        teacher_name: subject.teacher?.name || null,
      }))
      .sort((a, b) =>
        `${a.department_name}-${a.name}`.localeCompare(`${b.department_name}-${b.name}`),
      );

    res.json(rows);
  }),
);

router.post(
  "/subjects",
  requireAuth,
  requireRoles(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const name = parseRequiredString(req.body?.name, "name");
    const departmentId = parseOptionalObjectId(req.body?.department_id, "department_id");
    const teacher = parseOptionalObjectId(req.body?.teacher_id, "teacher_id");
    const cseDepartmentId = await getCseDepartmentId();

    if (departmentId) {
      await assertCseDepartment(departmentId, "department_id");
    }

    const created = await Subject.create({
      name,
      department: cseDepartmentId,
      teacher: teacher || null,
    });

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      id: created.id,
    });
  }),
);

export default router;
