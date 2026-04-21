import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { forbidden, unauthorized } from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

function extractToken(headerValue = "") {
  const raw = String(headerValue).trim();
  if (!raw) {
    return null;
  }
  if (raw.toLowerCase().startsWith("bearer ")) {
    return raw.slice(7).trim();
  }
  return raw;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    throw unauthorized("Missing authorization token");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub).select("+password");
  if (!user) {
    throw unauthorized("Session user no longer exists");
  }

  req.user = user;
  next();
});

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw unauthorized("Authentication required");
    }
    if (!roles.includes(req.user.role)) {
      throw forbidden("You are not allowed to access this resource");
    }
    next();
  };
}

export function buildAuthPayload(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
  };
}
