import Exam from './exam.model.js';
import Chapter from '../chapter/chapter.model.js';

export const createExam = async (data) => {
  const chapter = await Chapter.findById(data.chapter);
  if (!chapter) throw new Error('Chapter not found');

  const exam = new Exam(data);
  await exam.save();
  return exam;
};

export const getAllExams = async (query = {}) => {
  return Exam.find(query).populate('chapter', 'title');
};

export const getExamById = async (id) => {
  return Exam.findById(id).populate('chapter', 'title');
};

export const updateExam = async (id, data) => {
  return Exam.findByIdAndUpdate(id, data, { new: true });
};

export const deleteExam = async (id) => {
  return Exam.findByIdAndDelete(id);
};
