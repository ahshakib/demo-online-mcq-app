// src/modules/exam/attempt/attempt.service.js
import Attempt from './attempt.model.js';
import Question from '../question/question.model.js';
import Exam from '../exam.model.js';

export const submitAttempt = async (userId, examId, answers, timeTaken) => {
  // ✅ Prevent multiple attempts
  const existing = await Attempt.findOne({ user: userId, exam: examId });
  if (existing) throw new Error('You have already attempted this exam');

  const exam = await Exam.findById(examId);
  if (!exam) throw new Error('Exam not found');

  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({ _id: { $in: questionIds }, exam: examId });

  let correctCount = 0;
  const evaluatedAnswers = answers.map((ans) => {
    const q = questions.find((qq) => qq._id.toString() === ans.questionId);
    if (!q) return null;
    const correctOption = q.options.find((o) => o.isCorrect);
    const isCorrect = correctOption && correctOption.text === ans.selectedOption;
    if (isCorrect) correctCount++;
    return { question: q._id, selectedOption: ans.selectedOption, isCorrect };
  }).filter(Boolean);

  const score = correctCount * (exam.totalMarks / exam.totalQuestions);

  const attempt = await Attempt.create({
    user: userId,
    exam: examId,
    answers: evaluatedAnswers,
    score,
    correctAnswers: correctCount,
    totalQuestions: questions.length,
    timeTaken,
  });

  // ✅ Build detailed feedback
  const feedback = questions.map((q) => {
    const userAns = evaluatedAnswers.find((a) => a.question.toString() === q._id.toString());
    const correctOption = q.options.find((o) => o.isCorrect);
    return {
      questionId: q._id,
      questionText: q.text,
      questionImage: q.image,
      selectedOption: userAns?.selectedOption || null,
      correctOption: correctOption?.text || null,
      isCorrect: userAns?.isCorrect || false,
      explanation: q.explanation,
    };
  });

  return {
    attempt,
    feedback,
  };
};

export const getUserResults = async (userId) => {
  return Attempt.find({ user: userId })
    .populate('exam', 'title duration totalMarks')
    .sort({ createdAt: -1 });
};

export const getResultByExam = async (userId, examId) => {
  return Attempt.findOne({ user: userId, exam: examId })
    .populate('exam', 'title totalMarks totalQuestions');
};