import * as subjectService from './subject.service.js';
import { successResponse } from '../../utils/response.util.js';

export const createSubject = async (req, res, next) => {
  try {
    const subjectData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const subject = await subjectService.createSubject(subjectData);
    return successResponse(res, subject, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    return successResponse(res, subjects);
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    return successResponse(res, subject);
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body);
    return successResponse(res, subject);
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    await subjectService.deleteSubject(req.params.id);
    return successResponse(res, null, 204, 'Subject deleted successfully');
  } catch (error) {
    next(error);
  }
};
