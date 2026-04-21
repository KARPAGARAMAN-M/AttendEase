import mongoose from "mongoose";
import { schemaOptions } from "./schemaOptions.js";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    type: { type: String, required: true, enum: ["LOW_ATTENDANCE", "REQUEST_STATUS", "SYSTEM"] },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    meta: { type: Object, default: {} },
  },
  schemaOptions,
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
