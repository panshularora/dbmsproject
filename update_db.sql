DELIMITER //

DROP PROCEDURE IF EXISTS GetStudentResults //
CREATE PROCEDURE GetStudentResults(IN p_student_id INT)
BEGIN
    SELECT s.name, s.gpa, sub.subject_name, sub.credits, e.marks, e.grade
    FROM students s
    JOIN exam_registrations er ON s.student_id = er.student_id
    JOIN evaluations e ON er.registration_id = e.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE s.student_id = p_student_id;
END //

DELIMITER ;

CREATE INDEX idx_student_roll ON students(roll_no);
CREATE INDEX idx_reg_student ON exam_registrations(student_id);
