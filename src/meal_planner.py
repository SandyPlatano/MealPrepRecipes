"""Meal Planner - Generates weekly meal plans."""

from typing import List, Dict, Optional
import random
from datetime import datetime, timedelta


class MealPlanner:
    """Generates meal plans based on available recipes and preferences."""

    DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    def __init__(self, recipes: List[Dict]):
        """Initialize the meal planner.

        Args:
            recipes: List of all available recipes
        """
        self.recipes = recipes

    def _categorize_recipes(self) -> Dict[str, List[Dict]]:
        """Categorize recipes by meal type.

        Returns:
            Dictionary of recipes by category
        """
        categories = {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'snack': []
        }

        for recipe in self.recipes:
            category = recipe.get('category', '').lower()
            if category in categories:
                categories[category].append(recipe)

        return categories

    def generate_weekly_plan(self,
                             days: int = 7,
                             include_breakfast: bool = True,
                             include_lunch: bool = True,
                             include_dinner: bool = True,
                             include_snacks: bool = False,
                             variety: bool = True,
                             prefer_meal_prep: bool = True) -> Dict:
        """Generate a weekly meal plan.

        Args:
            days: Number of days to plan for
            include_breakfast: Include breakfast meals
            include_lunch: Include lunch meals
            include_dinner: Include dinner meals
            include_snacks: Include snack ideas
            variety: Ensure variety in meal selection
            prefer_meal_prep: Prefer meal-prep-friendly recipes

        Returns:
            Dictionary containing the meal plan
        """
        categories = self._categorize_recipes()
        meal_plan = {
            'start_date': datetime.now().strftime('%Y-%m-%d'),
            'days': days,
            'meals': {}
        }

        # Filter for meal-prep friendly recipes if requested
        if prefer_meal_prep:
            for cat in categories:
                categories[cat] = [
                    r for r in categories[cat]
                    if 'meal-prep-friendly' in r.get('tags', [])
                ] or categories[cat]  # Fallback to all if no meal-prep recipes

        used_recipes = set()

        for day_num in range(days):
            day_name = self.DAYS_OF_WEEK[day_num % 7]
            meal_plan['meals'][day_name] = {}

            # Breakfast
            if include_breakfast and categories['breakfast']:
                breakfast = self._select_recipe(categories['breakfast'], used_recipes, variety)
                if breakfast:
                    meal_plan['meals'][day_name]['breakfast'] = breakfast
                    if variety:
                        used_recipes.add(breakfast['id'])

            # Lunch
            if include_lunch and categories['lunch']:
                lunch = self._select_recipe(categories['lunch'], used_recipes, variety)
                if lunch:
                    meal_plan['meals'][day_name]['lunch'] = lunch
                    if variety:
                        used_recipes.add(lunch['id'])

            # Dinner
            if include_dinner and categories['dinner']:
                dinner = self._select_recipe(categories['dinner'], used_recipes, variety)
                if dinner:
                    meal_plan['meals'][day_name]['dinner'] = dinner
                    if variety:
                        used_recipes.add(dinner['id'])

            # Snacks
            if include_snacks and categories['snack']:
                snack = self._select_recipe(categories['snack'], used_recipes, variety)
                if snack:
                    meal_plan['meals'][day_name]['snack'] = snack

        return meal_plan

    def _select_recipe(self, category_recipes: List[Dict],
                       used_recipes: set,
                       variety: bool) -> Optional[Dict]:
        """Select a recipe from a category.

        Args:
            category_recipes: Recipes in this category
            used_recipes: Set of already used recipe IDs
            variety: Whether to avoid repeats

        Returns:
            Selected recipe or None
        """
        if not category_recipes:
            return None

        # Filter out used recipes if variety is requested
        if variety:
            available = [r for r in category_recipes if r['id'] not in used_recipes]
            if not available:
                # If all used, reset and use all recipes
                available = category_recipes
        else:
            available = category_recipes

        # Randomly select a recipe
        return random.choice(available)

    def generate_plan_with_preferences(self,
                                       matched_recipes: List[Dict],
                                       days: int = 7,
                                       **kwargs) -> Dict:
        """Generate a meal plan from matched recipes.

        Args:
            matched_recipes: Recipes that match available ingredients
            days: Number of days
            **kwargs: Additional arguments for generate_weekly_plan

        Returns:
            Meal plan dictionary
        """
        # Temporarily use only matched recipes
        original_recipes = self.recipes
        self.recipes = matched_recipes

        meal_plan = self.generate_weekly_plan(days=days, **kwargs)

        # Restore original recipes
        self.recipes = original_recipes

        return meal_plan

    def print_meal_plan(self, meal_plan: Dict, show_details: bool = False):
        """Print a formatted meal plan.

        Args:
            meal_plan: Meal plan dictionary
            show_details: Show recipe details
        """
        print(f"\n{'='*70}")
        print(f"MEAL PLAN - {meal_plan['days']} Days")
        print(f"Starting: {meal_plan['start_date']}")
        print(f"{'='*70}\n")

        for day, meals in meal_plan['meals'].items():
            print(f"{day}")
            print("-" * 70)

            for meal_type, recipe in meals.items():
                match_info = ""
                if 'match_percentage' in recipe:
                    match_info = f" ({recipe['match_percentage']:.0f}% match)"

                print(f"  {meal_type.title()}: {recipe['name']}{match_info}")

                if show_details:
                    print(f"    Time: {recipe['prep_time'] + recipe['cook_time']} min")
                    if recipe.get('missing_ingredients'):
                        print(f"    Missing: {', '.join(recipe['missing_ingredients'])}")

            print()

    def get_all_recipes_from_plan(self, meal_plan: Dict) -> List[Dict]:
        """Get all unique recipes from a meal plan.

        Args:
            meal_plan: Meal plan dictionary

        Returns:
            List of unique recipes
        """
        recipes = {}

        for day, meals in meal_plan['meals'].items():
            for meal_type, recipe in meals.items():
                recipes[recipe['id']] = recipe

        return list(recipes.values())
