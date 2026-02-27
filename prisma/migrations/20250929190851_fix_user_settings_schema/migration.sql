/*
  Warnings:

  - You are about to drop the column `job_notification` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `program_notification` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `promo_notification` on the `user_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,key]` on the table `user_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `user_settings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_settings_user_id_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "job_notification",
DROP COLUMN "program_notification",
DROP COLUMN "promo_notification",
ADD COLUMN     "key" VARCHAR(100),
ADD COLUMN     "value" JSONB;

-- CreateIndex
CREATE INDEX "user_settings_user_id_idx" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "user_settings_key_idx" ON "user_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key_key" ON "user_settings"("user_id", "key");

-- RenameIndex
ALTER INDEX "uk_enrollment_user_bootcamp" RENAME TO "uk_enrollment_user_academy";
