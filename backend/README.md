# Backend — online-mcq-exam-project

This is the Express + Mongoose backend for the Online MCQ Exam project. It provides REST endpoints for users, subjects, chapters, exams, questions, attempts, results, routines, subscriptions and payments. It also serves uploaded images under `/uploads`.

## Quick start

Prerequisites:

- Node.js (16+ recommended)
- npm
- MongoDB (or use the in-memory server for tests)

Install dependencies and run the dev server:

```powershell
cd "d:\web development\online-mcq-exam-project\backend"
npm install
# start dev server (nodemon)
npm run dev
```

Run tests:

```powershell
npm test
```

The server listens on the port defined by `PORT` (default: 5000).

Environment variables (in `.env`):

- PORT (default 5000)
- MONGO_URI
- JWT_SECRET (defaults to `supersecretkey`)
- CLIENT_URL (default http://localhost:3000)
- BASE_URL (used for payment callbacks, e.g. http://localhost:5000)
- SSLCZ_STORE_ID, SSLCZ_STORE_PASSWORD, SSLCZ_IS_LIVE (optional, for SSLCommerz)

Note: In test runs the payment initiation is test-friendly (it returns a fake GatewayPageURL) so tests don't call an external gateway.

## How the frontend should use this API

- Base URL (local dev): `http://localhost:5000/api/v1`
- Authentication: endpoints that require authentication expect an `Authorization` header: `Authorization: Bearer <jwt>`
- File uploads: use `multipart/form-data`. The server serves uploaded files at `http://localhost:5000/uploads/...`.

Example profile image URL returned by the API: `/uploads/profile/<filename>` → full URL: `http://localhost:5000/uploads/profile/<filename>`

## Routes (overview + examples)

For all examples assume `BASE = http://localhost:5000/api/v1`.

---

### Users

- POST /users/register

  - Public — register a normal user
  - Body (JSON):
    {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
    }
  - Example response (201):
    {
    "success": true,
    "data": {
    "token": "<jwt>",
    "user": { "\_id": "...", "email": "john@example.com", "username": "johndoe" }
    }
    }

- POST /users/register/admin

  - Create admin user (used in tests). Same body as above. Returns token with admin role.

- POST /users/login

  - Public — login
  - Body: { "email":"...", "password":"..." }
  - Response: token and user.

- GET /users/profile

  - Protected — returns current user
  - Header: `Authorization: Bearer <token>`

- PATCH /users/profile
  - Protected — update profile and optionally upload `profilePic` (field name)
  - Content-Type: `multipart/form-data`
  - Form fields: any profile fields (e.g., `bio`) and file field `profilePic`
  - Response contains `profilePic` path like `profile/<filename>` (served at `/uploads/profile/<filename>`)

Response examples (users)

- Register / Login (201 / 200):
  {
  "success": true,
  "data": {
  "token": "<jwt>",
  "user": { "\_id": "...", "email": "john@example.com", "username": "johndoe" }
  }
  }

- Get profile (200):
  {
  "success": true,
  "data": { "\_id": "...", "email": "john@example.com", "username": "johndoe", "profilePic": "profile/abc.png" }
  }

- Update profile (200):
  {
  "success": true,
  "data": { "\_id": "...", "username": "johndoe", "bio": "...", "profilePic": "profile/abc.png" }
  }

- Error (401 / 400):
  { "success": false, "message": "Unauthorized" }

---

### Subjects

- POST /subjects

  - Admin only. Body: { name, code, description, price, isPremium }

- GET /subjects

  - Auth required (any user) — returns list

- GET /subjects/:id

  - Auth required — get by id

- PATCH /subjects/:id

  - Admin only — update fields

- DELETE /subjects/:id
  - Admin only — deletes subject

Example: create subject (admin):

Request header: `Authorization: Bearer <adminToken>`

Body (JSON):
{
"name": "Mathematics",
"code": "MATH101",
"description": "Basic math",
"price": 10,
"isPremium": false
}

Example response (201):
{
"success": true,
"data": { "\_id": "...", "name": "Mathematics", ... }
}

Response examples (subjects)

- Get list (200):
  { "success": true, "data": [ { "_id":"...","name":"..." } ] }
- Get single (200):
  { "success": true, "data": { "\_id":"...","name":"..." } }
- Update (200):
  { "success": true, "data": { "\_id":"...","name":"Updated" } }
- Delete (204 or 200):
  No content or { "success": true, "message": "Deleted" }

---

### Chapters

- POST /chapters (admin)
- GET /chapters (auth)
- GET /chapters/:id (auth)
- PUT /chapters/:id (admin)
- DELETE /chapters/:id (admin)

Request/response shapes are similar to subjects. Use `auth` header for protected routes.

Response examples (chapters)

- Create / Get / Update / Delete follow the same shape as Subjects (success flag and `data`)

---

### Exams

- POST /exams (admin) — create an exam. Body validated.
- GET /exams (auth) — list
- GET /exams/:id (auth) — detail
- PUT /exams/:id (admin) — update
- DELETE /exams/:id (admin) — delete

Example create (admin):
{
"title":"Sample Exam",
"subject":"<subjectId>",
"chapter":"<chapterId>",
"duration": 60,
"totalMarks": 100
}

Response examples (exams)

- Create (201): { "success": true, "data": { /_ exam object _/ } }
- List / Get (200): { "success": true, "data": [ /* exams */ ] } or { "success": true, "data": { /_ exam _/ } }
- Update (200): { "success": true, "data": { /_ updated exam _/ } }
- Delete (204/200): no content or { "success": true }

---

### Questions (exam images)

- POST /questions (admin)
  - multipart/form-data
  - Fields:
    - `question` — JSON string containing question text, options, correct answer, etc. (see question.model/service for shape)
    - File fields (optional): `questionImage` (max 1), `explanationImage` (max 1)

Example usage: send form-data with `question` JSON and attach `questionImage`.

Response: created question object.

Response examples (questions)

- Create (201):
  { "success": true, "data": { "\_id":"...","text":"...","options":[...],"images":{...} } }
- Validation / auth error: { "success": false, "message": "..." }

---

### Attempts

- POST /attempts (auth) — submit answers for an exam
  - Body: validated payload (see attempt.validation.js)
- GET /attempts (auth) — get user's attempts
- GET /attempts/:examId (auth) — get attempt/result for exam

Example submit response: contains score, feedback and saved attempt id.

Response examples (attempts)

- Submit (201):
  {
  "success": true,
  "data": {
  "attemptId": "...",
  "score": 80,
  "feedback": [ /* per-question feedback */ ]
  }
  }
- Get list (200): { "success": true, "data": [ /* attempts */ ] }

---

### Results

- GET /results/my-results (auth) — returns user's results
- GET /results/my-analytics (auth) — analytics for user
- GET /results/leaderboard/:examId — public leaderboard for an exam
- GET /results/all (admin) — all results
- GET /results/admin-analytics (admin) — admin analytics

---

### Routines

- POST /routines (admin) — create routine (title, subject, exam, date, startTime, duration)
- PUT /routines/:id (admin)
- DELETE /routines/:id (admin)
- GET /routines — public listing
- GET /routines/:id — public detail
- GET /routines/user/upcoming (auth) — upcoming routines for the authenticated user

Example create body:
{
"title": "Midterm Routine",
"subject": "<subjectId>",
"date": "2025-12-20T10:00:00.000Z",
"startTime": "10:00",
"duration": 90
}

---

Response examples (routines)

- Create (201): { "success": true, "routine": { /_ routine object _/ } }
- List / Get (200): { "success": true, "routines": [ /* */ ] } or { "success": true, "routine": { /\* \*/ } }
- Upcoming for user (200): { "success": true, "routines": [ /* upcoming */ ] }
- Update/Delete: { "success": true, "routine": { /_ updated _/ } } or { "success": true, "message": "Routine deleted" }

### Subscriptions

- GET /subscriptions/me (auth) — user's subscriptions
- GET /subscriptions/analytics (admin) — basic analytics (total, active, expired)
- POST /subscriptions/expire (admin) — expire old subscriptions (returns number expired)

Example response for analytics:
{
"success": true,
"data": { "total": 3, "active": 2, "expired": 1 }
}

Response examples (subscriptions)

- GET /subscriptions/me (200): { "success": true, "data": [ /* subscriptions */ ] }
- GET /subscriptions/analytics (200): { "success": true, "data": { "total":0, "active":0, "expired":0 } }
- POST /subscriptions/expire (200): { "success": true, "message": "<n> subscriptions expired." }

---

### Payments

- POST /payment/initiate (auth)

  - Body: { amount: Number, subscriptionType: 'basic'|'premium'|'pro' }
  - Returns payment gateway URL and transaction id. In test runs (`NODE_ENV=test`) this route returns a fake GatewayPageURL so tests do not call external SDKs.

- POST /payment/success

  - Called by payment gateway or used in tests to mark payment success.
  - Body: gateway payload; service uses `tran_id` to mark Payment as `Success` and creates a subscription.

- POST /payment/fail

  - Body: { tran_id }
  - Marks payment as `Failed`.

- POST /payment/cancel
  - Same as fail (marks payment `Failed`)

Example initiate request (auth header required):

POST /payment/initiate
Body: { "amount": 50, "subscriptionType":"basic" }

Response (200):
{
"success": true,
"url": "https://test-gateway.local/TXN_TEST_...",
"transactionId": "TXN*TEST*..."
}

Example success webhook (used in tests):
POST /payment/success
Body: { "tran*id": "TXN_TEST*..." }

Response (200):
{
"success": true,
"message": "Payment successful",
"payment": { "\_id": "...", "paymentStatus": "Success", ... }
}

Response examples (payments)

- POST /payment/initiate (200): { "success": true, "url": "...", "transactionId": "..." }
- POST /payment/success (200): { "success": true, "message": "Payment successful", "payment": { /_ payment doc _/ } }
- POST /payment/fail (200): { "success": false, "message": "Payment failed", "payment": { /_ payment doc _/ } }
- POST /payment/cancel (200): same as fail

---

## File uploads

- Profile images: `PATCH /api/v1/users/profile` — field name `profilePic`.
- Question images: `POST /api/v1/questions` — file fields `questionImage`, `explanationImage`.
- Uploaded files are stored under `uploads/` and served at `/uploads`.

Example to upload profile image (multipart/form-data):

Headers:

- Authorization: Bearer <token>

Form-data fields:

- profilePic -> (file)
- bio -> Updated bio

Returned `profilePic` value will be a path like `profile/abc123.png`. The full public URL is `http://localhost:5000/uploads/profile/abc123.png`.

## Notes for frontend developers

- Always include `Authorization: Bearer <token>` for protected endpoints.
- Handle file uploads with `multipart/form-data` and use the field names specified above.
- Use the returned `profile`/`question` image paths to display images by prefixing with `http://<server>/uploads/`.
- Registration returns an auth token — typically store it client-side (localStorage) and send it with requests.

## Tests

- Tests use `mongodb-memory-server` and are defined under `src/test/*.test.js`.
- Run `npm test` to execute the integration test suite.

## Troubleshooting

- If the server crashes on `sslcommerz-lts` import, either install the package (`npm i sslcommerz-lts`) or rely on test-mode behavior for local testing — the code avoids calling the SDK during tests.
- Ensure `uploads/` directory exists and is writable by the server process.

---

If you want, I can also:

- Add a small Postman collection or OpenAPI spec for these routes.
- Add GitHub Actions workflow to run the tests on push.

Happy building — ask me to generate a Postman collection or API spec next and I'll add it.
