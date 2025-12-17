"use client";

import { useState } from "react";
import {
  WindowChrome,
  MenuItem,
  StatusBarPane,
  OsButton,
  Taskbar,
  DesktopIcon,
  DesktopIconGrid,
  StartMenu,
  Tootsie,
  TootsieExpression,
} from "@/components/os";
import {
  FolderOpen,
  Calendar,
  ShoppingCart,
  Package,
  Settings,
  FileText,
  Star,
  Activity,
  ChefHat,
  Utensils,
  Timer,
  Flame,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Demo Desktop
// The main desktop view showcasing the retro OS aesthetic
// ═══════════════════════════════════════════════════════════════════════════════

export default function MealPrepOSDemo() {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [tootsieExpression, setTootsieExpression] = useState<TootsieExpression>("neutral");
  const [tootsieSpeech, setTootsieSpeech] = useState<string | undefined>();

  // Desktop icons
  const desktopIcons = [
    { id: "recipes", label: "Recipe Explorer", icon: <FolderOpen className="w-8 h-8 text-food-butter" /> },
    { id: "calendar", label: "Calendar.exe", icon: <Calendar className="w-8 h-8 text-os-titlebar" /> },
    { id: "shopping", label: "ShopList.exe", icon: <ShoppingCart className="w-8 h-8 text-food-avocado" /> },
    { id: "pantry", label: "Inventory Manager", icon: <Package className="w-8 h-8 text-food-carrot" /> },
    { id: "nutrition", label: "Nutrition.exe", icon: <Activity className="w-8 h-8 text-food-tomato" /> },
    { id: "settings", label: "Control Panel", icon: <Settings className="w-8 h-8 text-os-sunken" /> },
  ];

  // Taskbar windows (open applications)
  const openWindows = [
    { id: "meals", title: "Today's Meals", icon: <Utensils className="w-4 h-4" /> },
    { id: "macros", title: "Weekly Macros", icon: <Activity className="w-4 h-4" /> },
  ];

  // Handle Tootsie interactions
  const handleTootsieClick = () => {
    const expressions: { expression: TootsieExpression; speech: string }[] = [
      { expression: "excited", speech: "Click a recipe! Let's cook!" },
      { expression: "hungry", speech: "I'm sooo hungry..." },
      { expression: "counting", speech: "ONE... TWO... THREE!" },
      { expression: "celebrate", speech: "Let's make something amazing!" },
    ];
    const random = expressions[Math.floor(Math.random() * expressions.length)];
    setTootsieExpression(random.expression);
    setTootsieSpeech(random.speech);

    // Reset after 3 seconds
    setTimeout(() => {
      setTootsieExpression("neutral");
      setTootsieSpeech(undefined);
    }, 3000);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════════
          Desktop Area
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 bg-os-desktop relative overflow-hidden">
        {/* Desktop Icons */}
        <DesktopIconGrid className="absolute inset-0">
          {desktopIcons.map((icon) => (
            <DesktopIcon
              key={icon.id}
              icon={icon.icon}
              label={icon.label}
              isSelected={selectedIcon === icon.id}
              onClick={() => setSelectedIcon(icon.id)}
              onDoubleClick={() => {
                setTootsieExpression("excited");
                setTootsieSpeech(`Opening ${icon.label}...`);
                setTimeout(() => {
                  setTootsieExpression("neutral");
                  setTootsieSpeech(undefined);
                }, 2000);
              }}
            />
          ))}
        </DesktopIconGrid>

        {/* ═══════════════════════════════════════════════════════════════════════
            Widget Windows
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute top-4 right-4 flex flex-col gap-4">
          {/* Today's Meals Widget */}
          <WindowChrome
            title="Today's Meals"
            icon={<Utensils className="w-4 h-4" />}
            width={280}
            showMinimize={false}
            showMaximize={false}
            statusBar={
              <StatusBarPane>3 meals planned</StatusBarPane>
            }
          >
            <div className="p-2 space-y-2 text-[12px] font-system">
              <MealItem
                time="8:00 AM"
                meal="Breakfast"
                recipe="Overnight Oats"
                emoji="🥣"
              />
              <MealItem
                time="12:30 PM"
                meal="Lunch"
                recipe="(not planned)"
                emoji="🍽️"
                isEmpty
              />
              <MealItem
                time="6:30 PM"
                meal="Dinner"
                recipe="Pasta Carbonara"
                emoji="🍝"
              />
            </div>
          </WindowChrome>

          {/* Weekly Macros Widget */}
          <WindowChrome
            title="Weekly Macros"
            icon={<Activity className="w-4 h-4" />}
            width={280}
            showMinimize={false}
            showMaximize={false}
          >
            <div className="p-2 space-y-2 text-[12px] font-system">
              <MacroBar label="Protein" current={145} goal={180} color="bg-food-tomato" />
              <MacroBar label="Carbs" current={220} goal={250} color="bg-food-butter" />
              <MacroBar label="Fat" current={55} goal={70} color="bg-food-avocado" />
              <div className="text-center text-os-text-disabled pt-1">
                1,850 / 2,200 kcal
              </div>
            </div>
          </WindowChrome>

          {/* Cooking Streak Widget */}
          <WindowChrome
            title="Cooking Streak"
            icon={<Flame className="w-4 h-4 text-food-carrot" />}
            width={280}
            showMinimize={false}
            showMaximize={false}
          >
            <div className="p-3 flex flex-col items-center gap-2">
              <div className="text-[32px] font-pixel text-food-carrot">
                🔥 7 days
              </div>
              <div className="text-[11px] font-system text-os-text-disabled">
                Keep it up! You're on fire!
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 bg-food-carrot rounded-sm flex items-center justify-center text-[10px]"
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>
          </WindowChrome>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            Tootsie Mascot
            ═══════════════════════════════════════════════════════════════════════ */}
        <div className="absolute bottom-[40px] right-4">
          <Tootsie
            expression={tootsieExpression}
            size="xl"
            speech={tootsieSpeech}
            onClick={handleTootsieClick}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            Start Menu
            ═══════════════════════════════════════════════════════════════════════ */}
        <StartMenu
          isOpen={startMenuOpen}
          onClose={() => setStartMenuOpen(false)}
          onItemClick={(id) => {
            console.log("Menu item clicked:", id);
            setStartMenuOpen(false);
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          Taskbar
          ═══════════════════════════════════════════════════════════════════════ */}
      <Taskbar
        openWindows={openWindows}
        activeWindowId="meals"
        onWindowClick={(id) => console.log("Window clicked:", id)}
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        startMenuOpen={startMenuOpen}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════════════════════

interface MealItemProps {
  time: string;
  meal: string;
  recipe: string;
  emoji: string;
  isEmpty?: boolean;
}

function MealItem({ time, meal, recipe, emoji, isEmpty }: MealItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 p-1.5
        border border-os-sunken
        ${isEmpty ? "bg-os-chrome/50 text-os-text-disabled" : "bg-os-content"}
      `}
    >
      <span className="text-[16px]">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-bold">{meal}</span>
          <span className="text-os-text-disabled text-[10px]">{time}</span>
        </div>
        <div className={`truncate ${isEmpty ? "italic" : ""}`}>{recipe}</div>
      </div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
}

function MacroBar({ label, current, goal, color }: MacroBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px]">
        <span>{label}</span>
        <span className="text-os-text-disabled">
          {current}g / {goal}g
        </span>
      </div>
      <div className="os-progress h-4">
        <div
          className={`h-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
