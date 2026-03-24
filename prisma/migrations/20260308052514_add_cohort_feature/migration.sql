-- AlterTable
ALTER TABLE "academy_themes" RENAME CONSTRAINT "academy_topics_pkey" TO "academy_themes_pkey";

-- AlterTable
ALTER TABLE "academy_topics" RENAME CONSTRAINT "academy_sessions_pkey" TO "academy_topics_pkey";

-- CreateTable
CREATE TABLE "cohorts" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'not_started',
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_modules" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "session_timestamp" TIMESTAMP(3),
    "meeting_link" VARCHAR(500),
    "attendance_link" VARCHAR(500),
    "assignment_link" VARCHAR(500),
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_module_attachments" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "cohort_module_id" INTEGER NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "label" VARCHAR(150),
    "file_path" VARCHAR(500),
    "file_mime" VARCHAR(100),
    "file_size_kb" INTEGER,
    "url" VARCHAR(1000),
    "embed_provider" VARCHAR(50),
    "order" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_module_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_enrollments" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_id" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "enrolled_at" TIMESTAMP(3),
    "completion_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_mentors" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "avatar" VARCHAR(500),
    "job_title" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohort_certificates" (
    "id" SERIAL NOT NULL,
    "academy_id" INTEGER NOT NULL,
    "cohort_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "certificate_code" VARCHAR(100) NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "academy_title" VARCHAR(255) NOT NULL,
    "cohort_name" VARCHAR(100) NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_path" VARCHAR(500),
    "file_url" VARCHAR(500),
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohort_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cohorts_academy_id_idx" ON "cohorts"("academy_id");

-- CreateIndex
CREATE INDEX "cohorts_status_idx" ON "cohorts"("status");

-- CreateIndex
CREATE INDEX "cohort_modules_academy_id_idx" ON "cohort_modules"("academy_id");

-- CreateIndex
CREATE INDEX "cohort_modules_session_timestamp_idx" ON "cohort_modules"("session_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_modules_cohort_id_order_key" ON "cohort_modules"("cohort_id", "order");

-- CreateIndex
CREATE INDEX "cohort_module_attachments_cohort_module_id_order_idx" ON "cohort_module_attachments"("cohort_module_id", "order");

-- CreateIndex
CREATE INDEX "cohort_module_attachments_cohort_id_idx" ON "cohort_module_attachments"("cohort_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_enrollments_transaction_id_key" ON "cohort_enrollments"("transaction_id");

-- CreateIndex
CREATE INDEX "cohort_enrollments_user_id_idx" ON "cohort_enrollments"("user_id");

-- CreateIndex
CREATE INDEX "cohort_enrollments_academy_id_idx" ON "cohort_enrollments"("academy_id");

-- CreateIndex
CREATE INDEX "cohort_enrollments_transaction_id_idx" ON "cohort_enrollments"("transaction_id");

-- CreateIndex
CREATE INDEX "cohort_enrollments_status_idx" ON "cohort_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_enrollments_cohort_id_user_id_key" ON "cohort_enrollments"("cohort_id", "user_id");

-- CreateIndex
CREATE INDEX "cohort_mentors_cohort_id_idx" ON "cohort_mentors"("cohort_id");

-- CreateIndex
CREATE INDEX "cohort_mentors_academy_id_idx" ON "cohort_mentors"("academy_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_certificates_enrollment_id_key" ON "cohort_certificates"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_certificates_certificate_code_key" ON "cohort_certificates"("certificate_code");

-- CreateIndex
CREATE INDEX "cohort_certificates_user_id_idx" ON "cohort_certificates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "cohort_certificates_cohort_id_user_id_key" ON "cohort_certificates"("cohort_id", "user_id");

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_modules" ADD CONSTRAINT "cohort_modules_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_modules" ADD CONSTRAINT "cohort_modules_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_module_attachments" ADD CONSTRAINT "cohort_module_attachments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_module_attachments" ADD CONSTRAINT "cohort_module_attachments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_module_attachments" ADD CONSTRAINT "cohort_module_attachments_cohort_module_id_fkey" FOREIGN KEY ("cohort_module_id") REFERENCES "cohort_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_enrollments" ADD CONSTRAINT "cohort_enrollments_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_mentors" ADD CONSTRAINT "cohort_mentors_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_mentors" ADD CONSTRAINT "cohort_mentors_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "cohort_certificates_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "cohort_certificates_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "cohort_certificates_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "cohort_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohort_certificates" ADD CONSTRAINT "cohort_certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
