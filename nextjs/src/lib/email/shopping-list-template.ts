import { INGREDIENT_CATEGORIES } from "@/types/shopping-list";

interface ShoppingListEmailData {
  weekRange: string;
  items: Array<{
    recipe: { title: string; ingredients: string[] };
    cook: string | null;
    day: string | null;
  }>;
}

// Smart categorization based on ingredient keywords
function categorizeIngredient(ingredient: string): string {
  const lower = ingredient.toLowerCase();

  // Produce
  if (
    /(lettuce|spinach|kale|arugula|cabbage|tomato|pepper|onion|garlic|carrot|celery|cucumber|zucchini|squash|broccoli|cauliflower|potato|sweet potato|apple|banana|orange|lemon|lime|berry|berries|avocado|mushroom|herb|cilantro|parsley|basil|thyme|rosemary|green|salad|fruit|vegetable)/i.test(
      lower
    )
  ) {
    return "Produce";
  }

  // Meat & Seafood
  if (
    /(chicken|beef|pork|turkey|lamb|fish|salmon|tuna|shrimp|crab|lobster|steak|ground|sausage|bacon|ham|meat|seafood)/i.test(
      lower
    )
  ) {
    return "Meat & Seafood";
  }

  // Dairy & Eggs
  if (
    /(milk|cream|butter|cheese|yogurt|egg|sour cream|cottage cheese|mozzarella|cheddar|parmesan|dairy)/i.test(
      lower
    )
  ) {
    return "Dairy & Eggs";
  }

  // Bakery
  if (/(bread|bun|roll|bagel|tortilla|pita|croissant|baguette|bakery)/i.test(lower)) {
    return "Bakery";
  }

  // Frozen
  if (/(frozen|ice cream)/i.test(lower)) {
    return "Frozen";
  }

  // Beverages
  if (/(juice|soda|water|coffee|tea|wine|beer|drink|beverage)/i.test(lower)) {
    return "Beverages";
  }

  // Condiments
  if (
    /(sauce|ketchup|mustard|mayo|mayonnaise|dressing|vinegar|soy sauce|hot sauce|salsa|condiment)/i.test(
      lower
    )
  ) {
    return "Condiments";
  }

  // Spices
  if (
    /(spice|pepper|salt|cumin|paprika|cinnamon|nutmeg|ginger|turmeric|curry|oregano|bay leaf|seasoning)/i.test(
      lower
    )
  ) {
    return "Spices";
  }

  // Pantry (flour, rice, pasta, etc.)
  if (
    /(flour|sugar|rice|pasta|noodle|oil|olive oil|vegetable oil|honey|syrup|beans|lentils|chickpeas|oats|cereal|quinoa|stock|broth|can|canned)/i.test(
      lower
    )
  ) {
    return "Pantry";
  }

  // Default to Other
  return "Other";
}

// Generate the interactive list URL with encoded data
function generateInteractiveListURL(
  baseUrl: string,
  data: ShoppingListEmailData
): string {
  // Collect and categorize ingredients
  const categorized: { [category: string]: string[] } = {};

  data.items.forEach((item) => {
    if (item.recipe && item.recipe.ingredients) {
      item.recipe.ingredients.forEach((ing) => {
        const category = categorizeIngredient(ing);
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(ing);
      });
    }
  });

  const listData = {
    weekRange: data.weekRange,
    categories: categorized,
    recipes: data.items.map((i) => ({
      title: i.recipe.title,
      day: i.day || "",
      cook: i.cook || "",
    })),
  };

  const encoded = Buffer.from(JSON.stringify(listData)).toString("base64");
  return `${baseUrl}/api/shopping-list-html?data=${encoded}`;
}

export function generateShoppingListHTML(data: ShoppingListEmailData): string {
  // Collect all ingredients and recipes
  const allIngredients: string[] = [];
  const recipesList: Array<{
    title: string;
    cook: string | null;
    day: string | null;
  }> = [];

  data.items.forEach((item) => {
    if (item.recipe && item.recipe.ingredients) {
      item.recipe.ingredients.forEach((ing) => allIngredients.push(ing));
      recipesList.push({
        title: item.recipe.title,
        cook: item.cook,
        day: item.day,
      });
    }
  });

  // Group ingredients by category
  const categorized: { [category: string]: string[] } = {};
  allIngredients.forEach((ingredient) => {
    const category = categorizeIngredient(ingredient);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(ingredient);
  });

  // Sort categories in logical order
  const categoryOrder = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery",
    "Pantry",
    "Frozen",
    "Beverages",
    "Condiments",
    "Spices",
    "Other",
  ];
  const sortedCategories = Object.keys(categorized).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Generate schedule table rows
  const scheduleRows = recipesList
    .map(
      (recipe, index) => `
    <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#FFF8F5"};">
      <td style="border-bottom: 1px solid #fed7aa; padding: 14px 16px; font-size: 13px; font-weight: 600; color: #F97316;">${recipe.day || "-"}</td>
      <td style="border-bottom: 1px solid #fed7aa; padding: 14px 16px; font-size: 14px; font-weight: 600; color: #0a0a0a;">${recipe.title}</td>
      <td style="border-bottom: 1px solid #fed7aa; padding: 14px 16px; font-size: 13px; color: #737373;">${recipe.cook || "-"}</td>
    </tr>
  `
    )
    .join("");

  // Generate categorized shopping list HTML
  const shoppingListHTML = sortedCategories
    .map((category) => {
      const items = categorized[category];
      const itemsHTML = items
        .map(
          (item, index) => `
        <tr style="background-color: ${index % 2 === 0 ? "#ffffff" : "#FFF8F5"};">
          <td style="border-bottom: 1px solid #fed7aa; padding: 12px 16px; font-size: 14px; color: #0a0a0a; display: flex; align-items: center;">
            <span style="display: inline-block; width: 18px; height: 18px; border: 2px solid #F97316; border-radius: 4px; margin-right: 12px; flex-shrink: 0;"></span>
            ${item}
          </td>
        </tr>
      `
        )
        .join("");

      return `
      <div style="margin-bottom: 24px;">
        <div style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 11px; font-weight: 700; color: #F97316; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; padding: 6px 12px; background: #FFF8F5; border-left: 3px solid #F97316; display: inline-block;">
          ${category}
        </div>
        <table style="border-collapse: collapse; width: 100%; background: white; border: 1px solid #fed7aa; border-radius: 8px; overflow: hidden;">
          ${itemsHTML}
        </table>
      </div>
    `;
    })
    .join("");

  // Generate plain text for copy/paste (with checkboxes for Apple Notes)
  const copyPasteText = sortedCategories
    .map((category) => {
      const items = categorized[category];
      return `${category.toUpperCase()}\n${items.map((i) => `☐ ${i}`).join("\n")}`;
    })
    .join("\n\n");

  // Base URL for interactive list (will be replaced at send time)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
  const interactiveListURL = generateInteractiveListURL(appUrl, data);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #FFF8F5; color: #0a0a0a; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.08);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FFF8F5 0%, #ffffff 100%); border-bottom: 2px solid #F97316; padding: 40px 24px 32px 24px; text-align: center;">
      <h1 style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Caveat', cursive, system-ui; font-size: 36px; font-weight: 600; color: #F97316;">Babe,</span>
        <span style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 22px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em;"> What's for Dinner?</span>
      </h1>
      <p style="font-size: 14px; color: #737373; margin: 0; font-style: italic;">Finally, an answer.</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 32px 24px;">
      
      <!-- Week Range Badge -->
      <div style="margin-bottom: 28px;">
        <div style="display: inline-block; background-color: #F97316; color: white; padding: 10px 20px; border-radius: 8px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);">
          📅 Week of ${data.weekRange}
        </div>
      </div>
      
      <!-- Schedule Section -->
      <div style="margin-bottom: 36px;">
        <h2 style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 18px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em; margin: 0 0 4px 0; display: flex; align-items: center;">
          <span style="display: inline-block; width: 4px; height: 18px; background: #F97316; margin-right: 10px; border-radius: 2px;"></span>
          This Week's Schedule
        </h2>
        <p style="font-size: 13px; color: #737373; margin: 0 0 16px 0; padding-left: 14px;">Your meal lineup for the week</p>
        <table style="border-collapse: collapse; width: 100%; border: 2px solid #F97316; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background-color: #F97316;">
              <th style="padding: 14px 16px; text-align: left; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; font-weight: 700; color: white; letter-spacing: 0.02em; text-transform: uppercase;">Day</th>
              <th style="padding: 14px 16px; text-align: left; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; font-weight: 700; color: white; letter-spacing: 0.02em; text-transform: uppercase;">Recipe</th>
              <th style="padding: 14px 16px; text-align: left; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; font-weight: 700; color: white; letter-spacing: 0.02em; text-transform: uppercase;">Cook</th>
            </tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
      </div>
      
      <!-- Shopping List Section -->
      <div style="margin-bottom: 36px;">
        <h2 style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 18px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em; margin: 0 0 4px 0; display: flex; align-items: center;">
          <span style="display: inline-block; width: 4px; height: 18px; background: #F97316; margin-right: 10px; border-radius: 2px;"></span>
          Shopping List
        </h2>
        <p style="font-size: 13px; color: #737373; margin: 0 0 16px 0; padding-left: 14px;">
          <span style="color: #F97316; font-weight: 600;">${allIngredients.length} items</span> from ${recipesList.length} recipes • Organized by aisle
        </p>
        <div style="margin-top: 16px;">
          ${shoppingListHTML}
        </div>
      </div>
      
      <!-- Interactive Shopping List Section -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #fed7aa;">
        <h2 style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 16px; font-weight: 600; color: #0a0a0a; letter-spacing: -0.02em; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #F97316;">
          Interactive Shopping List
        </h2>
        <p style="color: #737373; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
          Open your interactive shopping list to check off items while shopping. Tap items to cross them off, watch your progress bar fill up, and switch between light/dark mode. Works offline!
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${interactiveListURL}" target="_blank" style="display: inline-block; background-color: #F97316; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-family: 'Inter', sans-serif; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35); transition: all 0.2s;">
            🛒 Open Interactive Shopping List
          </a>
        </div>
        <p style="color: #737373; font-size: 12px; margin: 12px 0 20px 0; text-align: center; font-style: italic;">
          Click the button above to open your checklist. Works on mobile and desktop!
        </p>
        
        <!-- Copy/Paste Text Box -->
        <div style="background-color: #FFF8F5; padding: 16px; border-radius: 8px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 12px; white-space: pre-wrap; overflow-x: auto; border: 1px solid #fed7aa; color: #404040; line-height: 1.8;">
${copyPasteText}
        </div>
        <p style="color: #737373; font-size: 12px; margin-top: 12px; font-style: italic;">
          Or copy the text above and paste into Apple Notes or Google Keep for interactive checkboxes.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center;">
      <p style="margin: 0 0 8px 0; line-height: 1.2;">
        <span style="font-family: 'Caveat', cursive, system-ui; font-size: 28px; font-weight: 600; color: #ffffff;">Babe,</span>
        <span style="font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 16px; font-weight: 700; color: #ffffff;"> What's for Dinner?</span>
      </p>
      <p style="font-size: 13px; color: rgba(255,255,255,0.85); margin: 8px 0; font-style: italic;">
        Made with love (and mild guilt) 💕
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generateShoppingListText(data: ShoppingListEmailData): string {
  let text = `BABE, WHAT'S FOR DINNER?\n`;
  text += `Finally, an answer.\n\n`;
  text += `${"=".repeat(50)}\n`;
  text += `Week of ${data.weekRange}\n`;
  text += `${"=".repeat(50)}\n\n`;

  // Add recipes
  if (data.items.length > 0) {
    text += "THIS WEEK'S SCHEDULE\n";
    text += "-".repeat(50) + "\n\n";
    data.items.forEach((item) => {
      text += `${item.day || "-"} | ${item.recipe.title}`;
      if (item.cook) text += ` | ${item.cook}`;
      text += `\n`;
    });
    text += "\n";
  }

  // Collect and categorize ingredients
  const allIngredients: string[] = [];
  data.items.forEach((item) => {
    if (item.recipe && item.recipe.ingredients) {
      item.recipe.ingredients.forEach((ing) => allIngredients.push(ing));
    }
  });

  const categorized: { [category: string]: string[] } = {};
  allIngredients.forEach((ingredient) => {
    const category = categorizeIngredient(ingredient);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(ingredient);
  });

  // Sort categories
  const categoryOrder = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery",
    "Pantry",
    "Frozen",
    "Beverages",
    "Condiments",
    "Spices",
    "Other",
  ];
  const sortedCategories = Object.keys(categorized).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  text += "SHOPPING LIST\n";
  text += "-".repeat(50) + "\n";
  text += `${allIngredients.length} items • ${data.items.length} recipes\n\n`;

  sortedCategories.forEach((category) => {
    text += `${category.toUpperCase()}\n`;
    categorized[category].forEach((ing) => {
      text += `  ☐ ${ing}\n`;
    });
    text += "\n";
  });

  text += `${"=".repeat(50)}\n`;
  text += "Babe, What's for Dinner?\n";
  text += "Made with love (and mild guilt)\n";

  return text;
}
