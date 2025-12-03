/**
 * Generate interactive shopping list HTML page
 * Self-contained PWA with offline support, Supabase persistence, and mobile optimization
 */

/**
 * Generate the complete interactive shopping list HTML
 */
export function generateInteractiveShoppingListHTML({
  listId,
  weekRange,
  schedule,
  itemsByCategory,
  supabaseUrl,
  supabaseAnonKey,
}) {
  // Escape HTML for embedding in template
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const itemsJson = JSON.stringify(itemsByCategory);
  const scheduleJson = JSON.stringify(schedule || []);
  const escapedWeekRange = escapeHtml(weekRange);
  const escapedListId = escapeHtml(listId);

  // Generate PWA manifest JSON and base64 encode it
  const manifestJson = JSON.stringify({
    name: 'Shopping List',
    short_name: 'Shop List',
    description: 'Interactive shopping list',
    start_url: '.',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    icons: [{
      src: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#3b82f6" width="100" height="100"/><text x="50" y="70" font-size="60" fill="white" text-anchor="middle">🛒</text></svg>'),
      sizes: '192x192',
      type: 'image/svg+xml',
    }],
  });
  const manifestBase64 = btoa(manifestJson);

  // Generate HTML with embedded CSS, JS, service worker, and PWA manifest
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#3b82f6">
  <meta name="description" content="Interactive shopping list for ${escapedWeekRange}">
  <title>Shopping List - ${escapedWeekRange}</title>
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="data:application/json;base64,${manifestBase64}">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;
      --primary: 221 83% 53%;
      --primary-hex: #3b82f6;
      --muted: 0 0% 96.1%;
      --muted-hex: #f5f5f5;
      --muted-foreground: 0 0% 45.1%;
      --muted-foreground-hex: #737373;
      --border: 0 0% 89.8%;
      --border-hex: #e5e5e5;
      --radius: 0.5rem;
      --safe-area-top: env(safe-area-inset-top, 0px);
      --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    }
    
    @media (prefers-color-scheme: dark) {
      :root {
        --background: 0 0% 3.9%;
        --foreground: 0 0% 98%;
        --muted: 0 0% 14.9%;
        --muted-hex: #262626;
        --muted-foreground: 0 0% 63.9%;
        --muted-foreground-hex: #a3a3a3;
        --border: 0 0% 14.9%;
        --border-hex: #262626;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      padding-top: var(--safe-area-top);
      padding-bottom: var(--safe-area-bottom);
      min-height: 100vh;
      min-height: 100dvh; /* Dynamic viewport height for mobile */
    }
    
    /* Offline indicator */
    .offline-indicator {
      background: #fef3c7;
      border-bottom: 2px solid #f59e0b;
      color: #92400e;
      padding: 12px 16px;
      text-align: center;
      font-size: 14px;
      font-weight: 500;
      display: none;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .offline-indicator.show {
      display: block;
    }
    
    @media (prefers-color-scheme: dark) {
      .offline-indicator {
        background: #78350f;
        border-bottom-color: #f59e0b;
        color: #fef3c7;
      }
    }
    
    /* Header - sticky */
    .header {
      background: hsl(var(--background));
      border-bottom: 1px solid hsl(var(--border));
      padding: 16px 20px;
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(10px);
      background-color: hsl(var(--background) / 0.95);
    }
    
    .header h1 {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 20px;
      font-weight: 700;
      color: hsl(var(--foreground));
      letter-spacing: -0.02em;
      margin-bottom: 4px;
    }
    
    .header .subtitle {
      font-size: 14px;
      color: hsl(var(--muted-foreground));
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    /* Progress bar */
    .progress-container {
      padding: 16px 20px;
      background: hsl(var(--background));
      border-bottom: 1px solid hsl(var(--border));
      position: sticky;
      top: calc(73px + var(--safe-area-top));
      z-index: 40;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: hsl(var(--muted));
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--primary-hex);
      transition: width 0.3s ease-out;
      border-radius: 4px;
    }
    
    .progress-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: hsl(var(--muted-foreground));
      text-align: center;
    }
    
    /* Main content */
    .content {
      padding: 0 20px 100px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    /* Category section */
    .category-section {
      margin: 24px 0;
    }
    
    .category-header {
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace;
      font-size: 16px;
      font-weight: 600;
      color: hsl(var(--foreground));
      letter-spacing: -0.02em;
      padding-bottom: 8px;
      border-bottom: 2px solid hsl(var(--foreground));
      margin-bottom: 12px;
    }
    
    /* Shopping list item */
    .list-item {
      display: flex;
      align-items: center;
      min-height: 48px;
      padding: 12px 16px;
      margin: 4px 0;
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }
    
    .list-item:active {
      transform: scale(0.98);
      background: hsl(var(--muted));
    }
    
    .list-item.checked {
      opacity: 0.6;
      text-decoration: line-through;
      color: hsl(var(--muted-foreground));
      order: 999;
    }
    
    .checkbox {
      width: 24px;
      height: 24px;
      min-width: 24px;
      border: 2px solid hsl(var(--border));
      border-radius: 4px;
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      background: hsl(var(--background));
    }
    
    .list-item.checked .checkbox {
      background: var(--primary-hex);
      border-color: var(--primary-hex);
    }
    
    .checkbox::after {
      content: '';
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      display: none;
    }
    
    .list-item.checked .checkbox::after {
      display: block;
    }
    
    .item-text {
      font-size: 16px;
      font-weight: 500;
      color: hsl(var(--foreground));
      flex: 1;
      line-height: 1.5;
    }
    
    .list-item.checked .item-text {
      color: hsl(var(--muted-foreground));
    }
    
    /* Completed section */
    .completed-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid hsl(var(--border));
    }
    
    .completed-section .category-header {
      opacity: 0.7;
    }
    
    /* Fixed bottom bar */
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: hsl(var(--background));
      border-top: 1px solid hsl(var(--border));
      padding: 12px 20px;
      padding-bottom: calc(12px + var(--safe-area-bottom));
      display: flex;
      gap: 12px;
      z-index: 100;
      box-shadow: 0 -4px 12px hsl(var(--foreground) / 0.05);
    }
    
    .btn {
      flex: 1;
      min-height: 48px;
      padding: 12px 24px;
      border: none;
      border-radius: var(--radius);
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      touch-action: manipulation;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: var(--primary-hex);
      color: white;
    }
    
    .btn-primary:active {
      transform: scale(0.98);
      background: #2563eb;
    }
    
    .btn-secondary {
      background: hsl(var(--muted));
      color: hsl(var(--foreground));
    }
    
    .btn-secondary:active {
      background: hsl(var(--border));
    }
    
    /* Add item dialog */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: hsl(var(--foreground) / 0.5);
      backdrop-filter: blur(4px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .dialog-overlay.show {
      display: flex;
    }
    
    .dialog {
      background: hsl(var(--background));
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      padding: 24px;
      max-width: 400px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .dialog h2 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .dialog input,
    .dialog select {
      width: 100%;
      padding: 12px;
      border: 1px solid hsl(var(--border));
      border-radius: calc(var(--radius) - 2px);
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      margin-bottom: 16px;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 24px 20px;
      color: hsl(var(--muted-foreground));
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      border-top: 1px solid hsl(var(--border));
      margin-top: 32px;
    }
    
    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .list-item {
      animation: fadeIn 0.3s ease-out;
    }
    
    /* Loading state */
    .loading {
      text-align: center;
      padding: 40px 20px;
      color: hsl(var(--muted-foreground));
    }
    
    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: hsl(var(--muted-foreground));
    }
  </style>
</head>
<body>
  <div class="offline-indicator" id="offlineIndicator">◉ Offline - Changes will sync when online</div>
  
  <header class="header">
    <h1>Meal Prep Recipe Manager</h1>
    <div class="subtitle">Shopping List</div>
  </header>
  
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width: 0%"></div>
    </div>
    <div class="progress-text" id="progressText">0 of 0 items</div>
  </div>
  
  <main class="content" id="mainContent">
    <div class="loading">Loading shopping list...</div>
  </main>
  
  <div class="bottom-bar">
    <button class="btn btn-primary" onclick="openAddDialog()">+ Add Item</button>
    <button class="btn btn-secondary" onclick="shareList()">Share ↗</button>
  </div>
  
  <div class="dialog-overlay" id="addDialog" onclick="closeAddDialog(event)">
    <div class="dialog" onclick="event.stopPropagation()">
      <h2>Add Item</h2>
      <input type="text" id="newItemText" placeholder="e.g., Milk (1 gallon)" onkeydown="handleAddItemKeydown(event)">
      <select id="newItemCategory">
        <option value="">Select category...</option>
      </select>
      <div class="dialog-actions">
        <button class="btn btn-secondary" onclick="closeAddDialog()">Cancel</button>
        <button class="btn btn-primary" onclick="addItem()">Add</button>
      </div>
    </div>
  </div>
  
  <footer class="footer">
    <div>Meal Prep Recipe Manager</div>
    <div style="margin-top: 4px; font-size: 11px;">v1.0.0 • Built with React & Tailwind</div>
  </footer>
  
  <!-- Supabase SDK -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
  
  <script>
    // Configuration
    const CONFIG = {
      listId: '${escapedListId}',
      weekRange: '${escapedWeekRange}',
      supabaseUrl: '${supabaseUrl || ''}',
      supabaseKey: '${supabaseAnonKey || ''}',
      itemsData: ${itemsJson},
      scheduleData: ${scheduleJson},
    };
    
    // State
    let state = {
      items: [],
      checkedItems: new Set(),
      categories: [],
      supabase: null,
      offline: !navigator.onLine,
      syncQueue: [],
    };
    
    // Initialize Supabase if configured
    if (CONFIG.supabaseUrl && CONFIG.supabaseKey && typeof supabase !== 'undefined') {
      state.supabase = supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
    }
    
    // Initialize IndexedDB for offline storage
    let db = null;
    const DB_NAME = 'shoppingListDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'items';
    
    function openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      });
    }
    
    // Initialize app
    async function init() {
      try {
        db = await openDB();
        await loadItems();
        render();
        
        // Load state from Supabase if available
        if (state.supabase) {
          await syncFromSupabase();
        } else {
          // Load from IndexedDB
          await loadFromIndexedDB();
        }
        
        updateProgress();
        
        // Set up offline detection
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        handleOffline(); // Check initial state
        
        // Note: IndexedDB provides offline storage - no service worker needed for this use case
      } catch (error) {
        console.error('Initialization error:', error);
        document.getElementById('mainContent').innerHTML = '<div class="empty-state">Error loading shopping list. Please refresh.</div>';
      }
    }
    
    // Load items from config
    function loadItems() {
      state.items = [];
      state.categories = [];
      
      // Extract categories and items
      const categoryMap = {};
      
      for (const [category, items] of Object.entries(CONFIG.itemsData || {})) {
        if (!state.categories.includes(category)) {
          state.categories.push(category);
        }
        
        items.forEach(itemText => {
          const itemId = btoa(itemText).replace(/[+/=]/g, '').substring(0, 20);
          if (!categoryMap[itemId]) {
            state.items.push({
              id: itemId,
              text: itemText,
              category: category,
              checked: false,
              addedByUser: false,
            });
            categoryMap[itemId] = true;
          }
        });
      }
      
      // Sort categories (keep original order from config)
      state.categories = Object.keys(CONFIG.itemsData || {});
    }
    
    // Load checked state from IndexedDB
    async function loadFromIndexedDB() {
      if (!db) return;
      
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const savedItems = request.result;
            savedItems.forEach(saved => {
              const item = state.items.find(i => i.id === saved.id);
              if (item && saved.checked) {
                item.checked = true;
                state.checkedItems.add(saved.id);
              }
            });
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.error('Error loading from IndexedDB:', error);
      }
    }
    
    // Save to IndexedDB
    async function saveToIndexedDB(item) {
      if (!db) return;
      
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        await store.put({
          id: item.id,
          checked: item.checked,
          text: item.text,
          category: item.category,
        });
      } catch (error) {
        console.error('Error saving to IndexedDB:', error);
      }
    }
    
    // Sync from Supabase
    async function syncFromSupabase() {
      if (!state.supabase) return;
      
      try {
        const { data, error } = await state.supabase
          .from('shopping_list_state')
          .select('*')
          .eq('list_id', CONFIG.listId);
        
        if (error) throw error;
        
        if (data) {
          data.forEach(row => {
            const item = state.items.find(i => i.id === row.item_id);
            if (item) {
              item.checked = row.checked;
              if (row.checked) {
                state.checkedItems.add(item.id);
              } else {
                state.checkedItems.delete(item.id);
              }
            } else if (row.added_by_user) {
              // Add user-added items
              state.items.push({
                id: row.item_id,
                text: row.item_text,
                category: row.category || 'Other',
                checked: row.checked,
                addedByUser: true,
              });
              if (!state.categories.includes(row.category || 'Other')) {
                state.categories.push(row.category || 'Other');
              }
            }
          });
          
          render();
          updateProgress();
        }
      } catch (error) {
        console.error('Error syncing from Supabase:', error);
      }
    }
    
    // Sync to Supabase
    async function syncToSupabase(item) {
      if (!state.supabase) {
        // Queue for later
        state.syncQueue.push(item);
        return;
      }
      
      try {
        const { error } = await state.supabase
          .from('shopping_list_state')
          .upsert({
            list_id: CONFIG.listId,
            item_id: item.id,
            item_text: item.text,
            category: item.category || null,
            checked: item.checked,
            added_by_user: item.addedByUser || false,
          }, {
            onConflict: 'list_id,item_id',
          });
        
        if (error) throw error;
      } catch (error) {
        console.error('Error syncing to Supabase:', error);
        // Queue for later
        state.syncQueue.push(item);
      }
    }
    
    // Process sync queue
    async function processSyncQueue() {
      if (!state.supabase || state.syncQueue.length === 0) return;
      
      const items = [...state.syncQueue];
      state.syncQueue = [];
      
      for (const item of items) {
        await syncToSupabase(item);
      }
    }
    
    // Toggle item checked state
    async function toggleItem(itemId) {
      const item = state.items.find(i => i.id === itemId);
      if (!item) return;
      
      item.checked = !item.checked;
      
      if (item.checked) {
        state.checkedItems.add(itemId);
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      } else {
        state.checkedItems.delete(itemId);
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
      
      // Save locally
      await saveToIndexedDB(item);
      
      // Sync to Supabase
      if (state.supabase && !state.offline) {
        await syncToSupabase(item);
      } else {
        state.syncQueue.push(item);
      }
      
      render();
      updateProgress();
    }
    
    // Add new item
    async function addItem() {
      const textInput = document.getElementById('newItemText');
      const categorySelect = document.getElementById('newItemCategory');
      
      const text = textInput.value.trim();
      const category = categorySelect.value || 'Other';
      
      if (!text) return;
      
      const itemId = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      const newItem = {
        id: itemId,
        text: text,
        category: category,
        checked: false,
        addedByUser: true,
      };
      
      state.items.push(newItem);
      if (!state.categories.includes(category)) {
        state.categories.push(category);
      }
      
      // Save locally
      await saveToIndexedDB(newItem);
      
      // Sync to Supabase
      if (state.supabase && !state.offline) {
        await syncToSupabase(newItem);
      } else {
        state.syncQueue.push(newItem);
      }
      
      textInput.value = '';
      closeAddDialog();
      render();
      updateProgress();
    }
    
    // Share list
    async function shareList() {
      const url = window.location.href;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Shopping List - ' + CONFIG.weekRange,
            text: 'Check out our shopping list!',
            url: url,
          });
        } catch (error) {
          if (error.name !== 'AbortError') {
            // Fallback to copy
            copyToClipboard(url);
          }
        }
      } else {
        copyToClipboard(url);
      }
    }
    
    function copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          alert('Link copied to clipboard!');
        });
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
      }
    }
    
    // Update progress
    function updateProgress() {
      const total = state.items.length;
      const checked = state.checkedItems.size;
      const percentage = total > 0 ? (checked / total) * 100 : 0;
      
      document.getElementById('progressFill').style.width = percentage + '%';
      document.getElementById('progressText').textContent = checked + ' of ' + total + ' items';
    }
    
    // Render shopping list
    function render() {
      const container = document.getElementById('mainContent');
      
      if (state.items.length === 0) {
        container.innerHTML = '<div class="empty-state">No items in shopping list</div>';
        return;
      }
      
      let html = '';
      
      // Render recipes section
      if (CONFIG.scheduleData && CONFIG.scheduleData.length > 0) {
        html += '<div class="category-section">';
        html += '<div class="category-header">📅 Recipes This Week</div>';
        html += '<div style="padding-left: 4px;">';
        CONFIG.scheduleData.forEach(recipe => {
          html += '<div style="padding: 8px 0; font-size: 14px; color: hsl(var(--muted-foreground));">';
          html += '<strong>' + escapeHtml(recipe.recipe) + '</strong> - ' + escapeHtml(recipe.cook) + ' (' + escapeHtml(recipe.day) + ')';
          html += '</div>';
        });
        html += '</div>';
        html += '</div>';
      }
      
      // Group items by category and checked state
      const activeItems = {};
      const completedItems = {};
      
      state.items.forEach(item => {
        const category = item.category || 'Other';
        
        if (item.checked) {
          if (!completedItems[category]) completedItems[category] = [];
          completedItems[category].push(item);
        } else {
          if (!activeItems[category]) activeItems[category] = [];
          activeItems[category].push(item);
        }
      });
      
      // Render active items by category
      state.categories.forEach(category => {
        if (!activeItems[category] || activeItems[category].length === 0) return;
        
        html += '<div class="category-section">';
        html += '<div class="category-header">' + escapeHtml(category) + '</div>';
        
        activeItems[category].forEach(item => {
          html += '<div class="list-item" onclick="toggleItem(' + "'" + item.id + "'" + ')">';
          html += '<div class="checkbox"></div>';
          html += '<div class="item-text">' + escapeHtml(item.text) + '</div>';
          html += '</div>';
        });
        
        html += '</div>';
      });
      
      // Render completed items
      const hasCompleted = Object.keys(completedItems).some(cat => completedItems[cat].length > 0);
      if (hasCompleted) {
        html += '<div class="completed-section">';
        html += '<div class="category-header">✓ Completed</div>';
        
        Object.keys(completedItems).forEach(category => {
          if (!completedItems[category] || completedItems[category].length === 0) return;
          
          completedItems[category].forEach(item => {
            html += '<div class="list-item checked" onclick="toggleItem(' + "'" + item.id + "'" + ')">';
            html += '<div class="checkbox"></div>';
            html += '<div class="item-text">' + escapeHtml(item.text) + '</div>';
            html += '</div>';
          });
        });
        
        html += '</div>';
      }
      
      container.innerHTML = html;
      
      // Populate category select for add dialog
      const categorySelect = document.getElementById('newItemCategory');
      if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Select category...</option>';
        state.categories.forEach(cat => {
          categorySelect.innerHTML += '<option value="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</option>';
        });
      }
    }
    
    // Dialog functions
    function openAddDialog() {
      document.getElementById('addDialog').classList.add('show');
      document.getElementById('newItemText').focus();
    }
    
    function closeAddDialog(event) {
      if (event && event.target.id !== 'addDialog') return;
      document.getElementById('addDialog').classList.remove('show');
      document.getElementById('newItemText').value = '';
    }
    
    function handleAddItemKeydown(event) {
      if (event.key === 'Enter') {
        addItem();
      } else if (event.key === 'Escape') {
        closeAddDialog();
      }
    }
    
    // Offline handling
    function handleOffline() {
      state.offline = true;
      document.getElementById('offlineIndicator').classList.add('show');
    }
    
    async function handleOnline() {
      state.offline = false;
      document.getElementById('offlineIndicator').classList.remove('show');
      
      // Process sync queue
      await processSyncQueue();
      
      // Sync from server
      if (state.supabase) {
        await syncFromSupabase();
        render();
        updateProgress();
      }
    }
    
    // Utility
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    // Expose toggleItem globally for onclick
    window.toggleItem = toggleItem;
    window.openAddDialog = openAddDialog;
    window.closeAddDialog = closeAddDialog;
    window.addItem = addItem;
    window.shareList = shareList;
    window.handleAddItemKeydown = handleAddItemKeydown;
    
    // Initialize on load
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;
}

