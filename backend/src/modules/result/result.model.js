import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selectedOption: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number },
    answers: [answerSchema],
    timeTaken: { type: Number }, // seconds
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resultSchema.index({ user: 1, exam: 1 }, { unique: true }); // prevent multiple attempts

export const Result = mongoose.model("Result", resultSchema);
