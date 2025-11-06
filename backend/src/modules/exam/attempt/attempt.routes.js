import express from 'express';
import { auth } from '../../../middlewares/auth.middleware.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { submitAttemptSchema } from './attempt.validation.js';
import * as attemptController from './attempt.controller.js';

const router = express.Router();

router.post('/', auth(), validate(submitAttemptSchema), attemptController.submitAttempt);
router.get('/', auth(), attemptController.getUserResults);
router.get('/:examId', auth(), attemptController.getResultByExam);

export default router;
