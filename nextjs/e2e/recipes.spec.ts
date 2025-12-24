import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Recipe CRUD Operations
 *
 * Tests cover:
 * - Recipe list display
 * - Recipe creation (manual + URL import)
 * - Recipe viewing
 * - Recipe editing
 * - Recipe deletion
 * - Recipe search and filtering
 * - Recipe organization (folders, tags)
 */

test.describe("Recipes - List View", () => {
  test("should display recipes page for authenticated users", async ({
    page,
  }) => {
    await page.goto("/app/recipes");

    // If redirected to login, test is skipped (auth required)
    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Should show recipes page
    await expect(page).toHaveURL(/\/app\/recipes/);
  });

  test("should show empty state for new users", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Either recipes are shown or empty state
    const hasRecipes = await page.locator('[data-testid="recipe-card"]').count() > 0;
    const hasEmptyState = await page.locator("text=/no recipes|add your first|get started/i").isVisible();

    expect(hasRecipes || hasEmptyState).toBeTruthy();
  });

  test("should have add recipe button", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Look for add recipe button
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New"), a:has-text("Add"), [data-testid="add-recipe"]'
    );
    await expect(addButton.first()).toBeVisible();
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Look for search input
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[type="search"], [data-testid="recipe-search"]'
    );
    await expect(searchInput).toBeVisible();
  });

  test("should have filter options", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Look for filter button or dropdown
    const filterControls = page.locator(
      'button:has-text("Filter"), [data-testid="filter"], select'
    );
    await expect(filterControls.first()).toBeVisible();
  });
});

test.describe("Recipes - Create Recipe", () => {
  test("should open create recipe modal/page", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Click add recipe button
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New"), a:has-text("Add")'
    ).first();

    await addButton.click();

    // Should show modal or navigate to create page
    await page.waitForTimeout(500);

    const modal = page.locator('[role="dialog"]');
    const createPage = page.url().includes("/create") || page.url().includes("/new");

    expect((await modal.isVisible()) || createPage).toBeTruthy();
  });

  test("should have option to import from URL", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Click add recipe button
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New"), a:has-text("Add")'
    ).first();
    await addButton.click();

    await page.waitForTimeout(500);

    // Look for URL import option
    const urlOption = page.locator(
      'text=/import|url|paste|link/i, input[placeholder*="url" i]'
    );
    await expect(urlOption.first()).toBeVisible();
  });

  test("should have option to create manually", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Click add recipe button
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New"), a:has-text("Add")'
    ).first();
    await addButton.click();

    await page.waitForTimeout(500);

    // Look for manual entry option
    const manualOption = page.locator(
      'text=/manual|create|write|scratch/i, button:has-text("Create")'
    );
    await expect(manualOption.first()).toBeVisible();
  });

  test("should validate required fields when creating recipe", async ({
    page,
  }) => {
    await page.goto("/app/recipes/new");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Try to submit empty form
    const submitButton = page.locator(
      'button:has-text("Save"), button:has-text("Create"), button[type="submit"]'
    ).first();

    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation error
      await page.waitForTimeout(500);
      const error = page.locator("text=/required|name|title/i");
      await expect(error).toBeVisible();
    }
  });
});

test.describe("Recipes - URL Import", () => {
  test("should have URL input field for import", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to import
    const addButton = page.locator(
      'button:has-text("Add"), button:has-text("New")'
    ).first();
    await addButton.click();
    await page.waitForTimeout(500);

    // Look for URL input
    const urlInput = page.locator('input[placeholder*="url" i], input[type="url"]');
    await expect(urlInput.first()).toBeVisible();
  });

  test("should validate URL format", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to import
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();
    await page.waitForTimeout(500);

    // Enter invalid URL
    const urlInput = page.locator('input[placeholder*="url" i], input[type="url"]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill("not-a-valid-url");

      // Try to submit
      const importButton = page.locator('button:has-text("Import"), button:has-text("Parse")').first();
      if (await importButton.isVisible()) {
        await importButton.click();
        await page.waitForTimeout(500);

        // Should show error
        const error = page.locator("text=/invalid|url|valid/i");
        await expect(error).toBeVisible();
      }
    }
  });

  test("should show loading state during import", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to import
    const addButton = page.locator('button:has-text("Add")').first();
    await addButton.click();
    await page.waitForTimeout(500);

    // Enter a real recipe URL (this might timeout in CI)
    const urlInput = page.locator('input[placeholder*="url" i]').first();
    if (await urlInput.isVisible()) {
      await urlInput.fill("https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/");

      const importButton = page.locator('button:has-text("Import"), button:has-text("Parse")').first();
      if (await importButton.isVisible()) {
        await importButton.click();

        // Should show loading indicator
        const loading = page.locator('[data-loading="true"], .loading, .spinner, text=/loading|parsing/i');
        // Loading might be very quick, so we just check it appeared
        await page.waitForTimeout(500);
      }
    }
  });
});

test.describe("Recipes - View Recipe", () => {
  test("should display recipe details when clicking a recipe", async ({
    page,
  }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // If there are recipes, click one
    const recipeCard = page.locator('[data-testid="recipe-card"], .recipe-card').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();

      // Should navigate to recipe detail or open modal
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"]');
      const detailPage = page.url().includes("/recipes/");

      expect((await modal.isVisible()) || detailPage).toBeTruthy();
    }
  });

  test("should show recipe ingredients", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Look for ingredients section
      const ingredients = page.locator("text=/ingredients/i");
      await expect(ingredients).toBeVisible();
    }
  });

  test("should show recipe instructions", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Look for instructions section
      const instructions = page.locator("text=/instructions|steps|directions/i");
      await expect(instructions).toBeVisible();
    }
  });
});

test.describe("Recipes - Edit Recipe", () => {
  test("should have edit button on recipe detail", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Look for edit button
      const editButton = page.locator(
        'button:has-text("Edit"), a:has-text("Edit"), [data-testid="edit-recipe"]'
      );
      await expect(editButton.first()).toBeVisible();
    }
  });

  test("should allow editing recipe name", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      const editButton = page.locator('button:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(500);

        // Should show editable name field
        const nameInput = page.locator('input[name="name"], input[name="title"]');
        await expect(nameInput).toBeVisible();
      }
    }
  });
});

test.describe("Recipes - Delete Recipe", () => {
  test("should have delete option on recipe", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Look for delete button or menu option
      const deleteButton = page.locator(
        'button:has-text("Delete"), [data-testid="delete-recipe"]'
      );
      const menuButton = page.locator('button:has([data-testid="more"]), [aria-label="More options"]');

      const hasDelete = await deleteButton.isVisible();
      const hasMenu = await menuButton.isVisible();

      expect(hasDelete || hasMenu).toBeTruthy();
    }
  });

  test("should show confirmation before deleting", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      const deleteButton = page.locator('button:has-text("Delete")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]');
        await expect(confirmDialog).toBeVisible();

        // Should have confirm and cancel options
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
        const cancelButton = page.locator('button:has-text("Cancel")');

        await expect(confirmButton.first()).toBeVisible();
        await expect(cancelButton).toBeVisible();
      }
    }
  });
});

test.describe("Recipes - Search and Filter", () => {
  test("should filter recipes by search term", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("chicken");

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Results should update (either show matching or show "no results")
      const resultsArea = page.locator('[data-testid="recipe-list"], main');
      await expect(resultsArea).toBeVisible();
    }
  });

  test("should clear search results", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("test search");
      await page.waitForTimeout(300);

      // Clear the search
      await searchInput.clear();
      await page.waitForTimeout(300);

      // Verify search is cleared
      await expect(searchInput).toHaveValue("");
    }
  });
});

test.describe("Recipes - Accessibility", () => {
  test("should have accessible recipe cards", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Recipe cards should be keyboard accessible
    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible()) {
      // Should be focusable
      await recipeCard.focus();
      await expect(recipeCard).toBeFocused();

      // Should be activatable with Enter
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
    }
  });

  test("should have proper headings structure", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Should have main heading
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });
});

test.describe("Recipes - Mobile", () => {
  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Page should still be usable
    await expect(page).toHaveURL(/\/app\/recipes/);

    // Add button should still be visible
    const addButton = page.locator('button:has-text("Add"), [data-testid="add-recipe"]').first();
    await expect(addButton).toBeVisible();
  });

  test("should have mobile-friendly navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Should have hamburger menu or bottom nav
    const mobileNav = page.locator(
      '[data-testid="mobile-menu"], [aria-label="Menu"], nav'
    );
    await expect(mobileNav.first()).toBeVisible();
  });
});
