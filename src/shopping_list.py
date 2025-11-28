"""Shopping List Generator - Creates shopping lists from meal plans."""

from typing import List, Dict, Set
from collections import defaultdict


class ShoppingListGenerator:
    """Generates shopping lists from meal plans."""

    def __init__(self, pantry_ingredients: Set[str] = None):
        """Initialize the shopping list generator.

        Args:
            pantry_ingredients: Set of ingredients already in pantry
        """
        self.pantry = {ing.lower().strip() for ing in (pantry_ingredients or [])}

    def generate_from_recipes(self, recipes: List[Dict],
                              skip_pantry: bool = True) -> Dict[str, List[Dict]]:
        """Generate a shopping list from a list of recipes.

        Args:
            recipes: List of recipe dictionaries
            skip_pantry: Skip ingredients already in pantry

        Returns:
            Dictionary of ingredients organized by category
        """
        # Collect all ingredients with their amounts
        ingredient_list = defaultdict(list)

        for recipe in recipes:
            for ing in recipe.get('ingredients', []):
                item = ing['item'].lower().strip()

                # Skip if in pantry and skip_pantry is True
                if skip_pantry and item in self.pantry:
                    continue

                ingredient_list[item].append({
                    'amount': ing['amount'],
                    'recipe': recipe['name']
                })

        # Categorize ingredients
        categorized = self._categorize_ingredients(ingredient_list)

        return categorized

    def generate_from_meal_plan(self, meal_plan: Dict,
                                skip_pantry: bool = True) -> Dict[str, List[Dict]]:
        """Generate shopping list from a meal plan.

        Args:
            meal_plan: Meal plan dictionary
            skip_pantry: Skip ingredients already in pantry

        Returns:
            Categorized shopping list
        """
        recipes = []

        for day, meals in meal_plan['meals'].items():
            for meal_type, recipe in meals.items():
                recipes.append(recipe)

        return self.generate_from_recipes(recipes, skip_pantry)

    def _categorize_ingredients(self, ingredient_list: Dict) -> Dict[str, List[Dict]]:
        """Categorize ingredients by type.

        Args:
            ingredient_list: Dictionary of ingredients

        Returns:
            Categorized ingredient dictionary
        """
        categories = {
            'Produce': [],
            'Meat & Seafood': [],
            'Dairy & Eggs': [],
            'Grains & Pasta': [],
            'Canned & Jarred': [],
            'Spices & Condiments': [],
            'Other': []
        }

        # Category keywords
        produce_keywords = ['lettuce', 'tomato', 'cucumber', 'onion', 'garlic', 'pepper',
                           'carrot', 'celery', 'potato', 'broccoli', 'spinach', 'avocado',
                           'berry', 'berries', 'banana', 'lemon', 'lime', 'apple', 'orange',
                           'basil', 'cilantro', 'parsley', 'thyme', 'rosemary', 'ginger']

        meat_keywords = ['chicken', 'beef', 'pork', 'turkey', 'sausage', 'salmon',
                        'fish', 'shrimp', 'tuna', 'ground']

        dairy_keywords = ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg']

        grain_keywords = ['rice', 'pasta', 'bread', 'quinoa', 'oats', 'flour', 'tortilla',
                         'pita', 'ziti']

        canned_keywords = ['can', 'canned', 'beans', 'chickpeas', 'tomatoes', 'broth']

        spice_keywords = ['salt', 'pepper', 'cumin', 'paprika', 'oregano', 'cinnamon',
                         'oil', 'vinegar', 'sauce', 'powder', 'extract', 'seasoning',
                         'honey', 'sugar', 'syrup']

        for item, amounts in ingredient_list.items():
            item_lower = item.lower()
            categorized = False

            # Check each category
            if any(keyword in item_lower for keyword in produce_keywords):
                categories['Produce'].append({'item': item, 'amounts': amounts})
                categorized = True
            elif any(keyword in item_lower for keyword in meat_keywords):
                categories['Meat & Seafood'].append({'item': item, 'amounts': amounts})
                categorized = True
            elif any(keyword in item_lower for keyword in dairy_keywords):
                categories['Dairy & Eggs'].append({'item': item, 'amounts': amounts})
                categorized = True
            elif any(keyword in item_lower for keyword in grain_keywords):
                categories['Grains & Pasta'].append({'item': item, 'amounts': amounts})
                categorized = True
            elif any(keyword in item_lower for keyword in canned_keywords):
                categories['Canned & Jarred'].append({'item': item, 'amounts': amounts})
                categorized = True
            elif any(keyword in item_lower for keyword in spice_keywords):
                categories['Spices & Condiments'].append({'item': item, 'amounts': amounts})
                categorized = True

            if not categorized:
                categories['Other'].append({'item': item, 'amounts': amounts})

        # Remove empty categories
        return {k: v for k, v in categories.items() if v}

    def print_shopping_list(self, shopping_list: Dict):
        """Print a formatted shopping list.

        Args:
            shopping_list: Categorized shopping list
        """
        print(f"\n{'='*70}")
        print("SHOPPING LIST")
        print(f"{'='*70}\n")

        for category, items in shopping_list.items():
            print(f"{category}:")
            print("-" * 70)

            for item_info in sorted(items, key=lambda x: x['item']):
                item = item_info['item']
                amounts = item_info['amounts']

                # Show total amount needed
                amount_str = ', '.join([a['amount'] for a in amounts])
                print(f"  [ ] {item.title()}")
                print(f"      Amount: {amount_str}")

                # Optionally show which recipes need this
                if len(amounts) > 1:
                    recipes = [a['recipe'] for a in amounts]
                    print(f"      For: {', '.join(recipes)}")

            print()

    def export_simple_list(self, shopping_list: Dict) -> List[str]:
        """Export a simple list of ingredients.

        Args:
            shopping_list: Categorized shopping list

        Returns:
            Simple list of ingredient names
        """
        simple_list = []

        for category, items in shopping_list.items():
            for item_info in items:
                simple_list.append(item_info['item'])

        return sorted(simple_list)
