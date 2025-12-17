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
import { type CartItem, createCartItem, createCartItemWithAssignment } from "@/types/cart";
import { getWeekStart } from "@/types/meal-plan";

interface CartContextType {
  items: CartItem[];
  weekStart: Date;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (recipe: Recipe) => boolean;
  addToCartWithAssignment: (recipe: Recipe, day: DayOfWeek, cook: string | null, servingSize?: number | null) => boolean;
  removeFromCart: (itemId: string) => void;
  removeByRecipeId: (recipeId: string) => void;
  updateCartItem: (itemId: string, updates: { cook?: string | null; day?: DayOfWeek | null; servingSize?: number | null }) => void;
  clearCart: () => void;
  isInCart: (recipeId: string) => boolean;
  getCartCount: () => number;
  setWeekStart: (date: Date) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = "meal-plan-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Initialize with a consistent default to avoid hydration mismatch
  // This will be updated from localStorage in useEffect if a stored value exists
  // Using a fixed date ensures server and client render the same initial value
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date("2024-01-01")));
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
          // Update to current week if no stored weekStart
          setWeekStart(getWeekStart(new Date()));
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
        // Update to current week on parse error
        setWeekStart(getWeekStart(new Date()));
      }
    } else {
      // Update to current week if no stored cart
      setWeekStart(getWeekStart(new Date()));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
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

  const addToCartWithAssignment = useCallback((recipe: Recipe, day: DayOfWeek, cook: string | null, servingSize?: number | null): boolean => {
    const alreadyInCart = items.some((item) => item.recipeId === recipe.id);
    if (alreadyInCart) {
      return false;
    }
    setItems((prev) => [...prev, createCartItemWithAssignment(recipe, day, cook, servingSize ?? null)]);
    return true;
  }, [items]);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const removeByRecipeId = useCallback((recipeId: string) => {
    setItems((prev) => prev.filter((item) => item.recipeId !== recipeId));
  }, []);

  const updateCartItem = useCallback(
    (itemId: string, updates: { cook?: string | null; day?: DayOfWeek | null; servingSize?: number | null }) => {
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

  return (
    <CartContext.Provider
      value={{
        items,
        weekStart,
        isOpen,
        setIsOpen,
        addToCart,
        addToCartWithAssignment,
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
