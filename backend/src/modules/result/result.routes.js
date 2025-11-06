import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { resultController } from "./result.controller.js";

const router = express.Router();

// User routes
router.get("/my-results", auth(), resultController.getMyResults);
router.get("/my-analytics", auth(), resultController.getUserAnalytics);

// Leaderboard (public or auth-protected)
router.get("/leaderboard/:examId", resultController.getLeaderboard);

// Admin routes
router.get("/all", auth(['admin']), resultController.getAllResults);
router.get("/admin-analytics", auth(['admin']), resultController.getAdminAnalytics);

export default router;
