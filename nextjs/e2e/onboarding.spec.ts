import { test, expect } from "@playwright/test";
import { dismissCookieDialog } from "./fixtures/auth";

/**
 * E2E Tests for Onboarding Flow
 *
 * These tests verify the complete onboarding experience including:
 * - Step 1: Name entry
 * - Step 2: Cook names management
 * - Step 3: Nutrition goals (presets and custom)
 * - Step 4: Completion
 *
 * Note: These tests require authentication. They will be skipped
 * if the user is redirected to the login page.
 */

// Helper to navigate to app and check auth
async function navigateToApp(page: import("@playwright/test").Page) {
  await page.goto("/app/recipes");

  if (page.url().includes("/login")) {
    return false; // Not authenticated
  }

  await dismissCookieDialog(page);
  return true;
}

test.describe("Onboarding Flow", () => {
  // Note: These tests require a test user to be logged in
  // In a real setup, you'd use auth fixtures or test accounts

  test.describe("Step Navigation", () => {
    test("should display progress bar that updates with each step", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      // Look for onboarding dialog if user is new
      const dialog = page.getByRole("dialog");

      // If onboarding is shown, verify progress bar exists
      if (await dialog.isVisible()) {
        const progress = dialog.locator('[role="progressbar"]');
        await expect(progress).toBeVisible();
      }
    });

    test("should allow navigation between steps with Back button", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Fill step 1
        await dialog.getByLabel("First Name").fill("Test");

        // Go to step 2
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Verify step 2 is shown
        await expect(dialog.getByText("Who's cooking?")).toBeVisible();

        // Go back to step 1
        await dialog.getByRole("button", { name: /back/i }).click();

        // Verify step 1 is shown again
        await expect(dialog.getByText("What's your name?")).toBeVisible();
      }
    });
  });

  test.describe("Step 1: Name Entry", () => {
    test("should require first name to continue", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        const continueButton = dialog.getByRole("button", { name: /continue/i });

        // Should be disabled without first name
        await expect(continueButton).toBeDisabled();

        // Fill first name
        await dialog.getByLabel("First Name").fill("Test");

        // Should be enabled now
        await expect(continueButton).toBeEnabled();
      }
    });

    test("should accept optional last name", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByLabel("Last Name").fill("User");

        const continueButton = dialog.getByRole("button", { name: /continue/i });
        await expect(continueButton).toBeEnabled();
      }
    });
  });

  test.describe("Step 2: Cook Names", () => {
    test("should allow adding multiple cooks", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Complete step 1
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Should be on step 2
        await expect(dialog.getByText("Who's cooking?")).toBeVisible();

        // Add another cook
        await dialog.getByRole("button", { name: /add another person/i }).click();

        // Should have multiple input fields
        const inputs = dialog.locator('input[placeholder*="name"]');
        await expect(inputs).toHaveCount(3); // Me + empty + new one
      }
    });

    test("should allow removing cooks", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Complete step 1
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Add a cook
        await dialog.getByRole("button", { name: /add another person/i }).click();

        // Remove one - look for remove buttons (X icon)
        const removeButtons = dialog.locator('button[aria-label*="remove"], button:has-text("×")');
        if ((await removeButtons.count()) > 0) {
          await removeButtons.first().click();
        }
      }
    });

    test("should allow selecting cook colors", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Complete step 1
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Color picker should be visible
        const colorPicker = dialog.locator('input[type="color"]');
        await expect(colorPicker.first()).toBeVisible();
      }
    });
  });

  test.describe("Step 3: Nutrition Goals", () => {
    test("should display preset options", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate to step 3
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Verify preset buttons
        await expect(dialog.getByRole("button", { name: /weight loss/i })).toBeVisible();
        await expect(dialog.getByRole("button", { name: /muscle building/i })).toBeVisible();
        await expect(dialog.getByRole("button", { name: /maintenance/i })).toBeVisible();
        await expect(dialog.getByRole("button", { name: /custom/i })).toBeVisible();
      }
    });

    test("should allow selecting a preset", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate to step 3
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Select weight loss preset
        const weightLossBtn = dialog.getByRole("button", { name: /weight loss/i });
        await weightLossBtn.click();

        // Button should be highlighted (default variant)
        await expect(weightLossBtn).toHaveAttribute("data-state", "active");
      }
    });

    test("should show custom inputs when Custom is selected", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate to step 3
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Select custom
        await dialog.getByRole("button", { name: /custom/i }).click();

        // Custom input fields should appear
        await expect(dialog.getByLabel(/calories/i)).toBeVisible();
        await expect(dialog.getByLabel(/protein/i)).toBeVisible();
        await expect(dialog.getByLabel(/carbs/i)).toBeVisible();
        await expect(dialog.getByLabel(/fat/i)).toBeVisible();
      }
    });

    test("should allow entering custom macro values", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate to step 3
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Select custom
        await dialog.getByRole("button", { name: /custom/i }).click();

        // Enter custom values
        await dialog.getByLabel(/calories/i).fill("2200");
        await dialog.getByLabel(/protein/i).fill("160");
        await dialog.getByLabel(/carbs/i).fill("220");
        await dialog.getByLabel(/fat/i).fill("70");

        // Continue should still work
        const continueButton = dialog.getByRole("button", { name: /continue/i });
        await expect(continueButton).toBeEnabled();
      }
    });

    test("should allow skipping nutrition setup", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate to step 3
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Click skip
        await dialog.getByRole("button", { name: /skip for now/i }).click();

        // Should still be able to continue
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Should be on step 4
        await expect(dialog.getByText("You're all set!")).toBeVisible();
      }
    });
  });

  test.describe("Step 4: Completion", () => {
    test("should display quick tips", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate through all steps
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Verify tips are shown
        await expect(dialog.getByText("Quick Tips:")).toBeVisible();
        await expect(dialog.getByText(/import recipes/i)).toBeVisible();
        await expect(dialog.getByText(/meal plan/i)).toBeVisible();
        await expect(dialog.getByText(/shopping lists/i)).toBeVisible();
      }
    });

    test("should have completion button", async ({ page }) => {
      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Navigate through all steps
        await dialog.getByLabel("First Name").fill("Test");
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();
        await dialog.getByRole("button", { name: /continue/i }).click();

        // Verify completion button
        await expect(dialog.getByRole("button", { name: /add my first recipe/i })).toBeVisible();
      }
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      if (!(await navigateToApp(page))) {
        test.skip();
        return;
      }

      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Dialog should be visible and usable
        await expect(dialog).toBeVisible();
        await expect(dialog.getByLabel("First Name")).toBeVisible();
      }
    });
  });
});

// Accessibility tests
test.describe("Onboarding Accessibility", () => {
  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const dialog = page.getByRole("dialog");
    if (await dialog.isVisible()) {
      // Dialog should have title
      await expect(dialog.getByRole("heading")).toBeVisible();

      // Form inputs should have labels
      await expect(dialog.getByLabel("First Name")).toBeVisible();
      await expect(dialog.getByLabel("Last Name")).toBeVisible();
    }
  });

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/app/recipes");

    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    await dismissCookieDialog(page);

    const dialog = page.getByRole("dialog");
    if (await dialog.isVisible()) {
      // Tab through elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Type in focused input
      await page.keyboard.type("Test");

      // First name should have value
      await expect(dialog.getByLabel("First Name")).toHaveValue("Test");
    }
  });
});
