"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Recipe } from "@/types/recipe";
import type { DayOfWeek } from "@/types/meal-plan";
import { type CartItem, createCartItem } from "@/types/cart";
import { getWeekStart } from "@/types/meal-plan";

interface CartContextType {
  items: CartItem[];
  weekStart: Date;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (recipe: Recipe) => boolean;
  removeFromCart: (itemId: string) => void;
  removeByRecipeId: (recipeId: string) => void;
  updateCartItem: (itemId: string, updates: { cook?: string | null; day?: DayOfWeek | null }) => void;
  clearCart: () => void;
  isInCart: (recipeId: string) => boolean;
  getCartCount: () => number;
  setWeekStart: (date: Date) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "meal-plan-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Initialize with null to avoid hydration mismatch, will be set in useEffect
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setItems(parsed.items || []);
        if (parsed.weekStart) {
          setWeekStart(new Date(parsed.weekStart));
        } else {
          setWeekStart(getWeekStart(new Date()));
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        setWeekStart(getWeekStart(new Date()));
      }
    } else {
      setWeekStart(getWeekStart(new Date()));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded && weekStart) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          weekStart: weekStart.toISOString(),
        })
      );
    }
  }, [items, weekStart, isLoaded]);

  const addToCart = useCallback((recipe: Recipe): boolean => {
    const alreadyInCart = items.some((item) => item.recipeId === recipe.id);
    if (alreadyInCart) {
      return false;
    }
    setItems((prev) => [...prev, createCartItem(recipe)]);
    return true;
  }, [items]);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const removeByRecipeId = useCallback((recipeId: string) => {
    setItems((prev) => prev.filter((item) => item.recipeId !== recipeId));
  }, []);

  const updateCartItem = useCallback(
    (itemId: string, updates: { cook?: string | null; day?: DayOfWeek | null }) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (recipeId: string): boolean => {
      return items.some((item) => item.recipeId === recipeId);
    },
    [items]
  );

  const getCartCount = useCallback((): number => {
    return items.length;
  }, [items]);

  // Provide a default weekStart if not loaded yet to avoid null errors
  const effectiveWeekStart = weekStart || getWeekStart(new Date());

  return (
    <CartContext.Provider
      value={{
        items,
        weekStart: effectiveWeekStart,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        removeByRecipeId,
        updateCartItem,
        clearCart,
        isInCart,
        getCartCount,
        setWeekStart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
