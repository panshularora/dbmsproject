# SRM Exam Portal (MySQL Edition)

A high-fidelity examination management system refactored for MySQL and Express.

## 📁 Project Structure
- `/src`: Frontend React (Vite) source code.
- `/server`: Node.js + Express backend.
- `/public`: Static assets for the frontend.
- `.env`: Environment configuration for DB and JWT.

## 🚀 Getting Started

### 1. Database Setup
Ensure MySQL is running and an `exam_db` database exists with the normalized schema. Update the `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=exam_db
```

#### Audit log (optional, for Faculty → Database)
Apply after your base schema and existing triggers:
```bash
mysql -u root -p exam_db < audit_log.sql
mysql -u root -p exam_db < audit_triggers.sql
```

### 2. Install Dependencies
Run from the root:
```bash
npm install
cd server
npm install
```

### 3. Run the Application
- **Frontend**: `npm run dev` (Runs on http://localhost:5173)
- **Backend**: `npm run server` (Runs on http://localhost:5000)

## 📡 API Endpoints
- `GET /api/students?search=&semester=`: Student directory (faculty JWT; optional filters).
- `GET /api/faculty/:id/evaluations`: Grading queue for that faculty (faculty JWT; id must match token).
- `PUT /api/evaluations/:evaluationId`: Update marks (faculty JWT; must own the row).
- `POST /api/malpractice`: Create malpractice report (faculty JWT).
- `GET /api/audit-log?limit=`: Latest audit rows (faculty JWT; requires `audit_log` + triggers in DB).
- `GET /api/results/:studentId`: Joined result data.
- `GET /api/timetable`: Full exam schedule.
- `GET /api/hall/:studentId`: Seat allocation details.
- `POST /api/register`: Register for exams.
