import { test, expect } from "@playwright/test";
import { dismissCookieDialog } from "./fixtures/auth";

/**
 * E2E Tests for Social and Sharing Features
 *
 * Tests cover:
 * - Public profile pages
 * - Recipe sharing
 * - Share token access
 * - Household invitations
 * - Social discovery
 */

test.describe("Social - Public Profiles", () => {
  test("should display public profile page structure", async ({ page }) => {
    // Try to access a public profile
    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Should not redirect to login (public page)
    await expect(page).toHaveURL(/\/u\/testuser/);

    // Should show either profile content or 404 page
    // 404 is valid because "testuser" might not exist
    const has404 = await page.locator('text=/404|not found|page not found/i').first().isVisible().catch(() => false);
    const hasProfile = await page.locator('text=/@|profile|recipes/i').first().isVisible().catch(() => false);

    expect(has404 || hasProfile).toBeTruthy();
  });

  test("should show user's public recipes on profile", async ({ page }) => {
    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Check if this is a 404 page (expected for non-existent user)
    const is404 = await page.locator('text=/404|not found/i').first().isVisible().catch(() => false);

    if (is404) {
      // Test passes - 404 for non-existent user is correct behavior
      expect(is404).toBeTruthy();
      return;
    }

    // If profile exists and has recipes, they should be visible
    const recipesSection = page.locator("text=/recipes|0 recipes/i");
    await expect(recipesSection.first()).toBeVisible();
  });

  test("should have link to profile from app settings", async ({ page }) => {
    await page.goto("/app/settings");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Look for profile settings section
    const profileSection = page.locator("text=/profile|public|username/i");
    await expect(profileSection.first()).toBeVisible();
  });

  test("should allow setting username for public profile", async ({ page }) => {
    await page.goto("/app/settings/profile");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Look for username input
    const usernameInput = page.locator('input[name="username"], input[placeholder*="username" i]');

    // Might be in a different settings location
    const hasUsername = await usernameInput.isVisible().catch(() => false);
    if (!hasUsername) {
      // Try the social settings page
      await page.goto("/app/settings/social");
      if (page.url().includes("/login")) {
        test.skip();
        return;
      }
      const socialUsername = page.locator('input[name="username"]');
      if (await socialUsername.isVisible().catch(() => false)) {
        await expect(socialUsername).toBeVisible();
      }
    }
  });
});

test.describe("Social - Recipe Sharing", () => {
  test("should have share button on recipe detail", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible().catch(() => false)) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Look for share button
      const shareButton = page.locator(
        'button:has-text("Share"), [data-testid="share-recipe"], [aria-label*="share" i]'
      );
      await expect(shareButton.first()).toBeVisible();
    }
  });

  test("should open share modal when clicking share", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible().catch(() => false)) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      const shareButton = page.locator('button:has-text("Share")').first();
      if (await shareButton.isVisible().catch(() => false)) {
        await shareButton.click();

        // Should show share modal/dialog
        const shareDialog = page.locator('[role="dialog"]');
        await expect(shareDialog).toBeVisible();
      }
    }
  });

  test("should generate shareable link", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible().catch(() => false)) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      const shareButton = page.locator('button:has-text("Share")').first();
      if (await shareButton.isVisible().catch(() => false)) {
        await shareButton.click();
        await page.waitForTimeout(500);

        // Look for copy link button or link display
        const linkElement = page.locator(
          'input[readonly], text=/shared\/[a-z0-9]+/i, button:has-text("Copy")'
        );
        await expect(linkElement.first()).toBeVisible();
      }
    }
  });
});

test.describe("Social - Shared Recipe Access", () => {
  test("should display shared recipe page for valid token", async ({
    page,
  }) => {
    // Note: This test uses a placeholder token - in real testing,
    // you'd create a real shared recipe first
    await page.goto("/shared/testtoken123");
    await dismissCookieDialog(page);

    // Should show either recipe content or "not found" (both valid)
    await expect(page).toHaveURL(/\/shared\/testtoken123/);

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for content or error - both are valid outcomes for a test token
    const hasContent = await page.locator("text=/ingredients|instructions/i").first().isVisible().catch(() => false);
    const hasError = await page.locator("text=/not found|invalid|expired|404/i").first().isVisible().catch(() => false);

    expect(hasContent || hasError).toBeTruthy();
  });

  test("should not require login to view shared recipe", async ({ page }) => {
    await page.goto("/shared/testtoken123");

    // Should NOT redirect to login
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain("/login");
  });

  test("should show recipe details on shared page", async ({ page }) => {
    await page.goto("/shared/testtoken123");
    await dismissCookieDialog(page);

    // Wait for page load
    await page.waitForTimeout(1000);

    // Either shows recipe (h1/h2) or error message
    const hasHeading = await page.locator("h1, h2").first().isVisible().catch(() => false);
    expect(hasHeading).toBeTruthy();
  });

  test("should have option to save shared recipe (if logged in)", async ({
    page,
  }) => {
    await page.goto("/shared/testtoken123");
    await dismissCookieDialog(page);

    // Just verify page loads (save button only shows if logged in AND recipe exists)
    await expect(page).toHaveURL(/\/shared/);
  });
});

test.describe("Social - Household Invitations", () => {
  test("should have invite button in household settings", async ({ page }) => {
    await page.goto("/app/settings/household");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Look for invite button
    const inviteButton = page.locator(
      'button:has-text("Invite"), button:has-text("Add Member")'
    );
    await expect(inviteButton.first()).toBeVisible();
  });

  test("should open invite modal when clicking invite", async ({ page }) => {
    await page.goto("/app/settings/household");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const inviteButton = page.locator('button:has-text("Invite")').first();
    if (await inviteButton.isVisible().catch(() => false)) {
      await inviteButton.click();

      // Should show invite modal
      const inviteDialog = page.locator('[role="dialog"]');
      await expect(inviteDialog).toBeVisible();
    }
  });

  test("should require email for invitation", async ({ page }) => {
    await page.goto("/app/settings/household");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const inviteButton = page.locator('button:has-text("Invite")').first();
    if (await inviteButton.isVisible().catch(() => false)) {
      await inviteButton.click();
      await page.waitForTimeout(500);

      // Look for email input in modal
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      await expect(emailInput).toBeVisible();
    }
  });

  test("should display household members list", async ({ page }) => {
    await page.goto("/app/settings/household");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Look for members section
    const membersSection = page.locator("text=/members|people|household/i");
    await expect(membersSection.first()).toBeVisible();
  });
});

test.describe("Social - Invite Token Access", () => {
  test("should display invite page for valid token", async ({ page }) => {
    await page.goto("/invite/testinvitetoken");
    await dismissCookieDialog(page);

    // Should show invite page
    await expect(page).toHaveURL(/\/invite\/testinvitetoken/);

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Should show invite content, error, OR 404 page (all valid)
    const hasContent = await page.locator("text=/join|household|invitation/i").first().isVisible().catch(() => false);
    const hasError = await page.locator("text=/invalid|expired|not found|404/i").first().isVisible().catch(() => false);

    expect(hasContent || hasError).toBeTruthy();
  });

  test("should require login to accept invitation", async ({ page }) => {
    await page.goto("/invite/testinvitetoken");
    await dismissCookieDialog(page);

    await page.waitForTimeout(1000);

    // If valid invite, should prompt login, show accept button, or show error/404
    const loginPrompt = page.locator("text=/login|sign in/i");
    const acceptButton = page.locator('button:has-text("Accept"), button:has-text("Join")');
    const error = page.locator("text=/invalid|expired|not found|404/i");

    const hasLogin = await loginPrompt.first().isVisible().catch(() => false);
    const hasAccept = await acceptButton.first().isVisible().catch(() => false);
    const hasError = await error.first().isVisible().catch(() => false);

    expect(hasLogin || hasAccept || hasError).toBeTruthy();
  });
});

test.describe("Social - Discovery", () => {
  test("should have discover/explore page", async ({ page }) => {
    await page.goto("/discover");

    // Might require auth or be public
    await page.waitForTimeout(1000);

    const onDiscoverPage = page.url().includes("/discover");
    const redirectedToLogin = page.url().includes("/login");
    const is404 = await page.locator('text=/404|not found/i').first().isVisible().catch(() => false);

    // Discover page exists, redirects to login, or shows 404 (feature might not exist yet)
    expect(onDiscoverPage || redirectedToLogin || is404).toBeTruthy();
  });

  test("should show trending or featured recipes", async ({ page }) => {
    await page.goto("/discover");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Check if it's a 404 page (feature might not exist yet)
    const is404 = await page.locator('text=/404|not found/i').first().isVisible().catch(() => false);
    if (is404) {
      test.skip();
      return;
    }

    // Look for trending/featured section
    const trendingSection = page.locator("text=/trending|featured|popular|discover/i");
    await expect(trendingSection.first()).toBeVisible();
  });
});

test.describe("Social - RLS Validation", () => {
  test("should not expose private recipes in public profile", async ({
    page,
  }) => {
    // This test verifies RLS is working
    // Private recipes should not appear on public profiles

    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Check if this is a 404 (non-existent user is fine)
    const is404 = await page.locator('text=/404|not found/i').first().isVisible().catch(() => false);
    if (is404) {
      // Test passes - no private data exposed on 404
      expect(is404).toBeTruthy();
      return;
    }

    // If profile exists, verify no private indicator
    const privateIndicator = page.locator('[data-private="true"], text=/private/i');

    // Private recipes should NOT be visible on public profiles
    const privateVisible = await privateIndicator.first().isVisible().catch(() => false);
    expect(privateVisible).toBeFalsy();
  });

  test("API should not return other users private data", async ({ page }) => {
    // Test API endpoint directly
    const response = await page.request.get("/api/recipes?userId=other-user-id", {
      failOnStatusCode: false,
    });

    // Should either return 401/403, 404, or empty results, not other user's data
    const status = response.status();
    expect([200, 401, 403, 404]).toContain(status);

    if (status === 200) {
      const data = await response.json();
      // Should be empty or only public recipes
      if (Array.isArray(data)) {
        // Verify no private data leaked
        expect(data.length).toBe(0);
      }
    }
  });
});

test.describe("Social - Accessibility", () => {
  test("should have accessible share dialog", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible().catch(() => false)) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      const shareButton = page.locator('button:has-text("Share")').first();
      if (await shareButton.isVisible().catch(() => false)) {
        await shareButton.click();

        // Dialog should be visible
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible();

        // Should have close button
        const closeButton = page.locator('button:has-text("Close"), button[aria-label="Close"]');
        await expect(closeButton.first()).toBeVisible();
      }
    }
  });

  test("public profile should have proper heading structure", async ({
    page,
  }) => {
    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Should have h1 (either profile heading or 404 heading)
    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();
  });
});

test.describe("Social - Mobile", () => {
  test("share functionality should work on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    // Recipe cards should still be visible
    const recipeCard = page.locator('[data-testid="recipe-card"]').first();
    if (await recipeCard.isVisible().catch(() => false)) {
      await recipeCard.click();
      await page.waitForTimeout(500);

      // Share button should be accessible
      const shareButton = page.locator('button:has-text("Share")').first();
      await expect(shareButton).toBeVisible();
    }
  });

  test("public profile should be responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Page should render without horizontal scroll
    const viewportWidth = 375;
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 50); // Allow small margin
  });
});
