import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ 
      error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.' 
    });
  }

  // Get recipe data from request body
  const { recipe } = req.body;

  if (!recipe || !recipe.title) {
    return res.status(400).json({ error: 'Recipe data with title is required' });
  }

  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current recipes
    const { data: currentData, error: fetchError } = await supabase
      .from('recipes')
      .select('data')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's okay, we'll create it
      console.error('Error fetching recipes:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch existing recipes' });
    }

    const currentRecipes = currentData?.data || [];

    // Create new recipe with required fields
    const newRecipe = {
      ...recipe,
      id: recipe.id || Date.now().toString(),
      createdAt: recipe.createdAt || new Date().toISOString(),
      rating: recipe.rating || null,
      notes: recipe.notes || '',
    };

    // Add the new recipe to the array
    const updatedRecipes = [...currentRecipes, newRecipe];

    // Save back to Supabase
    const { error: updateError } = await supabase
      .from('recipes')
      .upsert({ id: 1, data: updatedRecipes }, { onConflict: 'id' });

    if (updateError) {
      console.error('Error saving recipe to Supabase:', updateError);
      return res.status(500).json({ error: 'Failed to save recipe' });
    }

    return res.status(200).json({ 
      success: true, 
      recipe: newRecipe,
      message: `Recipe "${newRecipe.title}" added successfully!`
    });
  } catch (error) {
    console.error('Error adding recipe:', error);
    return res.status(500).json({
      error: error.message || 'Failed to add recipe',
    });
  }
}

