import { routineService } from "./routine.service.js";

export const routineController = {
  async createRoutine(req, res) {
    try {
      const routine = await routineService.createRoutine({
        ...req.body,
        createdBy: req.user._id,
      });
      res.status(201).json({ success: true, routine });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getAllRoutines(req, res) {
    try {
      const routines = await routineService.getAllRoutines();
      res.status(200).json({ success: true, routines });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getRoutine(req, res) {
    try {
      const { id } = req.params;
      const routine = await routineService.getRoutineById(id);
      if (!routine)
        return res.status(404).json({ success: false, message: "Routine not found" });
      res.status(200).json({ success: true, routine });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateRoutine(req, res) {
    try {
      const updated = await routineService.updateRoutine(req.params.id, req.body);
      res.status(200).json({ success: true, routine: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async deleteRoutine(req, res) {
    try {
      await routineService.deleteRoutine(req.params.id);
      res.status(200).json({ success: true, message: "Routine deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getUpcomingForUser(req, res) {
    try {
      const routines = await routineService.getUserUpcomingRoutines(req.user._id);
      res.status(200).json({ success: true, routines });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
