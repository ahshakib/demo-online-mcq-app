import Chapter from './chapter.model.js';
import Subject from '../subject/subject.model.js';

export const createChapter = async (data) => {
  // ensure subject exists
  const subject = await Subject.findById(data.subject);
  if (!subject) {
    throw new Error('Subject not found');
  }

  const chapter = new Chapter(data);
  await chapter.save();

  // push to subject.chapters
  subject.chapters.push(chapter._id);
  await subject.save();

  return chapter;
};

export const getAllChapters = async (query = {}) => {
  return Chapter.find(query).populate('subject', 'name code');
};

export const getChapterById = async (id) => {
  return Chapter.findById(id).populate('subject', 'name code');
};

export const updateChapter = async (id, data) => {
  return Chapter.findByIdAndUpdate(id, data, { new: true });
};

export const deleteChapter = async (id) => {
  const chapter = await Chapter.findByIdAndDelete(id);
  if (chapter) {
    await Subject.findByIdAndUpdate(chapter.subject, {
      $pull: { chapters: chapter._id },
    });
  }
  return chapter;
};
