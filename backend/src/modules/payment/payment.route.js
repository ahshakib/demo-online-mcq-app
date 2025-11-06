import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import {
    failController,
    startPaymentController,
    successController,
} from "./payment.controller.js";

const router = express.Router();

router.post("/initiate", auth(), startPaymentController);
router.post("/success", successController);
router.post("/fail", failController);
router.post("/cancel", failController);

export default router;
