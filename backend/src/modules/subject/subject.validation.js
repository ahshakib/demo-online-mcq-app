import Joi from 'joi';

export const createSubjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  code: Joi.string().min(2).max(10).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).default(0),
  isPremium: Joi.boolean().default(false),
});

export const updateSubjectSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  code: Joi.string().min(2).max(10),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0),
  isPremium: Joi.boolean(),
});
