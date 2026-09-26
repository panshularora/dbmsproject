# SRM Exam Portal: MySQL-backed exam management system

**What:** student and faculty portals for exam registration, timetables, seat and hall allocation, grading, malpractice reports, results (with PDF export), notifications, and an audit log.
**Why:** a DBMS course project (29 commits, 26–27 Apr 2026). The aim was to push the logic into the database with stored procedures, triggers and views, and not only CRUD from the API.

**Status:** runs locally against your own MySQL instance. There are no automated tests and no deployment.

## Database work
| Feature | Files |
|---|---|
| Stored procedures for results, timetable, hall allocation, malpractice and result publishing. `RegisterForExam` and `ResetDemoData` run inside `START TRANSACTION` / `COMMIT`, with a `ROLLBACK` exit handler | `stored_procedures.sql`, `patch_sp.sql`, `update_sp_to_view.sql` |
| Triggers: grade and GPA computation, audit logging on inserts, updates and deletes | `triggers.sql`, `audit_triggers.sql`, `audit_log.sql` |
| Views for result and schedule reads | `create_views.sql` |
| B-tree indexes on hot lookups (e.g., roll number, registrations by student) | `update_db.sql` |
| Notifications table and search | `notifications_and_search.sql` |

About 690 lines of SQL in total. The UI includes a "SQL Query Visualizer" page that shows the queries behind each screen.

## API (Express + mysql2)
JWT auth (`jsonwebtoken`) with role checks for student and faculty, input validation with `express-validator`, request logging with `morgan`. Main routes:
`GET /api/students`, `GET /api/faculty/:id/evaluations`, `PUT /api/evaluations/:evaluationId`, `POST /api/malpractice`, `GET /api/audit-log`, `GET /api/results/:studentId`, `GET /api/timetable`, `GET /api/hall/:studentId`, `POST /api/register`.

## Run
1. Create an `exam_db` database in MySQL. **The base schema (students, faculty, subjects, exam_registrations, evaluations, …) is not in this repo yet.** The SQL files here are migrations and patches on top of it. See "Known gaps".
2. Apply the SQL files: procedures, triggers, views, then `audit_log.sql` and `audit_triggers.sql`.
3. Create `.env` in the repo root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=exam_db
   JWT_SECRET=change-me   # server falls back to a hard-coded default if unset
   ```
4. Install and start:
   ```bash
   npm run install:all
   npm run server     # API on http://localhost:5000
   npm run dev        # UI on http://localhost:5173
   ```

## Known gaps (course-project level)
- **Missing base schema:** add a `schema.sql` (CREATE TABLEs) and seed data so the project can be set up from scratch.
- **Plaintext demo passwords:** `restore_credentials.sql` sets demo passwords in plain text, and login accepts `password === user.password` as well as bcrypt hashes (`server/server.js`). Fine for a classroom demo; switch to bcrypt-only before any real use.
- No tests yet. Transaction and rollback behaviour in the procedures would be the first thing to test.

## Stack
MySQL (procedures, triggers, views, indexes) · Node.js, Express, mysql2, jsonwebtoken, bcryptjs, express-validator, morgan · React 19, Vite, Tailwind v4, Recharts, jsPDF.
