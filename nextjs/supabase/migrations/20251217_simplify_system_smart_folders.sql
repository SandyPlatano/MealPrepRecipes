-- Simplify System Smart Folders
-- Keep only "Highly Rated" and "Never Cooked" to start
-- Make emoji and color optional to demonstrate flexibility

-- ============================================
-- MAKE EMOJI AND COLOR OPTIONAL
-- ============================================

ALTER TABLE system_smart_folders
ALTER COLUMN emoji DROP NOT NULL,
ALTER COLUMN color DROP NOT NULL;

-- ============================================
-- REMOVE UNWANTED SYSTEM SMART FOLDERS
-- ============================================

DELETE FROM system_smart_folders
WHERE id IN ('quick_meals', 'recently_added', 'frequently_cooked');

-- ============================================
-- UPDATE REMAINING FOLDERS
-- Keep "Highly Rated" with emoji/color (to show styled example)
-- Update "Never Cooked" without emoji/color (to show unstyled is possible)
-- ============================================

UPDATE system_smart_folders
SET
  emoji = NULL,
  color = NULL,
  sort_order = 2
WHERE id = 'never_cooked';

UPDATE system_smart_folders
SET sort_order = 1
WHERE id = 'highly_rated';
