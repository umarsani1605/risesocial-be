-- Migration: Add 3-Layer Payment Architecture
-- This migration adds new tables WITHOUT dropping old ones
-- Old tables (midtrans_payments) will be kept for data migration

-- Step 1: Create new Layer 1 tables (Generic Transaction)
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "transaction_code" VARCHAR(100) NOT NULL,
    "provider_reference" VARCHAR(100),
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "provider" VARCHAR(50) NOT NULL,
    "payment_method" VARCHAR(50),
    "payment_token" VARCHAR(500),
    "payment_url" VARCHAR(500),
    "customer_name" VARCHAR(255) NOT NULL,
    "customer_email" VARCHAR(255) NOT NULL,
    "customer_phone" VARCHAR(50),
    "customer_address" VARCHAR(500),
    "customer_city" VARCHAR(100),
    "customer_postal_code" VARCHAR(20),
    "customer_country_code" VARCHAR(10),
    "user_id" INTEGER,
    "product_type" VARCHAR(100) NOT NULL,
    "product_type_id" INTEGER NOT NULL,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transaction_items" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "product_code" VARCHAR(100) NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "product_category" VARCHAR(100),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create new Layer 2 table (Provider-Specific)
CREATE TABLE "midtrans_transactions" (
    "id" SERIAL NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "snap_token" VARCHAR(500) NOT NULL,
    "redirect_url" VARCHAR(500),
    "midtrans_order_id" VARCHAR(100) NOT NULL,
    "midtrans_transaction_id" VARCHAR(100),
    "transaction_status" VARCHAR(50),
    "fraud_status" VARCHAR(50),
    "payment_type" VARCHAR(50),
    "bank" VARCHAR(50),
    "va_numbers" JSONB,
    "masked_card" VARCHAR(50),
    "status_code" VARCHAR(10),
    "status_message" VARCHAR(255),
    "approval_code" VARCHAR(50),
    "create_response" JSONB,
    "last_notification" JSONB,
    "status_response" JSONB,
    "settlement_time" TIMESTAMP(3),
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midtrans_transactions_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add new columns to ryls_payments (Layer 3)
-- Make registration_id nullable to handle existing NULL values
ALTER TABLE "ryls_payments" 
  ADD COLUMN "transaction_id" INTEGER,
  ADD COLUMN "scholarship_type" VARCHAR(50) DEFAULT 'SELF_FUNDED',
  ADD COLUMN "payment_method" VARCHAR(50) DEFAULT 'midtrans',
  ALTER COLUMN "registration_id" DROP NOT NULL,
  ALTER COLUMN "status" SET DEFAULT 'pending',
  ALTER COLUMN "status" SET DATA TYPE VARCHAR(50);

-- Step 4: Create indexes for new tables
CREATE UNIQUE INDEX "transactions_transaction_code_key" ON "transactions"("transaction_code");
CREATE INDEX "transactions_transaction_code_idx" ON "transactions"("transaction_code");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE INDEX "transactions_provider_idx" ON "transactions"("provider");
CREATE INDEX "transactions_product_type_product_type_id_idx" ON "transactions"("product_type", "product_type_id");
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "transactions_payment_method_idx" ON "transactions"("payment_method");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at" DESC);

CREATE INDEX "transaction_items_transaction_id_idx" ON "transaction_items"("transaction_id");

CREATE UNIQUE INDEX "midtrans_transactions_transaction_id_key" ON "midtrans_transactions"("transaction_id");
CREATE INDEX "midtrans_transactions_midtrans_order_id_idx" ON "midtrans_transactions"("midtrans_order_id");
CREATE INDEX "midtrans_transactions_transaction_status_idx" ON "midtrans_transactions"("transaction_status");
CREATE INDEX "midtrans_transactions_midtrans_transaction_id_idx" ON "midtrans_transactions"("midtrans_transaction_id");

-- Step 5: Add foreign keys
ALTER TABLE "transactions" 
  ADD CONSTRAINT "transactions_user_id_fkey" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") 
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "transaction_items" 
  ADD CONSTRAINT "transaction_items_transaction_id_fkey" 
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "midtrans_transactions" 
  ADD CONSTRAINT "midtrans_transactions_transaction_id_fkey" 
  FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Note: We'll add ryls_payments foreign key after data migration
-- when transaction_id is populated

-- Note: Old enums are kept because they're still used by midtrans_payments table
-- They will be dropped after midtrans_payments table is dropped

-- Note: Old midtrans_payments table is kept for data migration
-- It will be dropped manually after verification
