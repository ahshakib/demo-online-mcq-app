import express from "express";
import { auth } from "../../../middlewares/auth.middleware.js";
import { uploadExamImage } from "../../../middlewares/uploadExam.middleware.js";
import { createQuestion } from "./question.controller.js";

const router = express.Router();

router.post(
  "/",
  auth(["admin"]),
  uploadExamImage.fields([
    { name: "questionImage", maxCount: 1 },
    { name: "explanationImage", maxCount: 1 },
  ]),
  createQuestion
);

export default router;
