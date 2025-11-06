// src/modules/exam/question/question.model.js
import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    text: { type: String, required: true },
    image: { type: String }, // ✅ Optional image for question
    options: [optionSchema],
    explanation: {
      text: { type: String },
      image: { type: String }, // ✅ Optional image for explanation
    },
  },
  { timestamps: true }
);

export default mongoose.model('Question', questionSchema);
