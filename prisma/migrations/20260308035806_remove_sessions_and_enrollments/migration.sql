/*
  Warnings:

  - You are about to drop the `academy_enrollments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "academy_enrollments" DROP CONSTRAINT "academy_enrollments_academy_id_fkey";

-- DropForeignKey
ALTER TABLE "academy_enrollments" DROP CONSTRAINT "academy_enrollments_pricing_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "academy_enrollments" DROP CONSTRAINT "academy_enrollments_user_id_fkey";

-- AlterTable
ALTER TABLE "academy_faqs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "academy_features" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "academy_pricing" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "academy_testimonials" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "academy_themes" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "academy_topics" ALTER COLUMN "updated_at" DROP DEFAULT;

-- DropTable
DROP TABLE IF EXISTS "academy_enrollments";

-- DropTable
DROP TABLE IF EXISTS "academy_sessions";

-- DropEnum
DROP TYPE IF EXISTS "EnrollmentStatus";
