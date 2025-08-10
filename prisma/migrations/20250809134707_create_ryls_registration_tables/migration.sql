-- CreateEnum
CREATE TYPE "RylsRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RylsGender" AS ENUM ('FEMALE', 'MALE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "RylsDiscoverSource" AS ENUM ('RISE_INSTAGRAM', 'OTHER_INSTAGRAM', 'FRIENDS', 'OTHER');

-- CreateEnum
CREATE TYPE "RylsScholarshipType" AS ENUM ('FULLY_FUNDED', 'SELF_FUNDED');

-- CreateEnum
CREATE TYPE "FileUploadType" AS ENUM ('ESSAY', 'HEADSHOT');

-- CreateTable
CREATE TABLE "ryls_registrations" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "residence" VARCHAR(255) NOT NULL,
    "nationality" VARCHAR(255) NOT NULL,
    "second_nationality" VARCHAR(255),
    "whatsapp" VARCHAR(50) NOT NULL,
    "institution" VARCHAR(255) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "RylsGender" NOT NULL,
    "discover_source" "RylsDiscoverSource" NOT NULL,
    "discover_other_text" TEXT,
    "scholarship_type" "RylsScholarshipType" NOT NULL,
    "status" "RylsRegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "submission_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryls_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" SERIAL NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "upload_type" "FileUploadType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryls_fully_funded_submissions" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "essay_topic" TEXT NOT NULL,
    "essay_file_id" INTEGER NOT NULL,
    "essay_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryls_fully_funded_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ryls_self_funded_submissions" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "passport_number" VARCHAR(100) NOT NULL,
    "need_visa" BOOLEAN NOT NULL,
    "headshot_file_id" INTEGER NOT NULL,
    "read_policies" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ryls_self_funded_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_registrations_email_key" ON "ryls_registrations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_registrations_submission_id_key" ON "ryls_registrations"("submission_id");

-- CreateIndex
CREATE INDEX "ryls_registrations_status_idx" ON "ryls_registrations"("status");

-- CreateIndex
CREATE INDEX "ryls_registrations_scholarship_type_idx" ON "ryls_registrations"("scholarship_type");

-- CreateIndex
CREATE INDEX "ryls_registrations_created_at_idx" ON "ryls_registrations"("created_at" DESC);

-- CreateIndex
CREATE INDEX "file_uploads_upload_type_idx" ON "file_uploads"("upload_type");

-- CreateIndex
CREATE INDEX "file_uploads_created_at_idx" ON "file_uploads"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_fully_funded_submissions_registration_id_key" ON "ryls_fully_funded_submissions"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "ryls_self_funded_submissions_registration_id_key" ON "ryls_self_funded_submissions"("registration_id");

-- AddForeignKey
ALTER TABLE "ryls_fully_funded_submissions" ADD CONSTRAINT "ryls_fully_funded_submissions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_fully_funded_submissions" ADD CONSTRAINT "ryls_fully_funded_submissions_essay_file_id_fkey" FOREIGN KEY ("essay_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_self_funded_submissions" ADD CONSTRAINT "ryls_self_funded_submissions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ryls_self_funded_submissions" ADD CONSTRAINT "ryls_self_funded_submissions_headshot_file_id_fkey" FOREIGN KEY ("headshot_file_id") REFERENCES "file_uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;