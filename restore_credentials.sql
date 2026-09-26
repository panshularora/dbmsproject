-- Upgrade an exam_db created before schema.sql existed to bcrypt-only demo logins.
-- Safe to run more than once. Fresh installs do not need it: seed.sql already stores hashes.
--
-- Adds the email / password_hash / gpa columns if missing, stores bcrypt hashes of the demo
-- passwords (students: student123, faculty: faculty123), and drops any plaintext
-- `password` column left by the previous version of this script.

DROP PROCEDURE IF EXISTS tmp_add_column_if_missing;
DROP PROCEDURE IF EXISTS tmp_drop_column_if_exists;

DELIMITER //
CREATE PROCEDURE tmp_add_column_if_missing(IN p_table VARCHAR(64), IN p_column VARCHAR(64), IN p_definition VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE tmp_drop_column_if_exists(IN p_table VARCHAR(64), IN p_column VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = p_table AND COLUMN_NAME = p_column
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` DROP COLUMN `', p_column, '`');
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

CALL tmp_add_column_if_missing('students', 'email', 'VARCHAR(255) NULL');
CALL tmp_add_column_if_missing('students', 'password_hash', 'VARCHAR(255) NULL');
CALL tmp_add_column_if_missing('students', 'gpa', 'DECIMAL(4,2) NOT NULL DEFAULT 0.00');
CALL tmp_add_column_if_missing('faculty', 'email', 'VARCHAR(255) NULL');
CALL tmp_add_column_if_missing('faculty', 'password_hash', 'VARCHAR(255) NULL');

UPDATE students SET email = CONCAT(LOWER(REPLACE(name, ' ', '.')), '@srm.edu.in') WHERE email IS NULL OR email = '';
UPDATE faculty  SET email = CONCAT(LOWER(REPLACE(name, ' ', '.')), '@srm.edu.in') WHERE email IS NULL OR email = '';

-- Demo emails used by the login page's quick-fill buttons
UPDATE faculty SET email = 'dr..rajesh.kumar@srm.edu.in' WHERE email LIKE '%rajesh%';
UPDATE students SET email = 'keerthi.nair@srm.edu.in' WHERE name = 'Keerthi Nair';

-- bcrypt (cost 10) hashes of the demo passwords; the API only accepts bcrypt.
UPDATE students SET password_hash = '$2b$10$.abXVRCyrjB.OCUpT2VOou44XsXge4pph1jw9rNvqJYhExKDrENqi';  -- student123
UPDATE faculty  SET password_hash = '$2b$10$QATxsf1qbNmeSUf3GFgdwuuS0L2in/UP12oSHLtncqU7gp4YEdIJS';  -- faculty123

CALL tmp_drop_column_if_exists('students', 'password');
CALL tmp_drop_column_if_exists('faculty', 'password');

DROP PROCEDURE tmp_add_column_if_missing;
DROP PROCEDURE tmp_drop_column_if_exists;

-- Recalculate GPA
UPDATE students s SET gpa = COALESCE((SELECT SUM(sub.credits * CASE e.grade WHEN 'O' THEN 10 WHEN 'A+' THEN 9 WHEN 'A' THEN 8 WHEN 'B+' THEN 7 WHEN 'B' THEN 6 WHEN 'C' THEN 5 ELSE 0 END) / SUM(sub.credits) FROM evaluations e JOIN exam_registrations er ON e.registration_id = er.registration_id JOIN subjects sub ON er.subject_id = sub.subject_id WHERE er.student_id = s.student_id AND e.grade IS NOT NULL), 0.00);
