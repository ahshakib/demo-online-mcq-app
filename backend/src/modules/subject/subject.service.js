import Subject from './subject.model.js';

export const createSubject = async (data) => {
  const subject = new Subject(data);
  return await subject.save();
};

export const getAllSubjects = async () => {
  return await Subject.find().populate('chapters routine');
};

export const getSubjectById = async (id) => {
  return await Subject.findById(id).populate('chapters routine');
};

export const updateSubject = async (id, data) => {
  return await Subject.findByIdAndUpdate(id, data, { new: true });
};

export const deleteSubject = async (id) => {
  return await Subject.findByIdAndDelete(id);
};
