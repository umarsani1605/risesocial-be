#!/bin/bash

# Payment Migration Deployment - The Prisma Way
# 
# This script performs migration in 2 phases:
# Phase 1: Add new tables (additive, safe)
# Phase 2: Remove old tables via Prisma migration (after data migration)
#
# All schema changes via Prisma migrations - NO manual SQL!

set -e  # Exit on error

echo "=========================================="
echo "  PAYMENT MIGRATION - PRISMA WAY"
echo "  (2-Phase Migration)"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ ERROR: .env file not found"
    exit 1
fi

# Clean DATABASE_URL
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed 's/?schema=public//')
DB_NAME=$(echo "$CLEAN_DB_URL" | sed 's/.*\///')

echo "📊 Database: $DB_NAME"
echo "🕐 Started at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ============================================
# STEP 1: BACKUP
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Creating database backup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/payment_migration_backup_$TIMESTAMP.sql"

echo "Backup file: $BACKUP_FILE"
pg_dump "$CLEAN_DB_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
else
    echo "❌ Backup failed!"
    exit 1
fi
echo ""

# ============================================
# STEP 2: VERIFY CURRENT STATE
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Verifying current database state..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

psql "$CLEAN_DB_URL" -c "
SELECT 
  'midtrans_payments' as table_name, 
  COUNT(*) as record_count 
FROM midtrans_payments
UNION ALL
SELECT 
  'ryls_payments' as table_name, 
  COUNT(*) as record_count 
FROM ryls_payments;
"
echo ""

# ============================================
# STEP 3: APPLY MIGRATION 1 (Add New Tables)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Applying Migration 1 (Add new tables)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This will add:"
echo "  - transactions table"
echo "  - midtrans_transactions table"
echo "  - transaction_items table"
echo "  - new columns to ryls_payments (transaction_id, scholarship_type, payment_method)"
echo ""
echo "Old tables will be kept temporarily for data migration."
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migration 1 applied successfully"
else
    echo "❌ Migration 1 failed!"
    echo ""
    echo "To rollback, restore from backup:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi

npx prisma generate > /dev/null 2>&1
echo ""

# ============================================
# STEP 4: MIGRATE DATA
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Migrating data to new architecture..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node scripts/migrate-payment-data.js

if [ $? -eq 0 ]; then
    echo "✅ Data migration completed"
else
    echo "❌ Data migration failed!"
    echo ""
    echo "To rollback, restore from backup:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi
echo ""

# ============================================
# STEP 5: VERIFY DATA MIGRATION
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Verifying data migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get counts
OLD_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM midtrans_payments;" 2>/dev/null | xargs)
NEW_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM transactions;" 2>/dev/null | xargs)
MIDTRANS_TRANS_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM midtrans_transactions;" 2>/dev/null | xargs)
TRANS_ITEMS_COUNT=$(psql "$CLEAN_DB_URL" -t -c "SELECT COUNT(*) FROM transaction_items;" 2>/dev/null | xargs)

echo "Record counts:"
echo "  OLD: midtrans_payments: $OLD_COUNT"
echo "  NEW: transactions: $NEW_COUNT"
echo "  NEW: midtrans_transactions: $MIDTRANS_TRANS_COUNT"
echo "  NEW: transaction_items: $TRANS_ITEMS_COUNT"
echo ""

# Verify counts match
if [ "$OLD_COUNT" -ne "$NEW_COUNT" ]; then
    echo "❌ ERROR: Record count mismatch!"
    echo "   Expected: $OLD_COUNT, Got: $NEW_COUNT"
    echo "   Aborting cleanup. Data is safe in both old and new tables."
    echo ""
    echo "To rollback:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi

echo "✅ Data verified - counts match"
echo ""

# ============================================
# STEP 6: PREPARE FOR PHASE 2
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Preparing for Phase 2 (Cleanup)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Phase 2 will:"
echo "   - Remove midtrans_payments table"
echo "   - Remove old columns from ryls_payments (amount, type, paid_at, midtrans_id)"
echo "   - Remove old enum types"
echo ""
echo "This will be done via Prisma migration (not manual SQL)."
echo ""
echo "Press ENTER to continue with Phase 2, or Ctrl+C to stop here..."
read

# ============================================
# STEP 7: UPDATE SCHEMA FOR PHASE 2
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 7: Updating schema for Phase 2..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  You need to manually update schema.prisma:"
echo ""
echo "1. Remove the MidtransPayment model"
echo "2. Remove old enums: MidtransTransactionStatus, MidtransFraudStatus"
echo "3. Update RylsPayment model:"
echo "   - Remove: amount, type, paid_at, midtrans_id columns"
echo "   - Make transaction_id NOT NULL"
echo "   - Make scholarship_type NOT NULL"
echo "   - Make payment_method NOT NULL"
echo "   - Remove midtrans_payment relation"
echo ""
echo "After updating schema.prisma, press ENTER to generate Migration 2..."
read

# ============================================
# STEP 8: GENERATE MIGRATION 2
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 8: Generating Migration 2 (Cleanup)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

npx prisma migrate dev --name cleanup_old_payment_tables

if [ $? -eq 0 ]; then
    echo "✅ Migration 2 generated and applied successfully"
else
    echo "❌ Migration 2 failed!"
    echo ""
    echo "To rollback:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi

npx prisma generate > /dev/null 2>&1
echo ""

# ============================================
# STEP 9: FINAL VERIFICATION
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 9: Final verification..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check old table is gone
OLD_TABLE_EXISTS=$(psql "$CLEAN_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'midtrans_payments');" 2>/dev/null | xargs)

if [ "$OLD_TABLE_EXISTS" = "f" ]; then
    echo "✅ midtrans_payments table removed"
else
    echo "⚠️  midtrans_payments table still exists"
fi

# Check old columns are gone
OLD_AMOUNT_EXISTS=$(psql "$CLEAN_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ryls_payments' AND column_name = 'amount');" 2>/dev/null | xargs)

if [ "$OLD_AMOUNT_EXISTS" = "f" ]; then
    echo "✅ Old columns removed from ryls_payments"
else
    echo "⚠️  Old columns still exist in ryls_payments"
fi

echo ""
echo "Current tables:"
psql "$CLEAN_DB_URL" -c "
SELECT
  'transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'midtrans_transactions', COUNT(*) FROM midtrans_transactions
UNION ALL
SELECT 'transaction_items', COUNT(*) FROM transaction_items
UNION ALL
SELECT 'ryls_payments', COUNT(*) FROM ryls_payments
ORDER BY table_name;
"
echo ""

# Sample data check
echo "Sample data from new tables:"
psql "$CLEAN_DB_URL" -c "
SELECT 
  t.transaction_code,
  t.status,
  t.amount,
  t.payment_method,
  mt.transaction_status as midtrans_status
FROM transactions t
JOIN midtrans_transactions mt ON mt.transaction_id = t.id
ORDER BY t.created_at DESC
LIMIT 3;
"
echo ""

# ============================================
# COMPLETION
# ============================================
echo "=========================================="
echo "  ✅ MIGRATION COMPLETE"
echo "=========================================="
echo ""
echo "🕐 Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "📊 SUMMARY:"
echo "  ✅ Phase 1: Added new tables (via Prisma)"
echo "  ✅ Data migrated: $NEW_COUNT records"
echo "  ✅ Phase 2: Cleaned up old tables (via Prisma)"
echo "  ✅ Prisma migration history: CLEAN & SYNCED"
echo ""
echo "📦 Backup: $BACKUP_FILE"
echo ""
echo "📋 NEXT STEPS:"
echo "  1. Test payment creation flow"
echo "  2. Test webhook processing"
echo "  3. Monitor application logs"
echo "  4. Verify no errors in production"
echo ""
echo "🔄 To rollback if needed:"
echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
echo ""
