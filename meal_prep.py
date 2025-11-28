#!/usr/bin/env python3
"""Meal Prep Planner - Weekly Dinner Planning Application."""

import sys
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from recipe_manager import RecipeManager
from pantry import Pantry
from ingredient_matcher import IngredientMatcher
from meal_planner import MealPlanner
from shopping_list import ShoppingListGenerator


class DinnerPlannerApp:
    """Main application for Weekly Dinner Planner."""

    def __init__(self):
        """Initialize the application."""
        self.recipe_manager = RecipeManager()
        self.pantry = Pantry()
        self.current_dinner_plan = None

    def show_menu(self):
        """Display main menu."""
        print("\n" + "="*70)
        print("WEEKLY DINNER PLANNER")
        print("="*70)
        print("\nWhat would you like to do?")
        print("\n  PANTRY MANAGEMENT")
        print("  1. View pantry")
        print("  2. Add ingredients to pantry")
        print("  3. Remove ingredient from pantry")
        print("  4. Clear pantry")
        print("\n  RECIPE DISCOVERY")
        print("  5. Find dinners I can make now")
        print("  6. Find dinners with few missing ingredients")
        print("  7. Browse all dinner recipes")
        print("  8. Search recipes by name")
        print("  9. View recipe details")
        print("\n  DINNER PLANNING")
        print("  10. Generate weekly dinner plan (all recipes)")
        print("  11. Generate dinner plan from pantry ingredients")
        print("  12. View current dinner plan")
        print("\n  SHOPPING")
        print("  13. Generate shopping list from dinner plan")
        print("  14. Generate shopping list for specific recipes")
        print("\n  0. Exit")
        print("\n" + "="*70)

    def run(self):
        """Run the main application loop."""
        print("\nWelcome to Weekly Dinner Planner!")
        print(f"Loaded {len(self.recipe_manager.recipes)} dinner recipes")
        print("Plan your week of dinners and generate shopping lists!")

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
                self.find_makeable_dinners()
            elif choice == '6':
                self.find_almost_makeable_dinners()
            elif choice == '7':
                self.browse_recipes()
            elif choice == '8':
                self.search_recipes()
            elif choice == '9':
                self.view_recipe_details()
            elif choice == '10':
                self.generate_dinner_plan()
            elif choice == '11':
                self.generate_dinner_plan_from_pantry()
            elif choice == '12':
                self.view_dinner_plan()
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
        print("Example: chicken breast, rice, broccoli, garlic, onion")
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

    def find_makeable_dinners(self):
        """Find dinners that can be made with current ingredients."""
        if not self.pantry.ingredients:
            print("\nYour pantry is empty! Add ingredients first (option 2).")
            return

        matcher = IngredientMatcher(self.pantry.ingredients)
        perfect_matches = matcher.find_perfect_matches(self.recipe_manager.recipes)

        if not perfect_matches:
            print("\nNo dinners found with current ingredients.")
            print("Try option 6 to see dinners you're close to making!")
            return

        print(f"\n{'='*70}")
        print(f"DINNERS YOU CAN MAKE NOW ({len(perfect_matches)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(perfect_matches, 1):
            tags = ', '.join(recipe.get('tags', []))
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. [{recipe['id']}] {recipe['name']}")
            print(f"   Time: {time} min | Servings: {recipe['servings']}")
            print(f"   Tags: {tags}")
            print()

    def find_almost_makeable_dinners(self):
        """Find dinners with few missing ingredients."""
        if not self.pantry.ingredients:
            print("\nYour pantry is empty! Add ingredients first (option 2).")
            return

        print("\nMaximum missing ingredients (1-5, default 3):")
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
            print(f"\nNo dinners found with {max_missing} or fewer missing ingredients.")
            return

        print(f"\n{'='*70}")
        print(f"DINNERS WITH FEW MISSING INGREDIENTS ({len(almost_matches)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(almost_matches, 1):
            missing = recipe['missing_ingredients']
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. [{recipe['id']}] {recipe['name']} ({recipe['match_percentage']:.0f}% match)")
            print(f"   Time: {time} min | Servings: {recipe['servings']}")
            print(f"   Missing: {', '.join(missing)}")
            print()

    def browse_recipes(self):
        """Browse all dinner recipes."""
        recipes = self.recipe_manager.recipes

        # Option to filter by tag
        print("\nFilter by tag? (press Enter to skip)")
        print("Available tags: meal-prep-friendly, quick, healthy, comfort-food, etc.")
        tag = input("> ").strip()

        if tag:
            recipes = self.recipe_manager.search_by_tag(tag)

        self._display_recipe_list(recipes)

    def search_recipes(self):
        """Search recipes by name."""
        print("\nEnter search term:")
        query = input("> ").strip()

        if not query:
            return

        recipes = self.recipe_manager.search_by_name(query)

        if not recipes:
            print(f"\nNo dinners found matching '{query}'")
            return

        self._display_recipe_list(recipes)

    def view_recipe_details(self):
        """View detailed recipe information."""
        print("\nEnter recipe ID (e.g., d001, d002, d003):")
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

    def generate_dinner_plan(self):
        """Generate a weekly dinner plan."""
        print("\nWeekly Dinner Plan Configuration")
        print("-" * 70)

        try:
            days = int(input("Number of days (default 7 for full week): ").strip() or "7")
            days = max(1, min(14, days))
        except ValueError:
            days = 7

        prefer_meal_prep = input("Prefer meal-prep-friendly recipes? (y/n, default y): ").strip().lower() != 'n'

        planner = MealPlanner(self.recipe_manager.recipes)
        self.current_dinner_plan = planner.generate_weekly_plan(
            days=days,
            prefer_meal_prep=prefer_meal_prep
        )

        planner.print_meal_plan(self.current_dinner_plan, show_details=True)

    def generate_dinner_plan_from_pantry(self):
        """Generate dinner plan based on available ingredients."""
        if not self.pantry.ingredients:
            print("\nYour pantry is empty! Add ingredients first (option 2).")
            return

        print("\nGenerating dinner plan from available ingredients...")
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

        print(f"\nFound {len(matched_recipes)} matching dinner recipes!")

        # Generate plan
        planner = MealPlanner(matched_recipes)
        self.current_dinner_plan = planner.generate_weekly_plan(
            days=days,
            prefer_meal_prep=True
        )

        planner.print_meal_plan(self.current_dinner_plan, show_details=True)

    def view_dinner_plan(self):
        """View current dinner plan."""
        if not self.current_dinner_plan:
            print("\nNo dinner plan generated yet. Use option 10 or 11 to create one.")
            return

        planner = MealPlanner(self.recipe_manager.recipes)
        planner.print_meal_plan(self.current_dinner_plan, show_details=True)

    def generate_shopping_list_from_plan(self):
        """Generate shopping list from current dinner plan."""
        if not self.current_dinner_plan:
            print("\nNo dinner plan found. Generate a dinner plan first (option 10 or 11).")
            return

        skip_pantry = input("\nSkip items already in pantry? (y/n, default y): ").strip().lower() != 'n'

        generator = ShoppingListGenerator(self.pantry.ingredients if skip_pantry else set())
        shopping_list = generator.generate_from_meal_plan(self.current_dinner_plan, skip_pantry)

        generator.print_shopping_list(shopping_list)

        print("\nTip: Take this list with you on your Sunday shopping trip!")

    def generate_shopping_list_custom(self):
        """Generate shopping list for specific recipes."""
        print("\nEnter recipe IDs (comma-separated, e.g., d001,d005,d010):")
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
        print(f"DINNER RECIPES ({len(recipes)} found)")
        print(f"{'='*70}\n")

        for i, recipe in enumerate(recipes, 1):
            tags = ', '.join(recipe.get('tags', []))
            time = recipe['prep_time'] + recipe['cook_time']
            print(f"{i}. [{recipe['id']}] {recipe['name']}")
            print(f"   Time: {time} min | Servings: {recipe['servings']}")
            print(f"   Tags: {tags}")
            print()


def main():
    """Main entry point."""
    app = DinnerPlannerApp()
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
