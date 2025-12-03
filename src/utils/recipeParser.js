// Recipe parser utility to parse markdown recipe files

export const parseMarkdownRecipe = (markdown) => {
  const lines = markdown.split('\n');
  const recipe = {
    title: '',
    proteinType: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [],
    instructions: [],
    tags: []
  };

  let currentSection = null;

  for (let line of lines) {
    line = line.trim();

    // Parse title (first h1)
    if (line.startsWith('# ') && !recipe.title) {
      recipe.title = line.substring(2).trim();
      continue;
    }

    // Parse sections
    if (line.startsWith('## ')) {
      const sectionTitle = line.substring(3).trim().toLowerCase();
      if (sectionTitle.includes('protein')) {
        currentSection = 'protein';
      } else if (sectionTitle.includes('prep')) {
        currentSection = 'prep';
      } else if (sectionTitle.includes('cook')) {
        currentSection = 'cook';
      } else if (sectionTitle.includes('serving')) {
        currentSection = 'servings';
      } else if (sectionTitle.includes('ingredient')) {
        currentSection = 'ingredients';
      } else if (sectionTitle.includes('instruction')) {
        currentSection = 'instructions';
      } else if (sectionTitle.includes('tag')) {
        currentSection = 'tags';
      }
      continue;
    }

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Parse content based on current section
    if (currentSection === 'protein' && line) {
      recipe.proteinType = line;
    } else if (currentSection === 'prep' && line) {
      recipe.prepTime = line;
    } else if (currentSection === 'cook' && line) {
      recipe.cookTime = line;
    } else if (currentSection === 'servings' && line) {
      recipe.servings = line;
    } else if (currentSection === 'ingredients' && line.startsWith('-')) {
      recipe.ingredients.push(line.substring(1).trim());
    } else if (currentSection === 'instructions' && line.match(/^\d+\./)) {
      recipe.instructions.push(line.replace(/^\d+\.\s*/, '').trim());
    } else if (currentSection === 'tags' && line) {
      recipe.tags = line.split(',').map(tag => tag.trim());
    }
  }

  return recipe;
};

// Create markdown from recipe object
export const createMarkdownRecipe = (recipe) => {
  let markdown = `# ${recipe.title}\n\n`;
  markdown += `## Protein Type\n${recipe.proteinType}\n\n`;
  markdown += `## Prep Time\n${recipe.prepTime}\n\n`;
  markdown += `## Cook Time\n${recipe.cookTime}\n\n`;
  markdown += `## Servings\n${recipe.servings}\n\n`;

  markdown += `## Ingredients\n`;
  recipe.ingredients.forEach(ingredient => {
    markdown += `- ${ingredient}\n`;
  });
  markdown += `\n`;

  markdown += `## Instructions\n`;
  recipe.instructions.forEach((instruction, index) => {
    markdown += `${index + 1}. ${instruction}\n`;
  });
  markdown += `\n`;

  markdown += `## Tags\n${recipe.tags.join(', ')}\n`;

  return markdown;
};

// Sample recipes data (in real app, these would be loaded from markdown files)
export const sampleRecipes = [
  {
    id: 1,
    title: 'Sheet Pan Lemon Herb Chicken',
    recipeType: 'Dinner',
    category: 'Chicken',
    proteinType: 'Chicken',
    prepTime: '15 minutes',
    cookTime: '35 minutes',
    servings: '4',
    ingredients: [
      '8 pieces chicken thighs',
      '1 lb baby potatoes, halved',
      '1 lb green beans',
      '2 lemons',
      '4 cloves garlic, minced',
      '1/4 cup olive oil',
      '2 tbsp fresh rosemary',
      '2 tbsp fresh thyme',
      'Salt to taste',
      'Pepper to taste'
    ],
    instructions: [
      'Preheat oven to 425°F (220°C)',
      'Mix olive oil, lemon juice, garlic, herbs, salt, and pepper',
      'Toss chicken and potatoes with marinade',
      'Arrange on a sheet pan',
      'Roast for 25 minutes',
      'Add green beans to pan',
      'Roast another 10 minutes until chicken is cooked through',
      'Serve with lemon wedges'
    ],
    tags: ['one-pan', 'healthy', 'meal-prep-friendly', 'chicken']
  },
  {
    id: 2,
    title: 'Teriyaki Salmon with Broccoli',
    recipeType: 'Dinner',
    category: 'Fish',
    proteinType: 'Fish',
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    servings: '4',
    ingredients: [
      '4 salmon fillets (6 oz each)',
      '4 cups broccoli florets',
      '1/4 cup soy sauce',
      '2 tbsp honey',
      '3 cloves garlic, minced',
      '1 tbsp ginger, minced',
      '1 tbsp sesame oil',
      '1 tbsp rice vinegar',
      'Sesame seeds for garnish'
    ],
    instructions: [
      'Mix soy sauce, honey, garlic, ginger, sesame oil, and vinegar',
      'Marinate salmon for 10 minutes',
      'Preheat oven to 400°F (200°C)',
      'Place salmon and broccoli on a baking sheet',
      'Brush salmon with marinade',
      'Roast for 12-15 minutes',
      'Garnish with sesame seeds',
      'Serve with rice'
    ],
    tags: ['healthy', 'quick', 'high-protein', 'seafood', 'asian']
  },
  {
    id: 3,
    title: 'Vegetarian Stuffed Bell Peppers',
    recipeType: 'Dinner',
    category: 'Vegetarian',
    proteinType: 'Vegetarian',
    prepTime: '20 minutes',
    cookTime: '40 minutes',
    servings: '6',
    ingredients: [
      '6 large bell peppers',
      '1 cup quinoa, cooked',
      '1 can black beans',
      '1 cup corn',
      '1 can diced tomatoes',
      '1 onion, diced',
      '3 cloves garlic, minced',
      '1 cup cheese, shredded',
      '1 tsp cumin',
      '1 tsp chili powder'
    ],
    instructions: [
      'Preheat oven to 375°F (190°C)',
      'Cut tops off peppers and remove seeds',
      'Sauté onion and garlic until soft',
      'Mix quinoa, beans, corn, tomatoes, and spices',
      'Stir in half the cheese',
      'Stuff peppers with mixture',
      'Place in baking dish with 1/2 cup water',
      'Cover with foil and bake 30 minutes',
      'Remove foil, top with remaining cheese',
      'Bake 10 more minutes'
    ],
    tags: ['vegetarian', 'healthy', 'meal-prep-friendly']
  },
  {
    id: 4,
    title: 'Honey Garlic Pork Chops',
    recipeType: 'Dinner',
    category: 'Pork',
    proteinType: 'Pork',
    prepTime: '10 minutes',
    cookTime: '20 minutes',
    servings: '4',
    ingredients: [
      '4 bone-in pork chops',
      '1/3 cup honey',
      '1/4 cup soy sauce',
      '5 cloves garlic, minced',
      '2 tbsp apple cider vinegar',
      '2 tbsp olive oil',
      '1/4 tsp red pepper flakes',
      'Salt to taste',
      'Pepper to taste'
    ],
    instructions: [
      'Season pork chops with salt and pepper',
      'Heat olive oil in a large skillet over medium-high heat',
      'Sear pork chops 4-5 minutes per side',
      'Remove pork chops and set aside',
      'In same skillet, add garlic and cook 30 seconds',
      'Add honey, soy sauce, vinegar, and red pepper flakes',
      'Simmer until sauce thickens slightly',
      'Return pork chops to skillet and coat with sauce',
      'Cook 2-3 more minutes until done',
      'Serve with vegetables and rice'
    ],
    tags: ['quick', 'meal-prep-friendly', 'pork']
  },
  {
    id: 5,
    title: 'Beef and Broccoli Stir-Fry',
    recipeType: 'Dinner',
    category: 'Beef',
    proteinType: 'Beef',
    prepTime: '15 minutes',
    cookTime: '15 minutes',
    servings: '4',
    ingredients: [
      '1.5 lbs flank steak, sliced thin',
      '4 cups broccoli florets',
      '1/3 cup soy sauce',
      '1/2 cup beef broth',
      '2 tbsp brown sugar',
      '4 cloves garlic, minced',
      '1 tbsp ginger, minced',
      '2 tbsp cornstarch',
      '2 tbsp sesame oil',
      '2 tbsp vegetable oil'
    ],
    instructions: [
      'Mix soy sauce, broth, brown sugar, and cornstarch',
      'Heat vegetable oil in a wok over high heat',
      'Add beef and stir-fry until browned',
      'Remove beef and set aside',
      'Add sesame oil, garlic, and ginger to wok',
      'Cook 30 seconds',
      'Add broccoli and stir-fry 3-4 minutes',
      'Return beef to wok',
      'Pour sauce over and cook until thickened',
      'Serve over rice'
    ],
    tags: ['asian', 'quick', 'beef']
  }
];
