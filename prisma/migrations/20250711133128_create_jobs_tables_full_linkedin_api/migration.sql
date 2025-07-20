/*
  Warnings:

  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `first_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `last_name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `avatar` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterEnum
ALTER TYPE "EnrollmentStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "first_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "last_name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "avatar" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "website_url" VARCHAR(500),
    "industry" VARCHAR(255),
    "headquarters" VARCHAR(255),
    "description" TEXT,
    "linkedin_url" VARCHAR(500),
    "linkedin_slug" VARCHAR(255),
    "linkedin_employees" INTEGER,
    "linkedin_size" VARCHAR(100),
    "linkedin_slogan" VARCHAR(500),
    "linkedin_followers" INTEGER,
    "linkedin_type" VARCHAR(100),
    "linkedin_founded_date" VARCHAR(4),
    "linkedin_specialties" JSONB,
    "linkedin_locations" JSONB,
    "linkedin_is_recruitment_agency" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_locations" (
    "id" SERIAL NOT NULL,
    "city" VARCHAR(255),
    "region" VARCHAR(255),
    "country" VARCHAR(255) NOT NULL,
    "timezone" VARCHAR(100),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "raw_location_data" JSONB,
    "location_type" VARCHAR(100),
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "company_id" INTEGER NOT NULL,
    "location_id" INTEGER,
    "description" TEXT NOT NULL,
    "employment_type" VARCHAR(50) NOT NULL,
    "seniority_level" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "direct_apply" BOOLEAN NOT NULL DEFAULT true,
    "external_url" VARCHAR(500),
    "posted_date" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "source_type" VARCHAR(100),
    "source" VARCHAR(100),
    "source_domain" VARCHAR(255),
    "source_url" VARCHAR(500),
    "linkedin_job_id" VARCHAR(255),
    "recruiter_name" VARCHAR(255),
    "recruiter_title" VARCHAR(255),
    "recruiter_url" VARCHAR(500),
    "salary_raw" VARCHAR(500),
    "location_requirements_raw" TEXT,
    "meta_title" VARCHAR(255),
    "meta_description" VARCHAR(500),
    "api_created_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_ai_insights" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "ai_salary_currency" VARCHAR(3),
    "ai_salary_value" INTEGER,
    "ai_salary_min_value" INTEGER,
    "ai_salary_max_value" INTEGER,
    "ai_salary_unit_text" VARCHAR(100),
    "ai_benefits" TEXT,
    "ai_experience_level" VARCHAR(100),
    "ai_work_arrangement" VARCHAR(100),
    "ai_work_arrangement_days" INTEGER,
    "ai_remote_location" VARCHAR(255),
    "ai_remote_location_derived" VARCHAR(255),
    "ai_key_skills" JSONB,
    "ai_core_responsibilities" TEXT,
    "ai_requirements_summary" TEXT,
    "ai_working_hours" VARCHAR(100),
    "ai_job_language" VARCHAR(100),
    "ai_visa_sponsorship" BOOLEAN,
    "ai_hiring_manager_name" VARCHAR(255),
    "ai_hiring_manager_email" VARCHAR(255),
    "salary_confidence" DECIMAL(3,2),
    "skills_confidence" DECIMAL(3,2),
    "requirements_confidence" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" SERIAL NOT NULL,
    "job_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "cover_letter" TEXT,
    "resume_url" VARCHAR(500),
    "portfolio_url" VARCHAR(500),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_saved_jobs" (
    "user_id" INTEGER NOT NULL,
    "job_id" INTEGER NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_saved_jobs_pkey" PRIMARY KEY ("user_id","job_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_industry_idx" ON "companies"("industry");

-- CreateIndex
CREATE INDEX "companies_linkedin_size_idx" ON "companies"("linkedin_size");

-- CreateIndex
CREATE INDEX "companies_linkedin_employees_idx" ON "companies"("linkedin_employees");

-- CreateIndex
CREATE INDEX "job_locations_country_idx" ON "job_locations"("country");

-- CreateIndex
CREATE INDEX "job_locations_is_remote_idx" ON "job_locations"("is_remote");

-- CreateIndex
CREATE INDEX "job_locations_latitude_longitude_idx" ON "job_locations"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "job_locations_city_region_country_key" ON "job_locations"("city", "region", "country");

-- CreateIndex
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");

-- CreateIndex
CREATE INDEX "jobs_location_id_idx" ON "jobs"("location_id");

-- CreateIndex
CREATE INDEX "jobs_employment_type_idx" ON "jobs"("employment_type");

-- CreateIndex
CREATE INDEX "jobs_seniority_level_idx" ON "jobs"("seniority_level");

-- CreateIndex
CREATE INDEX "jobs_posted_date_idx" ON "jobs"("posted_date" DESC);

-- CreateIndex
CREATE INDEX "jobs_source_idx" ON "jobs"("source");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_company_id_slug_key" ON "jobs"("company_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "job_ai_insights_job_id_key" ON "job_ai_insights"("job_id");

-- CreateIndex
CREATE INDEX "job_ai_insights_ai_experience_level_idx" ON "job_ai_insights"("ai_experience_level");

-- CreateIndex
CREATE INDEX "job_ai_insights_ai_work_arrangement_idx" ON "job_ai_insights"("ai_work_arrangement");

-- CreateIndex
CREATE INDEX "job_ai_insights_ai_salary_min_value_ai_salary_max_value_idx" ON "job_ai_insights"("ai_salary_min_value", "ai_salary_max_value");

-- CreateIndex
CREATE INDEX "job_applications_user_id_idx" ON "job_applications"("user_id");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_applied_at_idx" ON "job_applications"("applied_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_job_id_user_id_key" ON "job_applications"("job_id", "user_id");

-- CreateIndex
CREATE INDEX "user_saved_jobs_user_id_saved_at_idx" ON "user_saved_jobs"("user_id", "saved_at" DESC);

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_user_id_idx" ON "bootcamp_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_bootcamp_id_idx" ON "bootcamp_enrollments"("bootcamp_id");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_enrollment_status_idx" ON "bootcamp_enrollments"("enrollment_status");

-- CreateIndex
CREATE INDEX "bootcamp_enrollments_enrolled_at_idx" ON "bootcamp_enrollments"("enrolled_at" DESC);

-- CreateIndex
CREATE INDEX "bootcamp_faqs_bootcamp_id_faq_order_idx" ON "bootcamp_faqs"("bootcamp_id", "faq_order");

-- CreateIndex
CREATE INDEX "bootcamp_features_bootcamp_id_feature_order_idx" ON "bootcamp_features"("bootcamp_id", "feature_order");

-- CreateIndex
CREATE INDEX "bootcamp_pricing_bootcamp_id_tier_order_idx" ON "bootcamp_pricing"("bootcamp_id", "tier_order");

-- CreateIndex
CREATE INDEX "bootcamp_sessions_topic_id_session_order_idx" ON "bootcamp_sessions"("topic_id", "session_order");

-- CreateIndex
CREATE INDEX "bootcamp_testimonials_bootcamp_id_testimonial_order_idx" ON "bootcamp_testimonials"("bootcamp_id", "testimonial_order");

-- CreateIndex
CREATE INDEX "bootcamp_topics_bootcamp_id_topic_order_idx" ON "bootcamp_topics"("bootcamp_id", "topic_order");

-- CreateIndex
CREATE INDEX "bootcamps_category_status_idx" ON "bootcamps"("category", "status");

-- CreateIndex
CREATE INDEX "bootcamps_status_idx" ON "bootcamps"("status");

-- CreateIndex
CREATE INDEX "bootcamps_path_slug_idx" ON "bootcamps"("path_slug");

-- CreateIndex
CREATE INDEX "bootcamps_created_at_idx" ON "bootcamps"("created_at" DESC);

-- CreateIndex
CREATE INDEX "bootcamps_rating_idx" ON "bootcamps"("rating" DESC);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "job_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_ai_insights" ADD CONSTRAINT "job_ai_insights_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "user_saved_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_saved_jobs" ADD CONSTRAINT "user_saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "bootcamp_enrollments_bootcamp_id_user_id_key" RENAME TO "uk_enrollment_user_bootcamp";
