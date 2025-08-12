-- DropForeignKey
ALTER TABLE "ryls_payments" DROP CONSTRAINT "ryls_payments_registration_id_fkey";

-- AlterTable
ALTER TABLE "ryls_payments" ALTER COLUMN "registration_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ryls_payments" ADD CONSTRAINT "ryls_payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "ryls_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
