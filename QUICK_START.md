# Quick Start Guide - Online MCQ Exam Platform

## Prerequisites

- Node.js 16+ installed
- MongoDB running (or use docker-compose)
- Git (optional)

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `dot.env`):
```bash
cp dot.env .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/online-mcq
PORT=5000
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:3000
BASE_URL=http://localhost:5000
```

5. Start MongoDB (if using docker-compose):
```bash
docker-compose up -d mongo
```

Or start your local MongoDB instance.

6. Start the backend server:
```bash
npm run dev
```

Backend will run at `http://localhost:5000`

## Frontend Setup

1. Open a new terminal and navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Environment is already configured in `.env`:
```env
REACT_APP_API_BASE=http://localhost:5000/api/v1
```

4. Start the frontend development server:
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## First Time Usage

### Create Admin Account

1. Register a normal account at `http://localhost:3000/register`
2. Use backend API to create admin (via Postman or curl):

```bash
curl -X POST http://localhost:5000/api/v1/users/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

3. Login with admin credentials
4. Access admin panel at `/admin/dashboard`

### Add Sample Data

As admin:

1. Go to `/admin/subjects`
2. Create subjects (e.g., Mathematics, Physics, Chemistry)
3. Navigate to chapters section (future feature)
4. Create exams
5. Add questions to exams

## Testing the Application

### User Flow

1. Register new account
2. Browse exams at `/exams`
3. View profile at `/profile`
4. Upload profile picture
5. Check subscriptions at `/subscriptions`
6. Take an exam
7. View results at `/results`

### Admin Flow

1. Login as admin
2. Access `/admin/dashboard`
3. Create subjects via `/admin/subjects`
4. Manage other resources through admin panel

## Common Commands

### Backend
```bash
npm run dev      # Development with nodemon
npm test         # Run test suite
```

### Frontend
```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```
Error: MongoDB Connection Failed
```
Solution: Ensure MongoDB is running and MONGO_URI is correct

**Port Already in Use**
```
Error: Port 5000 is already in use
```
Solution: Change PORT in `.env` or kill the process using port 5000

### Frontend Issues

**API Connection Error**
```
Network Error or CORS error
```
Solution:
- Verify backend is running
- Check REACT_APP_API_BASE in `.env`
- Ensure backend CORS allows `http://localhost:3000`

**Build Errors**
```
Module not found
```
Solution: Delete `node_modules` and `package-lock.json`, then run `npm install`

**Blank Page After Login**
```
Page loads but shows blank screen
```
Solution: Check browser console for errors, verify token is stored in localStorage

## Default Ports

- Backend API: `http://localhost:5000`
- Frontend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

## API Endpoints Quick Reference

### Public
- POST `/api/v1/users/register` - Register user
- POST `/api/v1/users/login` - Login user
- GET `/api/v1/exams` - List exams (requires auth)

### Protected (Requires Auth)
- GET `/api/v1/users/profile` - Get profile
- PATCH `/api/v1/users/profile` - Update profile
- GET `/api/v1/results/my-results` - Get user results
- POST `/api/v1/payment/initiate` - Initiate payment

### Admin Only
- POST `/api/v1/subjects` - Create subject
- GET `/api/v1/subjects` - List subjects
- PATCH `/api/v1/subjects/:id` - Update subject
- DELETE `/api/v1/subjects/:id` - Delete subject

## Next Steps

1. Implement chapters management
2. Build exam taking interface
3. Add question creation UI
4. Implement routines management
5. Add analytics dashboards
6. Setup payment gateway credentials

## Development Tips

- Use Redux DevTools extension for debugging state
- Keep backend terminal open to monitor API calls
- Check browser console for frontend errors
- Use Postman to test API endpoints directly
- Enable MongoDB logs for database debugging

## Production Deployment

### Backend
1. Set production environment variables
2. Use process manager (PM2 recommended)
3. Setup reverse proxy (nginx)
4. Enable SSL/TLS
5. Configure production database

### Frontend
1. Update API base URL
2. Run `npm run build`
3. Serve `build/` folder with static server
4. Configure CDN for assets (optional)

## Support

For detailed documentation:
- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
- Overview: See `FRONTEND_OVERVIEW.md`

## License

MIT
