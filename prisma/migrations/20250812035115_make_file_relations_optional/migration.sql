-- DropForeignKey
ALTER TABLE "ryls_fully_funded_submissions" DROP CONSTRAINT "ryls_fully_funded_submissions_essay_file_id_fkey";

-- DropForeignKey
ALTER TABLE "ryls_self_funded_submissions" DROP CONSTRAINT "ryls_self_funded_submissions_headshot_file_id_fkey";

-- AlterTable
ALTER TABLE "ryls_fully_funded_submissions" ALTER COLUMN "essay_file_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ryls_self_funded_submissions" ALTER COLUMN "headshot_file_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ryls_fully_funded_submissions" ADD CONSTRAINT "ryls_fully_funded_submissions_essay_file_id_fkey" FOREIGN KEY ("essay_file_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_self_funded_submissions" ADD CONSTRAINT "ryls_self_funded_submissions_headshot_file_id_fkey" FOREIGN KEY ("headshot_file_id") REFERENCES "file_uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
