"""Recipe Manager - Handles loading and searching recipes."""

import json
import os
from pathlib import Path
from typing import List, Dict, Optional


class RecipeManager:
    """Manages recipe database operations."""

    def __init__(self, recipes_dir: str = None):
        """Initialize the recipe manager.

        Args:
            recipes_dir: Path to recipes directory. Defaults to ../recipes
        """
        if recipes_dir is None:
            current_dir = Path(__file__).parent
            recipes_dir = current_dir.parent / "recipes"

        self.recipes_dir = Path(recipes_dir)
        self.recipes: List[Dict] = []
        self._load_all_recipes()

    def _load_all_recipes(self):
        """Load all recipes from JSON files."""
        self.recipes = []

        if not self.recipes_dir.exists():
            print(f"Warning: Recipes directory not found: {self.recipes_dir}")
            return

        for recipe_file in self.recipes_dir.glob("*.json"):
            try:
                with open(recipe_file, 'r') as f:
                    recipes_data = json.load(f)
                    self.recipes.extend(recipes_data)
            except Exception as e:
                print(f"Error loading {recipe_file}: {e}")

    def get_all_recipes(self) -> List[Dict]:
        """Get all recipes."""
        return self.recipes

    def get_recipe_by_id(self, recipe_id: str) -> Optional[Dict]:
        """Get a specific recipe by ID.

        Args:
            recipe_id: The recipe ID

        Returns:
            Recipe dict or None if not found
        """
        for recipe in self.recipes:
            if recipe.get('id') == recipe_id:
                return recipe
        return None

    def search_by_category(self, category: str) -> List[Dict]:
        """Search recipes by category.

        Args:
            category: Category name (breakfast, lunch, dinner, snack)

        Returns:
            List of matching recipes
        """
        return [r for r in self.recipes if r.get('category', '').lower() == category.lower()]

    def search_by_tag(self, tag: str) -> List[Dict]:
        """Search recipes by tag.

        Args:
            tag: Tag to search for

        Returns:
            List of matching recipes
        """
        return [r for r in self.recipes if tag.lower() in [t.lower() for t in r.get('tags', [])]]

    def search_by_name(self, query: str) -> List[Dict]:
        """Search recipes by name.

        Args:
            query: Search query

        Returns:
            List of matching recipes
        """
        query_lower = query.lower()
        return [r for r in self.recipes if query_lower in r.get('name', '').lower()]

    def get_quick_recipes(self, max_time: int = 30) -> List[Dict]:
        """Get recipes that can be prepared quickly.

        Args:
            max_time: Maximum total time in minutes

        Returns:
            List of quick recipes
        """
        return [
            r for r in self.recipes
            if (r.get('prep_time', 0) + r.get('cook_time', 0)) <= max_time
        ]

    def get_recipe_ingredients(self, recipe_id: str) -> List[str]:
        """Get list of ingredient names for a recipe.

        Args:
            recipe_id: The recipe ID

        Returns:
            List of ingredient names
        """
        recipe = self.get_recipe_by_id(recipe_id)
        if not recipe:
            return []

        return [ing['item'] for ing in recipe.get('ingredients', [])]

    def print_recipe(self, recipe: Dict):
        """Print a formatted recipe.

        Args:
            recipe: Recipe dictionary
        """
        print(f"\n{'='*60}")
        print(f"{recipe['name']}")
        print(f"{'='*60}")
        print(f"Category: {recipe['category'].title()}")
        print(f"Prep Time: {recipe['prep_time']} min | Cook Time: {recipe['cook_time']} min")
        print(f"Servings: {recipe['servings']} | Difficulty: {recipe['difficulty']}")
        print(f"Tags: {', '.join(recipe.get('tags', []))}")

        print(f"\nIngredients:")
        for ing in recipe['ingredients']:
            print(f"  - {ing['amount']} {ing['item']}")

        print(f"\nInstructions:")
        for i, step in enumerate(recipe['instructions'], 1):
            print(f"  {i}. {step}")
        print(f"{'='*60}\n")
