import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/localStorage';
import { supabaseStorage, shouldUseSupabase } from '../utils/supabaseStorage';
import { sampleRecipes } from '../utils/recipeParser';

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      let savedRecipes, savedFavorites, savedHistory;

      if (shouldUseSupabase()) {
        // Load from Supabase
        savedRecipes = await supabaseStorage.recipes.get();
        savedFavorites = await supabaseStorage.favorites.get();
        savedHistory = await supabaseStorage.history.get();
      } else {
        // Load from localStorage
        savedRecipes = storage.recipes.get();
        savedFavorites = storage.favorites.get();
        savedHistory = storage.history.get();
      }
      
      // Initialize with sample recipes if no recipes exist
      if (!savedRecipes || savedRecipes.length === 0) {
        savedRecipes = sampleRecipes.map(recipe => ({
          ...recipe,
          id: recipe.id.toString(),
          createdAt: new Date().toISOString(),
          rating: null,
          notes: '',
        }));
        
        // Save initial recipes
        if (shouldUseSupabase()) {
          await supabaseStorage.recipes.set(savedRecipes);
        } else {
          storage.recipes.set(savedRecipes);
        }
      }
      
      setRecipes(savedRecipes);
      setFavorites(savedFavorites);
      setHistory(savedHistory);
      setLoading(false);
    };

    loadData();
  }, []);

  // Save to Supabase or localStorage whenever recipes change
  useEffect(() => {
    if (!loading && recipes.length > 0) {
      if (shouldUseSupabase()) {
        supabaseStorage.recipes.set(recipes).catch(err => {
          console.error('Error saving recipes to Supabase:', err);
          // Fall back to localStorage
          storage.recipes.set(recipes);
        });
      } else {
        storage.recipes.set(recipes);
      }
    }
  }, [recipes, loading]);

  // Save to Supabase or localStorage whenever favorites change
  useEffect(() => {
    if (!loading) {
      if (shouldUseSupabase()) {
        supabaseStorage.favorites.set(favorites).catch(err => {
          console.error('Error saving favorites to Supabase:', err);
          // Fall back to localStorage
          storage.favorites.set(favorites);
        });
      } else {
        storage.favorites.set(favorites);
      }
    }
  }, [favorites, loading]);

  // Save to Supabase or localStorage whenever history changes
  useEffect(() => {
    if (!loading) {
      if (shouldUseSupabase()) {
        supabaseStorage.history.set(history).catch(err => {
          console.error('Error saving history to Supabase:', err);
          // Fall back to localStorage
          storage.history.set(history);
        });
      } else {
        storage.history.set(history);
      }
    }
  }, [history, loading]);

  const addRecipe = (recipe) => {
    const newRecipe = {
      ...recipe,
      id: recipe.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setRecipes(prev => [...prev, newRecipe]);
    return newRecipe;
  };

  const updateRecipe = (id, updates) => {
    setRecipes(prev =>
      prev.map(recipe => (recipe.id === id ? { ...recipe, ...updates } : recipe))
    );
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== id));
    // Also remove from favorites if favorited
    setFavorites(prev => prev.filter(favId => favId !== id));
  };

  const toggleFavorite = (recipeId) => {
    setFavorites(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  const isFavorite = (recipeId) => {
    return favorites.includes(recipeId);
  };

  const getFavoriteRecipes = () => {
    return recipes.filter(recipe => favorites.includes(recipe.id));
  };

  const markAsCooked = (recipeId, date = new Date().toISOString()) => {
    const historyEntry = {
      recipeId,
      date,
      rating: null,
      notes: '',
    };
    setHistory(prev => [...prev, historyEntry]);
    return historyEntry;
  };

  const updateHistoryEntry = (recipeId, date, updates) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.recipeId === recipeId && entry.date === date
          ? { ...entry, ...updates }
          : entry
      )
    );
  };

  const getRecipeHistory = (recipeId) => {
    return history.filter(entry => entry.recipeId === recipeId).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  };

  const getLastMadeDate = (recipeId) => {
    const recipeHistory = getRecipeHistory(recipeId);
    return recipeHistory.length > 0 ? recipeHistory[0].date : null;
  };

  const getAllHistory = () => {
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getRecentHistory = (limit = 10) => {
    return getAllHistory().slice(0, limit);
  };

  const updateRecipeRating = (recipeId, rating) => {
    updateRecipe(recipeId, { rating });
  };

  const updateRecipeNotes = (recipeId, notes) => {
    updateRecipe(recipeId, { notes });
  };

  const value = {
    recipes,
    favorites,
    history,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    isFavorite,
    getFavoriteRecipes,
    markAsCooked,
    updateHistoryEntry,
    getRecipeHistory,
    getLastMadeDate,
    getAllHistory,
    getRecentHistory,
    updateRecipeRating,
    updateRecipeNotes,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
}

