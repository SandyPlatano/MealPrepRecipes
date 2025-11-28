"""Ingredient Matcher - Matches recipes to available ingredients."""

from typing import List, Dict, Set, Tuple
import re


class IngredientMatcher:
    """Matches recipes to available ingredients."""

    # Common ingredients that most people have
    COMMON_STAPLES = {
        'salt', 'pepper', 'black pepper', 'olive oil', 'vegetable oil',
        'water', 'sugar', 'flour', 'butter'
    }

    def __init__(self, pantry_ingredients: Set[str]):
        """Initialize the matcher.

        Args:
            pantry_ingredients: Set of available ingredients
        """
        self.pantry = {ing.lower().strip() for ing in pantry_ingredients}
        self.pantry.update(self.COMMON_STAPLES)

    def _normalize_ingredient(self, ingredient: str) -> str:
        """Normalize ingredient name for matching.

        Args:
            ingredient: Raw ingredient name

        Returns:
            Normalized ingredient name
        """
        # Remove common modifiers
        modifiers = ['fresh', 'frozen', 'dried', 'chopped', 'diced', 'sliced',
                     'minced', 'shredded', 'grated', 'cooked', 'raw', 'large',
                     'small', 'medium', 'whole', 'ground', 'canned']

        ingredient = ingredient.lower().strip()

        for modifier in modifiers:
            ingredient = re.sub(r'\b' + modifier + r'\b', '', ingredient)

        # Remove extra whitespace
        ingredient = ' '.join(ingredient.split())

        return ingredient

    def _ingredient_match(self, recipe_ingredient: str, pantry_ingredient: str) -> bool:
        """Check if recipe ingredient matches pantry ingredient.

        Args:
            recipe_ingredient: Ingredient from recipe
            pantry_ingredient: Ingredient from pantry

        Returns:
            True if they match
        """
        recipe_norm = self._normalize_ingredient(recipe_ingredient)
        pantry_norm = self._normalize_ingredient(pantry_ingredient)

        # Exact match
        if recipe_norm == pantry_norm:
            return True

        # Partial match (one contains the other)
        if recipe_norm in pantry_norm or pantry_norm in recipe_norm:
            return True

        # Check singular/plural variations
        if recipe_norm.rstrip('s') == pantry_norm or recipe_norm == pantry_norm.rstrip('s'):
            return True

        return False

    def calculate_match_score(self, recipe: Dict) -> Tuple[float, List[str], List[str]]:
        """Calculate how well a recipe matches available ingredients.

        Args:
            recipe: Recipe dictionary

        Returns:
            Tuple of (match_percentage, matched_ingredients, missing_ingredients)
        """
        recipe_ingredients = [ing['item'] for ing in recipe.get('ingredients', [])]

        if not recipe_ingredients:
            return 0.0, [], []

        matched = []
        missing = []

        for recipe_ing in recipe_ingredients:
            found = False
            for pantry_ing in self.pantry:
                if self._ingredient_match(recipe_ing, pantry_ing):
                    matched.append(recipe_ing)
                    found = True
                    break

            if not found:
                missing.append(recipe_ing)

        match_percentage = (len(matched) / len(recipe_ingredients)) * 100

        return match_percentage, matched, missing

    def find_matching_recipes(self, recipes: List[Dict],
                              min_match_percentage: float = 70.0,
                              max_missing: int = None) -> List[Dict]:
        """Find recipes that match available ingredients.

        Args:
            recipes: List of recipe dictionaries
            min_match_percentage: Minimum percentage of ingredients to match
            max_missing: Maximum number of missing ingredients allowed

        Returns:
            List of recipes with match information
        """
        matching_recipes = []

        for recipe in recipes:
            match_pct, matched, missing = self.calculate_match_score(recipe)

            # Check if recipe meets criteria
            if match_pct < min_match_percentage:
                continue

            if max_missing is not None and len(missing) > max_missing:
                continue

            recipe_with_match = recipe.copy()
            recipe_with_match['match_percentage'] = match_pct
            recipe_with_match['matched_ingredients'] = matched
            recipe_with_match['missing_ingredients'] = missing

            matching_recipes.append(recipe_with_match)

        # Sort by match percentage (descending)
        matching_recipes.sort(key=lambda r: r['match_percentage'], reverse=True)

        return matching_recipes

    def find_perfect_matches(self, recipes: List[Dict]) -> List[Dict]:
        """Find recipes where we have all ingredients.

        Args:
            recipes: List of recipe dictionaries

        Returns:
            List of recipes with all ingredients available
        """
        return self.find_matching_recipes(recipes, min_match_percentage=100.0)

    def find_almost_matches(self, recipes: List[Dict], max_missing: int = 3) -> List[Dict]:
        """Find recipes where we're missing just a few ingredients.

        Args:
            recipes: List of recipe dictionaries
            max_missing: Maximum missing ingredients

        Returns:
            List of recipes with minimal missing ingredients
        """
        return self.find_matching_recipes(recipes, min_match_percentage=70.0,
                                          max_missing=max_missing)

    def get_shopping_needs(self, recipe: Dict) -> List[str]:
        """Get list of ingredients needed for a recipe.

        Args:
            recipe: Recipe dictionary

        Returns:
            List of missing ingredients
        """
        _, _, missing = self.calculate_match_score(recipe)
        return missing
