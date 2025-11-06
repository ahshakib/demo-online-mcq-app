import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profilePic: { type: String, default: "" },
  bio: String,
  phone: String,
  resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
