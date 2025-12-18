import {
  BarChart3,
  Apple,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export type StatsCategoryId = "overview" | "nutrition" | "impact";

export interface StatsCategory {
  id: StatsCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

export const STATS_CATEGORIES: StatsCategory[] = [
  {
    id: "overview",
    label: "Overview",
    shortLabel: "Overview",
    description: "Summary of your meal planning statistics",
    icon: BarChart3,
    path: "/app/stats",
  },
  {
    id: "nutrition",
    label: "Nutrition",
    shortLabel: "Nutrition",
    description: "Track your daily macros and nutrition goals",
    icon: Apple,
    path: "/app/stats/nutrition",
  },
  {
    id: "impact",
    label: "Impact",
    shortLabel: "Impact",
    description: "See your food waste reduction and sustainability impact",
    icon: Leaf,
    path: "/app/stats/impact",
  },
];

export const STATS_CATEGORY_MAP = new Map(
  STATS_CATEGORIES.map((cat) => [cat.id, cat])
);

export function getStatsCategoryById(id: StatsCategoryId): StatsCategory | undefined {
  return STATS_CATEGORY_MAP.get(id);
}

export function getStatsCategoryByPath(path: string): StatsCategory | undefined {
  return STATS_CATEGORIES.find((cat) => cat.path === path);
}
