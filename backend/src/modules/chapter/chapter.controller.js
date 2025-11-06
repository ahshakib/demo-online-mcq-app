import * as chapterService from './chapter.service.js';
import { successResponse } from '../../utils/response.util.js';

export const createChapter = async (req, res, next) => {
  try {
    const chapterData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const chapter = await chapterService.createChapter(chapterData);
    return successResponse(res, chapter, 201);
  } catch (error) {
    next(error);
  }
};

export const getAllChapters = async (req, res, next) => {
  try {
    const chapters = await chapterService.getAllChapters();
    return successResponse(res, chapters);
  } catch (error) {
    next(error);
  }
};

export const getChapterById = async (req, res, next) => {
  try {
    const chapter = await chapterService.getChapterById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    return successResponse(res, chapter);
  } catch (error) {
    next(error);
  }
};

export const updateChapter = async (req, res, next) => {
  try {
    const chapter = await chapterService.updateChapter(req.params.id, req.body);
    return successResponse(res, chapter);
  } catch (error) {
    next(error);
  }
};

export const deleteChapter = async (req, res, next) => {
  try {
    await chapterService.deleteChapter(req.params.id);
    return successResponse(res, null, 204, 'Chapter deleted successfully');
  } catch (error) {
    next(error);
  }
};
