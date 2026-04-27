-- Fix missing email, password, and gpa columns
ALTER TABLE students 
ADD COLUMN email VARCHAR(255), 
ADD COLUMN password VARCHAR(255),
ADD COLUMN gpa DECIMAL(4,2) DEFAULT 0.00;

UPDATE students SET 
email = CONCAT(LOWER(REPLACE(name, ' ', '.')), '@srm.edu.in'),
password = 'student123';

ALTER TABLE faculty 
ADD COLUMN email VARCHAR(255), 
ADD COLUMN password VARCHAR(255);

UPDATE faculty SET 
email = CONCAT(LOWER(REPLACE(name, ' ', '.')), '@srm.edu.in'),
password = 'faculty123';

-- Manually fix specific emails to match the demo logic
UPDATE faculty SET email = 'dr..rajesh.kumar@srm.edu.in' WHERE email LIKE '%rajesh%';
UPDATE students SET email = 'keerthi.nair@srm.edu.in' WHERE name = 'Keerthi Nair';

-- Recalculate GPA
UPDATE students s SET gpa = COALESCE((SELECT SUM(sub.credits * CASE e.grade WHEN 'O' THEN 10 WHEN 'A+' THEN 9 WHEN 'A' THEN 8 WHEN 'B+' THEN 7 WHEN 'B' THEN 6 WHEN 'C' THEN 5 ELSE 0 END) / SUM(sub.credits) FROM evaluations e JOIN exam_registrations er ON e.registration_id = er.registration_id JOIN subjects sub ON er.subject_id = sub.subject_id WHERE er.student_id = s.student_id AND e.grade IS NOT NULL), 0.00);
