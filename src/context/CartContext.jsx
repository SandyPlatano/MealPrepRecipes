import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storage } from '../utils/localStorage';
import { supabaseStorage, shouldUseSupabase } from '../utils/supabaseStorage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastUpdateTimeRef = useRef(null);
  const savingRef = useRef(false);

  // Load from Supabase or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      let savedCart;
      let cartUpdatedAt = null;
      
      if (shouldUseSupabase()) {
        // Load from Supabase with metadata
        const cartResult = await supabaseStorage.cart.getWithMetadata();
        savedCart = cartResult.data;
        cartUpdatedAt = cartResult.updatedAt;
      } else {
        // Load from localStorage
        savedCart = storage.cart.get();
      }
      
      setCartItems(savedCart || []);
      lastUpdateTimeRef.current = cartUpdatedAt;
      setLoading(false);
    };

    loadData();
  }, []);

  // Save to Supabase or localStorage whenever cart changes
  useEffect(() => {
    if (!loading) {
      savingRef.current = true;
      const saveCart = async () => {
        if (shouldUseSupabase()) {
          try {
            await supabaseStorage.cart.set(cartItems);
            // Update last update time after successful save
            const result = await supabaseStorage.cart.getWithMetadata();
            if (result.updatedAt) {
              lastUpdateTimeRef.current = result.updatedAt;
            }
          } catch (err) {
            console.error('Error saving cart to Supabase:', err);
            // Fall back to localStorage
            storage.cart.set(cartItems);
          }
        } else {
          storage.cart.set(cartItems);
        }
        savingRef.current = false;
      };
      saveCart();
    }
  }, [cartItems, loading]);

  // Periodic polling to sync cart data from Supabase (every 5 seconds)
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
      if (!isTabActive || savingRef.current) {
        return;
      }

      try {
        const cartResult = await supabaseStorage.cart.getWithMetadata();
        const remoteUpdatedAt = cartResult.updatedAt;
        const localUpdatedAt = lastUpdateTimeRef.current;

        if (remoteUpdatedAt && remoteUpdatedAt !== localUpdatedAt) {
          // Check if remote is actually newer
          if (!localUpdatedAt || new Date(remoteUpdatedAt) > new Date(localUpdatedAt)) {
            setCartItems(cartResult.data || []);
            lastUpdateTimeRef.current = remoteUpdatedAt;
          }
        }
      } catch (error) {
        console.error('Error polling for cart updates:', error);
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

  const addToCart = (recipe) => {
    // Check if already in cart
    if (cartItems.some(item => item.recipeId === recipe.id)) {
      return false; // Already in cart
    }

    const cartItem = {
      recipeId: recipe.id,
      recipe: recipe,
      cook: null, // Will be assigned in cart UI
      day: null,  // Will be assigned in cart UI
    };

    setCartItems(prev => [...prev, cartItem]);
    return true;
  };

  const removeFromCart = (recipeId) => {
    setCartItems(prev => prev.filter(item => item.recipeId !== recipeId));
  };

  const updateCartItem = (recipeId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item.recipeId === recipeId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (recipeId) => {
    return cartItems.some(item => item.recipeId === recipeId);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  const getAssignedItems = () => {
    return cartItems.filter(item => item.cook && item.day);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    isInCart,
    getCartCount,
    getAssignedItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

