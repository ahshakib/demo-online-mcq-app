import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import * as userController from "./user.controller.js";

const router = express.Router();

// Public
router.post("/register", userController.register);
router.post("/register/admin", userController.registerAdmin);
router.post("/login", userController.login);
router.post("/login/admin", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Protected
router.patch("/profile", auth(), upload.single("profilePic"), userController.updateProfile);
router.get("/profile", auth(), userController.getProfile);

export default router;
