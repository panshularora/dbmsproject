const { db } = require('./db');
const tables = [
  'Students', 'Subjects', 'Faculty', 'Examinations', 
  'Exam_Registrations', 'Exam_Timetable', 'Exam_Halls', 
  'Hall_Allocations', 'Evaluations', 'Malpractice', 'Notices'
];

console.log('--- Database Analysis ---');
tables.forEach(t => {
  try {
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get();
    console.log(`${t.padEnd(20)}: ${count.count} rows`);
  } catch (e) {
    console.log(`${t.padEnd(20)}: Error - ${e.message}`);
  }
});

console.log('\n--- Sample Data Integrity ---');
try {
  const student = db.prepare('SELECT * FROM Students LIMIT 1').get();
  console.log('Sample Student:', student ? `${student.first_name} ${student.last_name} (${student.email})` : 'None');
  
  const registration = db.prepare('SELECT COUNT(*) as count FROM Exam_Registrations WHERE student_id IS NOT NULL').get();
  console.log('Registrations linked to students:', registration.count);

  const evaluation = db.prepare('SELECT COUNT(*) as count FROM Evaluations WHERE registration_id IS NOT NULL').get();
  console.log('Evaluations linked to registrations:', evaluation.count);
} catch (e) {
  console.log('Integrity Check Error:', e.message);
}
