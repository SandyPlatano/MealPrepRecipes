"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PersonalizedGreetingProps {
  userName?: string | null;
  /** Fallback message if no time-based greeting */
  fallbackMessage?: string;
  className?: string;
}

type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

const GREETINGS: Record<TimeOfDay, string[]> = {
  morning: [
    "Good morning",
    "Rise and shine",
    "Morning",
  ],
  afternoon: [
    "Good afternoon",
    "Hey there",
    "Afternoon",
  ],
  evening: [
    "Good evening",
    "Evening",
    "Hey there",
  ],
  night: [
    "Good evening",
    "Late night cooking",
    "Burning the midnight oil",
  ],
};

const COOKING_PHRASES = [
  "Let's get cooking!",
  "Time to create something delicious!",
  "Ready to cook up something good?",
  "What's on the menu today?",
  "Let's make something tasty!",
];

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function PersonalizedGreeting({
  userName,
  fallbackMessage,
  className,
}: PersonalizedGreetingProps) {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setMounted(true);
    const timeOfDay = getTimeOfDay();
    const timeGreeting = getRandomItem(GREETINGS[timeOfDay]);

    if (userName) {
      // Personalized: "Good morning, Sarah!"
      setGreeting(`${timeGreeting}, ${userName}!`);
    } else {
      // Fallback to cooking phrase or provided message
      setGreeting(fallbackMessage || getRandomItem(COOKING_PHRASES));
    }
  }, [userName, fallbackMessage]);

  // SSR placeholder - prevent hydration mismatch
  if (!mounted) {
    return (
      <p className={cn("font-handwritten text-2xl text-primary mb-1 opacity-0", className)}>
        Loading...
      </p>
    );
  }

  return (
    <p
      className={cn(
        "font-handwritten text-2xl text-primary mb-1",
        "animate-in fade-in slide-in-from-left-2 duration-500",
        className
      )}
    >
      {greeting}
    </p>
  );
}
