DELIMITER //

DROP TRIGGER IF EXISTS trg_evaluations_before_insert //
CREATE TRIGGER trg_evaluations_before_insert
BEFORE INSERT ON evaluations
FOR EACH ROW
BEGIN
    IF NEW.marks >= 90 THEN SET NEW.grade = 'O';
    ELSEIF NEW.marks >= 80 THEN SET NEW.grade = 'A+';
    ELSEIF NEW.marks >= 70 THEN SET NEW.grade = 'A';
    ELSEIF NEW.marks >= 60 THEN SET NEW.grade = 'B+';
    ELSEIF NEW.marks >= 50 THEN SET NEW.grade = 'B';
    ELSEIF NEW.marks >= 40 THEN SET NEW.grade = 'C';
    ELSE SET NEW.grade = 'F';
    END IF;
END //

DROP TRIGGER IF EXISTS trg_evaluations_before_update //
CREATE TRIGGER trg_evaluations_before_update
BEFORE UPDATE ON evaluations
FOR EACH ROW
BEGIN
    IF NEW.marks >= 90 THEN SET NEW.grade = 'O';
    ELSEIF NEW.marks >= 80 THEN SET NEW.grade = 'A+';
    ELSEIF NEW.marks >= 70 THEN SET NEW.grade = 'A';
    ELSEIF NEW.marks >= 60 THEN SET NEW.grade = 'B+';
    ELSEIF NEW.marks >= 50 THEN SET NEW.grade = 'B';
    ELSEIF NEW.marks >= 40 THEN SET NEW.grade = 'C';
    ELSE SET NEW.grade = 'F';
    END IF;
END //

DROP TRIGGER IF EXISTS trg_evaluations_after_insert //
CREATE TRIGGER trg_evaluations_after_insert
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_total_points DECIMAL(10,2);
    DECLARE v_total_credits INT;

    SELECT student_id INTO v_student_id
    FROM exam_registrations
    WHERE registration_id = NEW.registration_id;

    SELECT 
        SUM(
            sub.credits * 
            CASE e.grade
                WHEN 'O' THEN 10
                WHEN 'A+' THEN 9
                WHEN 'A' THEN 8
                WHEN 'B+' THEN 7
                WHEN 'B' THEN 6
                WHEN 'C' THEN 5
                ELSE 0
            END
        ),
        SUM(sub.credits)
    INTO v_total_points, v_total_credits
    FROM evaluations e
    JOIN exam_registrations er ON e.registration_id = er.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE er.student_id = v_student_id AND e.grade IS NOT NULL;

    IF v_total_credits > 0 THEN
        UPDATE students SET gpa = v_total_points / v_total_credits WHERE student_id = v_student_id;
    END IF;
END //

DROP TRIGGER IF EXISTS trg_evaluations_after_update //
CREATE TRIGGER trg_evaluations_after_update
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_total_points DECIMAL(10,2);
    DECLARE v_total_credits INT;

    SELECT student_id INTO v_student_id
    FROM exam_registrations
    WHERE registration_id = NEW.registration_id;

    SELECT 
        SUM(
            sub.credits * 
            CASE e.grade
                WHEN 'O' THEN 10
                WHEN 'A+' THEN 9
                WHEN 'A' THEN 8
                WHEN 'B+' THEN 7
                WHEN 'B' THEN 6
                WHEN 'C' THEN 5
                ELSE 0
            END
        ),
        SUM(sub.credits)
    INTO v_total_points, v_total_credits
    FROM evaluations e
    JOIN exam_registrations er ON e.registration_id = er.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE er.student_id = v_student_id AND e.grade IS NOT NULL;

    IF v_total_credits > 0 THEN
        UPDATE students SET gpa = v_total_points / v_total_credits WHERE student_id = v_student_id;
    END IF;
END //

DELIMITER ;
