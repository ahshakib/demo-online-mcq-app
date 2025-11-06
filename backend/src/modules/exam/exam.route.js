import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createExamSchema } from './exam.validation.js';
import * as examController from './exam.controller.js';

const router = express.Router();

router.post('/', auth(['admin']), validate(createExamSchema), examController.createExam);
router.get('/', auth(), examController.getAllExams);
router.get('/:id', auth(), examController.getExamById);
router.put('/:id', auth(['admin']), examController.updateExam);
router.delete('/:id', auth(['admin']), examController.deleteExam);

export default router;
