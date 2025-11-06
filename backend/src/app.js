import cors from "cors";
import express from "express";
import morgan from "morgan";
import chapterRoutes from "./modules/chapter/chapter.routes.js";
import examRoutes from "./modules/exam/exam.route.js";
import subjectRoutes from "./modules/subject/subject.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import resultRoutes from "./modules/result/result.routes.js";
import routineRoutes from "./modules/routine/routine.routes.js";
import paymentRoutes from "./modules/payment/payment.route.js";
import subscriptionRoutes from "./modules/subscription/subscription.route.js";
import { errorResponse } from "./utils/response.util.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/exams", examRoutes);
app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/routines", routineRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  errorResponse(res, err.message || "Internal server error", 500);
});

export default app;
