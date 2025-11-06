import {
  getUserSubscriptions,
  getSubscriptionAnalytics,
  expireOldSubscriptions,
} from "./subscription.service.js";

export const getUserSubscriptionsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptions = await getUserSubscriptions(userId);
    res.json({ success: true, data: subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubscriptionAnalyticsController = async (req, res) => {
  try {
    const analytics = await getSubscriptionAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const expireSubscriptionsController = async (req, res) => {
  try {
    const count = await expireOldSubscriptions();
    res.json({ success: true, message: `${count} subscriptions expired.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
