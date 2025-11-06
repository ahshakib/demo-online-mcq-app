// src/modules/exam/attempt/attempt.controller.js
import * as attemptService from './attempt.service.js';
import { successResponse } from '../../../utils/response.util.js';

export const submitAttempt = async (req, res, next) => {
  try {
    const { examId, answers, timeTaken } = req.body;
    const { attempt, feedback } = await attemptService.submitAttempt(
      req.user._id,
      examId,
      answers,
      timeTaken
    );

    return successResponse(res, { attempt, feedback }, 201);
  } catch (error) {
    next(error);
  }
};

export const getUserResults = async (req, res, next) => {
  try {
    const results = await attemptService.getUserResults(req.user._id);
    return successResponse(res, results);
  } catch (error) {
    next(error);
  }
};

export const getResultByExam = async (req, res, next) => {
  try {
    const result = await attemptService.getResultByExam(req.user._id, req.params.examId);
    if (!result) return res.status(404).json({ message: 'Result not found' });
    return successResponse(res, result);
  } catch (error) {
    next(error);
  }
};