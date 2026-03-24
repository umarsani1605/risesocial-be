-- AlterTable
ALTER TABLE "file_uploads" ADD COLUMN     "academy_id" INTEGER,
ADD COLUMN     "cohort_module_id" INTEGER;

-- CreateIndex
CREATE INDEX "file_uploads_cohort_module_id_idx" ON "file_uploads"("cohort_module_id");

-- CreateIndex
CREATE INDEX "file_uploads_academy_id_idx" ON "file_uploads"("academy_id");

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_cohort_module_id_fkey" FOREIGN KEY ("cohort_module_id") REFERENCES "cohort_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
