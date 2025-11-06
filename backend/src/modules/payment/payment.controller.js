import {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
} from "./payment.service.js";

export const startPaymentController = async (req, res) => {
  try {
    const user = req.user;
    const { amount, subscriptionType } = req.body;

    const { GatewayPageURL, transactionId } = await initiatePayment(user, {
      amount,
      subscriptionType,
    });

    res.json({ success: true, url: GatewayPageURL, transactionId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const successController = async (req, res) => {
  try {
    const payment = await handlePaymentSuccess(req.body);
    res.json({ success: true, message: "Payment successful", payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const failController = async (req, res) => {
  try {
    const payment = await handlePaymentFailure(req.body.tran_id);
    res.json({ success: false, message: "Payment failed", payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
