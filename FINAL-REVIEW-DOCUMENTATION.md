# REPORA — Final Review Technical Documentation

Date: 2025-11-02  
Stack: MERN (MongoDB, Express, React, Node.js)

---

## What this document gives you
- What we used (tech), why we used it here, and what it does
- How each module works end-to-end (Announcements, Bookings, Issues, Users)
- Architecture, auth/RBAC, schemas, endpoints, UI patterns
- Testing, security, performance, troubleshooting
- Demo script + viva-style Q&A

---

## Contents
1. Project at a glance  
2. Tech stack (What/Why/How)  
3. Architecture & data flow  
4. Authentication & authorization (How and Why)  
5. Database design (collections, fields, indexes)  
6. Backend APIs (purpose and flow)  
7. Frontend structure (organization and patterns)  
8. Module deep dives  
9. Testing strategy  
10. Security & performance  
11. Demo script (review day)  
12. Troubleshooting  
13. Viva-style Q&A  
14. Future enhancements  
15. Appendix (schema and endpoint snapshots)  

---

## 1) Project at a glance
- Problem: Centralize academic operations (classroom bookings, issue reports, announcements) with clear workflows and role separation.
- Roles: Student, Class Representative, Admin.
- Core flows:
  - Announcements (targeted by year/department/class)
  - Classroom bookings (conflict detection, admin approval)
  - Issue reporting (categories, images, resolution)
  - Role dashboards and approvals

Success criteria: Simple UX, accurate targeting/approvals, secure auth, maintainable and testable code.

---

## 2) Tech stack (What/Why/How)

### Frontend
- React 18
  - Why: Component-based SPA; Hooks for state/effects; mature ecosystem.
  - How: Functional components, Context API for auth/theme/notifications.
- React Router 6
  - Why: Nested client routing with guards.
  - How: ProtectedRoute and RoleProtectedRoute wrap route trees.
- Tailwind CSS
  - Why: Fast, consistent, responsive styling.
  - How: Utility classes with theme-aware variants (dark/light).
- Framer Motion
  - Why: Smooth micro-interactions and page transitions.
  - How: Variants for list stagger and page transitions.
- Axios
  - Why: Robust HTTP client with interceptors.
  - How: Single instance with baseURL, Authorization header injector, error logging.

### Backend
- Node.js + Express
  - Why: Lightweight REST API, large ecosystem.
  - How: Modular routers, middleware, error handling.
- MongoDB + Mongoose
  - Why: Flexible document model; schema via Mongoose with validation and indexes.
  - How: Schemas for Users, Announcements, Bookings, Issues; validation hooks.
- JWT (jsonwebtoken)
  - Why: Stateless auth; horizontal scaling friendly.
  - How: Sign { userId, role }; verify in middleware.
- bcryptjs
  - Why: Secure password hashing.
  - How: Hash on register; compare on login.
- express-validator
  - Why: Input validation and sanitization.
  - How: Route-level chains; send 400 with messages on failure.
- multer
  - Why: File uploads (issue images, optional).
  - How: Disk storage with size/type checks.

### Testing & Dev
- Jest + Supertest
  - Why: Fast unit/integration for Node and APIs.
  - How: Test routes, models, error paths.
- mongodb-memory-server
  - Why: Deterministic, isolated DB for tests.
  - How: Spin ephemeral Mongo per test suite.
- Nodemon
  - Why: Dev auto-restart.
  - How: npm run dev script.

---

## 3) Architecture & data flow
```
React SPA → Axios → Express (routes/middleware) → Mongoose → MongoDB
                             ↑            ↓
                      JWT auth (middleware)  
```
- JWT stored client-side; sent as Authorization: Bearer <token>.
- Role checks happen in middleware; validation at route level.

Example: Announcements flow
1) Admin creates announcement with targetAudience and (optional) targetClasses.
2) Server validates and persists.
3) Students/Class Reps fetch announcements; backend filters by:
   - targetAudience = 'all'
   - OR 'students'
   - OR 'specific-classes' with elemMatch matching user.year/department/className.
4) Frontend renders pinned first, then newest.

---

## 4) Authentication & authorization (How and Why)
- Registration/login: email (restricted to @psgtech.ac.in), password hashing with bcrypt.
- JWT token: { userId, role }, 7d expiry.
- Middleware:
  - authenticateToken: verifies token, attaches req.user.
  - adminOnly: ensures req.user.role === 'admin'.
- Why JWT: No server session state; scalable and simple client handling.

Security choices: hashed passwords, validated inputs, CORS, recommended Helmet.

---

## 5) Database design (collections, fields, indexes)

### Users
- name, email (unique, domain-validated), password (hash)
- role: admin | student | class-representative
- department: Computer Science | Mechanical Engineering | Information Technology | Civil Engineering
- className rules: CS → G1/G2/AIML; others → G1/G2
- year: '1st'..'5th' (string enum)
- isActive (admin approval), profileImage

Indexes: email; role+isActive; department+className+year

### Announcements
- title, content
- category: general | academic | events | exam | holiday | important
- priority: low | medium | high
- targetAudience: all | students | specific-classes
- targetClasses: [{ year, department, className }]
- isPinned, createdBy (User ref), views, publishDate, createdAt

Indexes: targetAudience; targetClasses nested fields; isPinned+createdAt

### Bookings
- studentId (User ref), studentName
- room: { id, name }
- date, timeSlot: { start, end }
- purpose
- status: pending | approved | rejected; rejectionReason

Indexes: studentId+date; room.id+date+status; status+createdAt

### Issues
- title, description, category (technical, maintenance, cleanliness, safety, other)
- priority (low, medium, high, critical)
- room: { id, name }
- reportedBy (User ref), reporterName
- status: pending | resolved | rejected
- images, resolutionNotes, resolvedAt

Indexes: reportedBy+status; room.id+status; category+priority

---

## 6) Backend APIs (purpose and flow)

Auth (/api/auth)
- POST /register: Validate domain & rules; hash password; create user.
- POST /login: Validate credentials; return JWT + user.

Announcements (/api/announcements)
- GET /: Auth required; returns relevant list based on role and class.
- POST /: Admin only; validates fields and optional targetClasses.
- PATCH /:id/pin: Admin toggles pin.
- DELETE /:id: Admin deletes announcement.

Bookings (/api/bookings)
- GET /: Current user’s bookings.
- POST /: Create booking; detect conflicts for room/date/time.
- PATCH /:id/status: Admin approves/rejects (reason required for reject).

Issues (/api/issues)
- GET /: Current user’s issues (or admin filter).
- POST /: Report issue; optional images.
- PATCH /:id/resolve: Admin resolves with notes.

Validation (express-validator): min/max, enums, ISO dates, arrays; on fail → 400.

---

## 7) Frontend structure (organization and patterns)

Key directories
- pages/: Announcements, BookClassroom, Bookings, RaiseIssue, Dashboard, admin/*
- components/: layout (Navbar, Sidebar), common (LoadingSpinner, Modal, StatusNotification), auth (ProtectedRoute, RoleProtectedRoute)
- contexts/: AuthContext, ThemeContext, NotificationContext
- utils/: api.js (Axios instance + endpoints)

Patterns
- Context API for auth/theme/notifications.
- ProtectedRoute + RoleProtectedRoute for guards.
- Tailwind utility classes; theme-aware variants.
- Framer Motion variants for list/page animations.
- Responsive grid for class targeting UI.

---

## 8) Module deep dives (what & how)

### Announcements (Admin + Student/Class Rep)
- Create fields: title, content, category, priority, targetAudience, targetClasses[], isPinned.
- Targeting:
  - 'all': everyone.
  - 'students': all student roles.
  - 'specific-classes': array of { year, department, className }.
- Server enforces enums; if specific-classes, each item validated.
- Display: pinned first; then newest; category/priority badges with theme-aware colors.

### Bookings
- Create booking: room, date, timeSlot (HH:MM), purpose.
- Conflict detection: existing bookings for same room/date where status ∈ [pending, approved] overlap by time.
- Admin approves/rejects; rejection requires reason.

### Issues
- Report: title, description, category, priority, room; optional images.
- Admin resolves: resolutionNotes + resolvedAt.

### Dashboards
- Student/Class Rep: Recent announcements, bookings, issues.
- Admin: Pending approvals, quick actions, recent activity.

---

## 9) Testing strategy

Backend
- Jest + Supertest: Auth register/login; announcement CRUD; bookings overlaps; issues lifecycle.
- mongodb-memory-server: Isolated DB per suite.

Frontend
- React Testing Library: Login validations; announcements filters; common components.

Coverage focus: Auth flows, announcement targeting, bookings conflict, issue resolution.

---

## 10) Security & performance

Security
- bcrypt password hashing.
- JWT with expiry; auth middleware.
- Input validation (express-validator); CORS; recommend Helmet.
- Upload constraints: size/type; dedicated paths.

Performance
- Indexes for common queries.
- Pinned + createdAt sort for announcements.
- Time-range filtering for bookings.
- Optional pagination (easy to add).

---

## 11) Demo script (review day)

Backend
```powershell
cd C:\vscode\ADS\backend
copy config.env.example config.env  # if not already
npm install
npm run seed                        # seeds admin + sample data
npm run dev                         # http://localhost:5000
```

Frontend
```powershell
cd C:\vscode\ADS\frontend
npm install
npm start                           # http://localhost:3000
```

Walkthrough
1) Admin login → create pinned announcement targeted at 2nd year CS G1 & AIML.
2) Student (CS G1) → sees announcement; other depts don’t.
3) Student creates booking (R101, 10:00–11:00) → success.
4) Try overlap booking → conflict prevented.
5) Admin approves booking → student sees status update.
6) Student reports issue with image → Admin resolves with notes.

---

## 12) Troubleshooting
- Frontend “Network Error”/500:
  - Ensure backend running on port 5000; config has PORT=5000; start backend first.
- express-validator chaining errors:
  - Each .withMessage() must follow a validator (.isString(), .isIn(), etc.).
- CORS errors:
  - Verify CLIENT_URL/http origin and CORS middleware config.
- MongoDB connection:
  - Check MONGODB_URI; if Atlas, ensure IP/network access.

---

## 13) Viva-style Q&A
- Why MongoDB/Mongoose?
  - Flexible nested structures (targetClasses), rapid evolution; Mongoose adds schema, validation, and indexes.
- How do targeted announcements work?
  - Backend filters by targetAudience plus $elemMatch matching user’s year/department/className.
- How do you prevent booking overlaps?
  - Compare requested time range with existing (pending/approved) for same room/date; reject on overlap.
- Roles and capabilities?
  - Student/Class Rep: submit & track. Admin: create/pin/delete announcements; approve/reject bookings, resolve issues.
- How is auth secured?
  - Hashed passwords, JWT with expiry, guarded routes, validation, CORS.
- Key indexes & impact?
  - Announcements: targetAudience + nested fields; Bookings: room/date/time; Users: email/role/state. Faster queries.
- Testing approach?
  - API tests with Supertest; in-memory Mongo; RTL for UI flows.

---

## 14) Future enhancements
- Email/push notifications
- Calendar sync (Google/iCal)
- Real-time updates (WebSockets)
- Admin analytics dashboards
- Mobile app (React Native)
- Docker + CI/CD pipeline

---

## 15) Appendix (snapshots)

Announcement fields (condensed)
- title, content, category, priority
- targetAudience: 'all' | 'students' | 'specific-classes'
- targetClasses: [{ year, department, className }]
- isPinned, createdBy, views, publishDate

Key endpoints
- Auth: POST /api/auth/register, POST /api/auth/login
- Announcements: GET /, POST /, PATCH /:id/pin, DELETE /:id
- Bookings: GET /, POST /, PATCH /:id/status
- Issues: GET /, POST /, PATCH /:id/resolve

---

## Save/Share tips
- This file is already created at the repo root: `FINAL-REVIEW-DOCUMENTATION.md`.
- You can download/share it directly or copy to another location.
