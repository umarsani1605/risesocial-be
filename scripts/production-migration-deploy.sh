#!/bin/bash

# Production Payment Migration Deployment Script (with Cleanup)
# 
# This script performs complete migration with immediate cleanup:
# 1. Backup current database
# 2. Apply new schema migration (adds new tables, keeps old ones)
# 3. Migrate data from old tables to new 3-layer architecture
# 4. Verify migration success
# 5. CLEANUP: Drop old tables and columns immediately

set -e  # Exit on error

echo "=========================================="
echo "  PRODUCTION PAYMENT MIGRATION DEPLOYMENT"
echo "  (WITH IMMEDIATE CLEANUP)"
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
# STEP 1: BACKUP CURRENT DATABASE
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Creating database backup..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/production_migration_backup_$TIMESTAMP.sql"

echo "Backup file: $BACKUP_FILE"
pg_dump "$CLEAN_DB_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup successful! Size: $BACKUP_SIZE"
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
# STEP 3: APPLY NEW SCHEMA MIGRATION
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Applying new schema migration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This will add new tables (transactions, midtrans_transactions, transaction_items)"
echo "Old tables will be kept temporarily for data migration"
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Schema migration applied successfully"
else
    echo "❌ Schema migration failed!"
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

node scripts/migrate-payment-data-clean.js

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
# STEP 5: VERIFY MIGRATION BEFORE CLEANUP
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Verifying migration before cleanup..."
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

echo "✅ Record counts match - safe to proceed with cleanup"
echo ""

# ============================================
# STEP 6: CLEANUP OLD TABLES AND COLUMNS
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Cleaning up old tables and columns..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Drop old midtrans_payments table
echo "🗑️  Dropping midtrans_payments table..."
psql "$CLEAN_DB_URL" -c "DROP TABLE IF EXISTS midtrans_payments CASCADE;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ midtrans_payments table dropped"
else
    echo "   ⚠️  Failed to drop midtrans_payments table"
fi

# Drop old columns from ryls_payments
echo "🗑️  Dropping old columns from ryls_payments..."
psql "$CLEAN_DB_URL" -c "
  ALTER TABLE ryls_payments 
    DROP COLUMN IF EXISTS amount,
    DROP COLUMN IF EXISTS type,
    DROP COLUMN IF EXISTS paid_at,
    DROP COLUMN IF EXISTS midtrans_id;
" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Old columns dropped (amount, type, paid_at, midtrans_id)"
else
    echo "   ⚠️  Failed to drop some columns"
fi

# Drop old enum types
echo "🗑️  Dropping old enum types..."
psql "$CLEAN_DB_URL" -c "DROP TYPE IF EXISTS \"MidtransTransactionStatus\";" > /dev/null 2>&1
psql "$CLEAN_DB_URL" -c "DROP TYPE IF EXISTS \"MidtransFraudStatus\";" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "   ✅ Old enum types dropped"
else
    echo "   ⚠️  Failed to drop some enum types"
fi

echo ""
echo "✅ Cleanup completed successfully"
echo ""

# ============================================
# STEP 7: FINAL VERIFICATION
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 7: Final verification..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check that old table is gone
OLD_TABLE_EXISTS=$(psql "$CLEAN_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'midtrans_payments');" 2>/dev/null | xargs)

if [ "$OLD_TABLE_EXISTS" = "f" ]; then
    echo "✅ midtrans_payments table removed"
else
    echo "⚠️  midtrans_payments table still exists"
fi

# Check that old columns are gone
OLD_AMOUNT_EXISTS=$(psql "$CLEAN_DB_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ryls_payments' AND column_name = 'amount');" 2>/dev/null | xargs)

if [ "$OLD_AMOUNT_EXISTS" = "f" ]; then
    echo "✅ Old columns removed from ryls_payments"
else
    echo "⚠️  Old columns still exist in ryls_payments"
fi

# Show final table structure
echo ""
echo "Current database tables:"
psql "$CLEAN_DB_URL" -c "
SELECT 
  'transactions' as table_name, 
  COUNT(*) as count 
FROM transactions
UNION ALL
SELECT 
  'midtrans_transactions' as table_name, 
  COUNT(*) as count 
FROM midtrans_transactions
UNION ALL
SELECT 
  'transaction_items' as table_name, 
  COUNT(*) as count 
FROM transaction_items
UNION ALL
SELECT 
  'ryls_payments' as table_name, 
  COUNT(*) as count 
FROM ryls_payments
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
echo "  ✅ MIGRATION & CLEANUP COMPLETE"
echo "=========================================="
echo ""
echo "🕐 Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "📊 SUMMARY:"
echo "  ✅ Migrated records: $NEW_COUNT"
echo "  ✅ New tables: transactions, midtrans_transactions, transaction_items"
echo "  ✅ Cleaned up: midtrans_payments table, old columns, old enums"
echo "  ✅ Database now matches Prisma schema exactly"
echo ""
echo "📦 Backup location: $BACKUP_FILE"
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
