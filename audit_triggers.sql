-- Audit triggers: populate audit_log on DML to core tables.
-- Prerequisites: run audit_log.sql first.
-- Apply: mysql -u ... -p exam_db < audit_triggers.sql

DELIMITER //

DROP TRIGGER IF EXISTS trg_audit_exam_registrations_after_insert //
CREATE TRIGGER trg_audit_exam_registrations_after_insert
AFTER INSERT ON exam_registrations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'exam_registrations', 'INSERT', NEW.registration_id, NULL,
    JSON_OBJECT(
      'registration_id', NEW.registration_id,
      'student_id', NEW.student_id,
      'subject_id', NEW.subject_id,
      'exam_id', NEW.exam_id
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_exam_registrations_after_update //
CREATE TRIGGER trg_audit_exam_registrations_after_update
AFTER UPDATE ON exam_registrations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'exam_registrations', 'UPDATE', NEW.registration_id,
    JSON_OBJECT(
      'registration_id', OLD.registration_id,
      'student_id', OLD.student_id,
      'subject_id', OLD.subject_id,
      'exam_id', OLD.exam_id
    ),
    JSON_OBJECT(
      'registration_id', NEW.registration_id,
      'student_id', NEW.student_id,
      'subject_id', NEW.subject_id,
      'exam_id', NEW.exam_id
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_exam_registrations_before_delete //
CREATE TRIGGER trg_audit_exam_registrations_before_delete
BEFORE DELETE ON exam_registrations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'exam_registrations', 'DELETE', OLD.registration_id,
    JSON_OBJECT(
      'registration_id', OLD.registration_id,
      'student_id', OLD.student_id,
      'subject_id', OLD.subject_id,
      'exam_id', OLD.exam_id
    ),
    NULL
  );
END //

DROP TRIGGER IF EXISTS trg_audit_evaluations_after_insert //
CREATE TRIGGER trg_audit_evaluations_after_insert
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'evaluations', 'INSERT', NEW.evaluation_id, NULL,
    JSON_OBJECT(
      'evaluation_id', NEW.evaluation_id,
      'registration_id', NEW.registration_id,
      'faculty_id', NEW.faculty_id,
      'marks', NEW.marks,
      'grade', NEW.grade
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_evaluations_after_update //
CREATE TRIGGER trg_audit_evaluations_after_update
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'evaluations', 'UPDATE', NEW.evaluation_id,
    JSON_OBJECT(
      'evaluation_id', OLD.evaluation_id,
      'registration_id', OLD.registration_id,
      'faculty_id', OLD.faculty_id,
      'marks', OLD.marks,
      'grade', OLD.grade
    ),
    JSON_OBJECT(
      'evaluation_id', NEW.evaluation_id,
      'registration_id', NEW.registration_id,
      'faculty_id', NEW.faculty_id,
      'marks', NEW.marks,
      'grade', NEW.grade
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_evaluations_before_delete //
CREATE TRIGGER trg_audit_evaluations_before_delete
BEFORE DELETE ON evaluations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'evaluations', 'DELETE', OLD.evaluation_id,
    JSON_OBJECT(
      'evaluation_id', OLD.evaluation_id,
      'registration_id', OLD.registration_id,
      'faculty_id', OLD.faculty_id,
      'marks', OLD.marks,
      'grade', OLD.grade
    ),
    NULL
  );
END //

DROP TRIGGER IF EXISTS trg_audit_hall_allocations_after_insert //
CREATE TRIGGER trg_audit_hall_allocations_after_insert
AFTER INSERT ON hall_allocations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'hall_allocations', 'INSERT', NEW.allocation_id, NULL,
    JSON_OBJECT(
      'allocation_id', NEW.allocation_id,
      'registration_id', NEW.registration_id,
      'hall_id', NEW.hall_id,
      'seat_no', NEW.seat_no
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_hall_allocations_after_update //
CREATE TRIGGER trg_audit_hall_allocations_after_update
AFTER UPDATE ON hall_allocations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'hall_allocations', 'UPDATE', NEW.allocation_id,
    JSON_OBJECT(
      'allocation_id', OLD.allocation_id,
      'registration_id', OLD.registration_id,
      'hall_id', OLD.hall_id,
      'seat_no', OLD.seat_no
    ),
    JSON_OBJECT(
      'allocation_id', NEW.allocation_id,
      'registration_id', NEW.registration_id,
      'hall_id', NEW.hall_id,
      'seat_no', NEW.seat_no
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_hall_allocations_before_delete //
CREATE TRIGGER trg_audit_hall_allocations_before_delete
BEFORE DELETE ON hall_allocations
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'hall_allocations', 'DELETE', OLD.allocation_id,
    JSON_OBJECT(
      'allocation_id', OLD.allocation_id,
      'registration_id', OLD.registration_id,
      'hall_id', OLD.hall_id,
      'seat_no', OLD.seat_no
    ),
    NULL
  );
END //

DROP TRIGGER IF EXISTS trg_audit_malpractice_after_insert //
CREATE TRIGGER trg_audit_malpractice_after_insert
AFTER INSERT ON malpractice
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'malpractice', 'INSERT', NEW.malpractice_id, NULL,
    JSON_OBJECT(
      'malpractice_id', NEW.malpractice_id,
      'registration_id', NEW.registration_id,
      'description', NEW.description,
      'reported_by', NEW.reported_by,
      'action_taken', NEW.action_taken,
      'status', NEW.status
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_malpractice_after_update //
CREATE TRIGGER trg_audit_malpractice_after_update
AFTER UPDATE ON malpractice
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'malpractice', 'UPDATE', NEW.malpractice_id,
    JSON_OBJECT(
      'malpractice_id', OLD.malpractice_id,
      'registration_id', OLD.registration_id,
      'description', OLD.description,
      'reported_by', OLD.reported_by,
      'action_taken', OLD.action_taken,
      'status', OLD.status
    ),
    JSON_OBJECT(
      'malpractice_id', NEW.malpractice_id,
      'registration_id', NEW.registration_id,
      'description', NEW.description,
      'reported_by', NEW.reported_by,
      'action_taken', NEW.action_taken,
      'status', NEW.status
    )
  );
END //

DROP TRIGGER IF EXISTS trg_audit_malpractice_before_delete //
CREATE TRIGGER trg_audit_malpractice_before_delete
BEFORE DELETE ON malpractice
FOR EACH ROW
BEGIN
  INSERT INTO audit_log (table_name, action, pk_value, old_data, new_data)
  VALUES (
    'malpractice', 'DELETE', OLD.malpractice_id,
    JSON_OBJECT(
      'malpractice_id', OLD.malpractice_id,
      'registration_id', OLD.registration_id,
      'description', OLD.description,
      'reported_by', OLD.reported_by,
      'action_taken', OLD.action_taken,
      'status', OLD.status
    ),
    NULL
  );
END //

DELIMITER ;
