import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const scheduleSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, required: true, trim: true },
    dayOfWeek: { type: Number, required: true, min: 1, max: 7 },
    startTime: { type: String, required: true, trim: true, match: /^\d{2}:\d{2}$/ },
    endTime: { type: String, required: true, trim: true, match: /^\d{2}:\d{2}$/ },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  schemaOptions,
);

scheduleSchema.index(
  {
    department: 1,
    year: 1,
    semester: 1,
    section: 1,
    dayOfWeek: 1,
    startTime: 1,
    endTime: 1,
    subject: 1,
  },
  { unique: true },
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
