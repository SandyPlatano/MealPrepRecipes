"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Import from Anywhere - URL transforms into recipe card
export function ImportIllustration() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((s) => (s + 1) % 4);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border">
      {/* URL bar */}
      <div
        className={cn(
          "absolute top-3 left-3 right-3 h-8 bg-dark rounded-lg flex items-center px-3 transition-all duration-500",
          stage >= 1 && "scale-95 opacity-50"
        )}
      >
        <div className="w-2 h-2 rounded-full bg-primary/50 mr-2" />
        <span className="text-xs text-cream/40 font-mono truncate">
          allrecipes.com/chicken-tikka...
        </span>
      </div>

      {/* Sparkle animation */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          stage === 1 ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}
      >
        <div className="relative">
          <div className="w-8 h-8 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary text-lg">✨</span>
          </div>
        </div>
      </div>

      {/* Recipe card result */}
      <div
        className={cn(
          "absolute bottom-3 left-3 right-3 bg-dark rounded-lg p-2 transition-all duration-500",
          stage >= 2
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        )}
      >
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-lg">
            🍗
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-cream truncate">
              Chicken Tikka Masala
            </div>
            <div className="text-[10px] text-cream/50">
              {stage >= 3 ? "12 ingredients · 45 min" : "Extracting..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cook Mode - Steps with timer
export function CookModeIllustration() {
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setStep((s) => (s % 3) + 1);
          return 5;
        }
        return t - 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { num: 1, text: "Heat oil in pan", icon: "🍳" },
    { num: 2, text: "Add onions, sauté", icon: "🧅" },
    { num: 3, text: "Add spices, stir", icon: "🌶️" },
  ];

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border p-3">
      {/* Step indicator */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              s <= step ? "bg-primary" : "bg-dark"
            )}
          />
        ))}
      </div>

      {/* Current step */}
      <div className="flex items-center gap-3">
        <div className="text-2xl">{steps[step - 1].icon}</div>
        <div className="flex-1">
          <div className="text-xs text-cream/50">Step {step} of 3</div>
          <div className="text-sm font-medium text-cream">
            {steps[step - 1].text}
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-dark rounded-lg px-3 py-1.5">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-mono text-cream">0:0{timer}</span>
      </div>
    </div>
  );
}

// Shopping List - Items checking off
export function ShoppingIllustration() {
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const sequence = [0, 1, 2];
    let index = 0;

    const interval = setInterval(() => {
      if (index < sequence.length) {
        setChecked((prev) => [...prev, sequence[index]]);
        index++;
      } else {
        setChecked([]);
        index = 0;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const items = [
    { name: "Chicken thighs", qty: "2 lbs", category: "🥩" },
    { name: "Greek yogurt", qty: "1 cup", category: "🥛" },
    { name: "Garam masala", qty: "2 tbsp", category: "🌿" },
  ];

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border p-3">
      <div className="text-[10px] text-cream/40 uppercase tracking-wider mb-2">
        Shopping List
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 text-xs transition-all duration-300",
              checked.includes(i) && "opacity-50"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200",
                checked.includes(i)
                  ? "border-primary bg-primary"
                  : "border-dark-border"
              )}
            >
              {checked.includes(i) && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="text-sm">{item.category}</span>
            <span
              className={cn(
                "flex-1 text-cream transition-all",
                checked.includes(i) && "line-through"
              )}
            >
              {item.name}
            </span>
            <span className="text-cream/40">{item.qty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Nutrition tracking - Macros filling up
export function NutritionIllustration() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const macros = [
    { name: "Protein", current: Math.round(progress * 1.2), goal: 120, color: "bg-bold-green" },
    { name: "Carbs", current: Math.round(progress * 2), goal: 200, color: "bg-primary" },
    { name: "Fat", current: Math.round(progress * 0.65), goal: 65, color: "bg-bold-yellow" },
  ];

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border p-3">
      <div className="text-[10px] text-cream/40 uppercase tracking-wider mb-3">
        Today&apos;s Macros
      </div>
      <div className="flex flex-col gap-2">
        {macros.map((macro) => (
          <div key={macro.name} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-cream/60">{macro.name}</span>
              <span className="text-cream font-mono">
                {macro.current}g / {macro.goal}g
              </span>
            </div>
            <div className="h-1.5 bg-dark rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-100", macro.color)}
                style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pantry - Items with expiry
export function PantryIllustration() {
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlight((h) => (h + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { name: "Eggs", qty: "12", expiry: "5 days", icon: "🥚" },
    { name: "Milk", qty: "1 gal", expiry: "3 days", icon: "🥛" },
    { name: "Chicken", qty: "2 lbs", expiry: "2 days", icon: "🍗" },
  ];

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border p-3">
      <div className="text-[10px] text-cream/40 uppercase tracking-wider mb-2">
        Pantry
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-300",
              highlight === i ? "bg-dark" : ""
            )}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="text-xs text-cream flex-1">{item.name}</span>
            <span className="text-[10px] text-cream/40">{item.qty}</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded",
                i === 2
                  ? "bg-primary/20 text-primary"
                  : "bg-dark-border text-cream/50"
              )}
            >
              {item.expiry}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Household - Multiple avatars syncing
export function HouseholdIllustration() {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-32 bg-dark-accent rounded-xl overflow-hidden border border-dark-border p-3">
      <div className="text-[10px] text-cream/40 uppercase tracking-wider mb-3">
        Household
      </div>

      {/* Avatars */}
      <div className="flex justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-lg border-2 border-primary">
            👩
          </div>
          <span className="text-[10px] text-cream/60">You</span>
        </div>

        {/* Sync indicator */}
        <div className="flex items-center">
          <div
            className={cn(
              "flex gap-1 transition-all duration-300",
              syncing ? "opacity-100" : "opacity-30"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full bg-primary",
                syncing && "animate-ping"
              )}
            />
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full bg-primary",
                syncing && "animate-ping [animation-delay:100ms]"
              )}
            />
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full bg-primary",
                syncing && "animate-ping [animation-delay:200ms]"
              )}
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-bold-green/30 flex items-center justify-center text-lg border-2 border-bold-green">
            👨
          </div>
          <span className="text-[10px] text-cream/60">Partner</span>
        </div>
      </div>

      {/* Sync message */}
      <div
        className={cn(
          "absolute bottom-2 left-0 right-0 text-center text-[10px] transition-all duration-300",
          syncing ? "text-primary" : "text-cream/40"
        )}
      >
        {syncing ? "Syncing meal plan..." : "Everything synced"}
      </div>
    </div>
  );
}
