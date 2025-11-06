import { errorResponse, successResponse } from "../../utils/response.util.js";
import * as userService from "./user.service.js";

export const register = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    successResponse(res, result, 201);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const registerAdmin = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body, "admin");
    successResponse(res, result, 201);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message, 401);
  }
};


export const updateProfile = async (req, res) => {
  try {
    // If a file was uploaded, store relative path under uploads (so client can fetch at /uploads/profile/...)
    const data = req.file
      ? { ...req.body, profilePic: `profile/${req.file.filename}` }
      : req.body;
    const result = await userService.updateProfile(req.user._id, data);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user is populated by auth middleware. Remove sensitive fields before returning.
    const userObj = req.user && req.user.toObject ? req.user.toObject() : req.user;
    if (!userObj) return errorResponse(res, "User not found", 404);

    const { password, resetToken, resetTokenExpires, refreshToken, refreshTokenExpires, __v, ...publicProfile } = userObj;
    successResponse(res, publicProfile);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await userService.forgotPassword(req.body.email);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await userService.resetPassword(req.body.token, req.body.newPassword);
    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

