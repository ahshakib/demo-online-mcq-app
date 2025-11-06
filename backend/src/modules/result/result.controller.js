import { resultService } from "./result.service.js";

export const resultController = {
  async getMyResults(req, res) {
    try {
      const results = await resultService.getUserResults(req.user._id);
      res.status(200).json({ success: true, results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAllResults(req, res) {
    try {
      const results = await resultService.getAllResults();
      res.status(200).json({ success: true, results });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getLeaderboard(req, res) {
    try {
      const { examId } = req.params;
      const leaderboard = await resultService.getLeaderboard(examId);
      res.status(200).json({ success: true, leaderboard });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getUserAnalytics(req, res) {
    try {
      const analytics = await resultService.getUserAnalytics(req.user._id);
      res.status(200).json({ success: true, analytics });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAdminAnalytics(req, res) {
    try {
      const analytics = await resultService.getAdminAnalytics();
      res.status(200).json({ success: true, analytics });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
