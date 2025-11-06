import { Result } from "./result.model.js";
import mongoose from "mongoose";

export const resultService = {
  async createResult(data) {
    const result = new Result(data);
    return await result.save();
  },

  async getUserResults(userId) {
    return await Result.find({ user: userId })
      .populate("exam", "title")
      .populate("subject", "name")
      .sort({ submittedAt: -1 });
  },

  async getAllResults() {
    return await Result.find()
      .populate("user", "username email")
      .populate("exam", "title")
      .populate("subject", "name")
      .sort({ submittedAt: -1 });
  },

  async getLeaderboard(examId) {
    return await Result.find({ exam: examId })
      .populate("user", "username")
      .sort({ score: -1, timeTaken: 1 })
      .limit(20); // top 20 users
  },

  async getUserAnalytics(userId) {
    const data = await Result.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$subject",
          totalExams: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
        },
      },
    ]);

    return data;
  },

  async getAdminAnalytics() {
    const data = await Result.aggregate([
      {
        $group: {
          _id: "$exam",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          highestScore: { $max: "$percentage" },
        },
      },
    ]);
    return data;
  },
};
