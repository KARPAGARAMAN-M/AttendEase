import mongoose from "mongoose";
import { badRequest } from "./errors.js";

export function parseOptionalNumber(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw badRequest(`${fieldName} must be a number`);
  }
  return num;
}

export function parseRequiredNumber(value, fieldName) {
  const num = parseOptionalNumber(value, fieldName);
  if (num === null) {
    throw badRequest(`${fieldName} is required`);
  }
  return num;
}

export function parseRequiredString(value, fieldName) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    throw badRequest(`${fieldName} is required`);
  }
  return raw;
}

export function parseObjectId(value, fieldName) {
  const raw = String(value || "").trim();
  if (!raw) {
    throw badRequest(`${fieldName} is required`);
  }
  if (!mongoose.Types.ObjectId.isValid(raw)) {
    throw badRequest(`Invalid ${fieldName}`);
  }
  return raw;
}

export function parseOptionalObjectId(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }
  return parseObjectId(value, fieldName);
}
