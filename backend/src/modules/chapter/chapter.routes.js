import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createChapterSchema,
  updateChapterSchema,
} from './chapter.validation.js';
import * as chapterController from './chapter.controller.js';

const router = express.Router();

// Only admins can manage chapters
router.post('/', auth(['admin']), validate(createChapterSchema), chapterController.createChapter);
router.get('/', auth(), chapterController.getAllChapters);
router.get('/:id', auth(), chapterController.getChapterById);
router.put('/:id', auth(['admin']), validate(updateChapterSchema), chapterController.updateChapter);
router.delete('/:id', auth(['admin']), chapterController.deleteChapter);

export default router;
