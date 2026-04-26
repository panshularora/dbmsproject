const XLSX = require('xlsx');
const { db, initDb } = require('./db');
const path = require('path');

const EXCEL_PATH = 'C:/Users/Panshul/Desktop/exam_management_1200students.xlsx';

async function seed() {
  console.log('Starting database seeding...');
  initDb();

  const workbook = XLSX.readFile(EXCEL_PATH);

  const importData = (sheetName, tableName, mapping) => {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet ${sheetName} not found.`);
      return;
    }
    const data = XLSX.utils.sheet_to_json(sheet);
    console.log(`Importing ${data.length} rows into ${tableName}...`);

    const columns = Object.keys(mapping);
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`);

    const transaction = db.transaction((rows) => {
      for (const row of rows) {
        const values = columns.map(col => row[mapping[col]] ?? null);
        insertStmt.run(...values);
      }
    });

    transaction(data);
  };

  // Mapping: Database Column -> Excel Header
  importData('Students', 'Students', {
    student_id: 'STUDENT_ID',
    roll_no: 'ROLL_NO',
    first_name: 'FIRST_NAME',
    last_name: 'LAST_NAME',
    phone_no: 'PHONE_NO',
    course: 'COURSE',
    semester: 'SEMESTER'
  });

  importData('Subjects', 'Subjects', {
    subject_id: 'SUBJECT_ID',
    subject_code: 'SUBJECT_CODE',
    subject_name: 'SUBJECT_NAME',
    credits: 'CREDITS',
    semester: 'SEMESTER'
  });

  importData('Examinations', 'Examinations', {
    exam_id: 'EXAM_ID',
    exam_type: 'EXAM_TYPE',
    academic_year: 'ACADEMIC_YEAR'
  });

  importData('Exam_Registrations', 'Exam_Registrations', {
    registration_id: 'REGISTRATION_ID',
    student_id: 'STUDENT_ID',
    subject_id: 'SUBJECT_ID',
    exam_id: 'EXAM_ID',
    student_name: 'STUDENT_NAME',
    subject_name: 'SUBJECT_NAME',
    appearance_status: 'APPEARANCE_STATUS'
  });

  importData('Exam_Timetable', 'Exam_Timetable', {
    timetable_id: 'TIMETABLE_ID',
    exam_id: 'EXAM_ID',
    subject_id: 'SUBJECT_ID',
    subject_name: 'SUBJECT_NAME',
    exam_date: 'EXAM_TIME', // Shifted
    exam_time: '__EMPTY'   // Shifted
  });

  importData('Exam_Halls', 'Exam_Halls', {
    hall_id: 'HALL_ID',
    hall_name: 'HALL_NAME',
    capacity: 'CAPACITY'
  });

  importData('Hall_Allocations', 'Hall_Allocations', {
    allocation_id: 'ALLOCATION_ID',
    registration_id: 'REGISTRATION_ID',
    hall_id: 'HALL_ID',
    hall_name: 'HALL_NAME',
    seat_no: 'SEAT_NO',
    student_name: 'STUDENT_NAME'
  });

  importData('Faculty', 'Faculty', {
    faculty_id: 'FACULTY_ID',
    first_name: 'FIRST_NAME',
    last_name: 'LAST_NAME',
    department: 'DEPARTMENT',
    qualification: 'QUALIFICATION'
  });

  importData('Evaluations', 'Evaluations', {
    evaluation_id: 'EVALUATION_ID',
    registration_id: 'REGISTRATION_ID',
    faculty_id: 'FACULTY_ID',
    faculty_name: 'FACULTY_NAME',
    student_name: 'STUDENT_NAME',
    subject_name: 'SUBJECT_NAME',
    marks: 'GRADE',   // Shifted
    grade: '__EMPTY'  // Shifted
  });

  importData('Malpractice', 'Malpractice', {
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

  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
