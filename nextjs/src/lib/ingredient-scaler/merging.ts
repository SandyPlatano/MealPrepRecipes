/**
 * Shopping item merging utilities
 * Combine duplicate ingredients from multiple recipes
 */

import type { IngredientCategory } from "@/types/shopping-list";
import { parseQuantity, formatQuantity } from "./parsing";
import { normalizeUnit, areUnitsConvertible, convertUnit, getPreferredUnit } from "./units";
import { normalizeIngredientName } from "./intelligence";

export interface MergeableItem {
  ingredient: string;
  quantity?: string | null;
  unit?: string | null;
  category?: string | null;
  recipe_id?: string | null;
  recipe_title?: string | null;
}

export interface MergedItem {
  ingredient: string;
  quantity: string | null;
  unit: string | null;
  category: IngredientCategory | string | null;
  sources: Array<{ recipe_id?: string | null; recipe_title?: string | null }>;
}

/**
 * Merge a list of shopping items, combining duplicates
 */
export function mergeShoppingItems(items: MergeableItem[]): MergedItem[] {
  const merged = new Map<string, MergedItem>();

  for (const item of items) {
    const normalizedName = normalizeIngredientName(item.ingredient);
    const existing = merged.get(normalizedName);

    if (!existing) {
      // First occurrence
      merged.set(normalizedName, {
        ingredient: item.ingredient, // Keep original casing from first occurrence
        quantity: item.quantity || null,
        unit: item.unit ? normalizeUnit(item.unit) : null,
        category: item.category || null,
        sources: item.recipe_id || item.recipe_title
          ? [{ recipe_id: item.recipe_id, recipe_title: item.recipe_title }]
          : [],
      });
    } else {
      // Merge with existing
      const newQuantity = parseQuantity(item.quantity || "");
      const existingQuantity = parseQuantity(existing.quantity || "");

      // Add source
      if (item.recipe_id || item.recipe_title) {
        const alreadyHasSource = existing.sources.some(
          (s) => s.recipe_id === item.recipe_id && s.recipe_title === item.recipe_title
        );
        if (!alreadyHasSource) {
          existing.sources.push({
            recipe_id: item.recipe_id,
            recipe_title: item.recipe_title,
          });
        }
      }

      // Try to merge quantities
      if (newQuantity !== null && existingQuantity !== null) {
        const newUnit = item.unit ? normalizeUnit(item.unit) : null;
        const existingUnit = existing.unit;

        if (newUnit === existingUnit || (!newUnit && !existingUnit)) {
          // Same unit, just add
          const total = existingQuantity + newQuantity;
          const preferred = existingUnit
            ? getPreferredUnit(total, existingUnit)
            : { quantity: total, unit: null };
          existing.quantity = formatQuantity(preferred.quantity);
          existing.unit = preferred.unit;
        } else if (newUnit && existingUnit && areUnitsConvertible(newUnit, existingUnit)) {
          // Convertible units - convert to existing unit then add
          const converted = convertUnit(newQuantity, newUnit, existingUnit);
          if (converted !== null) {
            const total = existingQuantity + converted;
            const preferred = getPreferredUnit(total, existingUnit);
            existing.quantity = formatQuantity(preferred.quantity);
            existing.unit = preferred.unit;
          }
        }
        // If not convertible, we keep the existing quantity (conservative approach)
      } else if (newQuantity !== null && existingQuantity === null) {
        // Existing had no quantity, use new one
        existing.quantity = item.quantity || null;
        existing.unit = item.unit ? normalizeUnit(item.unit) : null;
      }
      // If new has no quantity but existing does, keep existing (do nothing)
    }
  }

  return Array.from(merged.values());
}
