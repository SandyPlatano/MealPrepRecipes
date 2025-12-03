/**
 * Popup script for Chrome extension
 */

// State management
let currentRecipe = null;
let appUrl = 'https://your-app.vercel.app';

// DOM elements
const elements = {
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-btn'),
  mainContent: document.getElementById('main-content'),
  initialState: document.getElementById('initial-state'),
  captureBtn: document.getElementById('capture-btn'),
  recipeForm: document.getElementById('recipe-form'),
  recipeEditor: document.getElementById('recipe-editor'),
  success: document.getElementById('success'),
  successMessage: document.getElementById('success-message'),
  openAppBtn: document.getElementById('open-app-btn'),
  newRecipeBtn: document.getElementById('new-recipe-btn'),
  cancelBtn: document.getElementById('cancel-btn'),
  optionsLink: document.getElementById('options-link'),
};

// Load app URL from storage
async function loadAppUrl() {
  const result = await chrome.storage.sync.get(['appUrl']);
  if (result.appUrl) {
    appUrl = result.appUrl;
  }
}

// Show/hide functions
function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function showState(state) {
  // Hide all states
  hideElement(elements.loading);
  hideElement(elements.error);
  hideElement(elements.initialState);
  hideElement(elements.recipeForm);
  hideElement(elements.success);
  
  // Show requested state
  if (state === 'loading') {
    showElement(elements.loading);
  } else if (state === 'error') {
    showElement(elements.error);
  } else if (state === 'initial') {
    showElement(elements.initialState);
  } else if (state === 'form') {
    showElement(elements.recipeForm);
  } else if (state === 'success') {
    showElement(elements.success);
  }
}

// Capture recipe from current page
async function captureRecipe() {
  showState('loading');
  
  try {
    // Extract page content
    const extractResponse = await chrome.runtime.sendMessage({
      action: 'extractPageContent'
    });
    
    if (!extractResponse.success) {
      throw new Error(extractResponse.error || 'Failed to extract page content');
    }
    
    // Parse recipe
    const parseResponse = await chrome.runtime.sendMessage({
      action: 'parseRecipe',
      html: extractResponse.html,
      url: extractResponse.url
    });
    
    if (!parseResponse.success) {
      throw new Error(parseResponse.error || 'Failed to parse recipe');
    }
    
    currentRecipe = parseResponse.data;
    populateForm(currentRecipe);
    showState('form');
  } catch (error) {
    console.error('Error capturing recipe:', error);
    elements.errorMessage.textContent = error.message || 'Couldn't capture. Try again?';
    showState('error');
  }
}

// Populate form with recipe data
function populateForm(recipe) {
  document.getElementById('title').value = recipe.title || '';
  document.getElementById('recipeType').value = recipe.recipeType || 'Dinner';
  document.getElementById('category').value = recipe.category || recipe.proteinType || '';
  document.getElementById('prepTime').value = recipe.prepTime || '';
  document.getElementById('cookTime').value = recipe.cookTime || '';
  document.getElementById('servings').value = recipe.servings || '';
  document.getElementById('ingredients').value = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients.join('\n') 
    : '';
  document.getElementById('instructions').value = Array.isArray(recipe.instructions) 
    ? recipe.instructions.join('\n') 
    : '';
  document.getElementById('tags').value = Array.isArray(recipe.tags) 
    ? recipe.tags.join(', ') 
    : '';
}

// Get form data
function getFormData() {
  const ingredients = document.getElementById('ingredients').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const instructions = document.getElementById('instructions').value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const tags = document.getElementById('tags').value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  return {
    title: document.getElementById('title').value.trim(),
    recipeType: document.getElementById('recipeType').value.trim() || 'Dinner',
    category: document.getElementById('category').value.trim() || '',
    proteinType: document.getElementById('category').value.trim() || '',
    prepTime: document.getElementById('prepTime').value.trim() || '15 minutes',
    cookTime: document.getElementById('cookTime').value.trim() || '30 minutes',
    servings: document.getElementById('servings').value.trim() || '4',
    ingredients: ingredients,
    instructions: instructions,
    tags: tags,
    sourceUrl: currentRecipe?.sourceUrl || ''
  };
}

// Save recipe
async function saveRecipe() {
  const recipeData = getFormData();
  
  if (!recipeData.title) {
    alert('Give it a name first');
    return;
  }
  
  showState('loading');
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'addRecipe',
      recipe: recipeData
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save recipe');
    }
    
    elements.successMessage.textContent = response.data.message || `"${recipeData.title}" saved!`;
    showState('success');
  } catch (error) {
    console.error('Error saving recipe:', error);
    elements.errorMessage.textContent = error.message || 'Couldn't save. Try again?';
    showState('error');
  }
}

// Event listeners
elements.captureBtn.addEventListener('click', captureRecipe);
elements.retryBtn.addEventListener('click', captureRecipe);
elements.recipeEditor.addEventListener('submit', (e) => {
  e.preventDefault();
  saveRecipe();
});
elements.cancelBtn.addEventListener('click', () => {
  showState('initial');
  currentRecipe = null;
});
elements.newRecipeBtn.addEventListener('click', () => {
  showState('initial');
  currentRecipe = null;
});
elements.openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: appUrl });
  window.close();
});
elements.optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Initialize
loadAppUrl().then(() => {
  showState('initial');
});

