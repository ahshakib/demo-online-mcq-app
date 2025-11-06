import express from 'express';
import { auth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
} from './subject.validation.js';
import * as subjectController from './subject.controller.js';

const router = express.Router();

// Only admins can create/edit/delete subjects
router.post('/', auth(['admin']), validate(createSubjectSchema), subjectController.createSubject);
router.get('/', auth(), subjectController.getAllSubjects);
router.get('/:id', auth(), subjectController.getSubjectById);
router.patch('/:id', auth(['admin']), validate(updateSubjectSchema), subjectController.updateSubject);
router.delete('/:id', auth(['admin']), subjectController.deleteSubject);

export default router;
