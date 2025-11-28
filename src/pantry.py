"""Pantry Manager - Handles ingredient inventory."""

import json
from pathlib import Path
from typing import List, Set
from datetime import datetime


class Pantry:
    """Manages user's ingredient inventory."""

    def __init__(self, data_dir: str = None):
        """Initialize the pantry.

        Args:
            data_dir: Path to data directory
        """
        if data_dir is None:
            current_dir = Path(__file__).parent
            data_dir = current_dir.parent / "data"

        self.data_dir = Path(data_dir)
        self.pantry_file = self.data_dir / "pantry.json"
        self.ingredients: Set[str] = set()
        self._load_pantry()

    def _load_pantry(self):
        """Load pantry from file."""
        if self.pantry_file.exists():
            try:
                with open(self.pantry_file, 'r') as f:
                    data = json.load(f)
                    self.ingredients = set(data.get('ingredients', []))
            except Exception as e:
                print(f"Error loading pantry: {e}")
                self.ingredients = set()
        else:
            # Create data directory if it doesn't exist
            self.data_dir.mkdir(exist_ok=True)
            self.ingredients = set()

    def _save_pantry(self):
        """Save pantry to file."""
        data = {
            'ingredients': sorted(list(self.ingredients)),
            'last_updated': datetime.now().isoformat()
        }

        with open(self.pantry_file, 'w') as f:
            json.dump(data, f, indent=2)

    def add_ingredient(self, ingredient: str):
        """Add an ingredient to the pantry.

        Args:
            ingredient: Ingredient name
        """
        self.ingredients.add(ingredient.lower().strip())
        self._save_pantry()

    def add_ingredients(self, ingredients: List[str]):
        """Add multiple ingredients to the pantry.

        Args:
            ingredients: List of ingredient names
        """
        for ing in ingredients:
            self.ingredients.add(ing.lower().strip())
        self._save_pantry()

    def remove_ingredient(self, ingredient: str):
        """Remove an ingredient from the pantry.

        Args:
            ingredient: Ingredient name
        """
        self.ingredients.discard(ingredient.lower().strip())
        self._save_pantry()

    def has_ingredient(self, ingredient: str) -> bool:
        """Check if pantry has an ingredient.

        Args:
            ingredient: Ingredient name

        Returns:
            True if ingredient is in pantry
        """
        return ingredient.lower().strip() in self.ingredients

    def get_all_ingredients(self) -> List[str]:
        """Get all ingredients in pantry.

        Returns:
            Sorted list of ingredients
        """
        return sorted(list(self.ingredients))

    def clear_pantry(self):
        """Clear all ingredients from pantry."""
        self.ingredients = set()
        self._save_pantry()

    def import_from_list(self, ingredient_list: str):
        """Import ingredients from a comma-separated string.

        Args:
            ingredient_list: Comma-separated ingredient names
        """
        ingredients = [ing.strip() for ing in ingredient_list.split(',') if ing.strip()]
        self.add_ingredients(ingredients)

    def print_pantry(self):
        """Print all pantry ingredients."""
        if not self.ingredients:
            print("Your pantry is empty!")
            return

        print(f"\nPantry Contents ({len(self.ingredients)} ingredients):")
        print("-" * 40)
        for ing in sorted(self.ingredients):
            print(f"  - {ing}")
        print("-" * 40)
