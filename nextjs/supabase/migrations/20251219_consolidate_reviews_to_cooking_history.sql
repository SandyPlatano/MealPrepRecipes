-- Migration: Consolidate Reviews into Cooking History
-- This migration updates avg_rating to be calculated from cooking_history instead of reviews

-- Add photo_url column to cooking_history table
ALTER TABLE cooking_history ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Drop existing trigger that updates avg_rating from reviews (if exists)
DROP TRIGGER IF EXISTS trigger_update_recipe_review_stats ON reviews;
DROP FUNCTION IF EXISTS update_recipe_review_stats() CASCADE;

-- Create new trigger function to update avg_rating from cooking_history
CREATE OR REPLACE FUNCTION update_recipe_rating_from_history() RETURNS TRIGGER AS $$
DECLARE
  target_recipe_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_recipe_id := OLD.recipe_id;
  ELSE
    target_recipe_id := NEW.recipe_id;
  END IF;

  -- Update recipe's avg_rating from cooking_history ratings (only non-null)
  UPDATE recipes
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM cooking_history
      WHERE recipe_id = target_recipe_id
      AND rating IS NOT NULL
    ),
    review_count = (
      SELECT COUNT(*)
      FROM cooking_history
      WHERE recipe_id = target_recipe_id
      AND rating IS NOT NULL
    )
  WHERE id = target_recipe_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on cooking_history for INSERT, UPDATE, DELETE
CREATE TRIGGER trigger_update_recipe_rating_from_history
  AFTER INSERT OR UPDATE OR DELETE ON cooking_history
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_rating_from_history();

-- Recalculate all existing recipe avg_ratings from cooking_history
UPDATE recipes r
SET
  avg_rating = (
    SELECT ROUND(AVG(ch.rating)::numeric, 1)
    FROM cooking_history ch
    WHERE ch.recipe_id = r.id
    AND ch.rating IS NOT NULL
  ),
  review_count = (
    SELECT COUNT(*)
    FROM cooking_history ch
    WHERE ch.recipe_id = r.id
    AND ch.rating IS NOT NULL
  );

-- Create storage bucket for cooking history photos (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cooking-history-photos', 'cooking-history-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for cooking-history-photos bucket
CREATE POLICY "Users can upload cooking history photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cooking-history-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their cooking history photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cooking-history-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their cooking history photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cooking-history-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Cooking history photos are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cooking-history-photos');
