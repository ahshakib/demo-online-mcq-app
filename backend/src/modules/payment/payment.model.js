import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Cancelled"],
      default: "Pending",
    },
    paymentGateway: {
      type: String,
      default: "SSLCommerz",
    },
    subscriptionType: {
      type: String,
      enum: ["basic", "premium", "pro"],
      required: true,
    },
    validTill: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
