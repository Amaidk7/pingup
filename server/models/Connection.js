import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
  from_user_id: { type: String, ref: "User", required: true },
  to_user_id: { type: String, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  // ✅ type field — follow ya connection
  type: {
    type: String,
    enum: ["follow", "connection"],
    default: "connection",
  },
}, { timestamps: true });

const Connection = mongoose.model("Connection", connectionSchema);

export default Connection;
