# Frontend Design Guide — Online MCQ Exam (for frontend developers)

This document gives a concise, crystal-clear plan to build the frontend that consumes the backend in this repository.
It covers API contracts, auth, pages/components, file uploads, payment flow, testing, and practical code snippets.

Keep these top-level rules in mind:

- Use a single API client to centralize headers and error handling.
- Keep UI (presentational) components separate from data-fetching logic.
- Centralize auth state (token + user) in one store/context and derive role checks from it.

1. Environment & base URL

- Use an environment variable for the API base (example: NEXT_PUBLIC_API_BASE or REACT_APP_API_BASE).
- Typical value for local dev: `http://localhost:5000/api/v1`.

2. Authentication (contract & storage)

- Responses from register/login:
  - Success: { success: true, data: { token: "<jwt>", user: { \_id, email, username, role } } }
- Store token in a single place (Redux slice or React Context). If using localStorage, read and write only the token and user minimal info.
- On 401 responses, clear auth state and redirect to /login.

3. API client

- Provide a single axios/fetch wrapper that:
  - Adds Authorization: Bearer <token> header when token exists.
  - Handles 401 globally (logout + redirect).
  - Returns JSON body (or throws an Error with the server message).

4. Pages & routing (recommended pages)

- Public:
  - /login, /register
  - /exams (list), /exams/:id
  - /results/leaderboard/:examId
- Authenticated user:
  - /dashboard, /profile, /attempts, /attempts/:examId, /subscriptions
- Admin:
  - /admin/dashboard, /admin/subjects, /admin/chapters, /admin/exams, /admin/questions, /admin/routines, /admin/results, /admin/subscriptions

5. Components & utilities

- Reusable components: Button, Input, Modal, FileUploader, ImagePreview, DataTable, LoadingSpinner, Toast/ErrorBanner.
- Higher-order components / hooks: useAuth(), useApi(), ProtectedRoute({ role }).

6. Data contracts (essential summaries)

- Users

  - POST /users/register (body: { username, email, password }) => 201 { success, data: { token, user } }
  - POST /users/login (body: { email, password }) => 200 { success, data: { token, user } }
  - GET /users/profile => 200 { success, data: user }
  - PATCH /users/profile (multipart/form-data; field `profilePic`) => 200 { success, data: updatedUser }

- Subjects / Chapters / Exams

  - Standard CRUD. Admin routes require auth with role `admin`.
  - GET list responses: { success: true, data: [ ... ] }

- Questions

  - POST /questions (multipart/form-data). Field `question` is JSON string; file fields: `questionImage`, `explanationImage`.

- Attempts

  - POST /attempts (auth) submit answers -> 201 { success, data: { attemptId, score, feedback } }

- Results

  - GET /results/my-results (auth) -> 200 { success, data: [ ... ] }
  - GET /results/leaderboard/:examId -> 200 { success, data: [ ... ] }

- Routines

  - POST/PUT/DELETE (admin); GET public listing; GET /routines/user/upcoming (auth).

- Subscriptions

  - GET /subscriptions/me (auth) -> 200 { success, data: [ ... ] }
  - GET /subscriptions/analytics (admin) -> 200 { success, data: { total, active, expired } }
  - POST /subscriptions/expire (admin) -> 200 { success, message }

- Payments
  - POST /payment/initiate (auth) body: { amount, subscriptionType } -> 200 { success, url, transactionId }
    - Frontend should redirect user to returned `url`.
  - POST /payment/success -> gateway webhook or test endpoint marks payment success and creates subscription
  - POST /payment/fail or /payment/cancel -> mark payment failed

7. File uploads (practical)

- Use FormData and `multipart/form-data` when uploading files.
- Example (axios):
  const fd = new FormData();
  fd.append('profilePic', file);
  fd.append('bio', bio);
  await api.patch('/users/profile', fd);
- Construct public URL for uploaded images: take returned `profilePic` path (e.g. `profile/abc.png`) and prefix with server base: `https://HOST/uploads/profile/abc.png`.

8. Payment flow for UI

- Step 1: call POST /payment/initiate with amount and subscriptionType.
- Step 2: backend returns { url, transactionId } — redirect to `url`.
- Step 3: after gateway completes, rely on gateway redirect/webhook. To reflect purchase in frontend, poll GET /subscriptions/me or show a success page that calls server to verify.

9. Role based UI

- Keep role check centralized: use user.role from auth store.
- Hide/disable admin actions if role !== 'admin'. Protect admin routes with ProtectedRoute(role='admin').

10. State management choices

- Small apps: React Context + hooks is fine.
- Medium/large: Redux Toolkit (slices) or RTK Query for data fetching.
- Suggested slices: auth, subjects, exams, attempts, results, routines, subscriptions, payments.

11. Error handling & UX

- Show friendly API error messages via a Toast or banner.
- Map validation errors to form fields when possible.
- Show spinners on network actions, disable buttons while requests are pending.

12. Testing strategy

- Unit tests: components using Jest + React Testing Library.
- API mocking: MSW (Mock Service Worker) replicates backend responses for UI tests.
- E2E: Cypress hitting a staging backend (or docker-compose test environment).

13. Security & production notes

- Prefer httpOnly cookies for tokens if you can change backend; otherwise harden UI and avoid storing tokens in vulnerable places.
- Sanitize any HTML content from the backend before rendering.

14. Useful snippets

- Axios instance (illustrative):

  ```js
  import axios from "axios";
  import store from "./store";

  const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE });

  api.interceptors.request.use((cfg) => {
    const token = store.getState().auth.token;
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });

  api.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) {
        store.dispatch(logout());
        window.location = "/login";
      }
      return Promise.reject(err);
    }
  );

  export default api;
  ```

15. Implementation checklist (practical order)

- 1. Implement API client + auth store and login/register pages.
- 2. Implement ProtectedRoute and role guard.
- 3. Implement Profile page with file upload.
- 4. Implement Subjects/Chapters CRUD and admin pages.
- 5. Implement Exams and Question upload flows.
- 6. Implement Attempts and Results pages.
- 7. Implement Payments UI (initiate + status checks) and Subscriptions pages.
- 8. Add tests (unit + integration with MSW) and optionally E2E.

If you want, I can generate a small starter frontend scaffold (React/Next) with the API client, auth slice, ProtectedRoute, and stubs for the main pages. Tell me if you want React or Next.js and I'll scaffold it.

---

Document created to match current backend API at `src/` — keep it in sync if the backend changes.
