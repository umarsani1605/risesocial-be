/*
  Warnings:

  - The values [APPROVED,REJECTED] on the enum `RylsRegistrationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RylsRegistrationStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');
ALTER TABLE "ryls_registrations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ryls_registrations" ALTER COLUMN "status" TYPE "RylsRegistrationStatus_new" USING ("status"::text::"RylsRegistrationStatus_new");
ALTER TYPE "RylsRegistrationStatus" RENAME TO "RylsRegistrationStatus_old";
ALTER TYPE "RylsRegistrationStatus_new" RENAME TO "RylsRegistrationStatus";
DROP TYPE "RylsRegistrationStatus_old";
ALTER TABLE "ryls_registrations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
