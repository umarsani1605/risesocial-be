/*
  Warnings:

  - You are about to drop the column `portfolio_url` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `responded_at` on the `job_applications` table. All the data in the column will be lost.
  - You are about to drop the column `reviewed_at` on the `job_applications` table. All the data in the column will be lost.
  - The primary key for the `user_saved_jobs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,job_id]` on the table `job_applications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,job_id]` on the table `user_saved_jobs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- DropIndex
DROP INDEX "job_applications_applied_at_idx";

-- DropIndex
DROP INDEX "job_applications_job_id_user_id_key";

-- DropIndex
DROP INDEX "user_saved_jobs_user_id_saved_at_idx";

-- AlterTable
ALTER TABLE "job_applications" DROP COLUMN "portfolio_url",
DROP COLUMN "responded_at",
DROP COLUMN "reviewed_at",
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "user_saved_jobs" DROP CONSTRAINT "user_saved_jobs_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "user_saved_jobs_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "testimonials" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_status_idx" ON "testimonials"("status");

-- CreateIndex
CREATE INDEX "testimonials_featured_idx" ON "testimonials"("featured");

-- CreateIndex
CREATE INDEX "testimonials_country_idx" ON "testimonials"("country");

-- CreateIndex
CREATE INDEX "job_applications_job_id_idx" ON "job_applications"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_user_id_job_id_key" ON "job_applications"("user_id", "job_id");

-- CreateIndex
CREATE INDEX "user_saved_jobs_user_id_idx" ON "user_saved_jobs"("user_id");

-- CreateIndex
CREATE INDEX "user_saved_jobs_job_id_idx" ON "user_saved_jobs"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_saved_jobs_user_id_job_id_key" ON "user_saved_jobs"("user_id", "job_id");
