-- Student Results View
CREATE OR REPLACE VIEW vw_student_results AS
SELECT 
    s.student_id,
    s.name AS student_name,
    s.roll_no,
    sub.subject_name,
    sub.credits,
    e.marks,
    e.grade,
    s.gpa
FROM students s
JOIN exam_registrations er ON s.student_id = er.student_id
JOIN evaluations e ON er.registration_id = e.registration_id
JOIN subjects sub ON er.subject_id = sub.subject_id;

-- Hall Occupancy View
CREATE OR REPLACE VIEW vw_hall_occupancy AS
SELECT 
    h.hall_id,
    h.hall_name,
    h.capacity,
    COUNT(ha.allocation_id) AS occupied_seats,
    (h.capacity - COUNT(ha.allocation_id)) AS available_seats
FROM exam_halls h
LEFT JOIN hall_allocations ha ON h.hall_id = ha.hall_id
GROUP BY h.hall_id, h.hall_name, h.capacity;

-- Subject Analytics View
CREATE OR REPLACE VIEW vw_subject_analytics AS
SELECT 
    sub.subject_id,
    sub.subject_name,
    COUNT(er.registration_id) AS total_registrations,
    AVG(e.marks) AS average_marks,
    MAX(e.marks) AS highest_marks,
    MIN(e.marks) AS lowest_marks
FROM subjects sub
LEFT JOIN exam_registrations er ON sub.subject_id = er.subject_id
LEFT JOIN evaluations e ON er.registration_id = e.registration_id
GROUP BY sub.subject_id, sub.subject_name;
