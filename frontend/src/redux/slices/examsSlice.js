import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchExams = createAsyncThunk(
  'exams/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/exams');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

export const fetchExamById = createAsyncThunk(
  'exams/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/exams/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch exam');
    }
  }
);

export const createExam = createAsyncThunk(
  'exams/create',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await api.post('/exams', examData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create exam');
    }
  }
);

export const submitAttempt = createAsyncThunk(
  'exams/submitAttempt',
  async (attemptData, { rejectWithValue }) => {
    try {
      const response = await api.post('/attempts', attemptData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit attempt');
    }
  }
);

const examsSlice = createSlice({
  name: 'exams',
  initialState: {
    items: [],
    currentExam: null,
    loading: false,
    error: null,
    attemptResult: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAttemptResult: (state) => {
      state.attemptResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.currentExam = action.payload;
      })
      .addCase(createExam.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(submitAttempt.fulfilled, (state, action) => {
        state.attemptResult = action.payload;
      });
  },
});

export const { clearError, clearAttemptResult } = examsSlice.actions;
export default examsSlice.reducer;
