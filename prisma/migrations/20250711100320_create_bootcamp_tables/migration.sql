-- CreateEnum
CREATE TYPE "BootcampStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "bootcamps" (
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
    "status" "BootcampStatus" NOT NULL DEFAULT 'ACTIVE',
    "meta_title" VARCHAR(255),
    "meta_description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bootcamps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_pricing" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "original_price" INTEGER NOT NULL,
    "discount_price" INTEGER NOT NULL,
    "tier_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_features" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "feature_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_topics" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "topic_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_sessions" (
    "id" SERIAL NOT NULL,
    "topic_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "session_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255),
    "avatar_url" VARCHAR(500),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_instructors" (
    "bootcamp_id" INTEGER NOT NULL,
    "instructor_id" INTEGER NOT NULL,
    "instructor_order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "bootcamp_instructors_pkey" PRIMARY KEY ("bootcamp_id","instructor_id")
);

-- CreateTable
CREATE TABLE "bootcamp_testimonials" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "comment" TEXT NOT NULL,
    "testimonial_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_faqs" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "faq_order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootcamp_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootcamp_enrollments" (
    "id" SERIAL NOT NULL,
    "bootcamp_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pricing_tier_id" INTEGER,
    "enrollment_status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "bootcamp_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bootcamps_path_slug_key" ON "bootcamps"("path_slug");

-- CreateIndex
CREATE INDEX "instructors_name_idx" ON "instructors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bootcamp_enrollments_bootcamp_id_user_id_key" ON "bootcamp_enrollments"("bootcamp_id", "user_id");

-- AddForeignKey
ALTER TABLE "bootcamp_pricing" ADD CONSTRAINT "bootcamp_pricing_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_features" ADD CONSTRAINT "bootcamp_features_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_topics" ADD CONSTRAINT "bootcamp_topics_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_sessions" ADD CONSTRAINT "bootcamp_sessions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "bootcamp_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_instructors" ADD CONSTRAINT "bootcamp_instructors_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_instructors" ADD CONSTRAINT "bootcamp_instructors_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_testimonials" ADD CONSTRAINT "bootcamp_testimonials_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_faqs" ADD CONSTRAINT "bootcamp_faqs_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_bootcamp_id_fkey" FOREIGN KEY ("bootcamp_id") REFERENCES "bootcamps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bootcamp_enrollments" ADD CONSTRAINT "bootcamp_enrollments_pricing_tier_id_fkey" FOREIGN KEY ("pricing_tier_id") REFERENCES "bootcamp_pricing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
