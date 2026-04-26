-- Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'result', 'malpractice', 'timetable', 'info'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Add FULLTEXT Indexes for Global Search
ALTER TABLE students ADD FULLTEXT INDEX idx_search_students (name, roll_no);
ALTER TABLE subjects ADD FULLTEXT INDEX idx_search_subjects (subject_name);

-- Triggers for Automated Notifications
DELIMITER //

-- Notification on Result Publication
DROP TRIGGER IF EXISTS trg_notify_result //
CREATE TRIGGER trg_notify_result
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_subject_name VARCHAR(255);

    SELECT student_id, subject_name INTO v_student_id, v_subject_name
    FROM vw_student_results
    WHERE student_id = (SELECT student_id FROM exam_registrations WHERE registration_id = NEW.registration_id)
    LIMIT 1;

    INSERT INTO notifications (student_id, title, message, type)
    VALUES (v_student_id, 'Result Published', CONCAT('Your result for ', v_subject_name, ' is now available.'), 'result');
END //

-- Notification on Malpractice Incident
DROP TRIGGER IF EXISTS trg_notify_malpractice //
CREATE TRIGGER trg_notify_malpractice
AFTER INSERT ON malpractice
FOR EACH ROW
BEGIN
    DECLARE v_student_id INT;
    DECLARE v_subject_name VARCHAR(255);

    SELECT er.student_id, sub.subject_name INTO v_student_id, v_subject_name
    FROM exam_registrations er
    JOIN subjects sub ON er.subject_id = sub.subject_id
    WHERE er.registration_id = NEW.registration_id;

    INSERT INTO notifications (student_id, title, message, type)
    VALUES (v_student_id, 'Urgent: Malpractice Reported', CONCAT('A malpractice incident has been reported for your ', v_subject_name, ' exam.'), 'malpractice');
END //

DELIMITER ;
