/**
 * Content script to extract recipe HTML from the current page
 */

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractRecipe') {
    try {
      // Get the full HTML of the page
      const html = document.documentElement.outerHTML;
      
      // Get the current URL
      const url = window.location.href;
      
      // Get page title
      const title = document.title;
      
      // Try to find recipe-specific content areas
      const recipeSelectors = [
        'article[itemtype*="Recipe"]',
        '[itemtype*="Recipe"]',
        '.recipe',
        '[class*="recipe"]',
        '[id*="recipe"]',
        'main',
        'article'
      ];
      
      let recipeContent = null;
      for (const selector of recipeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          recipeContent = element.innerHTML;
          break;
        }
      }
      
      // If no specific recipe element found, use body content
      if (!recipeContent) {
        recipeContent = document.body.innerHTML;
      }
      
      sendResponse({
        success: true,
        html: html,
        recipeHtml: recipeContent,
        url: url,
        title: title
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

