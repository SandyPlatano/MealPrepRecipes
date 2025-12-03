/**
 * Export service for recipes (Markdown and PDF)
 */

/**
 * Export single recipe as Markdown
 */
export function exportRecipeAsMarkdown(recipe) {
  let markdown = `# ${recipe.title}\n\n`;
  
  markdown += `**Protein Type:** ${recipe.proteinType}\n`;
  markdown += `**Prep Time:** ${recipe.prepTime}\n`;
  markdown += `**Cook Time:** ${recipe.cookTime}\n`;
  markdown += `**Servings:** ${recipe.servings}\n\n`;

  if (recipe.tags && recipe.tags.length > 0) {
    markdown += `**Tags:** ${recipe.tags.join(', ')}\n\n`;
  }

  markdown += `## Ingredients\n\n`;
  recipe.ingredients.forEach(ing => {
    markdown += `- ${ing}\n`;
  });

  markdown += `\n## Instructions\n\n`;
  recipe.instructions.forEach((inst, index) => {
    markdown += `${index + 1}. ${inst}\n`;
  });

  if (recipe.sourceUrl) {
    markdown += `\n**Source:** ${recipe.sourceUrl}\n`;
  }

  return markdown;
}

/**
 * Export all recipes as Markdown (organized by protein type)
 */
export function exportAllRecipesAsMarkdown(recipes) {
  const byProtein = {};
  
  recipes.forEach(recipe => {
    const protein = recipe.proteinType || 'Other';
    if (!byProtein[protein]) {
      byProtein[protein] = [];
    }
    byProtein[protein].push(recipe);
  });

  let markdown = `# Meal Prep Recipe Collection\n\n`;
  markdown += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;

  Object.keys(byProtein).sort().forEach(protein => {
    markdown += `## ${protein}\n\n`;
    byProtein[protein].forEach(recipe => {
      markdown += `### ${recipe.title}\n\n`;
      markdown += `**Prep Time:** ${recipe.prepTime} | **Cook Time:** ${recipe.cookTime} | **Servings:** ${recipe.servings}\n\n`;
      
      markdown += `**Ingredients:**\n`;
      recipe.ingredients.forEach(ing => {
        markdown += `- ${ing}\n`;
      });
      
      markdown += `\n**Instructions:**\n`;
      recipe.instructions.forEach((inst, index) => {
        markdown += `${index + 1}. ${inst}\n`;
      });
      
      markdown += `\n---\n\n`;
    });
  });

  return markdown;
}

/**
 * Download text as file
 */
export function downloadTextAsFile(text, filename, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export recipe as PDF (using browser print API)
 */
export function exportRecipeAsPDF(recipe) {
  const printWindow = window.open('', '_blank');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${recipe.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.6;
        }
        h1 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; }
        .meta { color: #666; margin: 20px 0; }
        ul, ol { margin: 10px 0; padding-left: 30px; }
        li { margin: 5px 0; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <h1>${recipe.title}</h1>
      <div class="meta">
        <strong>Protein Type:</strong> ${recipe.proteinType}<br>
        <strong>Prep Time:</strong> ${recipe.prepTime} | 
        <strong>Cook Time:</strong> ${recipe.cookTime} | 
        <strong>Servings:</strong> ${recipe.servings}
      </div>
      
      <h2>Ingredients</h2>
      <ul>
        ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
      </ul>
      
      <h2>Instructions</h2>
      <ol>
        ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
      </ol>
      
      ${recipe.sourceUrl ? `<p><em>Source: ${recipe.sourceUrl}</em></p>` : ''}
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

