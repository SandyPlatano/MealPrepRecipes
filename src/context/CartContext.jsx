import { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/localStorage';
import { supabaseStorage, shouldUseSupabase } from '../utils/supabaseStorage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from Supabase or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      let savedCart;
      
      if (shouldUseSupabase()) {
        // Load from Supabase
        savedCart = await supabaseStorage.cart.get();
      } else {
        // Load from localStorage
        savedCart = storage.cart.get();
      }
      
      setCartItems(savedCart);
      setLoading(false);
    };

    loadData();
  }, []);

  // Save to Supabase or localStorage whenever cart changes
  useEffect(() => {
    if (!loading) {
      if (shouldUseSupabase()) {
        supabaseStorage.cart.set(cartItems).catch(err => {
          console.error('Error saving cart to Supabase:', err);
          // Fall back to localStorage
          storage.cart.set(cartItems);
        });
      } else {
        storage.cart.set(cartItems);
      }
    }
  }, [cartItems, loading]);

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

