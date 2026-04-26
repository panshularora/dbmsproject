# College Examination Management System API

A Node.js + Express backend with SQLite database for managing college examinations.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Seed the database**:
    The database is automatically initialized and seeded on first run, but you can also run it manually:
    ```bash
    node seed.js
    ```

3.  **Start the server**:
    ```bash
    node server.js
    ```
    The server will run on `http://localhost:3000`.

## API Endpoints

### CRUD Endpoints
Available for: `students`, `subjects`, `examinations`, `registrations`, `timetable`, `halls`, `allocations`, `faculty`, `evaluations`, `malpractice`.

-   `GET /api/:resource` - List all (supports query filtering, e.g., `?semester=1` or `?limit=10`)
-   `GET /api/:resource/:id` - Get by ID
-   `POST /api/:resource` - Create new
-   `PUT /api/:resource/:id` - Update
-   `DELETE /api/:resource/:id` - Delete

### Aggregate & Search Endpoints

-   `GET /api/results/summary` - Statistical summary of results per subject.
-   `GET /api/students/topper?limit=10` - List top performing students.
-   `GET /api/results/gradesheet/:studentId` - Detailed gradesheet for a specific student.

## Technologies Used
-   **Node.js & Express**: Web framework.
-   **SQLite (better-sqlite3)**: Database engine.
-   **xlsx**: Excel data parsing.
-   **cors**: Cross-Origin Resource Sharing.
-   **morgan**: HTTP request logger.
