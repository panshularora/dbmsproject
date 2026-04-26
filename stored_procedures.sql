DELIMITER //

DROP PROCEDURE IF EXISTS GetStudentResults //
CREATE PROCEDURE GetStudentResults(IN p_student_id INT)
BEGIN
    SELECT s.name, sub.subject_name, e.marks, e.grade
    FROM students s
    JOIN exam_registrations er ON s.student_id = er.student_id
    JOIN evaluations e ON er.registration_id = e.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE s.student_id = p_student_id;
END //

DROP PROCEDURE IF EXISTS GetStudentTimetable //
CREATE PROCEDURE GetStudentTimetable(IN p_student_id INT)
BEGIN
    SELECT sub.subject_name, sub.subject_id, t.exam_date, t.exam_time
    FROM exam_timetable t
    JOIN subjects sub ON t.subject_id = sub.subject_id
    JOIN exam_registrations er ON sub.subject_id = er.subject_id
    WHERE er.student_id = p_student_id;
END //

DROP PROCEDURE IF EXISTS GetStudentHallAllocation //
CREATE PROCEDURE GetStudentHallAllocation(IN p_student_id INT)
BEGIN
    SELECT h.hall_name, ha.seat_no, sub.subject_name, sub.subject_id
    FROM hall_allocations ha
    JOIN exam_halls h ON ha.hall_id = h.hall_id
    JOIN exam_registrations er ON ha.registration_id = er.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE er.student_id = p_student_id;
END //

DROP PROCEDURE IF EXISTS GetDashboardTimeline //
CREATE PROCEDURE GetDashboardTimeline(IN p_student_id INT)
BEGIN
    SELECT 
        sub.subject_name as subject, 
        t.exam_date as date, t.exam_time as time,
        h.hall_name, ha.seat_no
    FROM exam_timetable t
    JOIN subjects sub ON t.subject_id = sub.subject_id
    JOIN exam_registrations er ON er.subject_id = t.subject_id
    LEFT JOIN hall_allocations ha ON ha.registration_id = er.registration_id
    LEFT JOIN exam_halls h ON ha.hall_id = h.hall_id
    WHERE er.student_id = p_student_id
    ORDER BY t.exam_date ASC;
END //

DROP PROCEDURE IF EXISTS GetLatestResult //
CREATE PROCEDURE GetLatestResult(IN p_student_id INT)
BEGIN
    SELECT sub.subject_name, e.marks, e.grade 
    FROM evaluations e 
    JOIN exam_registrations er ON e.registration_id = er.registration_id
    JOIN subjects sub ON er.subject_id = sub.subject_id 
    WHERE er.student_id = p_student_id 
    ORDER BY e.evaluation_id DESC LIMIT 1;
END //

DROP PROCEDURE IF EXISTS RegisterForExam //
CREATE PROCEDURE RegisterForExam(IN p_student_id INT, IN p_subject_id INT)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_registration_id INT;
    DECLARE v_random_hall INT;
    DECLARE v_random_seat INT;

    -- Check if already registered
    SELECT COUNT(*) INTO v_exists 
    FROM exam_registrations 
    WHERE student_id = p_student_id AND subject_id = p_subject_id;

    IF v_exists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Already registered for this subject!';
    ELSE
        -- 1. Register for Exam
        INSERT INTO exam_registrations (student_id, subject_id, exam_id) 
        VALUES (p_student_id, p_subject_id, 1);
        
        SET v_registration_id = LAST_INSERT_ID();

        -- 2. Auto-Allocate Hall for Demo
        SET v_random_hall = FLOOR(1 + RAND() * 6);
        SET v_random_seat = FLOOR(1 + RAND() * 60);

        INSERT INTO hall_allocations (registration_id, hall_id, seat_no) 
        VALUES (v_registration_id, v_random_hall, v_random_seat);

        -- Return the new registration ID
        SELECT v_registration_id AS registrationId;
    END IF;
END //

DELIMITER ;
