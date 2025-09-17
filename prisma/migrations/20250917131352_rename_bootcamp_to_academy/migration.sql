/*
  Warnings:

  - You are about to drop the `bootcamp_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_faqs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_features` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_instructors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_pricing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_testimonials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamp_topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bootcamps` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AcademyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "bootcamp_enrollments" DROP CONSTRAINT "bootcamp_enrollments_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_enrollments" DROP CONSTRAINT "bootcamp_enrollments_pricing_tier_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_enrollments" DROP CONSTRAINT "bootcamp_enrollments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_faqs" DROP CONSTRAINT "bootcamp_faqs_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_features" DROP CONSTRAINT "bootcamp_features_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_instructors" DROP CONSTRAINT "bootcamp_instructors_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_pricing" DROP CONSTRAINT "bootcamp_pricing_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_sessions" DROP CONSTRAINT "bootcamp_sessions_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_testimonials" DROP CONSTRAINT "bootcamp_testimonials_bootcamp_id_fkey";

-- DropForeignKey
ALTER TABLE "bootcamp_topics" DROP CONSTRAINT "bootcamp_topics_bootcamp_id_fkey";

-- DropTable
DROP TABLE "bootcamp_enrollments";

-- DropTable
DROP TABLE "bootcamp_faqs";

-- DropTable
DROP TABLE "bootcamp_features";

-- DropTable
DROP TABLE "bootcamp_instructors";

-- DropTable
DROP TABLE "bootcamp_pricing";

-- DropTable
DROP TABLE "bootcamp_sessions";

-- DropTable
DROP TABLE "bootcamp_testimonials";

-- DropTable
DROP TABLE "bootcamp_topics";

-- DropTable
DROP TABLE "bootcamps";

-- DropEnum
DROP TYPE "BootcampStatus";

-- CreateTable
CREATE TABLE "academies" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "path_slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration" VARCHAR(100),
    "format" VARCHAR(100),
    "category" VARCHAR(100),
    "image_url" VARCHAR(500),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "portfolio" BOOLEAN NOT NULL DEFAULT false,
    "status" "AcademyStatus" NOT NULL DEFAULT 'ACTIVE',
    "meta_title" VARCHAR(255),
    "meta_description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_pricing" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "original_price" INTEGER NOT NULL,
    "discount_price" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_features" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_topics" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_sessions" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_instructors" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255),
    "avatar_url" VARCHAR(500),
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_testimonials" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "comment" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_faqs" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academy_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academy_enrollments" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pricing_tier_id" INTEGER,
    "enrollment_status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "academy_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academies_path_slug_key" ON "academies"("path_slug");

-- CreateIndex
CREATE INDEX "academies_category_status_idx" ON "academies"("category", "status");

-- CreateIndex
CREATE INDEX "academies_status_idx" ON "academies"("status");

-- CreateIndex
CREATE INDEX "academies_path_slug_idx" ON "academies"("path_slug");

-- CreateIndex
CREATE INDEX "academies_created_at_idx" ON "academies"("created_at" DESC);

-- CreateIndex
CREATE INDEX "academies_rating_idx" ON "academies"("rating" DESC);

-- CreateIndex
CREATE INDEX "academy_pricing_academy_id_order_idx" ON "academy_pricing"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_features_academy_id_order_idx" ON "academy_features"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_topics_academy_id_order_idx" ON "academy_topics"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_sessions_topic_id_order_idx" ON "academy_sessions"("topic_id", "order");

-- CreateIndex
CREATE INDEX "academy_instructors_academy_id_order_idx" ON "academy_instructors"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_instructors_name_idx" ON "academy_instructors"("name");

-- CreateIndex
CREATE INDEX "academy_testimonials_academy_id_order_idx" ON "academy_testimonials"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_faqs_academy_id_order_idx" ON "academy_faqs"("academy_id", "order");

-- CreateIndex
CREATE INDEX "academy_enrollments_user_id_idx" ON "academy_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "academy_enrollments_academy_id_idx" ON "academy_enrollments"("academy_id");

-- CreateIndex
CREATE INDEX "academy_enrollments_enrollment_status_idx" ON "academy_enrollments"("enrollment_status");

-- CreateIndex
CREATE INDEX "academy_enrollments_enrolled_at_idx" ON "academy_enrollments"("enrolled_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uk_enrollment_user_bootcamp" ON "academy_enrollments"("academy_id", "user_id");

-- AddForeignKey
ALTER TABLE "academy_pricing" ADD CONSTRAINT "academy_pricing_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_features" ADD CONSTRAINT "academy_features_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_topics" ADD CONSTRAINT "academy_topics_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_sessions" ADD CONSTRAINT "academy_sessions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "academy_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_instructors" ADD CONSTRAINT "academy_instructors_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_testimonials" ADD CONSTRAINT "academy_testimonials_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_faqs" ADD CONSTRAINT "academy_faqs_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_pricing_tier_id_fkey" FOREIGN KEY ("pricing_tier_id") REFERENCES "academy_pricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academy_enrollments" ADD CONSTRAINT "academy_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
