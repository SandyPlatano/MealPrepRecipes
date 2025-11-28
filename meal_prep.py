#!/usr/bin/env python3
"""Meal Prep Planner - Main CLI Application."""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from recipe_manager import RecipeManager
from pantry import Pantry
from ingredient_matcher import IngredientMatcher
from meal_planner import MealPlanner
from shopping_list import ShoppingListGenerator


class MealPrepApp:
    """Main application class for Meal Prep Planner."""

    def __init__(self):
        """Initialize the application."""
        self.recipe_manager = RecipeManager()
        self.pantry = Pantry()
        self.current_meal_plan = None

    def show_menu(self):
        """Display main menu."""
        print("\n" + "="*70)
        print("MEAL PREP PLANNER")
        print("="*70)
        print("\nWhat would you like to do?")
        print("\n  PANTRY MANAGEMENT")
        print("  1. View pantry")
        print("  2. Add ingredients to pantry")
        print("  3. Remove ingredient from pantry")
        print("  4. Clear pantry")
        print("\n  RECIPE DISCOVERY")
        print("  5. Find recipes I can make now")
        print("  6. Find recipes with missing ingredients")
        print("  7. Browse all recipes")
        print("  8. Search recipes by name")
        print("  9. View recipe details")
        print("\n  MEAL PLANNING")
        print("  10. Generate weekly meal plan")
        print("  11. Generate meal plan from available ingredients")
        print("  12. View current meal plan")
        print("\n  SHOPPING")
        print("  13. Generate shopping list from meal plan")
        print("  14. Generate shopping list for specific recipes")
        print("\n  0. Exit")
        print("\n" + "="*70)

    def run(self):
        """Run the main application loop."""
        print("\nWelcome to Meal Prep Planner!")
        print(f"Loaded {len(self.recipe_manager.recipes)} recipes")

        while True:
            self.show_menu()
            choice = input("\nEnter your choice: ").strip()

            if choice == '0':
                print("\nHappy cooking! Goodbye!")
                break
            elif choice == '1':
                self.view_pantry()
            elif choice == '2':
                self.add_to_pantry()
            elif choice == '3':
                self.remove_from_pantry()
            elif choice == '4':
                self.clear_pantry()
            elif choice == '5':
                self.find_makeable_recipes()
            elif choice == '6':
                self.find_almost_makeable_recipes()
            elif choice == '7':
                self.browse_recipes()
            elif choice == '8':
                self.search_recipes()
            elif choice == '9':
                self.view_recipe_details()
            elif choice == '10':
                self.generate_meal_plan()
            elif choice == '11':
                self.generate_meal_plan_from_pantry()
            elif choice == '12':
                self.view_meal_plan()
            elif choice == '13':
                self.generate_shopping_list_from_plan()
            elif choice == '14':
                self.generate_shopping_list_custom()
            else:
                print("\nInvalid choice. Please try again.")

            input("\nPress Enter to continue...")

    def view_pantry(self):
        """View current pantry contents."""
        self.pantry.print_pantry()

    def add_to_pantry(self):
        """Add ingredients to pantry."""
        print("\nAdd ingredients (comma-separated):")
        ingredients = input("> ").strip()

        if ingredients:
            self.pantry.import_from_list(ingredients)
            print(f"\nAdded ingredients to pantry!")
            self.pantry.print_pantry()

    def remove_from_pantry(self):
        """Remove ingredient from pantry."""
        self.pantry.print_pantry()
        print("\nEnter ingredient to remove:")
        ingredient = input("> ").strip()

        if ingredient:
            self.pantry.remove_ingredient(ingredient)
            print(f"\nRemoved '{ingredient}' from pantry")

    def clear_pantry(self):
        """Clear all pantry items."""
        confirm = input("\nAre you sure you want to clear your pantry? (yes/no): ").strip().lower()
        if confirm == 'yes':
            self.pantry.clear_pantry()
            print("\nPantry cleared!")

    def find_makeable_recipes(self):
        """Find recipes that can be made with current ingredients."""
        matcher = IngredientMatcher(self.pantry.ingredients)
        perfect_matches = matcher.find_perfect_matches(self.recipe_manager.recipes)

        if not perfect_matches:
            print("\nNo recipes found with current ingredients.")
            print("Try option 6 to see recipes you're close to making!")
            return

        print(f"\n{'='*70}")
        print(f"RECIPES YOU CAN MAKE NOW ({len(perfect_matches)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(perfect_matches, 1):
            tags = ', '.join(recipe.get('tags', []))
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. {recipe['name']}")
            print(f"   Category: {recipe['category'].title()} | Time: {time} min | Tags: {tags}")
            print()

    def find_almost_makeable_recipes(self):
        """Find recipes with few missing ingredients."""
        print("\nMaximum missing ingredients (1-5):")
        try:
            max_missing = int(input("> ").strip() or "3")
            max_missing = max(1, min(5, max_missing))
        except ValueError:
            max_missing = 3

        matcher = IngredientMatcher(self.pantry.ingredients)
        almost_matches = matcher.find_almost_matches(
            self.recipe_manager.recipes,
            max_missing=max_missing
        )

        if not almost_matches:
            print(f"\nNo recipes found with {max_missing} or fewer missing ingredients.")
            return

        print(f"\n{'='*70}")
        print(f"RECIPES WITH FEW MISSING INGREDIENTS ({len(almost_matches)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(almost_matches, 1):
            missing = recipe['missing_ingredients']
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. {recipe['name']} ({recipe['match_percentage']:.0f}% match)")
            print(f"   Category: {recipe['category'].title()} | Time: {time} min")
            print(f"   Missing: {', '.join(missing)}")
            print()

    def browse_recipes(self):
        """Browse all recipes by category."""
        print("\nSelect category:")
        print("  1. Breakfast")
        print("  2. Lunch")
        print("  3. Dinner")
        print("  4. Snacks")
        print("  5. All recipes")

        choice = input("> ").strip()
        category_map = {
            '1': 'breakfast',
            '2': 'lunch',
            '3': 'dinner',
            '4': 'snack',
            '5': 'all'
        }

        category = category_map.get(choice)
        if not category:
            print("\nInvalid choice.")
            return

        if category == 'all':
            recipes = self.recipe_manager.recipes
        else:
            recipes = self.recipe_manager.search_by_category(category)

        self._display_recipe_list(recipes)

    def search_recipes(self):
        """Search recipes by name."""
        print("\nEnter search term:")
        query = input("> ").strip()

        if not query:
            return

        recipes = self.recipe_manager.search_by_name(query)

        if not recipes:
            print(f"\nNo recipes found matching '{query}'")
            return

        self._display_recipe_list(recipes)

    def view_recipe_details(self):
        """View detailed recipe information."""
        print("\nEnter recipe ID (e.g., b001, l001, d001):")
        recipe_id = input("> ").strip()

        recipe = self.recipe_manager.get_recipe_by_id(recipe_id)

        if not recipe:
            print(f"\nRecipe '{recipe_id}' not found.")
            return

        self.recipe_manager.print_recipe(recipe)

        # Show match info if pantry has ingredients
        if self.pantry.ingredients:
            matcher = IngredientMatcher(self.pantry.ingredients)
            match_pct, matched, missing = matcher.calculate_match_score(recipe)

            print(f"Match with your pantry: {match_pct:.0f}%")
            if missing:
                print(f"Missing ingredients: {', '.join(missing)}")
            print()

    def generate_meal_plan(self):
        """Generate a weekly meal plan."""
        print("\nMeal Plan Configuration")
        print("-" * 70)

        try:
            days = int(input("Number of days (default 7): ").strip() or "7")
            days = max(1, min(14, days))
        except ValueError:
            days = 7

        include_breakfast = input("Include breakfast? (y/n, default y): ").strip().lower() != 'n'
        include_lunch = input("Include lunch? (y/n, default y): ").strip().lower() != 'n'
        include_dinner = input("Include dinner? (y/n, default y): ").strip().lower() != 'n'
        include_snacks = input("Include snacks? (y/n, default n): ").strip().lower() == 'y'

        planner = MealPlanner(self.recipe_manager.recipes)
        self.current_meal_plan = planner.generate_weekly_plan(
            days=days,
            include_breakfast=include_breakfast,
            include_lunch=include_lunch,
            include_dinner=include_dinner,
            include_snacks=include_snacks,
            prefer_meal_prep=True
        )

        planner.print_meal_plan(self.current_meal_plan, show_details=True)

    def generate_meal_plan_from_pantry(self):
        """Generate meal plan based on available ingredients."""
        if not self.pantry.ingredients:
            print("\nYour pantry is empty! Add ingredients first (option 2).")
            return

        print("\nGenerating meal plan from available ingredients...")
        print("-" * 70)

        try:
            days = int(input("Number of days (default 7): ").strip() or "7")
            days = max(1, min(14, days))
        except ValueError:
            days = 7

        try:
            max_missing = int(input("Max missing ingredients per recipe (default 3): ").strip() or "3")
            max_missing = max(0, min(5, max_missing))
        except ValueError:
            max_missing = 3

        # Find matching recipes
        matcher = IngredientMatcher(self.pantry.ingredients)
        matched_recipes = matcher.find_almost_matches(
            self.recipe_manager.recipes,
            max_missing=max_missing
        )

        if not matched_recipes:
            print(f"\nNot enough recipes found with your criteria.")
            print("Try adding more ingredients or increasing max missing ingredients.")
            return

        print(f"\nFound {len(matched_recipes)} matching recipes!")

        # Generate plan
        planner = MealPlanner(matched_recipes)
        self.current_meal_plan = planner.generate_weekly_plan(
            days=days,
            include_breakfast=True,
            include_lunch=True,
            include_dinner=True,
            prefer_meal_prep=True
        )

        planner.print_meal_plan(self.current_meal_plan, show_details=True)

    def view_meal_plan(self):
        """View current meal plan."""
        if not self.current_meal_plan:
            print("\nNo meal plan generated yet. Use option 10 or 11 to create one.")
            return

        planner = MealPlanner(self.recipe_manager.recipes)
        planner.print_meal_plan(self.current_meal_plan, show_details=True)

    def generate_shopping_list_from_plan(self):
        """Generate shopping list from current meal plan."""
        if not self.current_meal_plan:
            print("\nNo meal plan found. Generate a meal plan first (option 10 or 11).")
            return

        skip_pantry = input("\nSkip items already in pantry? (y/n, default y): ").strip().lower() != 'n'

        generator = ShoppingListGenerator(self.pantry.ingredients if skip_pantry else set())
        shopping_list = generator.generate_from_meal_plan(self.current_meal_plan, skip_pantry)

        generator.print_shopping_list(shopping_list)

    def generate_shopping_list_custom(self):
        """Generate shopping list for specific recipes."""
        print("\nEnter recipe IDs (comma-separated, e.g., b001,l002,d003):")
        recipe_ids = input("> ").strip()

        if not recipe_ids:
            return

        recipes = []
        for recipe_id in recipe_ids.split(','):
            recipe_id = recipe_id.strip()
            recipe = self.recipe_manager.get_recipe_by_id(recipe_id)
            if recipe:
                recipes.append(recipe)
            else:
                print(f"Warning: Recipe '{recipe_id}' not found")

        if not recipes:
            print("\nNo valid recipes found.")
            return

        skip_pantry = input("\nSkip items already in pantry? (y/n, default y): ").strip().lower() != 'n'

        generator = ShoppingListGenerator(self.pantry.ingredients if skip_pantry else set())
        shopping_list = generator.generate_from_recipes(recipes, skip_pantry)

        generator.print_shopping_list(shopping_list)

    def _display_recipe_list(self, recipes: list):
        """Display a list of recipes.

        Args:
            recipes: List of recipe dictionaries
        """
        if not recipes:
            print("\nNo recipes found.")
            return

        print(f"\n{'='*70}")
        print(f"RECIPES ({len(recipes)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(recipes, 1):
            tags = ', '.join(recipe.get('tags', []))
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. [{recipe['id']}] {recipe['name']}")
            print(f"   Category: {recipe['category'].title()} | Time: {time} min")
            print(f"   Tags: {tags}")
            print()


def main():
    """Main entry point."""
    app = MealPrepApp()
    try:
        app.run()
    except KeyboardInterrupt:
        print("\n\nGoodbye!")
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
