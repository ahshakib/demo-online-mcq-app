import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectsReducer from './slices/subjectsSlice';
import examsReducer from './slices/examsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectsReducer,
    exams: examsReducer,
  },
});

export default store;
