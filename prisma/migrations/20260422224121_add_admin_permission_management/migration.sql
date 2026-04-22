/*
  Warnings:

  - You are about to drop the column `emailed_at` on the `cohort_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `cohort_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `issued_at` on the `cohort_certificates` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminAccessLevel" AS ENUM ('VIEWER', 'EDITOR');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';

-- AlterTable
ALTER TABLE "cohort_certificates" DROP COLUMN "emailed_at",
DROP COLUMN "file_url",
DROP COLUMN "issued_at";

-- CreateTable
CREATE TABLE "admin_permissions" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "available_levels" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "user_admin_permissions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permission_key" TEXT NOT NULL,
    "access_level" "AdminAccessLevel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_admin_permissions_user_id_idx" ON "user_admin_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_admin_permissions_user_id_permission_key_key" ON "user_admin_permissions"("user_id", "permission_key");

-- AddForeignKey
ALTER TABLE "user_admin_permissions" ADD CONSTRAINT "user_admin_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_admin_permissions" ADD CONSTRAINT "user_admin_permissions_permission_key_fkey" FOREIGN KEY ("permission_key") REFERENCES "admin_permissions"("key") ON DELETE CASCADE ON UPDATE CASCADE;
