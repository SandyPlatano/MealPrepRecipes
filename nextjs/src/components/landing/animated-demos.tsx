"use client";

import { useState, useEffect } from "react";
import { Heart, Plus, Check, Clock, Users, ChefHat, ShoppingCart } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Browser Frame Wrapper - macOS style window chrome
// ─────────────────────────────────────────────────────────────

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-3 border-[#111] bg-[#1a1a1a] shadow-[8px_8px_0_#111] overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#111] border-b border-[#333]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-[#666] font-mono ml-2">babe what's for dinner</span>
      </div>
      {/* Content */}
      <div className="p-4 bg-[#0d0d0d]">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Recipe Card Demo - Shows favoriting and adding to plan
// ─────────────────────────────────────────────────────────────

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
    <BrowserFrame>
      <div className="relative w-full max-w-[280px] mx-auto">
        {/* Recipe Card */}
        <div className={`
          bg-[#1a1a1a] rounded-lg border-2 border-[#333] p-4
          transition-all duration-300
          ${phase >= 1 ? "border-[#FF4400]/50" : ""}
        `}>
          {/* Image placeholder */}
          <div className="h-32 bg-gradient-to-br from-[#FF4400]/20 to-[#FF4400]/5 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-4xl">🍕</span>
          </div>

          {/* Title */}
          <h4 className="font-mono font-bold text-white mb-2">Margherita Pizza</h4>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[#888] mb-4">
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
              p-2 rounded-lg border-2 transition-all duration-300
              ${phase >= 1
                ? "bg-red-500/20 border-red-500 text-red-500"
                : "border-[#333] text-[#666] hover:border-[#555]"
              }
            `}>
              <Heart className={`w-4 h-4 ${phase >= 1 ? "fill-current" : ""}`} />
            </button>
            <button className={`
              flex-1 relative h-10 rounded-lg
              font-mono text-sm font-bold transition-all duration-500 ease-out
              ${phase >= 2
                ? "bg-[#FF4400] text-white border-2 border-[#FF4400]"
                : "bg-[#222] text-[#888] border-2 border-[#333]"
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
          absolute -top-2 -right-2 bg-green-500 text-white text-xs font-mono font-bold
          px-2 py-1 rounded-full border-2 border-[#111]
          transition-all duration-300
          ${phase >= 3 ? "opacity-100 scale-100" : "opacity-0 scale-75"}
        `}>
          +1 Recipe
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Meal Plan Demo - Weekly calendar with recipe assignment
// ─────────────────────────────────────────────────────────────

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
    <BrowserFrame>
      <div className="w-full max-w-[320px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono font-bold text-white text-sm">This Week</h4>
          <span className={`
            relative text-xs font-mono px-2 py-1 rounded-full transition-all duration-500 min-w-[90px] h-6 inline-flex items-center justify-center
            ${complete ? "bg-green-500/20 text-green-400" : "bg-[#222] text-[#666]"}
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
              <div className="text-[10px] text-[#666] font-mono mb-2">{day}</div>
              <div className={`
                h-16 rounded-lg border-2 flex flex-col items-center justify-center
                transition-all duration-300
                ${i < filledDays
                  ? "bg-[#FF4400]/10 border-[#FF4400]/50"
                  : "bg-[#111] border-[#333] border-dashed"
                }
              `}>
                {i < filledDays && (
                  <>
                    <span className="text-xl mb-1">{RECIPES[i]}</span>
                    <span className={`
                      text-[9px] font-mono text-[#888] transition-opacity duration-300
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
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Shopping List Demo - Animated checkbox progression
// ─────────────────────────────────────────────────────────────

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
    <BrowserFrame>
      <div className="w-full max-w-[280px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-4 h-4 text-[#FF4400]" />
          <h4 className="font-mono font-bold text-white text-sm">Shopping List</h4>
          <span className="ml-auto text-xs text-[#666] font-mono">
            {checked.length}/{SHOPPING_ITEMS.length}
          </span>
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          {SHOPPING_ITEMS.map((item, i) => (
            <div
              key={item.name}
              className={`
                flex items-center gap-3 p-2 rounded-lg border transition-all duration-300
                ${checked.includes(i)
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-[#111] border-[#333]"
                }
              `}
            >
              <div className={`
                relative w-4 h-4 rounded border-2 flex items-center justify-center
                transition-all duration-300
                ${checked.includes(i)
                  ? "bg-green-500 border-green-500"
                  : "border-[#444]"
                }
              `}>
                <Check className={`w-3 h-3 text-white transition-all duration-200 ${checked.includes(i) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
              </div>
              <span className={`
                flex-1 text-sm font-mono transition-all duration-300
                ${checked.includes(i) ? "text-[#666] line-through" : "text-white"}
              `}>
                {item.name}
              </span>
              <span className="text-xs text-[#666] font-mono">{item.qty}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-[#222] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF4400] to-[#FF6B35] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Complete Message */}
        <div className={`
          mt-3 text-center text-xs font-mono transition-all duration-300
          ${complete ? "text-green-400 opacity-100" : "text-[#666] opacity-0"}
        `}>
          ✓ List Complete! Ready to shop.
        </div>
      </div>
    </BrowserFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Cook Mode Demo - Step-by-step instructions with timer
// ─────────────────────────────────────────────────────────────

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
    <BrowserFrame>
      <div className="w-full max-w-[280px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-4 h-4 text-[#FF4400]" />
          <h4 className="font-mono font-bold text-white text-sm">Cook Mode</h4>
          <span className={`ml-auto text-sm font-mono text-[#FF4400] transition-opacity duration-300 ${timerActive ? "opacity-100 animate-pulse" : "opacity-0"}`}>
            ⏱ {timer}
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {COOKING_STEPS.map((step, i) => (
            <div
              key={step.step}
              className={`
                flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300
                ${i === currentStep
                  ? "bg-[#FF4400]/10 border-[#FF4400]"
                  : i < currentStep
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-[#111] border-[#222]"
                }
              `}
            >
              <div className={`
                relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold
                transition-all duration-300
                ${i === currentStep
                  ? "bg-[#FF4400] text-white"
                  : i < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-[#222] text-[#666]"
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
                flex-1 text-sm font-mono transition-all duration-300
                ${i === currentStep
                  ? "text-white"
                  : i < currentStep
                    ? "text-[#666]"
                    : "text-[#555]"
                }
              `}>
                {step.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}
