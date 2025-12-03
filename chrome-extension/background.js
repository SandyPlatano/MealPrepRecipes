/**
 * Background service worker for Chrome extension
 * Handles API communication and message passing
 */

// Get app URL from storage
async function getAppUrl() {
  const result = await chrome.storage.sync.get(['appUrl']);
  return result.appUrl || 'https://your-app.vercel.app';
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'parseRecipe') {
    handleParseRecipe(request.html, request.url)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Indicates we'll send response asynchronously
  }
  
  if (request.action === 'addRecipe') {
    handleAddRecipe(request.recipe)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'extractPageContent') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractRecipe' }, (response) => {
          if (chrome.runtime.lastError) {
            sendResponse({ 
              success: false, 
              error: chrome.runtime.lastError.message 
            });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ 
          success: false, 
          error: 'No active tab found' 
        });
      }
    });
    return true;
  }
});

/**
 * Parse recipe HTML using the app's API
 */
async function handleParseRecipe(html, url) {
  const appUrl = await getAppUrl();
  const apiUrl = `${appUrl}/api/parse-recipe`;
  
  // Truncate HTML to 10000 characters to avoid token limits
  const truncatedHtml = html.substring(0, 10000);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        htmlContent: truncatedHtml,
        sourceUrl: url,
        // No apiKey - will use server-side env var
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const parsed = await response.json();
    return parsed;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw error;
  }
}

/**
 * Add recipe to Supabase via the app's API
 */
async function handleAddRecipe(recipe) {
  const appUrl = await getAppUrl();
  const apiUrl = `${appUrl}/api/add-recipe`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe: recipe,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding recipe:', error);
    throw error;
  }
}

