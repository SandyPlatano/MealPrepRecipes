"""Markdown Recipe Parser - Parses recipes from markdown format."""

import re
from typing import List, Dict, Optional
from pathlib import Path


class MarkdownRecipeParser:
    """Parses dinner recipes from markdown files."""

    def __init__(self):
        """Initialize the parser."""
        self.recipes: List[Dict] = []
        self.recipe_id_counter = 1

    def parse_file(self, file_path: str) -> List[Dict]:
        """Parse recipes from a markdown file.

        Args:
            file_path: Path to the markdown file

        Returns:
            List of recipe dictionaries
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return self.parse_content(content)

    def parse_content(self, content: str) -> List[Dict]:
        """Parse recipes from markdown content.

        Args:
            content: Markdown content string

        Returns:
            List of recipe dictionaries
        """
        self.recipes = []
        self.recipe_id_counter = 1

        # Split by H2 headers (categories)
        category_sections = re.split(r'^## (.+?)$', content, flags=re.MULTILINE)

        # Process each category
        current_category = None
        for i, section in enumerate(category_sections):
            section = section.strip()
            if not section:
                continue

            # Check if this is a category header
            if i % 2 == 1:  # Odd indices are category names
                current_category = section.lower()
            else:  # Even indices are category content
                if current_category:
                    self._parse_category_recipes(section, current_category)

        return self.recipes

    def _parse_category_recipes(self, content: str, category: str):
        """Parse all recipes in a category section.

        Args:
            content: Content under a category header
            category: Category name
        """
        # Split by H3 headers (recipe names)
        recipe_sections = re.split(r'^### (.+?)$', content, flags=re.MULTILINE)

        current_recipe_name = None
        for i, section in enumerate(recipe_sections):
            section = section.strip()
            if not section:
                continue

            # Check if this is a recipe name
            if i % 2 == 1:  # Odd indices are recipe names
                current_recipe_name = section
            else:  # Even indices are recipe content
                if current_recipe_name:
                    recipe = self._parse_recipe(section, current_recipe_name, category)
                    if recipe:
                        self.recipes.append(recipe)
                        self.recipe_id_counter += 1

    def _parse_recipe(self, content: str, name: str, category: str) -> Optional[Dict]:
        """Parse a single recipe.

        Args:
            content: Recipe content
            name: Recipe name
            category: Category name

        Returns:
            Recipe dictionary or None if parsing fails
        """
        recipe = {
            'id': f'd{self.recipe_id_counter:03d}',
            'name': name.strip(),
            'category': category,
            'prep_time': 0,
            'cook_time': 0,
            'servings': 4,
            'difficulty': 'easy',
            'tags': [],
            'ingredients': [],
            'instructions': [],
            'notes': '',
            'source': ''
        }

        # Parse tags
        tags_match = re.search(r'\*\*Tags:\*\*\s*(.*?)(?=\*\*|\Z)', content, re.DOTALL)
        if tags_match:
            tags_text = tags_match.group(1)
            # Extract items from bullet points
            tags = re.findall(r'^\s*[-*]\s*(.+?)$', tags_text, re.MULTILINE)
            recipe['tags'] = [tag.strip().lower() for tag in tags]

        # Parse ingredients
        ingredients_match = re.search(r'\*\*Ingredients:\*\*\s*(.*?)(?=\*\*|\Z)', content, re.DOTALL)
        if ingredients_match:
            ingredients_text = ingredients_match.group(1)
            ingredient_lines = re.findall(r'^\s*[-*]\s*(.+?)$', ingredients_text, re.MULTILINE)

            for line in ingredient_lines:
                line = line.strip()
                if not line or line == '...':
                    continue

                # Try to split amount from item
                # Pattern: "amount item" e.g., "2 lbs chicken breast"
                parts = line.split(None, 1)
                if len(parts) >= 2:
                    # Check if first part looks like an amount (number, fraction, or measurement)
                    if re.match(r'^[\d/.-]+', parts[0]) or parts[0].lower() in ['a', 'an', 'some']:
                        # Try to get amount and rest
                        amount_parts = []
                        item_parts = []
                        found_item = False

                        for part in line.split():
                            if not found_item and (re.match(r'^[\d/.-]+', part) or
                                                   part.lower() in ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs',
                                                                   'oz', 'g', 'kg', 'ml', 'l', 'can', 'cans',
                                                                   'large', 'medium', 'small', 'whole', 'a', 'an']):
                                amount_parts.append(part)
                            else:
                                found_item = True
                                item_parts.append(part)

                        amount = ' '.join(amount_parts) if amount_parts else '1'
                        item = ' '.join(item_parts) if item_parts else line
                    else:
                        amount = '1'
                        item = line
                else:
                    amount = '1'
                    item = line if line else 'unknown'

                recipe['ingredients'].append({
                    'item': item.strip(),
                    'amount': amount.strip()
                })

        # Parse instructions
        instructions_match = re.search(r'\*\*Instructions:\*\*\s*(.*?)(?=\*\*|\Z)', content, re.DOTALL)
        if instructions_match:
            instructions_text = instructions_match.group(1)
            instruction_lines = re.findall(r'^\s*\d+\.\s*(.+?)$', instructions_text, re.MULTILINE)
            recipe['instructions'] = [inst.strip() for inst in instruction_lines if inst.strip() and inst.strip() != '...']

        # Parse notes
        notes_match = re.search(r'\*\*Notes:\*\*\s*(.*?)(?=\*\*|\Z)', content, re.DOTALL)
        if notes_match:
            notes_text = notes_match.group(1).strip()
            if notes_text and notes_text.lower() != 'none':
                recipe['notes'] = notes_text

        # Parse source
        source_match = re.search(r'\*\*Source:\*\*\s*(.*?)(?=\*\*|\Z)', content, re.DOTALL)
        if source_match:
            source_text = source_match.group(1).strip()
            if source_text and not source_text.startswith('http'):
                # If it doesn't look like a URL, skip it
                pass
            else:
                recipe['source'] = source_text

        # Extract timing info from tags or content if available
        for tag in recipe['tags']:
            if 'quick' in tag:
                recipe['prep_time'] = 10
                recipe['cook_time'] = 15
                break
            elif 'slow' in tag or 'slow-cooker' in tag:
                recipe['prep_time'] = 15
                recipe['cook_time'] = 240
                break

        # Set default times if not set
        if recipe['prep_time'] == 0:
            recipe['prep_time'] = 15
        if recipe['cook_time'] == 0:
            recipe['cook_time'] = 30

        return recipe

    def recipes_to_markdown(self, recipes: List[Dict]) -> str:
        """Convert recipes back to markdown format.

        Args:
            recipes: List of recipe dictionaries

        Returns:
            Markdown formatted string
        """
        # Group recipes by category
        categories = {}
        for recipe in recipes:
            category = recipe.get('category', 'other')
            if category not in categories:
                categories[category] = []
            categories[category].append(recipe)

        # Build markdown
        lines = ['# Meal Prep Recipe Collection\n']

        for category, category_recipes in sorted(categories.items()):
            # Category header
            lines.append(f'\n## {category.title()}\n')

            for recipe in category_recipes:
                # Recipe name
                lines.append(f'\n### {recipe["name"]}')

                # Tags
                lines.append('**Tags:**')
                for tag in recipe.get('tags', []):
                    lines.append(f'- {tag.title()}')

                # Ingredients
                lines.append('\n**Ingredients:**')
                for ing in recipe.get('ingredients', []):
                    lines.append(f'- {ing["amount"]} {ing["item"]}')

                # Instructions
                lines.append('\n**Instructions:**')
                for i, instruction in enumerate(recipe.get('instructions', []), 1):
                    lines.append(f'{i}. {instruction}')

                # Notes
                lines.append('\n**Notes:**')
                notes = recipe.get('notes', '')
                lines.append(notes if notes else 'None')

                # Source
                lines.append('\n**Source:**')
                source = recipe.get('source', '')
                lines.append(source if source else 'None')

                lines.append('')  # Empty line between recipes

        return '\n'.join(lines)
