import Joi from 'joi';

export const createExamSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  chapter: Joi.string().required(),
  duration: Joi.number().min(5).max(180).default(30),
  totalMarks: Joi.number().min(1).default(100),
  totalQuestions: Joi.number().min(1).default(10),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  isPublished: Joi.boolean().default(false),
});
