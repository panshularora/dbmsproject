const { request, app, db, STUDENT, FACULTY, FACULTY_2, login } = require('./helpers');

afterAll(() => db.end());

describe('core read endpoints', () => {
  test('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('GET /api/subjects returns the seeded subjects', async () => {
    const res = await request(app).get('/api/subjects');
    expect(res.status).toBe(200);
    expect(res.body.map((s) => s.subject_code)).toContain('21CSC205P');
    expect(res.body.length).toBe(6);
  });

  test('GET /api/results/:studentId uses the view; grades come from triggers', async () => {
    const res = await request(app).get('/api/results/1');
    expect(res.status).toBe(200);
    const dbms = res.body.find((r) => r.subject_name === 'Database Management Systems');
    expect(dbms).toMatchObject({ name: 'Keerthi Nair', grade: 'A+', credits: 4 });
    // A pending evaluation (marks NULL) has no grade rather than an F.
    const pending = res.body.find((r) => r.subject_name === 'Design and Analysis of Algorithms');
    expect(pending).toMatchObject({ marks: null, grade: null });
  });

  test('GET /api/timetable/:studentId returns only registered subjects', async () => {
    const res = await request(app).get('/api/timetable/1');
    expect(res.status).toBe(200);
    expect(res.body.map((r) => r.subject_id).sort()).toEqual([1, 2]);
  });

  test('GET /api/students/:id/dashboard', async () => {
    const res = await request(app).get('/api/students/1/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.registeredSubjects).toBe(2);
    expect(res.body.gpa).toBe('9.00');
  });

  test('GET /api/analytics/subjects reads vw_subject_analytics', async () => {
    const res = await request(app).get('/api/analytics/subjects');
    expect(res.status).toBe(200);
    const dbms = res.body.find((r) => r.subject_id === 1);
    expect(dbms.total_registrations).toBeGreaterThanOrEqual(3);
  });
});

describe('grading', () => {
  test('faculty can only grade their own evaluations; the trigger sets the grade and GPA', async () => {
    const [[ev]] = await db.query('SELECT evaluation_id FROM evaluations WHERE registration_id = 9'); // Rohan, faculty 2
    const other = await login(FACULTY);
    const denied = await request(app)
      .put(`/api/evaluations/${ev.evaluation_id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ marks: 91 });
    expect(denied.status).toBe(403);

    const owner = await login(FACULTY_2);
    const bad = await request(app)
      .put(`/api/evaluations/${ev.evaluation_id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ marks: 150 });
    expect(bad.status).toBe(400);

    const ok = await request(app)
      .put(`/api/evaluations/${ev.evaluation_id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ marks: 91 });
    expect(ok.status).toBe(200);
    const [[row]] = await db.query('SELECT grade FROM evaluations WHERE evaluation_id = ?', [ev.evaluation_id]);
    expect(row.grade).toBe('O');
    // Rohan: DAA 45 -> C (5 x 4 credits) + OS 91 -> O (10 x 4 credits) = 60 / 8 = 7.50
    const [[student]] = await db.query('SELECT gpa FROM students WHERE student_id = 4');
    expect(Number(student.gpa)).toBeCloseTo(7.5, 2);
  });
});

describe('RegisterForExam', () => {
  const STUDENT_ID = 5; // Sneha Reddy: no seeded registrations
  let token;

  async function rowsFor(studentId, subjectId) {
    const [[counts]] = await db.query(
      `SELECT
         (SELECT COUNT(*) FROM exam_registrations WHERE student_id = ? AND subject_id = ?) AS registrations,
         (SELECT COUNT(*) FROM hall_allocations ha JOIN exam_registrations er USING (registration_id)
            WHERE er.student_id = ? AND er.subject_id = ?) AS allocations,
         (SELECT COUNT(*) FROM evaluations e JOIN exam_registrations er USING (registration_id)
            WHERE er.student_id = ? AND er.subject_id = ?) AS evaluations`,
      [studentId, subjectId, studentId, subjectId, studentId, subjectId]
    );
    return counts;
  }

  async function tableTotals() {
    const [[t]] = await db.query(
      `SELECT (SELECT COUNT(*) FROM exam_registrations) AS registrations,
              (SELECT COUNT(*) FROM hall_allocations)   AS allocations,
              (SELECT COUNT(*) FROM evaluations)        AS evaluations,
              (SELECT COUNT(*) FROM audit_log)          AS audit_rows,
              (SELECT COUNT(*) FROM notifications)      AS notifications`
    );
    return t;
  }

  beforeAll(async () => {
    token = (await login(STUDENT)).token;
    const reset = await request(app).post(`/api/demo/reset/${STUDENT_ID}`);
    expect(reset.status).toBe(200);
  });

  test('registration creates the registration, hall allocation and pending evaluation together', async () => {
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ student_id: STUDENT_ID, subject_id: 1 });
    expect(res.status).toBe(200);
    expect(res.body.id).toEqual(expect.any(Number));
    expect(await rowsFor(STUDENT_ID, 1)).toEqual({ registrations: 1, allocations: 1, evaluations: 1 });
  });

  test('a duplicate registration fails and leaves no partial rows', async () => {
    const before = await tableTotals();
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ student_id: STUDENT_ID, subject_id: 1 });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Already registered/);
    expect(await rowsFor(STUDENT_ID, 1)).toEqual({ registrations: 1, allocations: 1, evaluations: 1 });
    expect(await tableTotals()).toEqual(before);
  });

  test('concurrent duplicate registrations leave exactly one registration', async () => {
    const conns = await Promise.all([db.getConnection(), db.getConnection()]);
    try {
      const results = await Promise.allSettled(conns.map((c) => c.query('CALL RegisterForExam(?, ?)', [STUDENT_ID, 3])));
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
      expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    } finally {
      conns.forEach((c) => c.release());
    }
    expect(await rowsFor(STUDENT_ID, 3)).toEqual({ registrations: 1, allocations: 1, evaluations: 1 });
  });

  test('a failure after the first INSERTs rolls the whole registration back', async () => {
    // Fault injection: make the last INSERT inside the procedure (the pending evaluation)
    // fail, after exam_registrations and hall_allocations rows were already written.
    await db.query('DROP TRIGGER IF EXISTS trg_test_fail_evaluation_insert');
    await db.query(`
      CREATE TRIGGER trg_test_fail_evaluation_insert BEFORE INSERT ON evaluations FOR EACH ROW
      BEGIN
        IF @fail_evaluation_insert = 1 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'injected failure';
        END IF;
      END`);
    const conn = await db.getConnection();
    try {
      const before = await tableTotals();
      await conn.query('SET @fail_evaluation_insert = 1');
      await expect(conn.query('CALL RegisterForExam(?, ?)', [STUDENT_ID, 2])).rejects.toThrow(/injected failure/);
      // If the procedure had not rolled back, this COMMIT would persist the partial rows.
      await conn.query('COMMIT');
      expect(await rowsFor(STUDENT_ID, 2)).toEqual({ registrations: 0, allocations: 0, evaluations: 0 });
      // Audit rows written by triggers inside the transaction are rolled back too.
      expect(await tableTotals()).toEqual(before);
    } finally {
      await conn.query('SET @fail_evaluation_insert = NULL');
      conn.release();
      await db.query('DROP TRIGGER IF EXISTS trg_test_fail_evaluation_insert');
    }
    // Without the injected fault the same registration succeeds.
    const res = await request(app)
      .post('/api/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ student_id: STUDENT_ID, subject_id: 2 });
    expect(res.status).toBe(200);
    expect(await rowsFor(STUDENT_ID, 2)).toEqual({ registrations: 1, allocations: 1, evaluations: 1 });
  });

  test('ResetDemoData removes the student\'s registrations and dependent rows', async () => {
    const res = await request(app).post(`/api/demo/reset/${STUDENT_ID}`);
    expect(res.status).toBe(200);
    for (const subject of [1, 2, 3]) {
      expect(await rowsFor(STUDENT_ID, subject)).toEqual({ registrations: 0, allocations: 0, evaluations: 0 });
    }
  });
});
