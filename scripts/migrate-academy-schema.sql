-- Academy Schema Refactor Migration
-- Date: 2026-03-07
-- Description: Restructure academy database schema
-- 
-- Changes:
-- 1. Simplify academies table (remove rating, meta fields, rename path_slug)
-- 2. Add updated_at to sub-tables
-- 3. Rename academy_topics → academy_themes
-- 4. Rename academy_sessions → academy_topics (with new structure)

-- ============================================
-- STEP 1: MODIFY ACADEMIES TABLE
-- ============================================

-- Rename column
ALTER TABLE academies RENAME COLUMN path_slug TO slug;

-- Drop columns
ALTER TABLE academies 
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS rating_count,
  DROP COLUMN IF EXISTS meta_title,
  DROP COLUMN IF EXISTS meta_description;

-- Add column
ALTER TABLE academies ADD COLUMN pixel_id VARCHAR(100);

-- Update indexes
DROP INDEX IF EXISTS academies_path_slug_idx;
CREATE INDEX academies_slug_idx ON academies(slug);
DROP INDEX IF EXISTS academies_rating_idx;

-- ============================================
-- STEP 2: ADD UPDATED_AT TO SUB-TABLES
-- ============================================

-- academy_pricing
ALTER TABLE academy_pricing 
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- academy_features
ALTER TABLE academy_features 
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- academy_testimonials
ALTER TABLE academy_testimonials 
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- academy_faqs
ALTER TABLE academy_faqs 
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ============================================
-- STEP 3: RENAME ACADEMY_TOPICS → ACADEMY_THEMES
-- ============================================

-- Rename table
ALTER TABLE academy_topics RENAME TO academy_themes;

-- Add updated_at
ALTER TABLE academy_themes 
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Indexes are automatically renamed by PostgreSQL:
-- academy_topics_academy_id_order_idx → academy_themes_academy_id_order_idx
-- academy_topics_pkey → academy_themes_pkey

-- ============================================
-- STEP 4: RENAME ACADEMY_SESSIONS → ACADEMY_TOPICS
-- ============================================

-- Rename table
ALTER TABLE academy_sessions RENAME TO academy_topics;

-- Rename column
ALTER TABLE academy_topics RENAME COLUMN topic_id TO theme_id;

-- Add new columns
ALTER TABLE academy_topics 
  ADD COLUMN academy_id INT,
  ADD COLUMN description TEXT,
  ADD COLUMN updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Populate academy_id from themes
UPDATE academy_topics t
SET academy_id = th.academy_id
FROM academy_themes th
WHERE t.theme_id = th.id;

-- Make academy_id NOT NULL after population
ALTER TABLE academy_topics ALTER COLUMN academy_id SET NOT NULL;

-- ============================================
-- STEP 5: UPDATE FOREIGN KEY CONSTRAINTS
-- ============================================

-- Drop old constraint (renamed from academy_sessions)
ALTER TABLE academy_topics DROP CONSTRAINT IF EXISTS academy_sessions_topic_id_fkey;

-- Add constraint for theme_id
ALTER TABLE academy_topics 
  ADD CONSTRAINT academy_topics_theme_id_fkey 
  FOREIGN KEY (theme_id) REFERENCES academy_themes(id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add constraint for academy_id
ALTER TABLE academy_topics 
  ADD CONSTRAINT academy_topics_academy_id_fkey 
  FOREIGN KEY (academy_id) REFERENCES academies(id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- STEP 6: CREATE NEW INDEXES
-- ============================================

-- Index for academy_topics by academy_id
CREATE INDEX academy_topics_academy_id_order_idx ON academy_topics(academy_id, "order");

-- Index for academy_topics by theme_id (replaces old topic_id index)
CREATE INDEX academy_topics_theme_id_order_idx ON academy_topics(theme_id, "order");

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check academies structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'academies' 
ORDER BY ordinal_position;

-- Check academy_themes exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'academy_themes'
) as academy_themes_exists;

-- Check academy_topics structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'academy_topics' 
ORDER BY ordinal_position;

-- Check all topics have academy_id
SELECT COUNT(*) as topics_without_academy_id
FROM academy_topics
WHERE academy_id IS NULL;
-- Expected: 0

-- Check academy_id matches theme's academy_id
SELECT COUNT(*) as mismatched_academy_ids
FROM academy_topics t
JOIN academy_themes th ON t.theme_id = th.id
WHERE t.academy_id != th.academy_id;
-- Expected: 0

-- Check record counts
SELECT 
  'academies' as table_name, COUNT(*) as count FROM academies
UNION ALL
SELECT 'academy_themes', COUNT(*) FROM academy_themes
UNION ALL
SELECT 'academy_topics', COUNT(*) FROM academy_topics
UNION ALL
SELECT 'academy_pricing', COUNT(*) FROM academy_pricing
UNION ALL
SELECT 'academy_features', COUNT(*) FROM academy_features
UNION ALL
SELECT 'academy_instructors', COUNT(*) FROM academy_instructors
UNION ALL
SELECT 'academy_testimonials', COUNT(*) FROM academy_testimonials
UNION ALL
SELECT 'academy_faqs', COUNT(*) FROM academy_faqs;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
