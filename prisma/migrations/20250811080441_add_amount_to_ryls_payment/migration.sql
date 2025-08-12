/*
  Warnings:

  - You are about to drop the column `payment_status` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `ryls_payments` table. All the data in the column will be lost.
  - You are about to drop the `RylsFullyFundedSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RylsSelfFundedSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `ryls_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `ryls_payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RylsFullyFundedSubmission" DROP CONSTRAINT "RylsFullyFundedSubmission_essay_file_id_fkey";

-- DropForeignKey
ALTER TABLE "RylsFullyFundedSubmission" DROP CONSTRAINT "RylsFullyFundedSubmission_registration_id_fkey";

-- DropForeignKey
ALTER TABLE "RylsSelfFundedSubmission" DROP CONSTRAINT "RylsSelfFundedSubmission_headshot_file_id_fkey";

-- DropForeignKey
ALTER TABLE "RylsSelfFundedSubmission" DROP CONSTRAINT "RylsSelfFundedSubmission_registration_id_fkey";

-- DropIndex
DROP INDEX "ryls_payments_payment_status_idx";

-- DropIndex
DROP INDEX "ryls_payments_payment_type_idx";

-- AlterTable
ALTER TABLE "ryls_payments" DROP COLUMN "payment_status",
DROP COLUMN "payment_type",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE "RylsFullyFundedSubmission";

-- DropTable
DROP TABLE "RylsSelfFundedSubmission";

-- DropEnum
DROP TYPE "FileUploadType";

-- CreateTable
CREATE TABLE "ryls_fully_funded_submissions" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "essay_topic" TEXT NOT NULL,
    "essay_file_id" INTEGER NOT NULL,
    "essay_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryls_fully_funded_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryls_self_funded_submissions" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "passport_number" VARCHAR(100) NOT NULL,
    "need_visa" BOOLEAN NOT NULL,
    "headshot_file_id" INTEGER NOT NULL,
    "read_policies" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryls_self_funded_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_fully_funded_submissions_registration_id_key" ON "ryls_fully_funded_submissions"("registration_id");

-- CreateIndex
CREATE INDEX "ryls_fully_funded_submissions_registration_id_idx" ON "ryls_fully_funded_submissions"("registration_id");

-- CreateIndex
CREATE INDEX "ryls_fully_funded_submissions_essay_file_id_idx" ON "ryls_fully_funded_submissions"("essay_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_fully_funded_submissions_essay_file_id_key" ON "ryls_fully_funded_submissions"("essay_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_self_funded_submissions_registration_id_key" ON "ryls_self_funded_submissions"("registration_id");

-- CreateIndex
CREATE INDEX "ryls_self_funded_submissions_registration_id_idx" ON "ryls_self_funded_submissions"("registration_id");

-- CreateIndex
CREATE INDEX "ryls_self_funded_submissions_headshot_file_id_idx" ON "ryls_self_funded_submissions"("headshot_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_self_funded_submissions_headshot_file_id_key" ON "ryls_self_funded_submissions"("headshot_file_id");

-- CreateIndex
CREATE INDEX "ryls_payments_status_idx" ON "ryls_payments"("status");

-- CreateIndex
CREATE INDEX "ryls_payments_type_idx" ON "ryls_payments"("type");

-- AddForeignKey
ALTER TABLE "ryls_fully_funded_submissions" ADD CONSTRAINT "ryls_fully_funded_submissions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_fully_funded_submissions" ADD CONSTRAINT "ryls_fully_funded_submissions_essay_file_id_fkey" FOREIGN KEY ("essay_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_self_funded_submissions" ADD CONSTRAINT "ryls_self_funded_submissions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_self_funded_submissions" ADD CONSTRAINT "ryls_self_funded_submissions_headshot_file_id_fkey" FOREIGN KEY ("headshot_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
