"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import {
  FolderOpen,
  FileText,
  Settings,
  HelpCircle,
  Power,
  ChevronRight,
  Search,
  Calendar,
  ShoppingCart,
  Package,
  Activity,
  History,
  Star,
  Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// MEAL PREP OS - Start Menu Component
// The main navigation menu that appears from the Start button
// ═══════════════════════════════════════════════════════════════════════════════

interface StartMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback when menu should close */
  onClose: () => void;
  /** User name to display in the sidebar */
  userName?: string;
  /** Custom menu items */
  items?: StartMenuItem[];
  /** Callback when an item is clicked */
  onItemClick?: (id: string) => void;
}

interface StartMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  hasSubmenu?: boolean;
  dividerAfter?: boolean;
}

const defaultItems: StartMenuItem[] = [
  { id: "recipes", label: "Recipe Explorer", icon: <FolderOpen className="w-4 h-4" /> },
  { id: "calendar", label: "Calendar.exe", icon: <Calendar className="w-4 h-4" /> },
  { id: "shopping", label: "ShopList.exe", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "pantry", label: "Inventory Manager", icon: <Package className="w-4 h-4" /> },
  { id: "nutrition", label: "Nutrition Tracker", icon: <Activity className="w-4 h-4" />, dividerAfter: true },
  { id: "favorites", label: "Favorites", icon: <Star className="w-4 h-4" />, hasSubmenu: true },
  { id: "recent", label: "Recent Recipes", icon: <History className="w-4 h-4" />, hasSubmenu: true },
  { id: "automation", label: "Task Scheduler", icon: <Zap className="w-4 h-4" />, dividerAfter: true },
  { id: "find", label: "Find Recipes...", icon: <Search className="w-4 h-4" /> },
  { id: "help", label: "Help Topics", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "settings", label: "Control Panel", icon: <Settings className="w-4 h-4" />, dividerAfter: true },
  { id: "shutdown", label: "Shut Down...", icon: <Power className="w-4 h-4" /> },
];

export function StartMenu({
  isOpen,
  onClose,
  userName = "Chef",
  items = defaultItems,
  onItemClick,
}: StartMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop to close menu */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Menu */}
      <div
        className={cn(
          "absolute bottom-[28px] left-0 z-50",
          "flex",
          // Window styling
          "bg-os-chrome",
          "border-2 border-solid",
          "border-t-os-raised border-l-os-raised",
          "border-b-os-darkest border-r-os-darkest",
          "shadow-os-window",
          // Animation
          "animate-os-window-open"
        )}
      >
        {/* ═══ Blue Sidebar ═══ */}
        <div
          className={cn(
            "w-[24px] py-2",
            "bg-gradient-to-b from-os-titlebar to-[#1084d0]",
            "flex flex-col justify-end"
          )}
        >
          <span
            className={cn(
              "text-os-text-light font-bold text-[18px] font-pixel",
              "transform -rotate-90 origin-center",
              "whitespace-nowrap",
              "tracking-wider"
            )}
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            Meal Prep<span className="text-food-butter">OS</span>
          </span>
        </div>

        {/* ═══ Menu Items ═══ */}
        <div className="flex flex-col py-1 min-w-[200px]">
          {items.map((item) => (
            <div key={item.id}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-1.5",
                  "text-[12px] font-system text-os-text text-left",
                  "hover:bg-os-titlebar hover:text-os-text-light",
                  "focus-visible:bg-os-titlebar focus-visible:text-os-text-light",
                  "focus-visible:outline-none"
                )}
                onClick={() => {
                  onItemClick?.(item.id);
                  if (!item.hasSubmenu) {
                    onClose();
                  }
                }}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.hasSubmenu && (
                  <ChevronRight className="w-3 h-3 opacity-60" />
                )}
              </button>
              {item.dividerAfter && (
                <div className="h-px bg-os-sunken mx-2 my-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default StartMenu;
