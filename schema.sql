-- Base schema for exam_db: the tables that the API, stored procedures, triggers and
-- views depend on. Run this first on an empty database, then the other SQL files in
-- the order listed in README.md ("Database setup") or via scripts/setup-db.sh.
--
-- Tables created by later files (not here): notifications (notifications_and_search.sql),
-- audit_log (audit_log.sql). Secondary indexes idx_student_roll / idx_reg_student come
-- from update_db.sql, FULLTEXT search indexes from notifications_and_search.sql.

SET NAMES utf8mb4;

CREATE TABLE students (
  student_id    INT          NOT NULL AUTO_INCREMENT,
  roll_no       VARCHAR(20)  NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NULL,
  password_hash VARCHAR(255) NULL COMMENT 'bcrypt hash; plaintext passwords are never stored',
  course        VARCHAR(100) NULL,
  semester      TINYINT UNSIGNED NULL,
  phone_no      VARCHAR(15)  NULL,
  gpa           DECIMAL(4,2) NOT NULL DEFAULT 0.00 COMMENT 'maintained by trg_evaluations_after_* triggers',
  PRIMARY KEY (student_id),
  UNIQUE KEY uq_students_roll_no (roll_no),
  UNIQUE KEY uq_students_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faculty (
  faculty_id    INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NULL,
  password_hash VARCHAR(255) NULL COMMENT 'bcrypt hash; plaintext passwords are never stored',
  department    VARCHAR(100) NULL,
  PRIMARY KEY (faculty_id),
  UNIQUE KEY uq_faculty_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subjects (
  subject_id   INT          NOT NULL AUTO_INCREMENT,
  subject_code VARCHAR(20)  NOT NULL,
  subject_name VARCHAR(255) NOT NULL,
  credits      TINYINT UNSIGNED NOT NULL DEFAULT 3,
  semester     TINYINT UNSIGNED NULL,
  PRIMARY KEY (subject_id),
  UNIQUE KEY uq_subjects_code (subject_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- An exam session (e.g. the May end-semester exams). RegisterForExam uses exam_id = 1.
CREATE TABLE exams (
  exam_id   INT          NOT NULL AUTO_INCREMENT,
  exam_name VARCHAR(100) NOT NULL,
  session   VARCHAR(50)  NULL,
  PRIMARY KEY (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_timetable (
  timetable_id INT  NOT NULL AUTO_INCREMENT,
  exam_id      INT  NOT NULL,
  subject_id   INT  NOT NULL,
  exam_date    DATE NOT NULL,
  exam_time    TIME NOT NULL,
  PRIMARY KEY (timetable_id),
  UNIQUE KEY uq_timetable_exam_subject (exam_id, subject_id),
  KEY idx_timetable_subject (subject_id),
  CONSTRAINT fk_timetable_exam    FOREIGN KEY (exam_id)    REFERENCES exams (exam_id),
  CONSTRAINT fk_timetable_subject FOREIGN KEY (subject_id) REFERENCES subjects (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RegisterForExam picks hall_id 1..6 and seat_no 1..60, so seed at least 6 halls.
CREATE TABLE exam_halls (
  hall_id   INT          NOT NULL AUTO_INCREMENT,
  hall_name VARCHAR(100) NOT NULL,
  capacity  INT          NOT NULL DEFAULT 60,
  PRIMARY KEY (hall_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE exam_registrations (
  registration_id INT       NOT NULL AUTO_INCREMENT,
  student_id      INT       NOT NULL,
  subject_id      INT       NOT NULL,
  exam_id         INT       NOT NULL,
  registered_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (registration_id),
  -- Backs RegisterForExam's duplicate check at the database level (also under concurrency).
  UNIQUE KEY uq_registration_student_subject (student_id, subject_id),
  KEY idx_registration_subject (subject_id),
  CONSTRAINT fk_registration_student FOREIGN KEY (student_id) REFERENCES students (student_id),
  CONSTRAINT fk_registration_subject FOREIGN KEY (subject_id) REFERENCES subjects (subject_id),
  CONSTRAINT fk_registration_exam    FOREIGN KEY (exam_id)    REFERENCES exams (exam_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hall_allocations (
  allocation_id   INT NOT NULL AUTO_INCREMENT,
  registration_id INT NOT NULL,
  hall_id         INT NOT NULL,
  seat_no         INT NOT NULL,
  PRIMARY KEY (allocation_id),
  UNIQUE KEY uq_allocation_registration (registration_id),
  KEY idx_allocation_hall (hall_id),
  CONSTRAINT fk_allocation_registration FOREIGN KEY (registration_id) REFERENCES exam_registrations (registration_id),
  CONSTRAINT fk_allocation_hall         FOREIGN KEY (hall_id)         REFERENCES exam_halls (hall_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One evaluation per registration; PublishResult relies on this for ON DUPLICATE KEY UPDATE.
-- grade is set by trg_evaluations_before_* triggers.
CREATE TABLE evaluations (
  evaluation_id   INT          NOT NULL AUTO_INCREMENT,
  registration_id INT          NOT NULL,
  faculty_id      INT          NOT NULL,
  marks           DECIMAL(5,2) NULL,
  grade           VARCHAR(2)   NULL,
  PRIMARY KEY (evaluation_id),
  UNIQUE KEY uq_evaluation_registration (registration_id),
  KEY idx_evaluation_faculty (faculty_id),
  CONSTRAINT fk_evaluation_registration FOREIGN KEY (registration_id) REFERENCES exam_registrations (registration_id),
  CONSTRAINT fk_evaluation_faculty      FOREIGN KEY (faculty_id)      REFERENCES faculty (faculty_id),
  CONSTRAINT chk_evaluation_marks CHECK (marks IS NULL OR (marks >= 0 AND marks <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE malpractice (
  malpractice_id  INT          NOT NULL AUTO_INCREMENT,
  registration_id INT          NOT NULL,
  description     TEXT         NOT NULL,
  reported_by     VARCHAR(100) NOT NULL,
  action_taken    VARCHAR(255) NOT NULL DEFAULT 'Under Investigation',
  status          VARCHAR(50)  NOT NULL DEFAULT 'Pending',
  reported_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (malpractice_id),
  KEY idx_malpractice_registration (registration_id),
  CONSTRAINT fk_malpractice_registration FOREIGN KEY (registration_id) REFERENCES exam_registrations (registration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
