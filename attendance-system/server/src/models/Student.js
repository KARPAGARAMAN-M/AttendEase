import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNo: { type: String, required: true, trim: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, required: true, trim: true },
  },
  schemaOptions,
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
