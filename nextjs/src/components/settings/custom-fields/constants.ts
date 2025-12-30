/**
 * Constants for custom field definitions
 */

import {
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  CheckSquare,
  Link2,
  Star,
} from "lucide-react";
import type { CustomFieldType } from "@/types/custom-fields";

/**
 * Field type metadata with icons, labels, and descriptions
 */
export const FIELD_TYPE_META: Record<
  CustomFieldType,
  { icon: React.ComponentType<{ className?: string }>; label: string; description: string }
> = {
  text: {
    icon: Type,
    label: "Text",
    description: "Short text input (e.g., wine pairing, notes)",
  },
  number: {
    icon: Hash,
    label: "Number",
    description: "Numeric value (e.g., spice level, difficulty)",
  },
  boolean: {
    icon: ToggleLeft,
    label: "Yes/No",
    description: "True/false toggle (e.g., kid-approved, freezer-friendly)",
  },
  date: {
    icon: Calendar,
    label: "Date",
    description: "Date picker (e.g., last made, expiry date)",
  },
  select: {
    icon: List,
    label: "Select",
    description: "Single choice from options (e.g., cuisine type)",
  },
  multi_select: {
    icon: CheckSquare,
    label: "Multi-Select",
    description: "Multiple choices from options (e.g., dietary labels)",
  },
  url: {
    icon: Link2,
    label: "URL",
    description: "Web link (e.g., video tutorial, blog post)",
  },
  rating: {
    icon: Star,
    label: "Rating",
    description: "Star rating (e.g., taste, difficulty)",
  },
};

/**
 * Ordered list of field types for selection UI
 */
export const FIELD_TYPES: CustomFieldType[] = [
  "text",
  "number",
  "boolean",
  "date",
  "select",
  "multi_select",
  "url",
  "rating",
];

/**
 * Color options for select field options
 */
export const COLOR_OPTIONS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#84cc16", label: "Lime" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
];

/**
 * Wizard step types
 */
export type WizardStep = "type" | "config" | "options" | "display" | "preview";
