/*
  Warnings:

  - You are about to drop the column `faq_order` on the `bootcamp_faqs` table. All the data in the column will be lost.
  - You are about to drop the column `feature_order` on the `bootcamp_features` table. All the data in the column will be lost.
  - The primary key for the `bootcamp_instructors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `instructor_id` on the `bootcamp_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `instructor_order` on the `bootcamp_instructors` table. All the data in the column will be lost.
  - You are about to drop the column `tier_order` on the `bootcamp_pricing` table. All the data in the column will be lost.
  - You are about to drop the column `session_order` on the `bootcamp_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `testimonial_order` on the `bootcamp_testimonials` table. All the data in the column will be lost.
  - You are about to drop the column `topic_order` on the `bootcamp_topics` table. All the data in the column will be lost.
  - You are about to drop the `instructors` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `bootcamp_instructors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `bootcamp_instructors` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bootcamp_instructors" DROP CONSTRAINT "bootcamp_instructors_instructor_id_fkey";

-- DropIndex
DROP INDEX "bootcamp_faqs_bootcamp_id_faq_order_idx";

-- DropIndex
DROP INDEX "bootcamp_features_bootcamp_id_feature_order_idx";

-- DropIndex
DROP INDEX "bootcamp_pricing_bootcamp_id_tier_order_idx";

-- DropIndex
DROP INDEX "bootcamp_sessions_topic_id_session_order_idx";

-- DropIndex
DROP INDEX "bootcamp_testimonials_bootcamp_id_testimonial_order_idx";

-- DropIndex
DROP INDEX "bootcamp_topics_bootcamp_id_topic_order_idx";

-- AlterTable
ALTER TABLE "bootcamp_faqs" DROP COLUMN "faq_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "bootcamp_features" DROP COLUMN "feature_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "bootcamp_instructors" DROP CONSTRAINT "bootcamp_instructors_pkey",
DROP COLUMN "instructor_id",
DROP COLUMN "instructor_order",
ADD COLUMN     "avatar_url" VARCHAR(500),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "job_title" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(255) NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "updated_at" TIMESTAMP(3) NULL,
ADD CONSTRAINT "bootcamp_instructors_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "bootcamp_pricing" DROP COLUMN "tier_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "bootcamp_sessions" DROP COLUMN "session_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "bootcamp_testimonials" DROP COLUMN "testimonial_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "bootcamp_topics" DROP COLUMN "topic_order",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "instructors";

-- CreateIndex
CREATE INDEX "bootcamp_faqs_bootcamp_id_order_idx" ON "bootcamp_faqs"("bootcamp_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_features_bootcamp_id_order_idx" ON "bootcamp_features"("bootcamp_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_instructors_bootcamp_id_order_idx" ON "bootcamp_instructors"("bootcamp_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_instructors_name_idx" ON "bootcamp_instructors"("name");

-- CreateIndex
CREATE INDEX "bootcamp_pricing_bootcamp_id_order_idx" ON "bootcamp_pricing"("bootcamp_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_sessions_topic_id_order_idx" ON "bootcamp_sessions"("topic_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_testimonials_bootcamp_id_order_idx" ON "bootcamp_testimonials"("bootcamp_id", "order");

-- CreateIndex
CREATE INDEX "bootcamp_topics_bootcamp_id_order_idx" ON "bootcamp_topics"("bootcamp_id", "order");
