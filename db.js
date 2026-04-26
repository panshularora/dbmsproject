const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'exam_management.db'));

// Initialize tables
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Students (
      student_id INTEGER PRIMARY KEY,
      roll_no TEXT UNIQUE,
      first_name TEXT,
      last_name TEXT,
      phone_no TEXT,
      course TEXT,
      semester INTEGER
    );

    CREATE TABLE IF NOT EXISTS Subjects (
      subject_id INTEGER PRIMARY KEY,
      subject_code TEXT UNIQUE,
      subject_name TEXT,
      credits INTEGER,
      semester INTEGER
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
      appearance_status TEXT,
      FOREIGN KEY(student_id) REFERENCES Students(student_id),
      FOREIGN KEY(subject_id) REFERENCES Subjects(subject_id),
      FOREIGN KEY(exam_id) REFERENCES Examinations(exam_id)
    );

    CREATE TABLE IF NOT EXISTS Exam_Timetable (
      timetable_id INTEGER PRIMARY KEY,
      exam_id INTEGER,
      subject_id INTEGER,
      subject_name TEXT,
      exam_date TEXT,
      exam_time TEXT,
      FOREIGN KEY(exam_id) REFERENCES Examinations(exam_id),
      FOREIGN KEY(subject_id) REFERENCES Subjects(subject_id)
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
      seat_no INTEGER,
      student_name TEXT,
      FOREIGN KEY(registration_id) REFERENCES Exam_Registrations(registration_id),
      FOREIGN KEY(hall_id) REFERENCES Exam_Halls(hall_id)
    );

    CREATE TABLE IF NOT EXISTS Faculty (
      faculty_id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      department TEXT,
      qualification TEXT
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
      FOREIGN KEY(registration_id) REFERENCES Exam_Registrations(registration_id),
      FOREIGN KEY(faculty_id) REFERENCES Faculty(faculty_id)
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
      status TEXT,
      FOREIGN KEY(registration_id) REFERENCES Exam_Registrations(registration_id),
      FOREIGN KEY(student_id) REFERENCES Students(student_id)
    );
  `);
};

module.exports = { db, initDb };
