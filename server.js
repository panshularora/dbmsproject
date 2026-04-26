const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure DB is initialized
initDb();

// --- AGGREGATE ENDPOINTS (Must be before CRUD routes to avoid conflicts) ---

// 1. Result Summary (Avg marks per subject, pass percentage, etc.)
app.get('/api/results/summary', (req, res) => {
  try {
    const summary = db.prepare(`
      SELECT 
        subject_name,
        COUNT(*) as total_students,
        AVG(marks) as average_marks,
        MAX(marks) as highest_marks,
        MIN(marks) as lowest_marks,
        SUM(CASE WHEN marks >= 50 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pass_percentage
      FROM Evaluations
      GROUP BY subject_name
    `).all();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Topper Students
app.get('/api/students/topper', (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const toppers = db.prepare(`
      SELECT 
        student_name,
        AVG(marks) as avg_marks,
        SUM(marks) as total_marks,
        COUNT(subject_name) as subjects_count
      FROM Evaluations
      GROUP BY student_name
      ORDER BY avg_marks DESC
      LIMIT ?
    `).all(limit);
    res.json(toppers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Gradesheet for a specific student
app.get('/api/results/gradesheet/:studentId', (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = db.prepare(`SELECT * FROM Students WHERE student_id = ?`).get(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const grades = db.prepare(`
      SELECT 
        e.subject_name,
        s.subject_code,
        e.marks,
        e.grade,
        s.credits
      FROM Evaluations e
      JOIN Exam_Registrations er ON e.registration_id = er.registration_id
      JOIN Subjects s ON er.subject_id = s.subject_id
      WHERE er.student_id = ?
    `).all(studentId);

    const avgMarks = grades.length > 0 
      ? (grades.reduce((acc, curr) => acc + curr.marks, 0) / grades.length).toFixed(2)
      : 0;

    res.json({
      student: {
        id: student.student_id,
        roll_no: student.roll_no,
        name: `${student.first_name} ${student.last_name}`,
        course: student.course,
        semester: student.semester
      },
      results: grades,
      summary: {
        total_subjects: grades.length,
        average_marks: avgMarks
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for generic CRUD
const createCrudRoutes = (tableName, idColumn) => {
  const router = express.Router();

  // GET all with search and filter
  router.get('/', (req, res) => {
    try {
      let query = `SELECT * FROM ${tableName}`;
      const params = [];
      const conditions = [];

      Object.keys(req.query).forEach(key => {
        if (key === 'limit' || key === 'offset') return;
        if (key === 'semester') {
          conditions.push(`semester = ?`);
          params.push(req.query.semester);
        } else if (key === 'search') {
          // Simple search across all columns (requires dynamic building)
          // For now, let's just support direct field filtering
        } else {
          conditions.push(`${key} = ?`);
          params.push(req.query[key]);
        }
      });

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }

      if (req.query.limit) {
        query += ` LIMIT ?`;
        params.push(parseInt(req.query.limit));
      }

      const rows = db.prepare(query).all(...params);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by ID
  router.get('/:id', (req, res) => {
    try {
      const row = db.prepare(`SELECT * FROM ${tableName} WHERE ${idColumn} = ?`).get(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post('/', (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const info = db.prepare(sql).run(...values);
      res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update
  router.put('/:id', (req, res) => {
    try {
      const keys = Object.keys(req.body);
      const values = Object.values(req.body);
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = ?`;
      const info = db.prepare(sql).run(...values, req.params.id);
      if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Updated successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE
  router.delete('/:id', (req, res) => {
    try {
      const info = db.prepare(`DELETE FROM ${tableName} WHERE ${idColumn} = ?`).run(req.params.id);
      if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

// Register CRUD routes
app.use('/api/students', createCrudRoutes('Students', 'student_id'));
app.use('/api/subjects', createCrudRoutes('Subjects', 'subject_id'));
app.use('/api/examinations', createCrudRoutes('Examinations', 'exam_id'));
app.use('/api/registrations', createCrudRoutes('Exam_Registrations', 'registration_id'));

// Custom Timetable route with Semester join
app.get('/api/timetable', (req, res) => {
  try {
    let query = `
      SELECT t.*, s.semester 
      FROM Exam_Timetable t
      JOIN Subjects s ON t.subject_id = s.subject_id
    `;
    const params = [];
    if (req.query.semester) {
      query += ` WHERE s.semester = ?`;
      params.push(req.query.semester);
    }
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use('/api/timetable', createCrudRoutes('Exam_Timetable', 'timetable_id'));
app.use('/api/halls', createCrudRoutes('Exam_Halls', 'hall_id'));
app.use('/api/allocations', createCrudRoutes('Hall_Allocations', 'allocation_id'));
app.use('/api/faculty', createCrudRoutes('Faculty', 'faculty_id'));
app.use('/api/evaluations', createCrudRoutes('Evaluations', 'evaluation_id'));
app.use('/api/malpractice', createCrudRoutes('Malpractice', 'malpractice_id'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'College Examination Management API is running',
    endpoints: [
      '/api/students',
      '/api/subjects',
      '/api/examinations',
      '/api/registrations',
      '/api/timetable',
      '/api/halls',
      '/api/allocations',
      '/api/faculty',
      '/api/evaluations',
      '/api/malpractice',
      '/api/results/summary',
      '/api/students/topper',
      '/api/results/gradesheet/:studentId'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
