import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Generate a standalone interactive shopping list HTML page
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dataParam = searchParams.get("data");

  // Default demo data if none provided
  let shoppingData = {
    weekRange: "This Week",
    categories: {
      "Produce": ["Tomatoes", "Onions", "Garlic", "Lettuce"],
      "Meat & Seafood": ["Chicken breast", "Ground beef"],
      "Dairy & Eggs": ["Milk", "Eggs", "Cheese"],
      "Pantry": ["Olive oil", "Pasta", "Rice"],
    },
    recipes: [
      { title: "Chicken Stir Fry", day: "Monday", cook: "You" },
      { title: "Pasta Bolognese", day: "Wednesday", cook: "Partner" },
    ],
  };

  // Parse data from URL if provided
  if (dataParam) {
    try {
      const decoded = Buffer.from(dataParam, "base64").toString("utf-8");
      shoppingData = JSON.parse(decoded);
    } catch (e) {
      console.error("Failed to parse shopping data:", e);
    }
  }

  const html = generateInteractiveShoppingListHTML(shoppingData);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

interface ShoppingData {
  weekRange: string;
  categories: { [category: string]: string[] };
  recipes: { title: string; day: string; cook: string }[];
}

function generateInteractiveShoppingListHTML(data: ShoppingData): string {
  // Generate category sections
  const categorySections = Object.entries(data.categories)
    .map(([category, items]) => {
      const itemsHTML = items
        .map(
          (item, index) => `
        <div class="item" data-category="${category}" data-index="${index}" onclick="toggleItem(this)">
          <div class="item-check">
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span class="item-text">${item}</span>
        </div>
      `
        )
        .join("");

      return `
      <div class="category" data-category="${category}">
        <div class="category-header">
          <span class="category-name">${category}</span>
          <span class="category-count" data-category-count="${category}">0/${items.length}</span>
        </div>
        <div class="category-items">
          ${itemsHTML}
        </div>
      </div>
      `;
    })
    .join("");

  // Calculate total items
  const totalItems = Object.values(data.categories).flat().length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="theme-color" content="#F97316">
  <title>Shopping List - ${data.weekRange}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    :root {
      --gray-50: #FAFAFA;
      --gray-100: #F5F5F5;
      --gray-200: #E5E5E5;
      --gray-300: #D4D4D4;
      --gray-400: #A3A3A3;
      --gray-500: #737373;
      --gray-700: #404040;
      --gray-900: #171717;
      --black: #0a0a0a;
      --success: #22C55E;
      --success-light: #F0FDF4;
    }
    
    html, body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--gray-50);
      color: var(--gray-900);
      line-height: 1.5;
      min-height: 100vh;
      min-height: 100dvh;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 500px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
      min-height: 100dvh;
      position: relative;
    }
    
    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      border-bottom: 1px solid var(--gray-200);
      padding: 16px 20px;
      padding-top: max(16px, env(safe-area-inset-top));
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .brand {
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      font-weight: 700;
      color: var(--gray-900);
      letter-spacing: -0.02em;
    }
    
    .brand-tagline {
      font-size: 11px;
      color: var(--gray-500);
      margin-top: 2px;
      font-style: italic;
    }
    
    .week-badge {
      background: var(--gray-100);
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 12px;
      font-weight: 500;
      color: var(--gray-500);
    }
    
    /* Progress Bar */
    .progress-section {
      margin-top: 8px;
    }
    
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }
    
    .progress-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--gray-700);
    }
    
    .progress-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
      color: var(--gray-900);
    }
    
    .progress-bar {
      height: 8px;
      background: var(--gray-100);
      border-radius: 100px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: var(--gray-900);
      border-radius: 100px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 0%;
    }
    
    .progress-bar.complete .progress-fill {
      background: var(--success);
    }
    
    /* Completion Banner */
    .completion-banner {
      display: none;
      background: var(--success-light);
      border: 1px solid var(--success);
      border-radius: 12px;
      padding: 16px;
      margin: 16px 20px;
      text-align: center;
      animation: slideIn 0.3s ease;
    }
    
    .completion-banner.show {
      display: block;
    }
    
    .completion-banner h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--success);
      margin-bottom: 4px;
    }
    
    .completion-banner p {
      font-size: 14px;
      color: var(--gray-700);
    }
    
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Content */
    .content {
      padding: 16px 20px;
      padding-bottom: max(80px, calc(20px + env(safe-area-inset-bottom)));
    }
    
    /* Category */
    .category {
      margin-bottom: 24px;
    }
    
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--black);
    }
    
    .category-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: var(--black);
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    
    .category-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      color: var(--gray-400);
    }
    
    .category-items {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    /* Checked Items Section (at bottom of page) */
    .checked-section {
      display: none;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid var(--gray-200);
    }
    
    .checked-section.show {
      display: block;
    }
    
    .checked-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--black);
    }
    
    .checked-section-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: var(--black);
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    
    .checked-section-count {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 600;
      color: var(--gray-400);
    }
    
    .checked-items-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    /* Item */
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--gray-50);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
      -webkit-user-select: none;
    }
    
    .item:active {
      transform: scale(0.98);
      background: var(--gray-100);
    }
    
    .item-check {
      width: 28px;
      height: 28px;
      border: 3px solid var(--gray-900);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.25s ease;
      background: white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    
    .check-icon {
      width: 16px;
      height: 16px;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      color: white;
    }
    
    .item-text {
      font-size: 15px;
      font-weight: 500;
      color: var(--gray-900);
      transition: all 0.2s ease;
    }
    
    /* Checked State */
    .item.checked {
      background: var(--gray-100);
    }
    
    .item.checked .item-check {
      background: var(--gray-900);
      border-color: var(--gray-900);
    }
    
    .item.checked .check-icon {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    
    .item.checked .item-text {
      color: var(--gray-400);
      text-decoration: line-through;
    }
    
    /* Reset Button */
    .reset-section {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 20px;
      padding-bottom: max(16px, env(safe-area-inset-bottom));
      background: linear-gradient(to top, white 80%, transparent);
      z-index: 50;
    }
    
    .reset-section .container-inner {
      max-width: 500px;
      margin: 0 auto;
    }
    
    .reset-btn {
      width: 100%;
      padding: 14px 20px;
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      border-radius: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-500);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .reset-btn:active {
      background: var(--gray-200);
      transform: scale(0.98);
    }
    
    /* Animations */
    .item {
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 8px;
    }
    
    .empty-state p {
      font-size: 14px;
      color: var(--gray-500);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Progress -->
    <div class="header">
      <div class="header-top">
        <div>
          <div class="brand">Babe, What's for Dinner?</div>
          <div class="brand-tagline">Finally, an answer.</div>
        </div>
        <span class="week-badge">${data.weekRange}</span>
      </div>
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-title">Shopping Progress</span>
          <span class="progress-count" id="progress-count">0/${totalItems}</span>
        </div>
        <div class="progress-bar" id="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
    </div>
    
    <!-- Completion Banner -->
    <div class="completion-banner" id="completion-banner">
      <h3>🎉 All Done!</h3>
      <p>You've got everything on your list!</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      ${categorySections}
      
      <!-- Checked Items Section (at bottom) -->
      <div class="checked-section" id="checked-section">
        <div class="checked-section-header">
          <span class="checked-section-title">✓ Checked Items</span>
          <span class="checked-section-count" id="checked-count">0</span>
        </div>
        <div class="checked-items-list" id="checked-items-list">
        </div>
      </div>
    </div>
    
    <!-- Reset Button -->
    <div class="reset-section">
      <div class="container-inner">
        <button class="reset-btn" onclick="resetAll()">
          Reset Shopping List
        </button>
      </div>
    </div>
  </div>
  
  <script>
    // Get unique list ID from URL or generate one
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('id') || 'default';
    const storageKey = 'shopping-list-' + listId;
    
    // Total items count
    const totalItems = ${totalItems};
    
    // Load saved state
    function loadState() {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const checkedItems = JSON.parse(saved);
          checkedItems.forEach(id => {
            const item = document.querySelector('[data-item-id="' + id + '"]');
            if (item) {
              item.classList.add('checked');
            }
          });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
      }
      
      // Generate item IDs
      document.querySelectorAll('.item').forEach((item, index) => {
        item.setAttribute('data-item-id', index);
      });
      
      // Load checked state after IDs are set
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const checkedItems = JSON.parse(saved);
          checkedItems.forEach(id => {
            const item = document.querySelector('[data-item-id="' + id + '"]');
            if (item) {
              item.classList.add('checked');
            }
          });
        }
      } catch (e) {
        console.error('Failed to load state:', e);
      }
      
      updateProgress();
      updateCategoryCounts();
    }
    
    // Save state
    function saveState() {
      const checkedItems = [];
      document.querySelectorAll('.item.checked').forEach(item => {
        checkedItems.push(item.getAttribute('data-item-id'));
      });
      localStorage.setItem(storageKey, JSON.stringify(checkedItems));
    }
    
    // Toggle item
    function toggleItem(element) {
      const wasChecked = element.classList.contains('checked');
      element.classList.toggle('checked');
      
      // Haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      
      const checkedSection = document.getElementById('checked-section');
      const checkedItemsList = document.getElementById('checked-items-list');
      
      if (element.classList.contains('checked')) {
        // Move to checked section at bottom
        checkedItemsList.appendChild(element);
        checkedSection.classList.add('show');
      } else {
        // Move back to original category
        const categoryName = element.getAttribute('data-category');
        const categoryDiv = document.querySelector('.category[data-category="' + categoryName + '"]');
        const categoryItems = categoryDiv.querySelector('.category-items');
        categoryItems.appendChild(element);
        
        // Hide checked section if empty
        if (checkedItemsList.children.length === 0) {
          checkedSection.classList.remove('show');
        }
      }
      
      saveState();
      updateProgress();
      updateCategoryCounts();
      updateCheckedCount();
    }
    
    // Update progress bar
    function updateProgress() {
      const checked = document.querySelectorAll('.item.checked').length;
      const percentage = totalItems > 0 ? (checked / totalItems) * 100 : 0;
      
      document.getElementById('progress-count').textContent = checked + '/' + totalItems;
      document.getElementById('progress-fill').style.width = percentage + '%';
      
      const progressBar = document.getElementById('progress-bar');
      const banner = document.getElementById('completion-banner');
      
      if (checked === totalItems && totalItems > 0) {
        progressBar.classList.add('complete');
        banner.classList.add('show');
      } else {
        progressBar.classList.remove('complete');
        banner.classList.remove('show');
      }
    }
    
    // Update category counts
    function updateCategoryCounts() {
      document.querySelectorAll('.category').forEach(category => {
        const categoryName = category.getAttribute('data-category');
        const categoryItems = category.querySelector('.category-items');
        const remaining = categoryItems.querySelectorAll('.item').length;
        const countEl = category.querySelector('.category-count');
        
        // Count total items that originally belonged to this category
        const allItems = document.querySelectorAll('.item[data-category="' + categoryName + '"]');
        const total = allItems.length;
        const checked = total - remaining;
        
        if (countEl) {
          countEl.textContent = checked + '/' + total;
        }
      });
    }
    
    // Update checked items count
    function updateCheckedCount() {
      const checkedItemsList = document.getElementById('checked-items-list');
      const checkedCount = document.getElementById('checked-count');
      if (checkedCount) {
        checkedCount.textContent = checkedItemsList.children.length;
      }
    }
    
    // Reset all items
    function resetAll() {
      if (confirm('Reset all items? This will uncheck everything.')) {
        document.querySelectorAll('.item.checked').forEach(item => {
          item.classList.remove('checked');
        });
        saveState();
        updateProgress();
        updateCategoryCounts();
        
        // Move all items back to their original categories
        const checkedItemsList = document.getElementById('checked-items-list');
        const checkedSection = document.getElementById('checked-section');
        
        // Get all checked items
        const checkedItems = Array.from(checkedItemsList.querySelectorAll('.item'));
        
        // Move each back to its category
        checkedItems.forEach(item => {
          const categoryName = item.getAttribute('data-category');
          const categoryDiv = document.querySelector('.category[data-category="' + categoryName + '"]');
          const categoryItems = categoryDiv.querySelector('.category-items');
          categoryItems.appendChild(item);
        });
        
        // Hide checked section
        checkedSection.classList.remove('show');
        
        updateCheckedCount();
      }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', loadState);
  </script>
</body>
</html>`;
}

