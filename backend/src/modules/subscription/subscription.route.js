import express from "express";
import { auth } from "../../middlewares/auth.middleware.js";
import {
    expireSubscriptionsController,
    getSubscriptionAnalyticsController,
    getUserSubscriptionsController,
} from "./subscription.controller.js";

const router = express.Router();

router.get("/me", auth(), getUserSubscriptionsController);
router.get("/analytics", auth(["admin"]), getSubscriptionAnalyticsController);
router.post("/expire", auth(["admin"]), expireSubscriptionsController);

export default router;
