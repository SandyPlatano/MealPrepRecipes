/**
 * URL scraper for fetching recipe content from websites
 */

/**
 * Fetch HTML content from a URL
 * Note: This will only work for URLs that allow CORS or same-origin requests
 * For production, you'd typically use a backend proxy
 */
export async function fetchRecipeFromURL(url) {
  try {
    // Validate URL
    new URL(url); // Will throw if invalid
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; MealPrepRecipeBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    // CORS errors will be caught here
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      throw new Error(
        'Unable to fetch this URL due to CORS restrictions. ' +
        'Please copy the recipe text and paste it in the free-form input instead.'
      );
    }
    throw error;
  }
}

/**
 * Extract text content from HTML (basic extraction)
 * This is a fallback - Claude will do better parsing
 */
export function extractTextFromHTML(html) {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Try to find common recipe sections
  const recipePatterns = [
    /<article[^>]*>[\s\S]*?<\/article>/i,
    /<div[^>]*class="[^"]*recipe[^"]*"[^>]*>[\s\S]*?<\/div>/i,
    /<main[^>]*>[\s\S]*?<\/main>/i,
  ];

  for (const pattern of recipePatterns) {
    const match = html.match(pattern);
    if (match) {
      text = match[0];
      break;
    }
  }

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

