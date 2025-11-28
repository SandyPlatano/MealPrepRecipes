"""Meal Planner - Generates weekly dinner plans."""

from typing import List, Dict
import random
from datetime import datetime


class MealPlanner:
    """Generates weekly dinner plans based on available recipes."""

    DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    def __init__(self, recipes: List[Dict]):
        """Initialize the meal planner.

        Args:
            recipes: List of all available dinner recipes
        """
        self.recipes = recipes

    def generate_weekly_plan(self,
                             days: int = 7,
                             variety: bool = True,
                             prefer_meal_prep: bool = True) -> Dict:
        """Generate a weekly dinner plan.

        Args:
            days: Number of days to plan for (default 7 for full week)
            variety: Ensure variety in meal selection (avoid repeats)
            prefer_meal_prep: Prefer meal-prep-friendly recipes

        Returns:
            Dictionary containing the dinner plan
        """
        available_recipes = self.recipes.copy()

        # Filter for meal-prep friendly recipes if requested
        if prefer_meal_prep:
            meal_prep_recipes = [
                r for r in available_recipes
                if 'meal-prep-friendly' in r.get('tags', [])
            ]
            if meal_prep_recipes:
                available_recipes = meal_prep_recipes

        meal_plan = {
            'start_date': datetime.now().strftime('%Y-%m-%d'),
            'days': days,
            'dinners': {}
        }

        used_recipes = set()

        for day_num in range(days):
            day_name = self.DAYS_OF_WEEK[day_num % 7]

            dinner = self._select_recipe(available_recipes, used_recipes, variety)
            if dinner:
                meal_plan['dinners'][day_name] = dinner
                if variety:
                    used_recipes.add(dinner['id'])

        return meal_plan

    def _select_recipe(self, available_recipes: List[Dict],
                       used_recipes: set,
                       variety: bool) -> Dict:
        """Select a dinner recipe.

        Args:
            available_recipes: Available dinner recipes
            used_recipes: Set of already used recipe IDs
            variety: Whether to avoid repeats

        Returns:
            Selected recipe
        """
        if not available_recipes:
            return None

        # Filter out used recipes if variety is requested
        if variety:
            unused = [r for r in available_recipes if r['id'] not in used_recipes]
            if not unused:
                # If all used, reset and use all recipes
                unused = available_recipes
            return random.choice(unused)
        else:
            return random.choice(available_recipes)

    def print_meal_plan(self, meal_plan: Dict, show_details: bool = False):
        """Print a formatted dinner plan.

        Args:
            meal_plan: Meal plan dictionary
            show_details: Show recipe details (time, missing ingredients)
        """
        print(f"\n{'='*70}")
        print(f"WEEKLY DINNER PLAN - {meal_plan['days']} Days")
        print(f"Starting: {meal_plan['start_date']}")
        print(f"{'='*70}\n")

        for day, recipe in meal_plan['dinners'].items():
            match_info = ""
            if 'match_percentage' in recipe:
                match_info = f" ({recipe['match_percentage']:.0f}% match)"

            print(f"{day}: {recipe['name']}{match_info}")

            if show_details:
                total_time = recipe['prep_time'] + recipe['cook_time']
                tags = ', '.join(recipe.get('tags', []))
                print(f"  Time: {total_time} min | Servings: {recipe['servings']}")
                print(f"  Tags: {tags}")

                if recipe.get('missing_ingredients'):
                    print(f"  Missing: {', '.join(recipe['missing_ingredients'])}")
            print()

    def get_all_recipes_from_plan(self, meal_plan: Dict) -> List[Dict]:
        """Get all recipes from a dinner plan.

        Args:
            meal_plan: Meal plan dictionary

        Returns:
            List of unique recipes
        """
        return list(meal_plan['dinners'].values())
