const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'srm_secret';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- Auth Endpoints ---

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const table = role === 'faculty' ? 'faculty' : 'students';
    const idField = role === 'faculty' ? 'faculty_id' : 'student_id';
    
    // In normalized MySQL, we'll look for the user in their respective table
    const [users] = await db.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
    
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = users[0];
    const isMatch = (password === user.password) || (user.password_hash && await bcrypt.compare(password, user.password_hash));
    
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user[idField], role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user[idField],
        roll_no: user.roll_no,
        name: user.name || (user.first_name + ' ' + user.last_name),
        email: user.email,
        role,
        semester: user.semester
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/:id/dashboard
app.get('/api/students/:id/dashboard', async (req, res) => {
  try {
    const studentId = req.params.id; // This is the INT student_id now
    
    const [[{ count: registered }]] = await db.query('SELECT COUNT(*) as count FROM exam_registrations WHERE student_id = ?', [studentId]);
    const [[{ count: completed }]] = await db.query('SELECT COUNT(*) as count FROM evaluations e JOIN exam_registrations er ON e.registration_id = er.registration_id WHERE er.student_id = ?', [studentId]);
    const [latestResult] = await db.query(`
      SELECT sub.subject_name, e.marks, e.grade 
      FROM evaluations e 
      JOIN exam_registrations er ON e.registration_id = er.registration_id
      JOIN subjects sub ON er.subject_id = sub.subject_id 
      WHERE er.student_id = ? 
      ORDER BY e.evaluation_id DESC LIMIT 1
    `, [studentId]);

    res.json({
      registeredSubjects: registered,
      completedExams: completed,
      latestResult: latestResult[0] || null,
      notices: [
        { title: 'End Semester Exams', content: 'Final exams start from May 12, 2025.' },
        { title: 'Hall Ticket Download', content: 'Download your hall tickets from the portal.' }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- API Endpoints ---

// GET /api/students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subjects
app.get('/api/subjects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/results/:studentId
app.get('/api/results/:studentId', async (req, res) => {
  try {
    const sql = `
      SELECT s.name, sub.subject_name, e.marks, e.grade
      FROM students s
      JOIN exam_registrations er ON s.student_id = er.student_id
      JOIN evaluations e ON er.registration_id = e.registration_id
      JOIN subjects sub ON er.subject_id = sub.subject_id
      WHERE s.student_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timetable/:studentId (Personalized)
app.get('/api/timetable/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const sql = `
      SELECT sub.subject_name, sub.subject_id, t.exam_date, t.exam_time
      FROM exam_timetable t
      JOIN subjects sub ON t.subject_id = sub.subject_id
      JOIN exam_registrations er ON sub.subject_id = er.subject_id
      WHERE er.student_id = ?
    `;
    const [rows] = await db.query(sql, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timetable
app.get('/api/timetable', async (req, res) => {
  try {
    const sql = `
      SELECT sub.subject_name, sub.subject_id, t.exam_date, t.exam_time
      FROM exam_timetable t
      JOIN subjects sub ON t.subject_id = sub.subject_id
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/malpractice/:roll_no
app.get('/api/malpractice/:roll_no', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM malpractice WHERE roll_no = ?', [req.params.roll_no]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/:studentId
app.get('/api/hall/:studentId', async (req, res) => {
  try {
    const sql = `
      SELECT h.hall_name, ha.seat_no
      FROM hall_allocations ha
      JOIN exam_halls h ON ha.hall_id = h.hall_id
      JOIN exam_registrations er ON ha.registration_id = er.registration_id
      WHERE er.student_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.studentId]);
    res.json(rows[0] || { message: 'No allocation found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { student_id, subject_id } = req.body;
  try {
    // 1. Register for Exam
    const [regResult] = await db.query('INSERT INTO exam_registrations (student_id, subject_id, exam_id) VALUES (?, ?, 1)', [student_id, subject_id]);
    const registrationId = regResult.insertId;

    // 2. Auto-Allocate Hall for Demo
    const randomHall = Math.floor(Math.random() * 6) + 1;
    const randomSeat = Math.floor(Math.random() * 60) + 1;
    await db.query('INSERT INTO hall_allocations (registration_id, hall_id, seat_no) VALUES (?, ?, ?)', [registrationId, randomHall, randomSeat]);

    res.json({ message: 'Registration & Hall Allocation successful', id: registrationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Demo Endpoints ---

// POST /api/demo/caught/:id
app.post('/api/demo/caught/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const [[student]] = await db.query('SELECT roll_no, name, semester FROM students WHERE student_id = ?', [studentId]);
    const [[registration]] = await db.query(`
      SELECT sub.subject_name 
      FROM exam_registrations er 
      JOIN subjects sub ON er.subject_id = sub.subject_id 
      WHERE er.student_id = ? LIMIT 1
    `, [studentId]);
    
    if (!registration) return res.status(400).json({ error: 'Please register for a subject first!' });

    await db.query(`
      INSERT INTO malpractice (roll_no, name, semester, subject_name, description, reported_by, action_taken) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      student.roll_no, 
      student.name, 
      student.semester, 
      registration.subject_name, 
      'Student found using mobile phone during exam', 
      'Dr. Rajesh Kumar', 
      'Exam cancelled'
    ]);
    
    res.json({ message: 'You have been caught! Check Malpractice section.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/demo/reset/:id
app.post('/api/demo/reset/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const [[student]] = await db.query('SELECT roll_no FROM students WHERE student_id = ?', [studentId]);
    
    // Delete in reverse order of dependencies
    await db.query('DELETE e FROM evaluations e JOIN exam_registrations er ON e.registration_id = er.registration_id WHERE er.student_id = ?', [studentId]);
    await db.query('DELETE ha FROM hall_allocations ha JOIN exam_registrations er ON ha.registration_id = er.registration_id WHERE er.student_id = ?', [studentId]);
    await db.query('DELETE FROM malpractice WHERE roll_no = ?', [student.roll_no]);
    await db.query('DELETE FROM exam_registrations WHERE student_id = ?', [studentId]);
    
    res.json({ message: 'Demo data reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/evaluate/:id
app.post('/api/demo/evaluate/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const [registrations] = await db.query('SELECT registration_id FROM exam_registrations WHERE student_id = ?', [studentId]);
    
    for (const reg of registrations) {
      const marks = (Math.random() * 40 + 60).toFixed(2); // 60-100
      const grade = marks > 90 ? 'O' : marks > 80 ? 'A+' : marks > 70 ? 'A' : 'B';
      
      // Check if already evaluated
      const [existing] = await db.query('SELECT * FROM evaluations WHERE registration_id = ?', [reg.registration_id]);
      if (existing.length === 0) {
        await db.query('INSERT INTO evaluations (registration_id, faculty_id, marks, grade) VALUES (?, 1, ?, ?)', [reg.registration_id, marks, grade]);
      }
    }
    
    res.json({ message: 'Mock evaluations completed' });
  } catch (err) {
    console.error(err);
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
