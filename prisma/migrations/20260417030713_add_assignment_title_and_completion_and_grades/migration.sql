-- AlterTable
ALTER TABLE "cohort_certificates" ADD COLUMN     "grades_transcript" JSONB;

-- AlterTable
ALTER TABLE "cohort_modules" ADD COLUMN     "assignment_title" VARCHAR(255);

-- CreateTable
CREATE TABLE "cohort_assignment_completions" (
    "id" SERIAL NOT NULL,
    "cohort_module_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_assignment_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cohort_assignment_completions_user_id_idx" ON "cohort_assignment_completions"("user_id");

-- CreateIndex
CREATE INDEX "cohort_assignment_completions_cohort_module_id_idx" ON "cohort_assignment_completions"("cohort_module_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_assignment_completions_cohort_module_id_user_id_key" ON "cohort_assignment_completions"("cohort_module_id", "user_id");

-- AddForeignKey
ALTER TABLE "cohort_assignment_completions" ADD CONSTRAINT "cohort_assignment_completions_cohort_module_id_fkey" FOREIGN KEY ("cohort_module_id") REFERENCES "cohort_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_assignment_completions" ADD CONSTRAINT "cohort_assignment_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
