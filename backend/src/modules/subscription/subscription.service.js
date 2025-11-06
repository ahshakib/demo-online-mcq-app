import { Subscription } from "./subscription.model.js";

export const createSubscription = async (userId, planType, amount) => {
  const durationDays =
    planType === "basic" ? 7 : planType === "premium" ? 30 : 90;

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  return await Subscription.create({
    user: userId,
    planType,
    endDate,
    amountPaid: amount,
  });
};

export const getUserSubscriptions = async (userId) => {
  return await Subscription.find({ user: userId }).sort({ createdAt: -1 });
};

export const getSubscriptionAnalytics = async () => {
  const total = await Subscription.countDocuments();
  const active = await Subscription.countDocuments({ status: "active" });
  const expired = await Subscription.countDocuments({ status: "expired" });

  return { total, active, expired };
};

export const expireOldSubscriptions = async () => {
  const now = new Date();
  const result = await Subscription.updateMany(
    { endDate: { $lt: now }, status: "active" },
    { status: "expired" }
  );
  return result.modifiedCount;
};
