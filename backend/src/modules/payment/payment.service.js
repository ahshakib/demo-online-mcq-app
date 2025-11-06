import SSLCommerzPayment from "sslcommerz-lts";
import { createSubscription } from "../subscription/subscription.service.js";
import { Payment } from "./payment.model.js";

const store_id = process.env.SSLCZ_STORE_ID || "YOUR_STORE_ID";
const store_passwd = process.env.SSLCZ_STORE_PASSWORD || "YOUR_STORE_PASSWORD";
const is_live = process.env.SSLCZ_IS_LIVE === "true"; // false = sandbox

export const initiatePayment = async (user, { amount, subscriptionType }) => {
  // In test environment, avoid calling external payment SDK.
  if (process.env.NODE_ENV === 'test') {
    const transactionId = "TXN_TEST_" + Date.now();
    const GatewayPageURL = `https://test-gateway.local/${transactionId}`;
    const payment = await Payment.create({
      user: user._id,
      amount,
      transactionId,
      subscriptionType,
      paymentStatus: "Pending",
    });
    return { GatewayPageURL, transactionId, payment };
  }

  const transactionId = "TXN_" + Date.now();

  const data = {
    total_amount: amount,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${process.env.BASE_URL}/api/payment/success`,
    fail_url: `${process.env.BASE_URL}/api/payment/fail`,
    cancel_url: `${process.env.BASE_URL}/api/payment/cancel`,
    ipn_url: `${process.env.BASE_URL}/api/payment/ipn`,
    product_name: subscriptionType + " plan",
    product_category: "Subscription",
    product_profile: "general",
    cus_name: user.name,
    cus_email: user.email,
    cus_phone: user.phone || "N/A",
    cus_add1: user.address || "Dhaka",
    ship_add1: "Dhaka",
    ship_city: "Dhaka",
    ship_country: "Bangladesh",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const apiResponse = await sslcz.init(data);

  const GatewayPageURL = apiResponse.GatewayPageURL;

  const payment = await Payment.create({
    user: user._id,
    amount,
    transactionId,
    subscriptionType,
    paymentStatus: "Pending",
  });

  return { GatewayPageURL, transactionId, payment };
};

export const handlePaymentSuccess = async (payload) => {
  const { tran_id } = payload;
  const payment = await Payment.findOneAndUpdate(
    { transactionId: tran_id },
    { paymentStatus: "Success" },
    { new: true }
  );

  if (payment) {
    await createSubscription(payment.user, payment.subscriptionType, payment.amount);
  }

  return payment;
};

export const handlePaymentFailure = async (tran_id) => {
  return await Payment.findOneAndUpdate(
    { transactionId: tran_id },
    { paymentStatus: "Failed" },
    { new: true }
  );
};
