-- DropIndex
DROP INDEX "academy_enrollments_status_idx";

-- DropIndex
DROP INDEX "academy_enrollments_user_id_academy_id_status_idx";

-- AlterTable
ALTER TABLE "academy_enrollments" DROP COLUMN "status";

-- CreateIndex
CREATE INDEX "academy_enrollments_user_id_academy_id_idx" ON "academy_enrollments"("user_id", "academy_id");
