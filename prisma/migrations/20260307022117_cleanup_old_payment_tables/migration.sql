/*
  Warnings:

  - You are about to drop the column `amount` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `midtrans_id` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the `midtrans_payments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transaction_id]` on the table `ryls_payments` will be added. If there are existing duplicate values, this will fail.
  - Made the column `scholarship_type` on table `ryls_payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `payment_method` on table `ryls_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ryls_payments" DROP CONSTRAINT IF EXISTS "ryls_payments_midtrans_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "ryls_payments_created_at_idx";

-- DropIndex
DROP INDEX IF EXISTS "ryls_payments_midtrans_id_key";

-- DropIndex
DROP INDEX IF EXISTS "ryls_payments_type_idx";

-- DropIndex
DROP INDEX IF EXISTS "ryls_payments_midtrans_id_idx";

-- AlterTable
ALTER TABLE "ryls_payments" DROP COLUMN IF EXISTS "amount",
DROP COLUMN IF EXISTS "midtrans_id",
DROP COLUMN IF EXISTS "paid_at",
DROP COLUMN IF EXISTS "type",
ALTER COLUMN "scholarship_type" SET NOT NULL,
ALTER COLUMN "scholarship_type" DROP DEFAULT,
ALTER COLUMN "payment_method" SET NOT NULL,
ALTER COLUMN "payment_method" DROP DEFAULT;

-- Note: transaction_id stays NULLABLE to support non-Midtrans payments (e.g., PayPal)

-- DropTable
DROP TABLE IF EXISTS "midtrans_payments";

-- DropEnum
DROP TYPE IF EXISTS "MidtransFraudStatus";

-- DropEnum
DROP TYPE IF EXISTS "MidtransTransactionStatus";

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ryls_payments_transaction_id_key" ON "ryls_payments"("transaction_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ryls_payments_registration_id_idx" ON "ryls_payments"("registration_id");

-- AddForeignKey (only if transaction_id is not null)
ALTER TABLE "ryls_payments" DROP CONSTRAINT IF EXISTS "ryls_payments_transaction_id_fkey";
ALTER TABLE "ryls_payments" ADD CONSTRAINT "ryls_payments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
