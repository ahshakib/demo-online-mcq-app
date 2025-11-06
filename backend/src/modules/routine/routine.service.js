import { Routine } from "./routine.model.js";

export const routineService = {
  async createRoutine(data) {
    const routine = new Routine(data);
    return await routine.save();
  },

  async getAllRoutines(filter = {}) {
    return await Routine.find(filter)
      .populate("subject", "name")
      .populate("chapter", "title")
      .populate("exam", "title")
      .sort({ date: 1 });
  },

  async getRoutineById(id) {
    return await Routine.findById(id)
      .populate("subject", "name")
      .populate("chapter", "title")
      .populate("exam", "title");
  },

  async updateRoutine(id, data) {
    return await Routine.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteRoutine(id) {
    return await Routine.findByIdAndDelete(id);
  },

  async getUserUpcomingRoutines(userId) {
    const now = new Date();
    return await Routine.find({ date: { $gte: now } })
      .populate("subject", "name")
      .populate("chapter", "title")
      .populate("exam", "title")
      .sort({ date: 1 });
  },
};
