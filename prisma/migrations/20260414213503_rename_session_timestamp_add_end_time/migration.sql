-- AlterTable: rename session_timestamp to session_start_time and add session_end_time
ALTER TABLE "cohort_modules" RENAME COLUMN "session_timestamp" TO "session_start_time";

-- AlterTable: add session_end_time column
ALTER TABLE "cohort_modules" ADD COLUMN "session_end_time" TIMESTAMP(3);

-- DropIndex
DROP INDEX IF EXISTS "cohort_modules_session_timestamp_idx";

-- CreateIndex
CREATE INDEX "cohort_modules_session_start_time_idx" ON "cohort_modules"("session_start_time");
