import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    attendanceDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["Present", "Absent", "Late"] },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  schemaOptions,
);

attendanceSchema.index({ student: 1, subject: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
