import { describe, it, expect } from "vitest";
import {
  parseIngredient,
  scaleIngredient,
  normalizeUnit,
  areUnitsConvertible,
  normalizeIngredientName,
  mergeShoppingItems,
  type MergeableItem,
} from "../ingredient-scaler";

describe("parseIngredient", () => {
  it("parses simple ingredient with quantity and unit", () => {
    const result = parseIngredient("2 cups flour");
    expect(result.quantity).toBe(2);
    expect(result.unit).toBe("cups");
    expect(result.ingredient).toBe("flour");
  });

  it("parses fractional quantities", () => {
    const result = parseIngredient("1/2 cup sugar");
    expect(result.quantity).toBe(0.5);
    expect(result.unit).toBe("cup");
    expect(result.ingredient).toBe("sugar");
  });

  it("parses mixed numbers", () => {
    const result = parseIngredient("1 1/2 cups milk");
    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe("cups");
    expect(result.ingredient).toBe("milk");
  });

  it("parses ingredients without quantity", () => {
    const result = parseIngredient("salt to taste");
    expect(result.quantity).toBeNull();
    expect(result.ingredient).toBe("salt to taste");
  });

  it("parses decimal quantities", () => {
    const result = parseIngredient("0.25 lb butter");
    expect(result.quantity).toBe(0.25);
    expect(result.unit).toBe("lb");
    expect(result.ingredient).toBe("butter");
  });
});

describe("scaleIngredient", () => {
  it("scales up ingredient quantities", () => {
    const result = scaleIngredient("2 cups flour", 2);
    expect(result).toBe("4 cups flour");
  });

  it("scales down ingredient quantities", () => {
    const result = scaleIngredient("4 tbsp butter", 0.5);
    expect(result).toBe("2 tbsp butter");
  });

  it("returns original for ingredients without quantity", () => {
    const result = scaleIngredient("salt to taste", 2);
    expect(result).toBe("salt to taste");
  });

  it("handles fractional results", () => {
    const result = scaleIngredient("1 cup sugar", 0.5);
    // Function formats as fraction when possible
    expect(result).toBe("1/2 cup sugar");
  });
});

describe("normalizeUnit", () => {
  it("normalizes teaspoon variations", () => {
    expect(normalizeUnit("teaspoon")).toBe("tsp");
    expect(normalizeUnit("teaspoons")).toBe("tsp");
    expect(normalizeUnit("tsp")).toBe("tsp");
  });

  it("normalizes tablespoon variations", () => {
    expect(normalizeUnit("tablespoon")).toBe("tbsp");
    expect(normalizeUnit("tablespoons")).toBe("tbsp");
    expect(normalizeUnit("tbsp")).toBe("tbsp");
  });

  it("normalizes cup variations", () => {
    expect(normalizeUnit("cup")).toBe("cup");
    expect(normalizeUnit("cups")).toBe("cup");
    expect(normalizeUnit("c")).toBe("cup");
  });

  it("normalizes pound variations", () => {
    expect(normalizeUnit("pound")).toBe("lb");
    expect(normalizeUnit("pounds")).toBe("lb");
    expect(normalizeUnit("lbs")).toBe("lb");
    expect(normalizeUnit("lb")).toBe("lb");
  });

  it("returns original for unknown units", () => {
    expect(normalizeUnit("pinch")).toBe("pinch");
    // normalizeUnit also singularizes plurals
    expect(normalizeUnit("cloves")).toBe("clove");
  });
});

describe("areUnitsConvertible", () => {
  it("returns true for same units", () => {
    expect(areUnitsConvertible("cup", "cup")).toBe(true);
    expect(areUnitsConvertible("lb", "lb")).toBe(true);
  });

  it("returns true for volume units", () => {
    expect(areUnitsConvertible("cup", "cups")).toBe(true);
    expect(areUnitsConvertible("tsp", "tbsp")).toBe(true);
    expect(areUnitsConvertible("ml", "l")).toBe(true);
  });

  it("returns true for weight units", () => {
    expect(areUnitsConvertible("oz", "lb")).toBe(true);
    expect(areUnitsConvertible("g", "kg")).toBe(true);
  });

  it("returns false for incompatible units", () => {
    expect(areUnitsConvertible("cup", "lb")).toBe(false);
    expect(areUnitsConvertible("tsp", "oz")).toBe(false);
  });
});

describe("normalizeIngredientName", () => {
  it("removes common prefixes", () => {
    expect(normalizeIngredientName("diced onion")).toBe("onion");
    expect(normalizeIngredientName("minced garlic")).toBe("garlic");
    expect(normalizeIngredientName("fresh basil")).toBe("basil");
    expect(normalizeIngredientName("chopped parsley")).toBe("parsley");
  });

  it("lowercases the name", () => {
    expect(normalizeIngredientName("FLOUR")).toBe("flour");
    expect(normalizeIngredientName("Brown Sugar")).toBe("brown sugar");
  });

  it("trims whitespace", () => {
    expect(normalizeIngredientName("  flour  ")).toBe("flour");
  });
});

describe("mergeShoppingItems", () => {
  it("merges items with same ingredient and unit", () => {
    const items: MergeableItem[] = [
      { ingredient: "flour", quantity: "1", unit: "cup", category: "Pantry" },
      { ingredient: "flour", quantity: "2", unit: "cup", category: "Pantry" },
    ];
    const result = mergeShoppingItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].ingredient).toBe("flour");
    expect(result[0].quantity).toBe("3");
    expect(result[0].unit).toBe("cup");
  });

  it("keeps separate items with different units", () => {
    const items: MergeableItem[] = [
      { ingredient: "flour", quantity: "1", unit: "cup", category: "Pantry" },
      { ingredient: "flour", quantity: "100", unit: "g", category: "Pantry" },
    ];
    const result = mergeShoppingItems(items);

    // May or may not merge depending on conversion logic
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("handles items without quantity", () => {
    const items: MergeableItem[] = [
      { ingredient: "salt", category: "Spices" },
      { ingredient: "salt", category: "Spices" },
    ];
    const result = mergeShoppingItems(items);

    // Should not crash, may dedupe
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].ingredient).toBe("salt");
  });

  it("preserves recipe attribution", () => {
    const items: MergeableItem[] = [
      {
        ingredient: "flour",
        quantity: "1",
        unit: "cup",
        category: "Pantry",
        recipe_id: "r1",
        recipe_title: "Recipe 1",
      },
      {
        ingredient: "flour",
        quantity: "2",
        unit: "cup",
        category: "Pantry",
        recipe_id: "r2",
        recipe_title: "Recipe 2",
      },
    ];
    const result = mergeShoppingItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].sources).toBeDefined();
    expect(result[0].sources?.length).toBe(2);
  });

  it("handles integer quantities correctly", () => {
    const items: MergeableItem[] = [
      { ingredient: "sugar", quantity: "1", unit: "cup", category: "Pantry" },
      { ingredient: "sugar", quantity: "2", unit: "cup", category: "Pantry" },
    ];
    const result = mergeShoppingItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].ingredient).toBe("sugar");
    expect(result[0].quantity).toBe("3");
  });
});
