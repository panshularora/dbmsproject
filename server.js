require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize DB
initDb();

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    const table = role === 'student' ? 'Students' : 'Faculty';
    const user = db.prepare(`SELECT * FROM ${table} WHERE email = ?`).get(email);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { id: user.student_id || user.faculty_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.student_id || user.faculty_id,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        email: user.email,
        roll_no: user.roll_no || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Student Endpoints ---
app.get('/api/students/:id', authenticateToken, (req, res) => {
  try {
    const student = db.prepare('SELECT * FROM Students WHERE student_id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id/timetable', authenticateToken, (req, res) => {
  try {
    const student = db.prepare('SELECT semester FROM Students WHERE student_id = ?').get(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const timetable = db.prepare(`
      SELECT t.*, s.type 
      FROM Exam_Timetable t
      JOIN Subjects s ON t.subject_id = s.subject_id
      WHERE s.semester = ?
    `).all(student.semester);
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id/seat', authenticateToken, (req, res) => {
  try {
    const allocation = db.prepare(`
      SELECT ha.* 
      FROM Hall_Allocations ha
      JOIN Exam_Registrations er ON ha.registration_id = er.registration_id
      WHERE er.student_id = ?
      LIMIT 1
    `).get(req.params.id);
    res.json(allocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students/:id/results', authenticateToken, (req, res) => {
  try {
    const results = db.prepare(`
      SELECT e.*, s.subject_code, s.credits
      FROM Evaluations e
      JOIN Exam_Registrations er ON e.registration_id = er.registration_id
      JOIN Subjects s ON er.subject_id = s.subject_id
      WHERE er.student_id = ?
    `).all(req.params.id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Faculty Endpoints ---
app.get('/api/faculty/:id/evaluations', authenticateToken, (req, res) => {
  try {
    const evaluations = db.prepare('SELECT * FROM Evaluations WHERE faculty_id = ?').all(req.params.id);
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/evaluations/:id', authenticateToken, (req, res) => {
  const { marks, grade } = req.body;
  try {
    const info = db.prepare('UPDATE Evaluations SET marks = ?, grade = ?, status = "Graded" WHERE evaluation_id = ?')
      .run(marks, grade, req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Evaluation not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subjects', (req, res) => {
  const { semester } = req.query;
  try {
    let query = 'SELECT * FROM Subjects';
    const params = [];
    if (semester) {
      query += ' WHERE semester = ?';
      params.push(semester);
    }
    const subjects = db.prepare(query).all(...params);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/students', authenticateToken, (req, res) => {
  const { semester, search } = req.query;
  try {
    let query = 'SELECT * FROM Students WHERE 1=1';
    const params = [];
    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }
    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR roll_no LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const students = db.prepare(query).all(...params);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Stats for Student
app.get('/api/students/:id/dashboard', authenticateToken, (req, res) => {
  try {
    const regCount = db.prepare('SELECT COUNT(*) as count FROM Exam_Registrations WHERE student_id = ?').get(req.params.id);
    const evalCount = db.prepare('SELECT COUNT(*) as count FROM Evaluations e JOIN Exam_Registrations er ON e.registration_id = er.registration_id WHERE er.student_id = ?').get(req.params.id);
    const latestResult = db.prepare('SELECT e.* FROM Evaluations e JOIN Exam_Registrations er ON e.registration_id = er.registration_id WHERE er.student_id = ? ORDER BY e.evaluation_id DESC LIMIT 1').get(req.params.id);
    const notices = db.prepare('SELECT * FROM Notices ORDER BY notice_id DESC LIMIT 3').all();

    res.json({
      registeredSubjects: regCount.count,
      completedExams: evalCount.count,
      latestResult,
      notices
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Malpractice Endpoints
app.get('/api/students/:id/malpractice', authenticateToken, (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM Malpractice WHERE student_id = ?').all(req.params.id);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/malpractice', authenticateToken, (req, res) => {
  try {
    const records = db.prepare('SELECT * FROM Malpractice').all();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/malpractice', authenticateToken, (req, res) => {
  const { registration_id, student_id, student_name, roll_no, subject_name, description, reported_by, action_taken, status } = req.body;
  try {
    const info = db.prepare(`
      INSERT INTO Malpractice (registration_id, student_id, student_name, roll_no, subject_name, description, reported_by, action_taken, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(registration_id, student_id, student_name, roll_no, subject_name, description, reported_by, action_taken, status);
    res.json({ id: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
