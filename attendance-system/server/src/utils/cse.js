import { CSE_DEPARTMENT_NAME } from "../constants/cse.js";
import Department from "../models/Department.js";
import { badRequest } from "./errors.js";

let cseDepartmentIdCache = "";

export async function getOrCreateCseDepartment() {
  let department = null;
  if (cseDepartmentIdCache) {
    department = await Department.findById(cseDepartmentIdCache);
  }

  if (!department) {
    department = await Department.findOne({ name: CSE_DEPARTMENT_NAME });
  }

  if (!department) {
    department = await Department.create({ name: CSE_DEPARTMENT_NAME });
  }

  cseDepartmentIdCache = department.id;
  return department;
}

export async function getCseDepartmentId() {
  const department = await getOrCreateCseDepartment();
  return department.id;
}

export async function assertCseDepartment(departmentId, fieldName = "department_id") {
  const cseDepartmentId = await getCseDepartmentId();
  if (String(departmentId || "") !== cseDepartmentId) {
    throw badRequest(`${fieldName} must be ${CSE_DEPARTMENT_NAME}`);
  }
  return cseDepartmentId;
}
