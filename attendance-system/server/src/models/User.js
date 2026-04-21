import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLE_VALUES } from "../constants/roles.js";
import { schemaOptions } from "./schemaOptions.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, required: true, enum: ROLE_VALUES },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  schemaOptions,
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.verifyPassword = function verifyPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
