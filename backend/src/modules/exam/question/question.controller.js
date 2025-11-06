// src/modules/exam/question/question.controller.js
import Question from './question.model.js';
import { successResponse } from '../../../utils/response.util.js';

export const createQuestion = async (req, res, next) => {
  try {
    const { exam, text, options, explanationText } = req.body;

    const question = new Question({
      exam,
      text,
      options: JSON.parse(options), // options passed as JSON string
      image: req.files?.questionImage?.[0]?.path,
      explanation: {
        text: explanationText,
        image: req.files?.explanationImage?.[0]?.path,
      },
    });

    await question.save();
    return successResponse(res, question, 201);
  } catch (err) {
    next(err);
  }
};
