import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { ROLE_VALUES } from "../constants/roles.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, unauthorized } from "../utils/errors.js";
import { requireAuth, buildAuthPayload } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    const role = String(req.body?.role || "").trim().toUpperCase();

    if (!username || !password || !role) {
      throw badRequest("username, password, and role are required");
    }

    if (!ROLE_VALUES.includes(role)) {
      throw badRequest("Invalid role selected");
    }

    const user = await User.findOne({ username }).select("+password");
    if (!user) {
      throw unauthorized("Invalid credentials");
    }

    const isMatch = await user.verifyPassword(password);
    if (!isMatch) {
      throw unauthorized("Invalid credentials");
    }

    if (user.role !== role) {
      throw unauthorized("Invalid credentials for selected portal");
    }

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      token,
      user: buildAuthPayload(user),
    });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.status(200).json(buildAuthPayload(req.user));
  }),
);

export default router;
