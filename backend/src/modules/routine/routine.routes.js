import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import { routineController } from "./routine.controller.js";

const router = express.Router();

// Admin routes
router.post("/", auth(["admin"]), routineController.createRoutine);
router.put("/:id", auth(["admin"]), routineController.updateRoutine);
router.delete("/:id", auth(["admin"]), routineController.deleteRoutine);

// Common routes
router.get("/", routineController.getAllRoutines);
router.get("/:id", routineController.getRoutine);

// User-specific
router.get("/user/upcoming", auth(), routineController.getUpcomingForUser);

export default router;
