/*
  Warnings:

  - You are about to drop the column `enrollment_id` on the `cohort_certificates` table. All the data in the column will be lost.
  - You are about to drop the `cohort_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[placement_id]` on the table `cohort_certificates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placement_id` to the `cohort_certificates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cohort_certificates" DROP CONSTRAINT "cohort_certificates_enrollment_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_enrollments" DROP CONSTRAINT "cohort_enrollments_academy_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_enrollments" DROP CONSTRAINT "cohort_enrollments_cohort_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_enrollments" DROP CONSTRAINT "cohort_enrollments_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_enrollments" DROP CONSTRAINT "cohort_enrollments_user_id_fkey";

-- DropIndex
DROP INDEX "cohort_certificates_enrollment_id_key";

-- AlterTable
ALTER TABLE "cohort_certificates" DROP COLUMN "enrollment_id",
ADD COLUMN     "placement_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "cohort_enrollments";

-- CreateTable
CREATE TABLE "academy_enrollments" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_placements" (
    "id" SERIAL NOT NULL,
    "academy_enrollment_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academy_enrollments_transaction_id_key" ON "academy_enrollments"("transaction_id");

-- CreateIndex
CREATE INDEX "academy_enrollments_user_id_academy_id_status_idx" ON "academy_enrollments"("user_id", "academy_id", "status");

-- CreateIndex
CREATE INDEX "academy_enrollments_status_idx" ON "academy_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_placements_academy_enrollment_id_key" ON "cohort_placements"("academy_enrollment_id");

-- CreateIndex
CREATE INDEX "cohort_placements_cohort_id_idx" ON "cohort_placements"("cohort_id");

-- CreateIndex
CREATE INDEX "cohort_placements_academy_id_idx" ON "cohort_placements"("academy_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_placements_cohort_id_user_id_key" ON "cohort_placements"("cohort_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_certificates_placement_id_key" ON "cohort_certificates"("placement_id");

-- AddForeignKey
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "cohort_certificates_placement_id_fkey" FOREIGN KEY ("placement_id") REFERENCES "cohort_placements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_placements" ADD CONSTRAINT "cohort_placements_academy_enrollment_id_fkey" FOREIGN KEY ("academy_enrollment_id") REFERENCES "academy_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_placements" ADD CONSTRAINT "cohort_placements_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_placements" ADD CONSTRAINT "cohort_placements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_placements" ADD CONSTRAINT "cohort_placements_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
