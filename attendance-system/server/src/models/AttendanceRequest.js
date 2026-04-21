import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const REQUEST_TYPES = ["LEAVE", "CORRECTION"];
const REQUEST_STATUS = ["PENDING", "APPROVED", "REJECTED"];
const ATTENDANCE_STATUS = ["Present", "Absent", "Late"];

const attendanceRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    requestType: { type: String, required: true, enum: REQUEST_TYPES },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", default: null },
    attendanceDate: { type: Date, required: true },
    requestedStatus: { type: String, enum: ATTENDANCE_STATUS, default: null },
    reason: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: REQUEST_STATUS, default: "PENDING" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, trim: true, default: "" },
  },
  schemaOptions,
);

attendanceRequestSchema.index({
  student: 1,
  requestType: 1,
  attendanceDate: 1,
  subject: 1,
  status: 1,
});

const AttendanceRequest = mongoose.model("AttendanceRequest", attendanceRequestSchema);
export default AttendanceRequest;
