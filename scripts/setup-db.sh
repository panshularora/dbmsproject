#!/usr/bin/env bash
# Create exam_db from scratch: base schema, procedures, views, indexes, triggers, audit log, seed data.
#
# Usage:  scripts/setup-db.sh [--reset]
#   --reset  drop and recreate the database first (destroys its data)
#
# Connection settings come from the environment (or .env in the repo root):
#   DB_HOST (default 127.0.0.1), DB_PORT (default 3306), DB_USER (default root), DB_PASSWORD, DB_NAME (default exam_db)
# Needs the `mysql` command-line client.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT/.env" ]]; then
  # Only pick up DB_* keys; values already in the environment win.
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^DB_(HOST|PORT|USER|PASSWORD|NAME)$ ]] || continue
    value="${value%%#*}"; value="${value%"${value##*[![:space:]]}"}"
    [[ -z "${!key:-}" ]] && export "$key=$value"
  done < "$ROOT/.env"
fi

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_NAME="${DB_NAME:-exam_db}"
export MYSQL_PWD="${DB_PASSWORD:-}"

if [[ ! "$DB_NAME" =~ ^[A-Za-z0-9_]+$ ]]; then
  echo "DB_NAME must be alphanumeric/underscore" >&2
  exit 1
fi

mysql_cmd=(mysql --protocol=TCP -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER")

if [[ "${1:-}" == "--reset" ]]; then
  "${mysql_cmd[@]}" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`"
fi
"${mysql_cmd[@]}" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# Order matters: later files depend on objects created by earlier ones.
FILES=(
  schema.sql                    # base tables
  stored_procedures.sql         # procedures (RegisterForExam, ResetDemoData, ...)
  create_views.sql              # vw_student_results, vw_hall_occupancy, vw_subject_analytics
  update_db.sql                 # B-tree indexes
  update_sp_to_view.sql         # GetStudentResults reads vw_student_results
  triggers.sql                  # grade + GPA triggers
  notifications_and_search.sql  # notifications table, FULLTEXT indexes, notification triggers
  audit_log.sql                 # audit_log table
  audit_triggers.sql            # audit triggers
  seed.sql                      # demo data (bcrypt-hashed demo logins)
)
for f in "${FILES[@]}"; do
  echo "-> $f"
  "${mysql_cmd[@]}" "$DB_NAME" < "$ROOT/$f"
done
echo "Database '$DB_NAME' is ready."
