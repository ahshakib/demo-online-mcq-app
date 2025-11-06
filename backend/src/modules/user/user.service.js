import User from "./user.model.js";
import { hashPassword, comparePassword } from "../../utils/bcrypt.util.js";
import { generateToken } from "../../utils/jwt.util.js";
import crypto from "crypto";
import e from "express";

export const registerUser = async (data, role = "user") => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error("Email already registered");

  const hashed = await hashPassword(data.password);
  const user = await User.create({ ...data, password: hashed, role });
  return { token: generateToken(user), user };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  return { token: generateToken(user), user };
};



export const updateProfile = async (id, updates) => {
  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  return user;
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // here you’d send email with link `${CLIENT_URL}/reset/${token}`
  return { message: "Reset email sent", token };
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpires: { $gt: Date.now() }
  });
  if (!user) throw new Error("Invalid or expired token");

  user.password = await hashPassword(newPassword);
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  return { message: "Password updated successfully" };
};
