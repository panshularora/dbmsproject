# SRM Exam Portal: MySQL-backed exam management system

**What:** student and faculty portals for exam registration, timetables, seat and hall allocation, grading, malpractice reports, results (with PDF export), notifications, and an audit log.
**Why:** a DBMS course project (29 commits, 26–27 Apr 2026). The aim was to push the logic into the database with stored procedures, triggers and views, and not only CRUD from the API.

**Status:** runs locally against your own MySQL instance and can be set up from scratch with `schema.sql` and `seed.sql`. Jest + Supertest API tests run in GitHub Actions against a MySQL 8 service container. There is no deployment.

## Database work
| Feature | Files |
|---|---|
| Base tables with primary keys, foreign keys, and unique constraints (for example, one registration per student and subject, and one evaluation per registration), plus demo seed data | `schema.sql`, `seed.sql` |
| Stored procedures for results, timetable, hall allocation, malpractice and result publishing. `RegisterForExam` and `ResetDemoData` run inside `START TRANSACTION` / `COMMIT`, with a `ROLLBACK` exit handler | `stored_procedures.sql`, `patch_sp.sql`, `update_sp_to_view.sql` |
| Triggers: grade and GPA computation, audit logging on inserts, updates and deletes | `triggers.sql`, `audit_triggers.sql`, `audit_log.sql` |
| Views for result and schedule reads | `create_views.sql` |
| B-tree indexes on hot lookups (e.g., roll number, registrations by student) | `update_db.sql` |
| Notifications table and search | `notifications_and_search.sql` |

About 920 lines of SQL in total. The UI includes a "SQL Query Visualizer" page that shows the queries behind each screen.

## API (Express + mysql2)
JWT auth (`jsonwebtoken`) with role checks for student and faculty. Passwords are stored and checked as bcrypt hashes only (`bcryptjs`). The API also has input validation with `express-validator`, request logging with `morgan`. Main routes:
`GET /api/students`, `GET /api/faculty/:id/evaluations`, `PUT /api/evaluations/:evaluationId`, `POST /api/malpractice`, `GET /api/audit-log`, `GET /api/results/:studentId`, `GET /api/timetable`, `GET /api/hall/:studentId`, `POST /api/register`.

## Run
1. Create `.env` in the repo root:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=exam_db
   JWT_SECRET=change-me   # server falls back to a hard-coded default if unset
   ```
2. Create the database from scratch. This needs the `mysql` client and MySQL 8:
   ```bash
   scripts/setup-db.sh            # add --reset to drop and recreate DB_NAME first
   ```
   Without bash, create the database and apply the files in this order: `mysql -u root -p exam_db < <file>`
   1. `schema.sql`: base tables
   2. `stored_procedures.sql`
   3. `create_views.sql`
   4. `update_db.sql`: B-tree indexes
   5. `update_sp_to_view.sql`
   6. `triggers.sql`
   7. `notifications_and_search.sql`: notifications table, FULLTEXT indexes and triggers
   8. `audit_log.sql`
   9. `audit_triggers.sql`
   10. `seed.sql`: demo data

   `patch_sp.sql` duplicates `update_sp_to_view.sql`. `restore_credentials.sql` is only for databases created before `schema.sql` existed. It switches them to bcrypt-hashed demo passwords and drops the old plaintext `password` column.
3. Install and start:
   ```bash
   npm run install:all
   npm run server     # API on http://localhost:5000
   npm run dev        # UI on http://localhost:5173
   ```

**Demo logins** (stored as bcrypt hashes in `seed.sql`; the login page's demo buttons fill them in):
| Role | Email | Password |
|---|---|---|
| Student | `keerthi.nair@srm.edu.in` | `student123` |
| Faculty | `dr..rajesh.kumar@srm.edu.in` | `faculty123` |

The other seeded students use `student123`, and the other seeded faculty member uses `faculty123`.

## Tests
`server/tests/` has Jest + Supertest tests. They cover login success and failure, bcrypt-only storage, role-protected routes, the results, timetable, dashboard and analytics endpoints, and grading through the triggers. They also check that `RegisterForExam` leaves no partial rows on a duplicate registration, on concurrent duplicates, or when a failure is injected after its first `INSERT`s. The tests run against a real MySQL database, and the database name must end in `_test`:
```bash
DB_NAME=exam_db_test scripts/setup-db.sh --reset
cd server && npm ci && DB_NAME=exam_db_test npm test
```
CI (`.github/workflows/test.yml`) runs the same steps on every push and PR against a `mysql:8` service container.

## Known gaps (course-project level)
- The demo endpoints (`/api/demo/*`) and several read endpoints (results, timetable, hall, dashboard) take a student ID in the URL and do not require a token or check that ID against it.
- `JWT_SECRET` falls back to a hard-coded value if it is not set.

## Stack
MySQL (procedures, triggers, views, indexes) · Node.js, Express, mysql2, jsonwebtoken, bcryptjs, express-validator, morgan · React 19, Vite, Tailwind v4, Recharts, jsPDF.
