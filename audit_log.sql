-- Run against exam_db (after base schema). Creates audit log table for trigger-based change tracking.
-- Usage: mysql -u ... -p exam_db < audit_log.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  table_name VARCHAR(64) NOT NULL,
  action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  pk_value VARCHAR(64) NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_id),
  KEY idx_audit_table_time (table_name, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
