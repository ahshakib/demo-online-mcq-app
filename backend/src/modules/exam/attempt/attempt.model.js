// src/modules/exam/attempt/attempt.model.js
import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, exam: 1 }, { unique: true }); // ✅ One attempt per user per exam

export default mongoose.model('Attempt', attemptSchema);
