/*
  Warnings:

  - You are about to drop the column `status` on the `ryls_registrations` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ryls_registrations_email_key";

-- DropIndex
DROP INDEX "ryls_registrations_status_idx";

-- AlterTable
ALTER TABLE "ryls_registrations" DROP COLUMN "status",
ADD COLUMN     "payment_status" "RylsRegistrationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "ryls_registrations_payment_status_idx" ON "ryls_registrations"("payment_status");
