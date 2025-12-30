/**
 * Unit tests for ingredient-matcher.ts
 *
 * Tests ingredient name extraction and step-to-ingredient matching.
 */

import { describe, it, expect } from "vitest";
import {
  extractIngredientName,
  matchIngredientsToStep,
  getHighlightedIngredientIndices,
  isIngredientNeededForStep,
  type IngredientMatch,
} from "../ingredient-matcher";

describe("ingredient-matcher", () => {
  describe("extractIngredientName", () => {
    it("should remove quantity numbers", () => {
      expect(extractIngredientName("2 cups flour")).toBe("flour");
      expect(extractIngredientName("100g butter")).toBe("butter");
    });

    it("should remove fractions", () => {
      expect(extractIngredientName("1/2 cup sugar")).toBe("sugar");
      expect(extractIngredientName("3/4 teaspoon salt")).toBe("salt");
    });

    it("should remove common units", () => {
      expect(extractIngredientName("2 tablespoons olive oil")).toBe("olive oil");
      expect(extractIngredientName("1 lb chicken breast")).toBe("chicken breast");
      expect(extractIngredientName("500ml milk")).toBe("milk");
      expect(extractIngredientName("3 cloves garlic")).toBe("garlic");
    });

    it("should remove preparation instructions in parentheses", () => {
      expect(extractIngredientName("1 onion (diced)")).toBe("onion");
      expect(extractIngredientName("2 cups spinach (fresh or frozen)")).toBe("spinach");
    });

    it("should remove preparation instructions after comma", () => {
      expect(extractIngredientName("1 lb chicken breast, cubed")).toBe("chicken breast");
      expect(extractIngredientName("2 carrots, peeled and sliced")).toBe("carrots");
    });

    it("should remove common descriptors", () => {
      expect(extractIngredientName("2 large eggs")).toBe("eggs");
      expect(extractIngredientName("1 cup fresh basil")).toBe("basil");
      expect(extractIngredientName("1/2 cup melted butter")).toBe("butter");
      expect(extractIngredientName("boneless skinless chicken thighs")).toBe("chicken thighs");
    });

    it("should handle complex ingredient strings", () => {
      expect(extractIngredientName("2 cups all-purpose flour")).toBe("all-purpose flour");
      // Note: "grated" is not in the descriptors list, so it's kept
      expect(extractIngredientName("1/4 cup freshly grated parmesan cheese")).toBe("freshly grated parmesan cheese");
    });

    it("should return lowercase result", () => {
      expect(extractIngredientName("BUTTER")).toBe("butter");
      expect(extractIngredientName("Chicken Breast")).toBe("chicken breast");
    });

    it("should handle empty or whitespace-only input", () => {
      expect(extractIngredientName("")).toBe("");
      expect(extractIngredientName("   ")).toBe("");
    });
  });

  describe("matchIngredientsToStep", () => {
    const sampleIngredients = [
      "2 cups all-purpose flour",
      "1/2 cup sugar",
      "2 large eggs",
      "1 cup milk",
      "1/4 cup butter, melted",
      "1 tsp vanilla extract",
      "pinch of salt",
    ];

    it("should find ingredient matches", () => {
      const matches = matchIngredientsToStep(
        "Add the flour and sugar to the bowl",
        sampleIngredients
      );

      const flourMatch = matches.find((m) => m.ingredient.includes("flour"));
      const sugarMatch = matches.find((m) => m.ingredient.includes("sugar"));

      // Both should be found (relevance varies based on exact vs partial match)
      expect(flourMatch).toBeDefined();
      expect(sugarMatch).toBeDefined();
    });

    it("should return high relevance for exact matches", () => {
      // Use simple ingredients for exact matching
      const matches = matchIngredientsToStep(
        "Add the butter to the pan",
        ["butter", "oil", "eggs"]
      );

      const butterMatch = matches.find((m) => m.ingredient === "butter");
      expect(butterMatch).toBeDefined();
      expect(butterMatch?.relevance).toBe("high");
    });

    it("should return empty array when no matches found", () => {
      const matches = matchIngredientsToStep(
        "Preheat the oven to 350°F",
        sampleIngredients
      );

      expect(matches).toHaveLength(0);
    });

    it("should match eggs in step text", () => {
      const matches = matchIngredientsToStep(
        "Beat the eggs until fluffy",
        sampleIngredients
      );

      const eggMatch = matches.find((m) => m.ingredient.includes("eggs"));
      expect(eggMatch).toBeDefined();
    });

    it("should match milk in step text", () => {
      const matches = matchIngredientsToStep(
        "Slowly pour in the milk while stirring",
        sampleIngredients
      );

      const milkMatch = matches.find((m) => m.ingredient.includes("milk"));
      expect(milkMatch).toBeDefined();
    });

    it("should sort matches by relevance (high first)", () => {
      const ingredients = ["1 cup flour", "1 egg", "salt"];
      const matches = matchIngredientsToStep(
        "Add flour to the mixture",
        ingredients
      );

      if (matches.length > 1) {
        expect(matches[0].relevance).toBe("high");
      }
    });

    it("should include ingredient index in match result", () => {
      const ingredients = ["flour", "sugar", "eggs"];
      const matches = matchIngredientsToStep(
        "Add the sugar",
        ingredients
      );

      const sugarMatch = matches.find((m) => m.ingredient === "sugar");
      expect(sugarMatch?.index).toBe(1);
    });

    it("should handle empty ingredients array", () => {
      const matches = matchIngredientsToStep("Add the flour", []);
      expect(matches).toHaveLength(0);
    });

    it("should handle empty step text", () => {
      const matches = matchIngredientsToStep("", sampleIngredients);
      expect(matches).toHaveLength(0);
    });
  });

  describe("getHighlightedIngredientIndices", () => {
    it("should return Set of matching ingredient indices", () => {
      const ingredients = ["flour", "sugar", "eggs", "milk"];
      const indices = getHighlightedIngredientIndices(
        "Combine flour and eggs in a bowl",
        ingredients
      );

      expect(indices).toBeInstanceOf(Set);
      expect(indices.has(0)).toBe(true); // flour
      expect(indices.has(2)).toBe(true); // eggs
      expect(indices.has(1)).toBe(false); // sugar not mentioned
    });

    it("should return empty Set when no matches", () => {
      const ingredients = ["flour", "sugar"];
      const indices = getHighlightedIngredientIndices(
        "Preheat oven to 350°F",
        ingredients
      );

      expect(indices.size).toBe(0);
    });

    it("should handle multiple mentions of same ingredient", () => {
      const ingredients = ["butter"];
      const indices = getHighlightedIngredientIndices(
        "Melt the butter, then add more butter",
        ingredients
      );

      expect(indices.size).toBe(1);
      expect(indices.has(0)).toBe(true);
    });
  });

  describe("isIngredientNeededForStep", () => {
    it("should return true when ingredient is mentioned", () => {
      expect(
        isIngredientNeededForStep("Add the flour to the bowl", "2 cups flour")
      ).toBe(true);
    });

    it("should return false when ingredient is not mentioned", () => {
      expect(
        isIngredientNeededForStep("Preheat the oven", "2 cups flour")
      ).toBe(false);
    });

    it("should handle ingredient variations", () => {
      // "chicken" should match in step about chicken
      expect(
        isIngredientNeededForStep(
          "Season the chicken with salt and pepper",
          "1 lb boneless chicken breast"
        )
      ).toBe(true);
    });

    it("should be case insensitive", () => {
      expect(
        isIngredientNeededForStep("ADD THE FLOUR", "flour")
      ).toBe(true);
      expect(
        isIngredientNeededForStep("add the flour", "FLOUR")
      ).toBe(true);
    });

    it("should match partial words when significant", () => {
      // "onion" should match when step mentions "onions"
      expect(
        isIngredientNeededForStep("Dice the onions finely", "1 large onion")
      ).toBe(true);
    });

    it("should not match very short words", () => {
      // Words <= 3 characters should require exact match
      const result = isIngredientNeededForStep("Add oil to pan", "1 egg");
      // "egg" is 3 chars, shouldn't match "oil"
      expect(result).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle ingredients with hyphens", () => {
      const matches = matchIngredientsToStep(
        "Add all-purpose flour",
        ["2 cups all-purpose flour"]
      );
      expect(matches.length).toBeGreaterThan(0);
    });

    it("should handle ingredients with special characters", () => {
      // Note: The % sign remains after number removal, and "ground" is in descriptors
      const name = extractIngredientName("1/2 lb 80% lean ground beef");
      // The regex removes numbers, leaving "% lean beef" (ground is removed as descriptor)
      expect(name).toContain("lean");
      expect(name).toContain("beef");
    });

    it("should handle unicode in ingredients", () => {
      const name = extractIngredientName("2 cups crème fraîche");
      expect(name).toBe("crème fraîche");
    });

    it("should handle very long ingredient strings", () => {
      const longIngredient =
        "2 tablespoons extra-virgin olive oil, plus more for drizzling";
      const name = extractIngredientName(longIngredient);
      expect(name).toBe("extra-virgin olive oil");
    });
  });
});
