const { request, app, db, STUDENT, FACULTY, login } = require('./helpers');

afterAll(() => db.end());

describe('POST /api/auth/login', () => {
  test('student logs in with the demo credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(STUDENT);
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({ id: 1, role: 'student', email: STUDENT.email, roll_no: 'CS101' });
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('faculty logs in with the demo credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(FACULTY);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: 1, role: 'faculty', name: 'Dr. Rajesh Kumar' });
  });

  test('wrong password is rejected', async () => {
    const res = await request(app).post('/api/auth/login').send({ ...STUDENT, password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });

  test('unknown email is rejected', async () => {
    const res = await request(app).post('/api/auth/login').send({ ...STUDENT, email: 'nobody@srm.edu.in' });
    expect(res.status).toBe(401);
  });

  test('missing password is rejected', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: STUDENT.email, role: 'student' });
    expect(res.status).toBe(401);
  });

  test('student credentials do not work on the faculty portal', async () => {
    const res = await request(app).post('/api/auth/login').send({ ...STUDENT, role: 'faculty' });
    expect(res.status).toBe(401);
  });

  test('a plaintext value in the password column is never accepted', async () => {
    // Simulate a legacy row whose stored "password" is plaintext rather than a bcrypt hash.
    await db.query("UPDATE students SET password_hash = 'plaintext123' WHERE student_id = 4");
    try {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rohan.gupta@srm.edu.in', password: 'plaintext123', role: 'student' });
      expect(res.status).toBe(401);
    } finally {
      await db.query(
        'UPDATE students SET password_hash = (SELECT h FROM (SELECT password_hash AS h FROM students WHERE student_id = 1) t) WHERE student_id = 4'
      );
    }
  });
});

describe('seeded credentials', () => {
  test('every demo account stores a bcrypt hash, not a plaintext password', async () => {
    const [students] = await db.query('SELECT password_hash FROM students');
    const [faculty] = await db.query('SELECT password_hash FROM faculty');
    for (const { password_hash: h } of [...students, ...faculty]) {
      expect(h).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/);
    }
  });

  test('schema has no plaintext password column', async () => {
    const [cols] = await db.query(
      "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME = 'password'"
    );
    expect(cols).toEqual([]);
  });
});

describe('protected routes', () => {
  test('GET /api/students needs a token', async () => {
    expect((await request(app).get('/api/students')).status).toBe(401);
  });

  test('GET /api/students rejects an invalid token', async () => {
    const res = await request(app).get('/api/students').set('Authorization', 'Bearer not-a-jwt');
    expect(res.status).toBe(403);
  });

  test('GET /api/students is faculty-only', async () => {
    const { token } = await login(STUDENT);
    const res = await request(app).get('/api/students').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('faculty can list students, without credential columns', async () => {
    const { token } = await login(FACULTY);
    const res = await request(app).get('/api/students').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    for (const s of res.body) {
      expect(s).not.toHaveProperty('password_hash');
      expect(s).not.toHaveProperty('password');
    }
    const filtered = await request(app)
      .get('/api/students')
      .query({ search: 'Keerthi' })
      .set('Authorization', `Bearer ${token}`);
    expect(filtered.body.map((s) => s.roll_no)).toEqual(['CS101']);
  });
});
