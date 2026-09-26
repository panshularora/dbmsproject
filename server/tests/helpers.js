// Shared helpers for the API tests. They run against a real MySQL database that was
// built with scripts/setup-db.sh (schema + procedures + triggers + seed).
// To avoid wiping a development database, DB_NAME must end in "_test".
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const dbName = process.env.DB_NAME || '';
if (!/_test$/.test(dbName)) {
  throw new Error(`Refusing to run API tests against DB_NAME="${dbName}". Use a database whose name ends in _test.`);
}

const request = require('supertest');
const app = require('../server');
const db = require('../db');

const STUDENT = { email: 'keerthi.nair@srm.edu.in', password: 'student123', role: 'student' };
const FACULTY = { email: 'dr..rajesh.kumar@srm.edu.in', password: 'faculty123', role: 'faculty' };
const FACULTY_2 = { email: 'priya.sharma@srm.edu.in', password: 'faculty123', role: 'faculty' };

async function login(creds) {
  const res = await request(app).post('/api/auth/login').send(creds);
  if (res.status !== 200) throw new Error(`login failed for ${creds.email}: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body;
}

module.exports = { request, app, db, STUDENT, FACULTY, FACULTY_2, login };
