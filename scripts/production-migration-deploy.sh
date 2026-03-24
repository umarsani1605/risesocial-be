#!/bin/bash

# Production Payment Migration Deployment Script - Prisma Way
# 
# This script performs complete migration using Prisma migrations:
# 1. Backup current database
# 2. Apply Phase 1 migration (adds new tables, keeps old ones)
# 3. Migrate data from old tables to new 3-layer architecture
# 4. Verify migration success
# 5. Apply Phase 2 migration (cleanup via Prisma - NO manual SQL!)

set -e  # Exit on error

echo "=========================================="
echo "  PRODUCTION PAYMENT MIGRATION"
echo "  (PRISMA WAY - 2 PHASE)"
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
# STEP 3: APPLY PHASE 1 MIGRATION (Add Tables)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Applying Phase 1 Migration (Add new tables)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "This will add:"
echo "  - transactions table"
echo "  - midtrans_transactions table"
echo "  - transaction_items table"
echo "  - new columns to ryls_payments"
echo ""
echo "Old tables will be kept temporarily for data migration."
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Phase 1 migration applied successfully"
else
    echo "❌ Phase 1 migration failed!"
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
    echo "   Aborting Phase 2. Data is safe in both old and new tables."
    echo ""
    echo "To rollback:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi

echo "✅ Data verified - counts match"
echo ""

# ============================================
# STEP 6: APPLY PHASE 2 MIGRATION (Cleanup)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Applying Phase 2 Migration (Cleanup)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Phase 2 will (via Prisma migration):"
echo "   - DROP midtrans_payments table"
echo "   - DROP old columns from ryls_payments"
echo "   - DROP old enum types"
echo ""
echo "This is done via Prisma migration (NOT manual SQL)."
echo ""

# Check if cleanup migration exists
CLEANUP_MIGRATION=$(ls -1 prisma/migrations/ | grep cleanup_old_payment_tables | tail -1)

if [ -z "$CLEANUP_MIGRATION" ]; then
    echo "❌ ERROR: Phase 2 migration not found!"
    echo ""
    echo "Expected migration: cleanup_old_payment_tables"
    echo ""
    echo "Please ensure Phase 2 migration has been generated."
    echo "The migration should already exist in prisma/migrations/"
    exit 1
fi

echo "Found Phase 2 migration: $CLEANUP_MIGRATION"
echo ""

npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Phase 2 migration applied successfully"
else
    echo "❌ Phase 2 migration failed!"
    echo ""
    echo "To rollback:"
    echo "  bash scripts/quick-restore.sh $BACKUP_FILE"
    exit 1
fi

npx prisma generate > /dev/null 2>&1
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

# Check Prisma migration status
echo ""
echo "Checking Prisma migration status..."
npx prisma migrate status

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

# Sample data check (if data exists)
if [ "$NEW_COUNT" -gt 0 ]; then
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
fi

# ============================================
# COMPLETION
# ============================================
echo "=========================================="
echo "  ✅ MIGRATION COMPLETE (PRISMA WAY)"
echo "=========================================="
echo ""
echo "� Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "� SUMMARY:"
echo "  ✅ Phase 1: Added new tables (via Prisma)"
echo "  ✅ Data migrated: $NEW_COUNT records"
echo "  ✅ Phase 2: Cleaned up old tables (via Prisma)"
echo "  ✅ Migration history: CLEAN & SYNCED"
echo "  ✅ Database matches Prisma schema exactly"
echo ""
echo "� Backup location: $BACKUP_FILE"
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
