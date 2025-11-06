import * as examService from './exam.service.js';
import { successResponse } from '../../utils/response.util.js';

export const createExam = async (req, res, next) => {
  try {
    const examData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const exam = await examService.createExam(examData);
    return successResponse(res, exam, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllExams = async (req, res, next) => {
  try {
    const exams = await examService.getAllExams();
    return successResponse(res, exams);
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    return successResponse(res, exam);
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    return successResponse(res, exam);
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    return successResponse(res, null, 204, 'Exam deleted successfully');
  } catch (error) {
    next(error);
  }
};
