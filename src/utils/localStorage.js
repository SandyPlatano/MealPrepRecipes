/**
 * Typed localStorage helpers with error handling
 */

const STORAGE_KEYS = {
  RECIPES: 'mealprep_recipes',
  FAVORITES: 'mealprep_favorites',
  CART: 'mealprep_cart',
  SETTINGS: 'mealprep_settings',
  HISTORY: 'mealprep_history',
  TEMPLATES: 'mealprep_templates',
};

/**
 * Get item from localStorage with error handling
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage with error handling
 */
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Consider removing old data.');
    }
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllStorage() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
}

// Specific helpers for each data type
export const storage = {
  recipes: {
    get: () => getStorageItem(STORAGE_KEYS.RECIPES, []),
    set: (recipes) => setStorageItem(STORAGE_KEYS.RECIPES, recipes),
  },
  favorites: {
    get: () => getStorageItem(STORAGE_KEYS.FAVORITES, []),
    set: (favorites) => setStorageItem(STORAGE_KEYS.FAVORITES, favorites),
  },
  cart: {
    get: () => getStorageItem(STORAGE_KEYS.CART, []),
    set: (cart) => setStorageItem(STORAGE_KEYS.CART, cart),
  },
  settings: {
    get: () => getStorageItem(STORAGE_KEYS.SETTINGS, {
      cookNames: ['You', 'Morgan'],
      yourEmail: '',
      partnerEmail: '',
      anthropicApiKey: '',
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
      googleClientId: '',
      googleAccessToken: '',
      googleRefreshToken: '',
      darkMode: false,
      supabaseUrl: '',
      supabaseAnonKey: '',
    }),
    set: (settings) => setStorageItem(STORAGE_KEYS.SETTINGS, settings),
  },
  history: {
    get: () => getStorageItem(STORAGE_KEYS.HISTORY, []),
    set: (history) => setStorageItem(STORAGE_KEYS.HISTORY, history),
  },
  templates: {
    get: () => getStorageItem(STORAGE_KEYS.TEMPLATES, []),
    set: (templates) => setStorageItem(STORAGE_KEYS.TEMPLATES, templates),
  },
};

