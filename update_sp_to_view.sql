DELIMITER //

DROP PROCEDURE IF EXISTS GetStudentResults //
CREATE PROCEDURE GetStudentResults(IN p_student_id INT)
BEGIN
    SELECT student_name AS name, gpa, subject_name, credits, marks, grade
    FROM vw_student_results
    WHERE student_id = p_student_id;
END //

DELIMITER ;
