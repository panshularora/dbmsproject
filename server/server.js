require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- API Endpoints ---

// GET /api/students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/results/:studentId
app.get('/api/results/:studentId', async (req, res) => {
  try {
    const sql = `
      SELECT s.first_name, s.last_name, sub.subject_name, e.marks
      FROM students s
      JOIN exam_registrations er ON s.student_id = er.student_id
      JOIN subjects sub ON er.subject_id = sub.subject_id
      JOIN evaluations e ON er.registration_id = e.registration_id
      WHERE s.student_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timetable
app.get('/api/timetable', async (req, res) => {
  try {
    const sql = `
      SELECT sub.subject_name, t.exam_date, t.exam_time
      FROM exam_timetable t
      JOIN subjects sub ON t.subject_id = sub.subject_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/:studentId
app.get('/api/hall/:studentId', async (req, res) => {
  try {
    const sql = `
      SELECT h.hall_name, ha.seat_no
      FROM hall_allocations ha
      JOIN exam_registrations er ON ha.registration_id = er.registration_id
      JOIN exam_halls h ON ha.hall_id = h.hall_id
      WHERE er.student_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.studentId]);
    res.json(rows[0] || { message: 'No allocation found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { student_id, subject_id, exam_id } = req.body;
  try {
    const sql = 'INSERT INTO exam_registrations (student_id, subject_id, exam_id) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [student_id, subject_id, exam_id]);
    res.json({ message: 'Registration successful', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'MySQL' });
});

app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});
