#!/bin/bash

# Quick Database Restore Script
# Usage: bash scripts/quick-restore.sh backups/[BACKUP_FILE].sql

set -e

echo "=== Quick Database Restore ==="
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "❌ Error: Backup file not specified"
  echo ""
  echo "Usage: bash scripts/quick-restore.sh backups/[BACKUP_FILE].sql"
  echo ""
  echo "Available backups:"
  ls -lh backups/*.sql 2>/dev/null || echo "  No backup files found"
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  echo ""
  echo "Available backups:"
  ls -lh backups/*.sql 2>/dev/null || echo "  No backup files found"
  exit 1
fi

echo "Backup file: $BACKUP_FILE"
echo ""

# Load environment variables
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  exit 1
fi

export $(cat .env | grep -v '^#' | xargs)

# Clean DATABASE_URL
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed 's/?schema=public//')

# Extract database name
DB_NAME=$(echo "$CLEAN_DB_URL" | sed 's/.*\///')

echo "Database: $DB_NAME"
echo ""

# Step 1: Terminate connections
echo "Step 1: Terminating active connections..."
psql "$CLEAN_DB_URL" -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
" > /dev/null 2>&1 || true

echo "✅ Connections terminated"
echo ""

# Wait a moment
sleep 2

# Step 2: Drop database
echo "Step 2: Dropping database..."
dropdb "$DB_NAME" -h localhost -U postgres 2>/dev/null || {
  echo "⚠️  Database drop failed, retrying..."
  sleep 2
  psql "$CLEAN_DB_URL" -c "
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();
  " > /dev/null 2>&1 || true
  sleep 2
  dropdb "$DB_NAME" -h localhost -U postgres
}

echo "✅ Database dropped"
echo ""

# Step 3: Create database
echo "Step 3: Creating database..."
createdb "$DB_NAME" -h localhost -U postgres

echo "✅ Database created"
echo ""

# Step 4: Restore from backup
echo "Step 4: Restoring from backup..."
echo "This may take a minute..."
psql "$CLEAN_DB_URL" < "$BACKUP_FILE" > /dev/null 2>&1

echo "✅ Database restored"
echo ""

# Step 5: Verify restore
echo "Step 5: Verifying restore..."
MIDTRANS_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM midtrans_payments;" 2>/dev/null | xargs)
RYLS_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM ryls_payments;" 2>/dev/null | xargs)

echo "  midtrans_payments: $MIDTRANS_COUNT records"
echo "  ryls_payments: $RYLS_COUNT records"
echo ""

if [ "$MIDTRANS_COUNT" -gt 0 ] && [ "$RYLS_COUNT" -gt 0 ]; then
  echo "✅ Verification passed"
else
  echo "⚠️  Warning: Some tables may be empty"
fi

echo ""
echo "=== RESTORE COMPLETE ==="
echo ""
echo "Database has been restored to: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "  1. Verify data: psql \"\$DATABASE_URL\" -c \"SELECT COUNT(*) FROM midtrans_payments;\""
echo "  2. Test application"
echo "  3. Deploy new schema if needed: bash scripts/production-migration-deploy.sh"
echo ""
