-- Supabase Database Schema for Meal Prep Recipe Manager
-- Run this SQL in your Supabase SQL Editor after creating your project

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cooking history table
CREATE TABLE IF NOT EXISTS cooking_history (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - but allow public read/write for shared household
-- This is fine for a personal/couple app. For production, you'd want proper authentication.
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for shared household)
CREATE POLICY "Allow public read access" ON recipes FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON recipes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON recipes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON recipes FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON favorites FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON favorites FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON favorites FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON cart FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON cart FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON cart FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON cart FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON cooking_history FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON cooking_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON cooking_history FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON cooking_history FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON templates FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON templates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON templates FOR DELETE USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at on each table
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cooking_history_updated_at BEFORE UPDATE ON cooking_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for shopping list files (for email downloads)
-- Note: Storage buckets must be created through the Supabase Dashboard or using the SQL below
-- Go to Storage section in Supabase Dashboard, or run the following:

-- Create storage bucket for shopping lists (public access for downloads)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shopping-lists', 'shopping-lists', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to shopping lists
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'shopping-lists');

-- Allow authenticated/anon insert (for uploading shopping lists)
CREATE POLICY "Allow uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'shopping-lists');

