const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const bcrypt = require('bcryptjs');
const { db, initDb } = require('./db');

const DATA_DIR = path.join(__dirname, 'data');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

const importCSV = (fileName, tableName, mapping) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(DATA_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      console.warn(`File ${fileName} not found, skipping table ${tableName}`);
      return resolve();
    }

    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          console.log(`Importing ${results.length} rows into ${tableName}...`);
          const columns = Object.keys(mapping);
          const placeholders = columns.map(() => '?').join(', ');
          const stmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

          const transaction = db.transaction((rows) => {
            for (const row of rows) {
              const values = columns.map(col => {
                const csvKey = mapping[col];
                if (typeof csvKey === 'function') return csvKey(row);
                return row[csvKey] || null;
              });
              stmt.run(...values);
            }
          });

          transaction(results);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
};

async function seed() {
  console.log('Starting data seeding from CSVs...');
  db.exec('PRAGMA foreign_keys = OFF;');
  initDb(true);

  const defaultPassword = await hashPassword('password123');

  // 1. Students
  await importCSV('Students.csv', 'Students', {
    student_id: 'STUDENT_ID',
    roll_no: 'ROLL_NO',
    first_name: 'FIRST_NAME',
    last_name: 'LAST_NAME',
    phone_no: 'PHONE_NO',
    course: 'COURSE',
    semester: 'SEMESTER',
    email: (row) => `${row.ROLL_NO.toLowerCase()}@srm.edu`,
    password: () => defaultPassword,
    role: () => 'student'
  });

  // 2. Subjects
  await importCSV('Subjects.csv', 'Subjects', {
    subject_id: 'SUBJECT_ID',
    subject_code: 'SUBJECT_CODE',
    subject_name: 'SUBJECT_NAME',
    credits: 'CREDITS',
    semester: 'SEMESTER',
    type: (row) => ['Core', 'Elective', 'Compulsory'][Math.floor(Math.random() * 3)]
  });

  // 3. Faculty
  await importCSV('Faculty.csv', 'Faculty', {
    faculty_id: 'FACULTY_ID',
    first_name: 'FIRST_NAME',
    last_name: 'LAST_NAME',
    department: 'DEPARTMENT',
    qualification: 'QUALIFICATION',
    email: (row) => `faculty${row.FACULTY_ID}@srm.edu`,
    password: () => defaultPassword,
    role: () => 'faculty'
  });

  // 3.5 Update Emails and Passwords from users.csv
  await new Promise((resolve) => {
    const users = [];
    fs.createReadStream(path.join(DATA_DIR, 'users.csv'))
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => users.push(row))
      .on('end', async () => {
        const studentStmt = db.prepare('UPDATE Students SET email = ?, password = ? WHERE student_id = ?');
        const facultyStmt = db.prepare('UPDATE Faculty SET email = ?, password = ? WHERE faculty_id = ?');
        
        const passwordCache = {};
        const transaction = db.transaction((rows) => {
          for (const row of rows) {
            const rawPwd = row.PASSWORD_HASH || 'password123';
            if (!passwordCache[rawPwd]) {
              passwordCache[rawPwd] = bcrypt.hashSync(rawPwd, 10);
            }
            const pwd = passwordCache[rawPwd];
            
            if (row.ROLE === 'student') {
              studentStmt.run(row.EMAIL, pwd, row.REF_ID);
            } else {
              facultyStmt.run(row.EMAIL, pwd, row.REF_ID);
            }
          }
        });
        transaction(users);
        resolve();
      });
  });

  // 4. Examinations
  await importCSV('Examinations.csv', 'Examinations', {
    exam_id: 'EXAM_ID',
    exam_type: 'EXAM_TYPE',
    academic_year: 'ACADEMIC_YEAR'
  });

  // 5. Exam_Registrations
  await importCSV('Exam_Registrations.csv', 'Exam_Registrations', {
    registration_id: 'REGISTRATION_ID',
    student_id: 'STUDENT_ID',
    subject_id: 'SUBJECT_ID',
    exam_id: 'EXAM_ID',
    student_name: 'STUDENT_NAME',
    subject_name: 'SUBJECT_NAME',
    appearance_status: 'APPEARANCE_STATUS'
  });

  // 6. Exam_Timetable
  await importCSV('Exam_Timetable.csv', 'Exam_Timetable', {
    timetable_id: 'TIMETABLE_ID',
    exam_id: 'EXAM_ID',
    subject_id: 'SUBJECT_ID',
    subject_name: 'SUBJECT_NAME',
    exam_date: 'EXAM_DATE',
    exam_time: 'EXAM_TIME',
    venue: () => 'Main Hall',
    status: () => 'Upcoming'
  });

  // 7. Exam_Halls
  await importCSV('Exam_Halls.csv', 'Exam_Halls', {
    hall_id: 'HALL_ID',
    hall_name: 'HALL_NAME',
    capacity: 'CAPACITY'
  });

  // 8. Hall_Allocations (A1-J10 format)
  await importCSV('Hall_Allocations.csv', 'Hall_Allocations', {
    allocation_id: 'ALLOCATION_ID',
    registration_id: 'REGISTRATION_ID',
    hall_id: 'HALL_ID',
    hall_name: 'HALL_NAME',
    seat_no: (row) => {
      const seatNum = parseInt(row.SEAT_NO);
      const rowLetter = String.fromCharCode(65 + Math.floor((seatNum - 1) / 10));
      const num = ((seatNum - 1) % 10) + 1;
      return `${rowLetter}${num}`;
    },
    student_name: 'STUDENT_NAME'
  });

  // 9. Evaluations
  await importCSV('evaluations.csv', 'Evaluations', {
    evaluation_id: 'EVALUATION_ID',
    registration_id: 'REGISTRATION_ID',
    faculty_id: 'FACULTY_ID',
    faculty_name: 'FACULTY_NAME',
    student_name: 'STUDENT_NAME',
    subject_name: 'SUBJECT_NAME',
    marks: 'MARKS',
    grade: 'GRADE',
    status: () => 'Graded'
  });

  // 10. Malpractice
  await importCSV('malpractice.csv', 'Malpractice', {
    malpractice_id: 'MALPRACTICE_ID',
    registration_id: 'REGISTRATION_ID',
    student_id: 'STUDENT_ID',
    student_name: 'STUDENT_NAME',
    roll_no: 'ROLL_NO',
    subject_name: 'SUBJECT_NAME',
    description: 'DESCRIPTION',
    reported_by: 'REPORTED_BY',
    action_taken: 'ACTION_TAKEN',
    status: 'STATUS'
  });

  // 11. Notices (Mock)
  const noticeStmt = db.prepare(`INSERT INTO Notices (title, content, date) VALUES (?, ?, ?)`);
  noticeStmt.run('Final Exam Guidelines', 'Please carry your ID card and hall ticket.', '2025-05-01');
  noticeStmt.run('Results Declared', 'Cycle Test 1 results are now available.', '2025-04-20');

  db.exec('PRAGMA foreign_keys = ON;');
  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
