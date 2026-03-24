-- DropForeignKey
ALTER TABLE "cohort_enrollments" DROP CONSTRAINT "cohort_enrollments_academy_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_module_attachments" DROP CONSTRAINT "cohort_module_attachments_academy_id_fkey";

-- DropForeignKey
ALTER TABLE "cohort_modules" DROP CONSTRAINT "cohort_modules_academy_id_fkey";

-- AddForeignKey
ALTER TABLE "cohort_modules" ADD CONSTRAINT "cohort_modules_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_module_attachments" ADD CONSTRAINT "cohort_module_attachments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
