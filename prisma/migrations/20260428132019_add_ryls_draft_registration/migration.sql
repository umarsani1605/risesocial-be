-- CreateTable
CREATE TABLE "ryls_draft_registrations" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "resume_token" VARCHAR(64) NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "form_data" JSONB NOT NULL,
    "scholarship_type" VARCHAR(50),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ryls_draft_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ryls_draft_registrations_resume_token_key" ON "ryls_draft_registrations"("resume_token");

-- CreateIndex
CREATE INDEX "ryls_draft_registrations_email_idx" ON "ryls_draft_registrations"("email");

-- CreateIndex
CREATE INDEX "ryls_draft_registrations_expires_at_idx" ON "ryls_draft_registrations"("expires_at");
