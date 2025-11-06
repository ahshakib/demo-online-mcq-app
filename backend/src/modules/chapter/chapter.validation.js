import Joi from 'joi';

export const createChapterSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  subject: Joi.string().required(), // subjectId
  order: Joi.number().min(1).default(1),
  isPublished: Joi.boolean().default(true),
});

export const updateChapterSchema = Joi.object({
  title: Joi.string().min(2).max(100),
  description: Joi.string().allow('', null),
  order: Joi.number().min(1),
  isPublished: Joi.boolean(),
});
