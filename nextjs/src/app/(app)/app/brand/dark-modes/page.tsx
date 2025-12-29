"use client";

import {
  Heart,
  Star,
  Zap,
  ChefHat,
  Calendar,
  Bell,
  Search,
  Plus,
  Check,
  Moon,
  Sun,
} from "lucide-react";

// Theme definitions - Simple, flat, yellow (#FBBF24) as primary
const themes = {
  neutralDark: {
    name: "Neutral Dark",
    tagline: "Yellow + Navy on pure neutral gray",
    colors: {
      background: "#171717",
      surface: "#262626",
      surfaceHover: "#333333",
      primary: "#FBBF24",
      primaryForeground: "#171717",
      secondary: "#1E3A5F",
      secondaryForeground: "#FFFFFF",
      text: "#F5F5F5",
      textMuted: "#A3A3A3",
      border: "#404040",
      borderHover: "#525252",
    },
    shadow: "none",
    shadowHover: "none",
    shadowAccent: "none",
  },
  slateNavy: {
    name: "Slate Navy",
    tagline: "Yellow + Sky Blue on dark slate",
    colors: {
      background: "#0F172A",
      surface: "#1E293B",
      surfaceHover: "#334155",
      primary: "#FBBF24",
      primaryForeground: "#0F172A",
      secondary: "#38BDF8",
      secondaryForeground: "#0F172A",
      text: "#F1F5F9",
      textMuted: "#94A3B8",
      border: "#334155",
      borderHover: "#475569",
    },
    shadow: "none",
    shadowHover: "none",
    shadowAccent: "none",
  },
  warmCharcoal: {
    name: "Warm Charcoal",
    tagline: "Yellow + Teal on warm dark gray",
    colors: {
      background: "#1C1917",
      surface: "#292524",
      surfaceHover: "#3D3835",
      primary: "#FBBF24",
      primaryForeground: "#1C1917",
      secondary: "#2DD4BF",
      secondaryForeground: "#1C1917",
      text: "#FAFAF9",
      textMuted: "#A8A29E",
      border: "#44403C",
      borderHover: "#57534E",
    },
    shadow: "none",
    shadowHover: "none",
    shadowAccent: "none",
  },
  coolZinc: {
    name: "Cool Zinc",
    tagline: "Yellow + Indigo on cool zinc",
    colors: {
      background: "#18181B",
      surface: "#27272A",
      surfaceHover: "#3F3F46",
      primary: "#FBBF24",
      primaryForeground: "#18181B",
      secondary: "#818CF8",
      secondaryForeground: "#18181B",
      text: "#FAFAFA",
      textMuted: "#A1A1AA",
      border: "#3F3F46",
      borderHover: "#52525B",
    },
    shadow: "none",
    shadowHover: "none",
    shadowAccent: "none",
  },
  deepBlack: {
    name: "Deep Black",
    tagline: "Yellow + Blue on true black (OLED)",
    colors: {
      background: "#000000",
      surface: "#0A0A0A",
      surfaceHover: "#171717",
      primary: "#FBBF24",
      primaryForeground: "#000000",
      secondary: "#3B82F6",
      secondaryForeground: "#FFFFFF",
      text: "#FFFFFF",
      textMuted: "#737373",
      border: "#262626",
      borderHover: "#404040",
    },
    shadow: "none",
    shadowHover: "none",
    shadowAccent: "none",
  },
};

type ThemeKey = keyof typeof themes;

export default function DarkModesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBBF24] text-black text-sm font-mono font-bold">
            <Zap className="w-4 h-4" />
            Simple & Flat
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">
            Dark Mode Options
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Your yellow <span className="text-[#FBBF24]">#FBBF24</span> as primary · No glows · Clean flat design
          </p>
        </header>

        {/* Theme Previews */}
        <div className="grid gap-8">
          {(Object.keys(themes) as ThemeKey[]).map((themeKey) => (
            <ThemePreview key={themeKey} themeKey={themeKey} />
          ))}
        </div>

        {/* Comparison Footer */}
        <footer className="text-center py-8 border-t border-white/10">
          <p className="text-white/40 font-mono text-sm">
            Pick your favorite and let me know!
          </p>
        </footer>
      </div>
    </div>
  );
}

function ThemePreview({ themeKey }: { themeKey: ThemeKey }) {
  const theme = themes[themeKey];
  const { colors, shadow, shadowHover, shadowAccent } = theme;

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Theme Header */}
      <div
        className="p-6 border-b-2"
        style={{ borderColor: colors.border }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold font-mono"
              style={{ color: colors.text }}
            >
              {theme.name}
            </h2>
            <p style={{ color: colors.textMuted }}>{theme.tagline}</p>
          </div>
          <div className="flex gap-2">
            {/* Color swatches */}
            <div
              className="w-8 h-8 rounded-lg border-2"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.border,
              }}
              title="Primary"
            />
            <div
              className="w-8 h-8 rounded-lg border-2"
              style={{
                backgroundColor: colors.secondary,
                borderColor: colors.border,
              }}
              title="Secondary"
            />
            <div
              className="w-8 h-8 rounded-lg border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              title="Surface"
            />
          </div>
        </div>
      </div>

      {/* Theme Content */}
      <div className="p-6 space-y-6">
        {/* Mini Dashboard Preview */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Sidebar Preview */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.border}`,
              boxShadow: shadow,
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="font-bold font-mono text-lg"
                style={{ color: colors.secondary }}
              >
                BWFD
              </span>
            </div>
            <NavItem
              icon={<Calendar className="w-4 h-4" />}
              label="Plan"
              active
              colors={colors}
            />
            <NavItem
              icon={<ChefHat className="w-4 h-4" />}
              label="Recipes"
              colors={colors}
            />
            <NavItem
              icon={<Heart className="w-4 h-4" />}
              label="Favorites"
              colors={colors}
            />
            <NavItem
              icon={<Star className="w-4 h-4" />}
              label="Highly Rated"
              colors={colors}
            />
          </div>

          {/* Main Content Preview */}
          <div className="md:col-span-2 space-y-4">
            {/* Search Bar */}
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3"
              style={{
                backgroundColor: colors.surface,
                border: `2px solid ${colors.border}`,
              }}
            >
              <Search className="w-5 h-5" style={{ color: colors.textMuted }} />
              <span style={{ color: colors.textMuted }}>Search recipes...</span>
            </div>

            {/* Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Recipe Card */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.border}`,
                  boxShadow: shadow,
                }}
              >
                <div
                  className="w-full h-20 rounded-lg"
                  style={{ backgroundColor: colors.surfaceHover }}
                />
                <h3
                  className="font-bold font-mono"
                  style={{ color: colors.text }}
                >
                  Pasta Carbonara
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryForeground,
                    }}
                  >
                    30 min
                  </span>
                  <Star
                    className="w-4 h-4"
                    style={{ color: colors.secondary }}
                    fill={colors.secondary}
                  />
                </div>
              </div>

              {/* Accent Card */}
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  backgroundColor: colors.secondary,
                  border: `2px solid ${colors.border}`,
                  boxShadow: shadowAccent,
                }}
              >
                <Zap
                  className="w-6 h-6"
                  style={{ color: colors.secondaryForeground }}
                />
                <h3
                  className="font-bold font-mono"
                  style={{ color: colors.secondaryForeground }}
                >
                  Quick Tip
                </h3>
                <p
                  className="text-sm"
                  style={{ color: colors.secondaryForeground, opacity: 0.8 }}
                >
                  Plan your week on Sunday!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* UI Components Row */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.border}`,
          }}
        >
          <h3
            className="font-mono text-sm mb-4"
            style={{ color: colors.textMuted }}
          >
            UI COMPONENTS
          </h3>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Primary Button */}
            <button
              className="px-4 py-2 rounded-lg font-bold font-mono text-sm transition-all"
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
                border: `2px solid ${colors.border}`,
                boxShadow: shadow,
              }}
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Recipe
              </span>
            </button>

            {/* Secondary Button */}
            <button
              className="px-4 py-2 rounded-lg font-bold font-mono text-sm transition-all"
              style={{
                backgroundColor: colors.secondary,
                color: colors.secondaryForeground,
                border: `2px solid ${colors.border}`,
                boxShadow: shadowAccent,
              }}
            >
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Favorite
              </span>
            </button>

            {/* Ghost Button */}
            <button
              className="px-4 py-2 rounded-lg font-bold font-mono text-sm transition-all"
              style={{
                backgroundColor: "transparent",
                color: colors.text,
                border: `2px solid ${colors.border}`,
              }}
            >
              Cancel
            </button>

            {/* Icon Buttons */}
            <div className="flex gap-2">
              <button
                className="p-2 rounded-full transition-all"
                style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-full transition-all"
                style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.border}`,
                  color: colors.primary,
                }}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Badges */}
            <span
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: colors.primary,
                color: colors.primaryForeground,
              }}
            >
              New
            </span>
            <span
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: "#22C55E",
                color: "#FFFFFF",
              }}
            >
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3" />
                Done
              </span>
            </span>
          </div>
        </div>

        {/* Progress & Input Row */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Progress Bars */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.border}`,
            }}
          >
            <h3
              className="font-mono text-sm mb-3"
              style={{ color: colors.textMuted }}
            >
              PROGRESS
            </h3>
            <div className="space-y-3">
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.surfaceHover }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.primary, width: "65%" }}
                />
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.surfaceHover }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.secondary, width: "40%" }}
                />
              </div>
            </div>
          </div>

          {/* Input */}
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.border}`,
            }}
          >
            <h3
              className="font-mono text-sm mb-3"
              style={{ color: colors.textMuted }}
            >
              INPUT
            </h3>
            <input
              type="text"
              placeholder="Enter recipe name..."
              className="w-full rounded-lg px-4 py-3 font-mono text-sm outline-none transition-all"
              style={{
                backgroundColor: colors.background,
                border: `2px solid ${colors.border}`,
                color: colors.text,
              }}
            />
          </div>
        </div>

        {/* Color Palette Display */}
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: colors.surface,
            border: `2px solid ${colors.border}`,
          }}
        >
          <h3
            className="font-mono text-sm mb-3"
            style={{ color: colors.textMuted }}
          >
            COLOR PALETTE
          </h3>
          <div className="flex flex-wrap gap-3">
            <ColorChip label="Background" color={colors.background} textLight />
            <ColorChip label="Surface" color={colors.surface} textLight />
            <ColorChip label="Primary" color={colors.primary} textLight />
            <ColorChip
              label="Secondary"
              color={colors.secondary}
              textLight={false}
            />
            <ColorChip label="Text" color={colors.text} textLight={false} />
            <ColorChip label="Border" color={colors.border} textLight />
          </div>
        </div>
      </div>
    </section>
  );
}

function NavItem({
  icon,
  label,
  active,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  colors: (typeof themes)["neutralDark"]["colors"];
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all"
      style={{
        backgroundColor: active ? colors.primary : "transparent",
        color: active ? colors.primaryForeground : colors.text,
      }}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

function ColorChip({
  label,
  color,
  textLight,
}: {
  label: string;
  color: string;
  textLight: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-lg border-2"
        style={{ backgroundColor: color, borderColor: "rgba(255,255,255,0.1)" }}
      />
      <span
        className="text-xs font-mono"
        style={{ color: textLight ? "#fff" : "#000" }}
      >
        {label}
      </span>
      <span className="text-xs font-mono opacity-60">{color}</span>
    </div>
  );
}
