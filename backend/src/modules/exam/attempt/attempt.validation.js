import Joi from 'joi';

export const submitAttemptSchema = Joi.object({
  examId: Joi.string().required(),
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        selectedOption: Joi.string().required(),
      })
    )
    .required(),
  timeTaken: Joi.number().min(0).required(),
});
