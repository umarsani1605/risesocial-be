/*
  Warnings:

  - You are about to drop the column `currency` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `fraud_status` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `gross_amount_idr` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `last_notification` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `notified_at` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_details` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `redirect_url` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `snap_token` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_status` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to alter the column `payment_type` on the `ryls_payments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to drop the column `payment_status` on the `ryls_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `submission_id` on the `ryls_registrations` table. All the data in the column will be lost.
  - You are about to drop the `ryls_fully_funded_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ryls_self_funded_submissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[payment_proof_id]` on the table `ryls_payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[midtrans_id]` on the table `ryls_payments` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `upload_type` on the `file_uploads` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `payment_type` on table `ryls_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ryls_fully_funded_submissions" DROP CONSTRAINT "ryls_fully_funded_submissions_essay_file_id_fkey";

-- DropForeignKey
ALTER TABLE "ryls_fully_funded_submissions" DROP CONSTRAINT "ryls_fully_funded_submissions_registration_id_fkey";

-- DropForeignKey
ALTER TABLE "ryls_self_funded_submissions" DROP CONSTRAINT "ryls_self_funded_submissions_headshot_file_id_fkey";

-- DropForeignKey
ALTER TABLE "ryls_self_funded_submissions" DROP CONSTRAINT "ryls_self_funded_submissions_registration_id_fkey";

-- DropIndex
DROP INDEX "ryls_payments_order_id_idx";

-- DropIndex
DROP INDEX "ryls_payments_order_id_key";

-- DropIndex
DROP INDEX "ryls_payments_registration_id_idx";

-- DropIndex
DROP INDEX "ryls_payments_transaction_status_idx";

-- DropIndex
DROP INDEX "ryls_registrations_payment_status_idx";

-- DropIndex
DROP INDEX "ryls_registrations_submission_id_key";

-- AlterTable
ALTER TABLE "file_uploads" DROP COLUMN "upload_type",
ADD COLUMN     "upload_type" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "ryls_payments" DROP COLUMN "currency",
DROP COLUMN "fraud_status",
DROP COLUMN "gross_amount_idr",
DROP COLUMN "last_notification",
DROP COLUMN "notified_at",
DROP COLUMN "order_id",
DROP COLUMN "payment_details",
DROP COLUMN "redirect_url",
DROP COLUMN "snap_token",
DROP COLUMN "transaction_id",
DROP COLUMN "transaction_status",
ADD COLUMN     "midtrans_id" INTEGER,
ADD COLUMN     "payment_proof_id" INTEGER,
ADD COLUMN     "payment_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "payment_type" SET NOT NULL,
ALTER COLUMN "payment_type" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "ryls_registrations" DROP COLUMN "payment_status",
DROP COLUMN "submission_id",
ADD COLUMN     "ryls_payment_id" INTEGER;

-- DropTable
DROP TABLE "ryls_fully_funded_submissions";

-- DropTable
DROP TABLE "ryls_self_funded_submissions";

-- CreateTable
CREATE TABLE "RylsFullyFundedSubmission" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "essay_topic" TEXT NOT NULL,
    "essay_file_id" INTEGER NOT NULL,
    "essay_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RylsFullyFundedSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RylsSelfFundedSubmission" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "passport_number" VARCHAR(100) NOT NULL,
    "need_visa" BOOLEAN NOT NULL,
    "headshot_file_id" INTEGER NOT NULL,
    "read_policies" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RylsSelfFundedSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midtrans_payments" (
    "id" SERIAL NOT NULL,
    "order_id" VARCHAR(100) NOT NULL,
    "snap_token" VARCHAR(255) NOT NULL,
    "redirect_url" VARCHAR(500),
    "transaction_id" VARCHAR(100),
    "payment_type" VARCHAR(50),
    "gross_amount_idr" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'IDR',
    "transaction_status" "MidtransTransactionStatus" NOT NULL DEFAULT 'pending',
    "fraud_status" "MidtransFraudStatus",
    "payment_details" JSONB,
    "last_notification" JSONB,
    "notified_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midtrans_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RylsFullyFundedSubmission_registration_id_key" ON "RylsFullyFundedSubmission"("registration_id");

-- CreateIndex
CREATE INDEX "RylsFullyFundedSubmission_registration_id_idx" ON "RylsFullyFundedSubmission"("registration_id");

-- CreateIndex
CREATE INDEX "RylsFullyFundedSubmission_essay_file_id_idx" ON "RylsFullyFundedSubmission"("essay_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "RylsFullyFundedSubmission_essay_file_id_key" ON "RylsFullyFundedSubmission"("essay_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "RylsSelfFundedSubmission_registration_id_key" ON "RylsSelfFundedSubmission"("registration_id");

-- CreateIndex
CREATE INDEX "RylsSelfFundedSubmission_registration_id_idx" ON "RylsSelfFundedSubmission"("registration_id");

-- CreateIndex
CREATE INDEX "RylsSelfFundedSubmission_headshot_file_id_idx" ON "RylsSelfFundedSubmission"("headshot_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "RylsSelfFundedSubmission_headshot_file_id_key" ON "RylsSelfFundedSubmission"("headshot_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "midtrans_payments_order_id_key" ON "midtrans_payments"("order_id");

-- CreateIndex
CREATE INDEX "midtrans_payments_transaction_status_idx" ON "midtrans_payments"("transaction_status");

-- CreateIndex
CREATE INDEX "midtrans_payments_order_id_idx" ON "midtrans_payments"("order_id");

-- CreateIndex
CREATE INDEX "file_uploads_upload_type_idx" ON "file_uploads"("upload_type");

-- CreateIndex
CREATE INDEX "ryls_payments_payment_status_idx" ON "ryls_payments"("payment_status");

-- CreateIndex
CREATE INDEX "ryls_payments_created_at_idx" ON "ryls_payments"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_payments_payment_proof_id_key" ON "ryls_payments"("payment_proof_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_payments_midtrans_id_key" ON "ryls_payments"("midtrans_id");

-- CreateIndex
CREATE INDEX "ryls_registrations_ryls_payment_id_idx" ON "ryls_registrations"("ryls_payment_id");

-- AddForeignKey
ALTER TABLE "RylsFullyFundedSubmission" ADD CONSTRAINT "RylsFullyFundedSubmission_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RylsFullyFundedSubmission" ADD CONSTRAINT "RylsFullyFundedSubmission_essay_file_id_fkey" FOREIGN KEY ("essay_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RylsSelfFundedSubmission" ADD CONSTRAINT "RylsSelfFundedSubmission_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RylsSelfFundedSubmission" ADD CONSTRAINT "RylsSelfFundedSubmission_headshot_file_id_fkey" FOREIGN KEY ("headshot_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_payments" ADD CONSTRAINT "ryls_payments_payment_proof_id_fkey" FOREIGN KEY ("payment_proof_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_payments" ADD CONSTRAINT "ryls_payments_midtrans_id_fkey" FOREIGN KEY ("midtrans_id") REFERENCES "midtrans_payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
