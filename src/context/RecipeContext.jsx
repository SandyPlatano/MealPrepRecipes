import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storage } from '../utils/localStorage';
import { supabaseStorage, shouldUseSupabase } from '../utils/supabaseStorage';
import { sampleRecipes } from '../utils/recipeParser';

const RecipeContext = createContext(null);

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track last update timestamps for polling (use ref to avoid closure issues)
  const lastUpdateTimesRef = useRef({
    recipes: null,
    favorites: null,
    history: null,
  });
  
  // Track if we're currently saving to prevent conflicts
  const savingRef = useRef({ recipes: false, favorites: false, history: false });

  // Load from Supabase or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      let savedRecipes, savedFavorites, savedHistory;
      let recipesUpdatedAt = null;
      let favoritesUpdatedAt = null;
      let historyUpdatedAt = null;

      if (shouldUseSupabase()) {
        // Load from Supabase with metadata
        const recipesResult = await supabaseStorage.recipes.getWithMetadata();
        savedRecipes = recipesResult.data;
        recipesUpdatedAt = recipesResult.updatedAt;
        
        const favoritesResult = await supabaseStorage.favorites.getWithMetadata();
        savedFavorites = favoritesResult.data;
        favoritesUpdatedAt = favoritesResult.updatedAt;
        
        const historyResult = await supabaseStorage.history.getWithMetadata();
        savedHistory = historyResult.data;
        historyUpdatedAt = historyResult.updatedAt;
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
      
      setRecipes(savedRecipes || []);
      setFavorites(savedFavorites || []);
      setHistory(savedHistory || []);
      lastUpdateTimesRef.current = {
        recipes: recipesUpdatedAt,
        favorites: favoritesUpdatedAt,
        history: historyUpdatedAt,
      };
      setLoading(false);
    };

    loadData();
  }, []);

  // Save to Supabase or localStorage whenever recipes change
  useEffect(() => {
    if (!loading && recipes.length > 0) {
      savingRef.current.recipes = true;
      const saveRecipes = async () => {
        if (shouldUseSupabase()) {
          try {
            await supabaseStorage.recipes.set(recipes);
            // Update last update time after successful save
            const result = await supabaseStorage.recipes.getWithMetadata();
            if (result.updatedAt) {
              lastUpdateTimesRef.current.recipes = result.updatedAt;
            }
          } catch (err) {
            console.error('Error saving recipes to Supabase:', err);
            // Fall back to localStorage
            storage.recipes.set(recipes);
          }
        } else {
          storage.recipes.set(recipes);
        }
        savingRef.current.recipes = false;
      };
      saveRecipes();
    }
  }, [recipes, loading]);

  // Save to Supabase or localStorage whenever favorites change
  useEffect(() => {
    if (!loading) {
      savingRef.current.favorites = true;
      const saveFavorites = async () => {
        if (shouldUseSupabase()) {
          try {
            await supabaseStorage.favorites.set(favorites);
            // Update last update time after successful save
            const result = await supabaseStorage.favorites.getWithMetadata();
            if (result.updatedAt) {
              lastUpdateTimesRef.current.favorites = result.updatedAt;
            }
          } catch (err) {
            console.error('Error saving favorites to Supabase:', err);
            // Fall back to localStorage
            storage.favorites.set(favorites);
          }
        } else {
          storage.favorites.set(favorites);
        }
        savingRef.current.favorites = false;
      };
      saveFavorites();
    }
  }, [favorites, loading]);

  // Save to Supabase or localStorage whenever history changes
  useEffect(() => {
    if (!loading) {
      savingRef.current.history = true;
      const saveHistory = async () => {
        if (shouldUseSupabase()) {
          try {
            await supabaseStorage.history.set(history);
            // Update last update time after successful save
            const result = await supabaseStorage.history.getWithMetadata();
            if (result.updatedAt) {
              lastUpdateTimesRef.current.history = result.updatedAt;
            }
          } catch (err) {
            console.error('Error saving history to Supabase:', err);
            // Fall back to localStorage
            storage.history.set(history);
          }
        } else {
          storage.history.set(history);
        }
        savingRef.current.history = false;
      };
      saveHistory();
    }
  }, [history, loading]);

  // Periodic polling to sync data from Supabase (every 5 seconds)
  useEffect(() => {
    if (!shouldUseSupabase() || loading) return;

    const POLL_INTERVAL = 5000; // 5 seconds
    let pollInterval;
    let isTabActive = true;

    // Track tab visibility to pause polling when inactive
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const pollForUpdates = async () => {
      // Skip polling if tab is inactive or we're currently saving
      if (!isTabActive || 
          savingRef.current.recipes || 
          savingRef.current.favorites || 
          savingRef.current.history) {
        return;
      }

      try {
        // Check for recipe updates
        if (!savingRef.current.recipes) {
          const recipesResult = await supabaseStorage.recipes.getWithMetadata();
          const remoteUpdatedAt = recipesResult.updatedAt;
          const localUpdatedAt = lastUpdateTimesRef.current.recipes;

          if (remoteUpdatedAt && remoteUpdatedAt !== localUpdatedAt) {
            // Check if remote is actually newer
            if (!localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
              setRecipes(recipesResult.data || []);
              lastUpdateTimesRef.current.recipes = remoteUpdatedAt;
            }
          }
        }

        // Check for favorites updates
        if (!savingRef.current.favorites) {
          const favoritesResult = await supabaseStorage.favorites.getWithMetadata();
          const remoteUpdatedAt = favoritesResult.updatedAt;
          const localUpdatedAt = lastUpdateTimesRef.current.favorites;

          if (remoteUpdatedAt && remoteUpdatedAt !== localUpdatedAt) {
            if (!localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
              setFavorites(favoritesResult.data || []);
              lastUpdateTimesRef.current.favorites = remoteUpdatedAt;
            }
          }
        }

        // Check for history updates
        if (!savingRef.current.history) {
          const historyResult = await supabaseStorage.history.getWithMetadata();
          const remoteUpdatedAt = historyResult.updatedAt;
          const localUpdatedAt = lastUpdateTimesRef.current.history;

          if (remoteUpdatedAt && remoteUpdatedAt !== localUpdatedAt) {
            if (!localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
              setHistory(historyResult.data || []);
              lastUpdateTimesRef.current.history = remoteUpdatedAt;
            }
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    };

    // Start polling
    pollInterval = setInterval(pollForUpdates, POLL_INTERVAL);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading]);

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

