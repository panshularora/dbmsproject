const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'exam_management.db'));

const initDb = (drop = false) => {
  if (drop) {
    db.exec(`
      DROP TABLE IF EXISTS Students;
      DROP TABLE IF EXISTS Subjects;
      DROP TABLE IF EXISTS Examinations;
      DROP TABLE IF EXISTS Exam_Registrations;
      DROP TABLE IF EXISTS Exam_Timetable;
      DROP TABLE IF EXISTS Exam_Halls;
      DROP TABLE IF EXISTS Hall_Allocations;
      DROP TABLE IF EXISTS Faculty;
      DROP TABLE IF EXISTS Evaluations;
      DROP TABLE IF EXISTS Malpractice;
      DROP TABLE IF EXISTS Notices;
    `);
  }
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS Students (
      student_id INTEGER PRIMARY KEY,
      roll_no TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      phone_no TEXT,
      course TEXT,
      semester INTEGER,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'student'
    );

    CREATE TABLE IF NOT EXISTS Subjects (
      subject_id INTEGER PRIMARY KEY,
      subject_code TEXT UNIQUE,
      subject_name TEXT,
      credits INTEGER,
      semester INTEGER,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS Examinations (
      exam_id INTEGER PRIMARY KEY,
      exam_type TEXT,
      academic_year TEXT
    );

    CREATE TABLE IF NOT EXISTS Exam_Registrations (
      registration_id INTEGER PRIMARY KEY,
      student_id INTEGER,
      subject_id INTEGER,
      exam_id INTEGER,
      student_name TEXT,
      subject_name TEXT,
      appearance_status TEXT
    );

    CREATE TABLE IF NOT EXISTS Exam_Timetable (
      timetable_id INTEGER PRIMARY KEY,
      exam_id INTEGER,
      subject_id INTEGER,
      subject_name TEXT,
      exam_date TEXT,
      exam_time TEXT,
      venue TEXT,
      status TEXT DEFAULT 'Upcoming'
    );

    CREATE TABLE IF NOT EXISTS Exam_Halls (
      hall_id INTEGER PRIMARY KEY,
      hall_name TEXT,
      capacity INTEGER
    );

    CREATE TABLE IF NOT EXISTS Hall_Allocations (
      allocation_id INTEGER PRIMARY KEY,
      registration_id INTEGER,
      hall_id INTEGER,
      hall_name TEXT,
      seat_no TEXT,
      student_name TEXT
    );

    CREATE TABLE IF NOT EXISTS Faculty (
      faculty_id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      department TEXT,
      qualification TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'faculty'
    );

    CREATE TABLE IF NOT EXISTS Evaluations (
      evaluation_id INTEGER PRIMARY KEY,
      registration_id INTEGER,
      faculty_id INTEGER,
      faculty_name TEXT,
      student_name TEXT,
      subject_name TEXT,
      marks INTEGER,
      grade TEXT,
      status TEXT DEFAULT 'Graded'
    );

    CREATE TABLE IF NOT EXISTS Malpractice (
      malpractice_id INTEGER PRIMARY KEY,
      registration_id INTEGER,
      student_id INTEGER,
      student_name TEXT,
      roll_no TEXT,
      subject_name TEXT,
      description TEXT,
      reported_by TEXT,
      action_taken TEXT,
      status TEXT
    );

    CREATE TABLE IF NOT EXISTS Notices (
      notice_id INTEGER PRIMARY KEY,
      title TEXT,
      content TEXT,
      date TEXT
    );
  `);
};

module.exports = { db, initDb };
