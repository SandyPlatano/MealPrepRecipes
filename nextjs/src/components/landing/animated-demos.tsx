"use client";

import { useState, useEffect } from "react";
import { Heart, Plus, Check, Clock, Users, ChefHat, ShoppingCart } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED DEMOS - Neo-Brutalist/Retro Style
// Bold borders, retro shadows, vibrant animations
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Recipe Card Demo - Shows favoriting and adding to plan
// ─────────────────────────────────────────────────────────────────────────────

export function RecipeCardDemo() {
  const [phase, setPhase] = useState(0);
  // Phase 0: Card visible
  // Phase 1: Heart fills
  // Phase 2: Add to Plan clicked
  // Phase 3: Success badge appears

  useEffect(() => {
    const phases = [1500, 1000, 1000, 2000]; // Duration for each phase
    let timeout: NodeJS.Timeout;

    const advance = () => {
      setPhase((p) => {
        const next = (p + 1) % 4;
        timeout = setTimeout(advance, phases[next]);
        return next;
      });
    };

    timeout = setTimeout(advance, phases[0]);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      {/* Recipe Card */}
      <div className={`
        bg-card rounded-xl border-2 border-black p-4
        transition-all duration-300
        ${phase >= 1 ? "shadow-retro" : ""}
      `}>
        {/* Image placeholder */}
        <div className="h-32 bg-secondary/30 rounded-lg border-2 border-black mb-3 flex items-center justify-center">
          <span className="text-4xl">🍕</span>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-foreground mb-2">Margherita Pizza</h4>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> 45min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> 4 servings
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className={`
            p-2 rounded-full border-2 border-black transition-all duration-300
            ${phase >= 1
              ? "bg-red-50 text-red-500 shadow-retro"
              : "bg-muted text-muted-foreground hover:shadow-retro"
            }
          `}>
            <Heart className={`w-4 h-4 ${phase >= 1 ? "fill-current" : ""}`} />
          </button>
          <button className={`
            flex-1 relative h-10 rounded-full border-2 border-black
            text-sm font-medium transition-all duration-500 ease-out
            ${phase >= 2
              ? "bg-secondary text-foreground shadow-retro"
              : "bg-muted text-muted-foreground"
            }
          `}>
            {/* Default state: Add to Plan */}
            <span className={`
              absolute inset-0 flex items-center justify-center gap-2
              transition-opacity duration-300
              ${phase >= 3 ? "opacity-0" : "opacity-100"}
            `}>
              <Plus className="w-4 h-4" /> Add to Plan
            </span>
            {/* Success state: Added! */}
            <span className={`
              absolute inset-0 flex items-center justify-center gap-2
              transition-opacity duration-300
              ${phase >= 3 ? "opacity-100" : "opacity-0"}
            `}>
              <Check className="w-4 h-4" /> Added!
            </span>
          </button>
        </div>
      </div>

      {/* Success Badge */}
      <div className={`
        absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-semibold
        px-2.5 py-1 rounded-full border-2 border-black shadow-retro
        transition-all duration-300
        ${phase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-75"}
      `}>
        +1 Recipe
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meal Plan Demo - Weekly calendar with recipe assignment
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const RECIPES = ["🍕", "🍝", "🥗", "🍜", "🍔"];
const COOKS = ["Alex", "Sam", "Alex", "Sam", "Both"];

export function MealPlanDemo() {
  const [filledDays, setFilledDays] = useState(0);
  const [showCooks, setShowCooks] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const sequence = async () => {
      // Reset
      setFilledDays(0);
      setShowCooks(false);
      setComplete(false);

      // Fill days one by one
      for (let i = 1; i <= 5; i++) {
        await new Promise(r => timeout = setTimeout(r, 600));
        setFilledDays(i);
      }

      // Show cook names
      await new Promise(r => timeout = setTimeout(r, 800));
      setShowCooks(true);

      // Show complete
      await new Promise(r => timeout = setTimeout(r, 1000));
      setComplete(true);

      // Wait and restart
      await new Promise(r => timeout = setTimeout(r, 2500));
      sequence();
    };

    sequence();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full max-w-[320px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground text-sm">This Week</h4>
        <span className={`
          relative text-xs px-3 py-1 rounded-full border-2 border-black transition-all duration-500 min-w-[90px] h-6 inline-flex items-center justify-center
          ${complete ? "bg-green-50 text-green-600 shadow-retro" : "bg-muted text-muted-foreground"}
        `}>
          {/* Progress state */}
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${complete ? "opacity-0" : "opacity-100"}`}>
            {filledDays}/5 planned
          </span>
          {/* Complete state */}
          <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${complete ? "opacity-100" : "opacity-0"}`}>
            ✓ Complete
          </span>
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-5 gap-2">
        {DAYS.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-[10px] text-muted-foreground mb-2 font-medium">{day}</div>
            <div className={`
              h-16 rounded-lg border-2 border-black flex flex-col items-center justify-center
              transition-all duration-300
              ${i < filledDays
                ? "bg-secondary/20 shadow-retro"
                : "bg-muted border-dashed"
              }
            `}>
              {i < filledDays && (
                <>
                  <span className="text-xl mb-1">{RECIPES[i]}</span>
                  <span className={`
                    text-[9px] text-muted-foreground transition-opacity duration-300
                    ${showCooks ? "opacity-100" : "opacity-0"}
                  `}>
                    {COOKS[i]}
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shopping List Demo - Animated checkbox progression
// ─────────────────────────────────────────────────────────────────────────────

const SHOPPING_ITEMS = [
  { name: "San Marzano Tomatoes", qty: "2 cans" },
  { name: "Fresh Mozzarella", qty: "200g" },
  { name: "Fresh Basil", qty: "1 bunch" },
  { name: "Olive Oil", qty: "as needed" },
  { name: "Pizza Dough", qty: "500g" },
];

export function ShoppingListDemo() {
  const [checked, setChecked] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const sequence = async () => {
      // Reset
      setChecked([]);
      setComplete(false);

      // Check items one by one
      for (let i = 0; i < SHOPPING_ITEMS.length; i++) {
        await new Promise(r => timeout = setTimeout(r, 800));
        setChecked(prev => [...prev, i]);
      }

      // Show complete
      await new Promise(r => timeout = setTimeout(r, 600));
      setComplete(true);

      // Wait and restart
      await new Promise(r => timeout = setTimeout(r, 2500));
      sequence();
    };

    sequence();
    return () => clearTimeout(timeout);
  }, []);

  const progress = (checked.length / SHOPPING_ITEMS.length) * 100;

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground text-sm">Shopping List</h4>
        <span className="ml-auto text-xs text-muted-foreground">
          {checked.length}/{SHOPPING_ITEMS.length}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {SHOPPING_ITEMS.map((item, i) => (
          <div
            key={item.name}
            className={`
              flex items-center gap-3 p-2.5 rounded-lg border-2 border-black transition-all duration-300
              ${checked.includes(i)
                ? "bg-green-50 shadow-retro"
                : "bg-card"
              }
            `}
          >
            <div className={`
              relative w-4 h-4 rounded border-2 border-black flex items-center justify-center
              transition-all duration-300
              ${checked.includes(i)
                ? "bg-green-500"
                : ""
              }
            `}>
              <Check className={`w-3 h-3 text-white transition-all duration-200 ${checked.includes(i) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
            </div>
            <span className={`
              flex-1 text-sm transition-all duration-300
              ${checked.includes(i) ? "text-muted-foreground line-through" : "text-foreground"}
            `}>
              {item.name}
            </span>
            <span className="text-xs text-muted-foreground">{item.qty}</span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden border-2 border-black">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Complete Message */}
      <div className={`
        mt-3 text-center text-xs transition-all duration-300
        ${complete ? "text-green-600 opacity-100" : "text-muted-foreground opacity-0"}
      `}>
        ✓ List Complete! Ready to shop.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cook Mode Demo - Step-by-step instructions with timer
// ─────────────────────────────────────────────────────────────────────────────

const COOKING_STEPS = [
  { step: 1, text: "Preheat oven to 450°F", time: null },
  { step: 2, text: "Roll out pizza dough", time: null },
  { step: 3, text: "Add tomato sauce", time: null },
  { step: 4, text: "Add mozzarella", time: null },
  { step: 5, text: "Bake until golden", time: "12:00" },
];

export function CookModeDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState("12:00");
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const sequence = async () => {
      // Reset
      setCurrentStep(0);
      setTimer("12:00");
      setTimerActive(false);

      // Progress through steps
      for (let i = 0; i < COOKING_STEPS.length; i++) {
        setCurrentStep(i);

        // If last step, start timer animation
        if (i === COOKING_STEPS.length - 1) {
          setTimerActive(true);
          // Animate timer countdown briefly
          const times = ["12:00", "11:45", "11:30", "11:15", "11:00"];
          for (const t of times) {
            await new Promise(r => timeout = setTimeout(r, 400));
            setTimer(t);
          }
        } else {
          await new Promise(r => timeout = setTimeout(r, 1200));
        }
      }

      // Wait and restart
      await new Promise(r => timeout = setTimeout(r, 2000));
      sequence();
    };

    sequence();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full max-w-[280px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ChefHat className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-foreground text-sm">Cook Mode</h4>
        <span className={`ml-auto text-sm text-foreground font-semibold transition-opacity duration-300 ${timerActive ? "opacity-100 animate-pulse" : "opacity-0"}`}>
          ⏱ {timer}
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {COOKING_STEPS.map((step, i) => (
          <div
            key={step.step}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 border-black transition-all duration-300
              ${i === currentStep
                ? "bg-primary/10 shadow-retro"
                : i < currentStep
                  ? "bg-green-50"
                  : "bg-card"
              }
            `}
          >
            <div className={`
              relative w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs font-semibold
              transition-all duration-300
              ${i === currentStep
                ? "bg-primary text-primary-foreground"
                : i < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }
            `}>
              {/* Step number */}
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${i < currentStep ? "opacity-0" : "opacity-100"}`}>
                {step.step}
              </span>
              {/* Checkmark */}
              <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${i < currentStep ? "opacity-100" : "opacity-0"}`}>
                ✓
              </span>
            </div>
            <span className={`
              flex-1 text-sm transition-all duration-300
              ${i === currentStep
                ? "text-foreground font-medium"
                : i < currentStep
                  ? "text-muted-foreground"
                  : "text-muted-foreground"
              }
            `}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
