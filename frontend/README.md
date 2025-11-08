# Online MCQ Exam Platform - Frontend

React frontend for the Online MCQ Exam platform.

## Tech Stack

- React 18
- Redux Toolkit
- React Router v6
- Axios
- Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure `.env`:
```
REACT_APP_API_BASE=http://localhost:5000/api/v1
```

3. Start development server:
```bash
npm start
```

App runs at `http://localhost:3000`

## Features

- User authentication (login/register)
- Profile management with image upload
- Browse and view exams
- Take exams and view results
- Subscription management with payment integration
- Admin panel for managing subjects, chapters, exams, questions

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── redux/          # Redux store and slices
├── services/       # API service
└── App.js          # Main app with routing
```

## Key Pages

### Public
- `/login` - Login page
- `/register` - Registration page
- `/exams` - Browse exams

### User (Protected)
- `/dashboard` - User dashboard
- `/profile` - Profile management
- `/results` - Exam results
- `/subscriptions` - Subscription management

### Admin (Protected, Admin Only)
- `/admin/dashboard` - Admin dashboard
- `/admin/subjects` - Manage subjects
- More admin routes available

## API Integration

Axios instance configured with:
- Automatic token injection
- 401 error handling (auto logout)
- Base URL from environment

## Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.
