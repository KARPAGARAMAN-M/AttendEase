import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    year: { type: Number, required: true, min: 1, max: 4 },
  },
  schemaOptions,
);

subjectSchema.index({ name: 1, department: 1, year: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;
