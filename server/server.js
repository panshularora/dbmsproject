const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'srm_secret';

app.use(cors({
  exposedHeaders: ['X-SQL-Query']
}));
app.use(express.json());
app.use(morgan('dev'));

// --- Middleware ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

// --- SQL Tracer ---
let lastQuery = '';
const originalQuery = db.query;
db.query = async function(...args) {
    lastQuery = args[0];
    // Simple replacement of ? with values for display purposes
    if (args[1]) {
        args[1].forEach(val => {
            lastQuery = lastQuery.replace('?', typeof val === 'string' ? `'${val}'` : val);
        });
    }
    return originalQuery.apply(this, args);
};

app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
        res.setHeader('X-SQL-Query', lastQuery.replace(/\n/g, ' ').trim());
        return originalJson.call(this, data);
    };
    next();
});

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
    
    // Include role and id in the JWT payload
    const token = jwt.sign({ id: user[idField], role: role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user[idField],
        roll_no: user.roll_no,
        name: user.name || (user.first_name + ' ' + user.last_name),
        email: user.email,
        role,
        semester: user.semester,
        gpa: user.gpa || 0.00
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
    const [latestResultSets] = await db.query('CALL GetLatestResult(?)', [studentId]);
    const latestResult = latestResultSets[0];

    const [timelineSets] = await db.query('CALL GetDashboardTimeline(?)', [studentId]);
    const timeline = timelineSets[0];

    const [[studentInfo]] = await db.query('SELECT gpa FROM students WHERE student_id = ?', [studentId]);
    const gpaValue = completed > 0
      ? (studentInfo ? Number(studentInfo.gpa).toFixed(2) : '0.00')
      : '0.00';

    res.json({
      registeredSubjects: registered,
      completedExams: completed,
      gpa: gpaValue,
      latestResult: latestResult[0] || null,
      timeline: timeline,
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

// GET /api/students (Faculty: optional ?search= & ?semester=)
app.get('/api/students', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const semester = req.query.semester || '';

    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];

    if (semester !== '' && semester !== null && !Number.isNaN(Number(semester))) {
      sql += ' AND semester = ?';
      params.push(Number(semester));
    }

    if (search) {
      sql += ' AND (name LIKE ? OR roll_no LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like);
    }

    sql += ' ORDER BY name, roll_no';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faculty/:id/evaluations (assigned rows for this faculty)
app.get('/api/faculty/:id/evaluations', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    if (String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ error: 'Access denied: wrong faculty' });
    }
    const facultyId = req.params.id;
    const sql = `
      SELECT
        e.evaluation_id,
        e.registration_id,
        e.marks,
        e.grade,
        s.name AS student_name,
        s.roll_no,
        sub.subject_name,
        CASE
          WHEN e.marks IS NULL THEN 'Pending'
          ELSE 'Graded'
        END AS status
      FROM evaluations e
      JOIN exam_registrations er ON e.registration_id = er.registration_id
      JOIN students s ON er.student_id = s.student_id
      JOIN subjects sub ON er.subject_id = sub.subject_id
      WHERE e.faculty_id = ?
      ORDER BY e.evaluation_id DESC
    `;
    const [rows] = await db.query(sql, [facultyId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/evaluations/:evaluationId (update marks; grade from DB triggers)
app.put('/api/evaluations/:evaluationId', [
  authenticateToken,
  requireRole('faculty'),
  body('marks').isFloat({ min: 0, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const evaluationId = req.params.evaluationId;
  const { marks } = req.body;
  try {
    const [[row]] = await db.query('SELECT faculty_id FROM evaluations WHERE evaluation_id = ?', [evaluationId]);
    if (!row) return res.status(404).json({ error: 'Evaluation not found' });
    if (row.faculty_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: not your evaluation' });
    }
    await db.query('UPDATE evaluations SET marks = ? WHERE evaluation_id = ?', [marks, evaluationId]);
    res.json({ message: 'Evaluation updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/malpractice (faculty: report by registration_id)
app.post('/api/malpractice', [
  authenticateToken,
  requireRole('faculty'),
  body('registration_id').isInt(),
  body('description').trim().notEmpty(),
  body('action_taken').optional().isString(),
  body('status').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { registration_id, description, action_taken, status } = req.body;
  const reportedBy = (req.body.reported_by && String(req.body.reported_by)) || (req.user.name || 'Faculty');
  try {
    const [[er]] = await db.query('SELECT er.registration_id FROM exam_registrations er WHERE er.registration_id = ?', [registration_id]);
    if (!er) return res.status(400).json({ error: 'Invalid registration_id' });
    const at = action_taken || 'Under Investigation';
    const st = status || 'Pending';
    const [r] = await db.query(
      'INSERT INTO malpractice (registration_id, description, reported_by, action_taken, status) VALUES (?, ?, ?, ?, ?)',
      [registration_id, description, reportedBy, at, st]
    );
    res.json({ message: 'Malpractice report recorded', malpractice_id: r.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit-log (latest rows; faculty only)
app.get('/api/audit-log', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '100'), 10) || 100, 500);
    const [rows] = await db.query(
      'SELECT audit_id, table_name, action, pk_value, old_data, new_data, changed_at FROM audit_log ORDER BY audit_id DESC LIMIT ?',
      [limit]
    );
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
    const [resultSets] = await db.query('CALL GetStudentResults(?)', [req.params.studentId]);
    res.json(resultSets[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/timetable/:studentId (Personalized)
app.get('/api/timetable/:studentId', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const [resultSets] = await db.query('CALL GetStudentTimetable(?)', [studentId]);
    res.json(resultSets[0]);
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

// GET /api/malpractice/:studentId
app.get('/api/malpractice/:studentId', async (req, res) => {
  try {
    const sql = `
      SELECT m.*, sub.subject_name
      FROM malpractice m
      JOIN exam_registrations er ON m.registration_id = er.registration_id
      JOIN subjects sub ON er.subject_id = sub.subject_id
      WHERE er.student_id = ?
    `;
    const [rows] = await db.query(sql, [req.params.studentId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/:studentId
app.get('/api/hall/:studentId', async (req, res) => {
  try {
    const [resultSets] = await db.query('CALL GetStudentHallAllocation(?)', [req.params.studentId]);
    res.json(resultSets[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Demo Endpoints ---

// POST /api/demo/caught/:id (Auth required - any role for demo)
app.post('/api/demo/caught/:id', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.id;
    const [[registration]] = await db.query(`
      SELECT er.registration_id, sub.subject_name 
      FROM exam_registrations er 
      JOIN subjects sub ON er.subject_id = sub.subject_id 
      WHERE er.student_id = ? LIMIT 1
    `, [studentId]);
    
    if (!registration) return res.status(400).json({ error: 'Please register for a subject first!' });

    await db.query(`
      INSERT INTO malpractice (registration_id, description, reported_by, action_taken, status) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      registration.registration_id, 
      `Student found using mobile phone during ${registration.subject_name} exam`, 
      'Dr. Rajesh Kumar', 
      'Exam cancelled',
      'Confirmed'
    ]);
    
    res.json({ message: 'You have been caught! Check Malpractice section.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/demo/reset/:id
app.post('/api/demo/reset/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Delete in reverse order of dependencies via transaction-wrapped stored procedure
    await db.query('CALL ResetDemoData(?)', [studentId]);
    
    res.json({ message: 'Demo data reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faculty/:id
app.get('/api/faculty/:id', authenticateToken, async (req, res) => {
  try {
    const [resultSets] = await db.query('CALL GetFacultyInfo(?)', [req.params.id]);
    res.json(resultSets[0][0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/malpractice (All records - Faculty only)
app.get('/api/malpractice', authenticateToken, requireRole('faculty'), async (req, res) => {
  try {
    const [resultSets] = await db.query('CALL GetAllMalpractice()');
    res.json(resultSets[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/results/publish (Faculty only)
app.put('/api/results/publish', [
  authenticateToken,
  requireRole('faculty'),
  body('registration_id').isInt(),
  body('marks').isFloat({ min: 0, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { registration_id, marks } = req.body;
  try {
    await db.query('CALL PublishResult(?, ?)', [registration_id, marks]);
    res.json({ message: 'Result published successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/register
app.post('/api/register', [
  authenticateToken,
  body('student_id').isInt(),
  body('subject_id').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { student_id, subject_id } = req.body;
  try {
    // 1. Register for Exam via Stored Procedure
    const [resultSets] = await db.query('CALL RegisterForExam(?, ?)', [student_id, subject_id]);
    const registrationId = resultSets[0][0].registrationId;

    res.json({ message: 'Registration & Hall Allocation successful', id: registrationId });
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

// POST /api/explain
app.post('/api/explain', async (req, res) => {
  const { query } = req.body;
  try {
    if (!query.toLowerCase().trim().startsWith('select')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
    }
    const [rows] = await db.query(`EXPLAIN ${query}`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/subjects
app.get('/api/analytics/subjects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_subject_analytics');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search (Global Full-Text Search)
app.get('/api/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ students: [], subjects: [] });
  
  try {
    const [students] = await db.query(
      "SELECT student_id, name, roll_no, course FROM students WHERE MATCH(name, roll_no) AGAINST(? IN NATURAL LANGUAGE MODE)", 
      [q]
    );
    const [subjects] = await db.query(
      "SELECT subject_id, subject_name, credits FROM subjects WHERE MATCH(subject_name) AGAINST(? IN NATURAL LANGUAGE MODE)", 
      [q]
    );
    res.json({ students, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/:studentId
app.get('/api/notifications/:studentId', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC LIMIT 10', 
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifications/:id/read
app.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ?', [req.params.id]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Health Check ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: 'MySQL' });
});

async function tableColumns(tableName) {
  const [rows] = await db.query(`SHOW COLUMNS FROM \`${tableName}\``);
  return new Set(rows.map((r) => r.Field));
}

async function ensureDemoUsers() {
  // If the DB has no seed users, login is impossible. We create minimal demo users
  // using only the columns that exist in the current schema.
  try {
    // Faculty
    const [[{ count: facultyCount }]] = await db.query('SELECT COUNT(*) as count FROM faculty');
    if (facultyCount === 0) {
      const cols = await tableColumns('faculty');
      const insertCols = [];
      const insertVals = [];

      if (cols.has('name')) { insertCols.push('name'); insertVals.push('Demo Faculty'); }
      if (cols.has('email')) { insertCols.push('email'); insertVals.push('faculty@srm.edu.in'); }
      if (cols.has('department')) { insertCols.push('department'); insertVals.push('CSE'); }

      if (cols.has('password')) {
        insertCols.push('password'); insertVals.push('faculty');
      } else if (cols.has('password_hash')) {
        insertCols.push('password_hash'); insertVals.push(await bcrypt.hash('faculty', 10));
      }

      if (insertCols.length > 0) {
        await db.query(
          `INSERT INTO faculty (${insertCols.map((c) => `\`${c}\``).join(', ')}) VALUES (${insertCols.map(() => '?').join(', ')})`,
          insertVals
        );
      }
    }

    // Students
    const [[{ count: studentCount }]] = await db.query('SELECT COUNT(*) as count FROM students');
    if (studentCount === 0) {
      const cols = await tableColumns('students');
      const insertCols = [];
      const insertVals = [];

      if (cols.has('name')) { insertCols.push('name'); insertVals.push('Keerthi Nair'); }
      if (cols.has('roll_no')) { insertCols.push('roll_no'); insertVals.push('CS101'); }
      if (cols.has('email')) { insertCols.push('email'); insertVals.push('student@srm.edu.in'); }
      if (cols.has('course')) { insertCols.push('course'); insertVals.push('B.Tech CSE'); }
      if (cols.has('semester')) { insertCols.push('semester'); insertVals.push(4); }
      if (cols.has('gpa')) { insertCols.push('gpa'); insertVals.push(0.0); }
      if (cols.has('phone_no')) { insertCols.push('phone_no'); insertVals.push('9999999999'); }

      if (cols.has('password')) {
        insertCols.push('password'); insertVals.push('student');
      } else if (cols.has('password_hash')) {
        insertCols.push('password_hash'); insertVals.push(await bcrypt.hash('student', 10));
      }

      if (insertCols.length > 0) {
        await db.query(
          `INSERT INTO students (${insertCols.map((c) => `\`${c}\``).join(', ')}) VALUES (${insertCols.map(() => '?').join(', ')})`,
          insertVals
        );
      }
    }
  } catch (err) {
    // Don't crash server if schema differs; log and continue.
    console.warn('Demo user seed skipped:', err.message);
  }
}

ensureDemoUsers().finally(() => {
  app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
  });
});
