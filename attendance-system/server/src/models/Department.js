import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  schemaOptions,
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
