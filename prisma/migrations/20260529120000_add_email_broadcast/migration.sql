-- CreateEnum
CREATE TYPE "EmailBroadcastStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "email_broadcasts" (
    "id" SERIAL NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "body_text" TEXT NOT NULL,
    "sender_email" VARCHAR(255) NOT NULL,
    "sender_name" VARCHAR(255) NOT NULL,
    "segment" VARCHAR(50) NOT NULL,
    "segment_criteria" JSONB,
    "recipient_count" INTEGER NOT NULL DEFAULT 0,
    "brevo_tag" VARCHAR(100),
    "message_ids" TEXT[],
    "status" "EmailBroadcastStatus" NOT NULL DEFAULT 'DRAFT',
    "error_detail" TEXT,
    "created_by" INTEGER NOT NULL,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opens" INTEGER NOT NULL DEFAULT 0,
    "unique_opens" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "unique_clicks" INTEGER NOT NULL DEFAULT 0,
    "hard_bounces" INTEGER NOT NULL DEFAULT 0,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_broadcasts_brevo_tag_key" ON "email_broadcasts"("brevo_tag");

-- CreateIndex
CREATE INDEX "email_broadcasts_status_idx" ON "email_broadcasts"("status");

-- CreateIndex
CREATE INDEX "email_broadcasts_created_by_idx" ON "email_broadcasts"("created_by");

-- CreateIndex
CREATE INDEX "email_broadcasts_created_at_idx" ON "email_broadcasts"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "email_broadcasts" ADD CONSTRAINT "email_broadcasts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

