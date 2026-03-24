/*
  Warnings:

  - You are about to drop the column `meta_description` on the `academies` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title` on the `academies` table. All the data in the column will be lost.
  - You are about to drop the column `path_slug` on the `academies` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `academies` table. All the data in the column will be lost.
  - You are about to drop the column `rating_count` on the `academies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `academies` will be added. If there are existing duplicate values, this will fail.

*/

-- DropIndex
DROP INDEX "academies_path_slug_idx";

-- DropIndex
DROP INDEX "academies_rating_idx";

-- ===== STEP 1: Rename path_slug to slug =====
ALTER TABLE "academies" RENAME COLUMN "path_slug" TO "slug";

-- ===== STEP 2: Drop unused columns from academies =====
ALTER TABLE "academies" 
  DROP COLUMN "meta_description",
  DROP COLUMN "meta_title",
  DROP COLUMN "rating",
  DROP COLUMN "rating_count";

-- ===== STEP 3: Add pixel_id to academies =====
ALTER TABLE "academies" ADD COLUMN "pixel_id" VARCHAR(100);

-- ===== STEP 4: Add updated_at with default to sub-tables =====
ALTER TABLE "academy_faqs" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "academy_features" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "academy_pricing" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "academy_testimonials" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ===== STEP 5: Rename academy_topics to academy_themes =====
ALTER TABLE "academy_topics" RENAME TO "academy_themes";

-- Add updated_at to academy_themes
ALTER TABLE "academy_themes" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rename index
ALTER INDEX "academy_topics_academy_id_order_idx" RENAME TO "academy_themes_academy_id_order_idx";

-- Update foreign key constraint name
ALTER TABLE "academy_themes" RENAME CONSTRAINT "academy_topics_academy_id_fkey" TO "academy_themes_academy_id_fkey";

-- ===== STEP 6: Rename academy_sessions to academy_topics =====
ALTER TABLE "academy_sessions" RENAME TO "academy_topics";

-- Rename topic_id to theme_id
ALTER TABLE "academy_topics" RENAME COLUMN "topic_id" TO "theme_id";

-- Add academy_id column (nullable first)
ALTER TABLE "academy_topics" ADD COLUMN "academy_id" INTEGER;

-- Populate academy_id from themes
UPDATE "academy_topics" t
SET "academy_id" = th."academy_id"
FROM "academy_themes" th
WHERE t."theme_id" = th."id";

-- Make academy_id NOT NULL
ALTER TABLE "academy_topics" ALTER COLUMN "academy_id" SET NOT NULL;

-- Add description column
ALTER TABLE "academy_topics" ADD COLUMN "description" TEXT;

-- Add updated_at
ALTER TABLE "academy_topics" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rename index
ALTER INDEX "academy_sessions_topic_id_order_idx" RENAME TO "academy_topics_theme_id_order_idx";

-- Update foreign key constraint
ALTER TABLE "academy_topics" RENAME CONSTRAINT "academy_sessions_topic_id_fkey" TO "academy_topics_theme_id_fkey";

-- ===== STEP 7: Add new indexes =====
CREATE UNIQUE INDEX "academies_slug_key" ON "academies"("slug");
CREATE INDEX "academies_slug_idx" ON "academies"("slug");
CREATE INDEX "academy_topics_academy_id_order_idx" ON "academy_topics"("academy_id", "order");

-- ===== STEP 8: Add foreign key for academy_topics -> academies =====
ALTER TABLE "academy_topics" 
  ADD CONSTRAINT "academy_topics_academy_id_fkey" 
  FOREIGN KEY ("academy_id") REFERENCES "academies"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ===== STEP 9: Fix user_settings.key to nullable =====
ALTER TABLE "user_settings" ALTER COLUMN "key" DROP NOT NULL;
