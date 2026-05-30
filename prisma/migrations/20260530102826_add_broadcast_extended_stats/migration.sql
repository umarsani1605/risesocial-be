-- Add the remaining Brevo aggregated-report counters to email_broadcasts.
ALTER TABLE "email_broadcasts"
  ADD COLUMN "requests" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "soft_bounces" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "spam_reports" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "blocked" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "invalid" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "unsubscribed" INTEGER NOT NULL DEFAULT 0;
