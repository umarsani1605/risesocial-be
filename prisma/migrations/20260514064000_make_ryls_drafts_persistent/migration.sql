DROP INDEX IF EXISTS "ryls_draft_registrations_expires_at_idx";

ALTER TABLE "ryls_draft_registrations"
DROP COLUMN IF EXISTS "expires_at";
