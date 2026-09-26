-- Demo data for exam_db. Run last (after schema.sql, procedures, views, triggers), so that
-- the grade/GPA, notification and audit triggers fire on the seeded evaluations.
--
-- Demo logins (passwords are stored as bcrypt hashes, cost 10):
--   student  keerthi.nair@srm.edu.in      / student123   (all seeded students use student123)
--   faculty  dr..rajesh.kumar@srm.edu.in  / faculty123   (all seeded faculty use faculty123)

SET NAMES utf8mb4;

INSERT INTO exams (exam_id, exam_name, session) VALUES
  (1, 'End Semester Examination', 'May 2026');

INSERT INTO faculty (faculty_id, name, email, password_hash, department) VALUES
  (1, 'Dr. Rajesh Kumar', 'dr..rajesh.kumar@srm.edu.in', '$2b$10$QATxsf1qbNmeSUf3GFgdwuuS0L2in/UP12oSHLtncqU7gp4YEdIJS', 'CSE'),
  (2, 'Dr. Priya Sharma', 'priya.sharma@srm.edu.in',     '$2b$10$QATxsf1qbNmeSUf3GFgdwuuS0L2in/UP12oSHLtncqU7gp4YEdIJS', 'CSE');

INSERT INTO students (student_id, roll_no, name, email, password_hash, course, semester, phone_no) VALUES
  (1, 'CS101', 'Keerthi Nair', 'keerthi.nair@srm.edu.in', '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi', 'B.Tech CSE', 4, '9876500101'),
  (2, 'CS102', 'Arjun Mehta',  'arjun.mehta@srm.edu.in',  '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi', 'B.Tech CSE', 4, '9876500102'),
  (3, 'CS103', 'Ananya Iyer',  'ananya.iyer@srm.edu.in',  '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi', 'B.Tech CSE', 4, '9876500103'),
  (4, 'CS104', 'Rohan Gupta',  'rohan.gupta@srm.edu.in',  '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi', 'B.Tech CSE', 4, '9876500104'),
  (5, 'CS105', 'Sneha Reddy',  'sneha.reddy@srm.edu.in',  '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi', 'B.Tech CSE', 4, '9876500105');

INSERT INTO subjects (subject_id, subject_code, subject_name, credits, semester) VALUES
  (1, '21CSC205P', 'Database Management Systems',  4, 4),
  (2, '21CSC204J', 'Design and Analysis of Algorithms', 4, 4),
  (3, '21CSC206T', 'Artificial Intelligence',      3, 4),
  (4, '21CSC202J', 'Operating Systems',            4, 4),
  (5, '21MAB204T', 'Probability and Queueing Theory', 4, 4),
  (6, '21PDH209T', 'Social Engineering',           2, 4);

INSERT INTO exam_timetable (exam_id, subject_id, exam_date, exam_time) VALUES
  (1, 1, '2026-05-04', '09:30:00'),
  (1, 2, '2026-05-06', '09:30:00'),
  (1, 3, '2026-05-08', '14:00:00'),
  (1, 4, '2026-05-11', '09:30:00'),
  (1, 5, '2026-05-13', '09:30:00'),
  (1, 6, '2026-05-15', '14:00:00');

INSERT INTO exam_halls (hall_id, hall_name, capacity) VALUES
  (1, 'TP-101', 60), (2, 'TP-102', 60), (3, 'TP-201', 60),
  (4, 'UB-301', 60), (5, 'UB-302', 60), (6, 'Main Auditorium', 60);

INSERT INTO exam_registrations (registration_id, student_id, subject_id, exam_id) VALUES
  (1, 1, 1, 1), (2, 1, 2, 1),
  (3, 2, 1, 1), (4, 2, 2, 1), (5, 2, 3, 1),
  (6, 3, 1, 1), (7, 3, 3, 1),
  (8, 4, 2, 1), (9, 4, 4, 1);

INSERT INTO hall_allocations (registration_id, hall_id, seat_no) VALUES
  (1, 1, 12), (2, 2, 7),
  (3, 1, 13), (4, 2, 8), (5, 3, 21),
  (6, 1, 14), (7, 3, 22),
  (8, 2, 9), (9, 4, 5);

-- marks NULL = pending evaluation; grades and GPAs are filled in by triggers.
INSERT INTO evaluations (registration_id, faculty_id, marks) VALUES
  (1, 1, 88.00), (2, 1, NULL),
  (3, 1, 92.50), (4, 1, 76.00), (5, 2, 81.00),
  (6, 1, 67.00), (7, 2, 58.50),
  (8, 1, 45.00), (9, 2, NULL);

INSERT INTO malpractice (registration_id, description, reported_by, action_taken, status) VALUES
  (8, 'Unauthorised notes found near the desk during the exam', 'Dr. Rajesh Kumar', 'Under Investigation', 'Pending');
