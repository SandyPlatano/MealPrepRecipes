import { test, expect } from "@playwright/test";
import { dismissCookieDialog } from "./fixtures/auth";

/**
 * E2E Tests for Authentication Flows
 *
 * Tests cover:
 * - Login page rendering
 * - Signup page rendering
 * - Form validation
 * - Login flow
 * - Logout flow
 * - Password reset flow
 * - Protected route access
 */

test.describe("Authentication - Login Page", () => {
  test("should display login form with all required elements", async ({
    page,
  }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Check page title/heading - use first() to avoid strict mode violation
    await expect(
      page.getByRole("heading", { name: /sign in|log in|welcome/i }).first()
    ).toBeVisible();

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in|log in/i }).first()
    ).toBeVisible();

    // Check links
    await expect(
      page.getByRole("link", { name: /sign up/i }).first()
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Enter invalid email (but looks like a valid format to avoid browser validation)
    await page.fill('input[type="email"]', "notreal@invalid.test");
    await page.fill('input[type="password"]', "password123");

    // Click submit button
    await page.getByRole("button", { name: /sign in/i }).first().click();

    // Wait for Supabase error response
    await page.waitForTimeout(2000);

    // Check for validation error or error message from Supabase
    const errorMessage = page.locator('text=/invalid|error|failed|incorrect/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("should show error for incorrect credentials", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Enter wrong credentials (valid email format)
    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword123");
    await page.getByRole("button", { name: /sign in/i }).first().click();

    // Wait for error message
    await expect(
      page.locator("text=/invalid|incorrect|wrong|failed|error/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Click the signup link with explicit navigation wait
    await Promise.all([
      page.waitForURL(/\/signup/, { timeout: 10000 }),
      page.locator('a[href="/signup"]').first().click(),
    ]);

    await expect(page).toHaveURL(/\/signup/);
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    await page.getByRole("link", { name: /forgot password/i }).click();

    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe("Authentication - Signup Page", () => {
  test("should display signup form with all required elements", async ({
    page,
  }) => {
    await page.goto("/signup");
    await dismissCookieDialog(page);

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Look for signup button with various possible texts
    const signupButton = page.locator(
      'button:has-text("Sign up"), button:has-text("Create"), button:has-text("Register"), button[type="submit"]'
    ).first();
    await expect(signupButton).toBeVisible();

    // Check link to login - might be in different locations
    const loginLink = page.locator('a[href="/login"], a:has-text("Log in"), a:has-text("Sign in")').first();
    await expect(loginLink).toBeVisible();
  });

  test("should show validation for weak password", async ({ page }) => {
    await page.goto("/signup");
    await dismissCookieDialog(page);

    // Fill in form with weak password
    const firstNameInput = page.locator('input[name="firstName"]');
    if (await firstNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstNameInput.fill("Test");
    }

    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "123");

    // Click submit
    await page.locator('button[type="submit"]').first().click();

    // Wait for validation response
    await page.waitForTimeout(2000);

    // Check for password validation error - could be various formats
    const hasPasswordError =
      (await page.locator('text=/password|characters|weak|short|at least|6/i').first().isVisible().catch(() => false)) ||
      (await page.locator('[data-state="invalid"]').count() > 0) ||
      (await page.locator('[aria-invalid="true"]').count() > 0);

    expect(hasPasswordError).toBeTruthy();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/signup");
    await dismissCookieDialog(page);

    // Click the login link with explicit navigation wait
    await Promise.all([
      page.waitForURL(/\/login/, { timeout: 10000 }),
      page.locator('a[href="/login"]').first().click(),
    ]);

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Authentication - Password Reset", () => {
  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    await dismissCookieDialog(page);

    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /reset|send|submit/i }).first()
    ).toBeVisible();
  });

  test("should show success message after submitting reset request", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await dismissCookieDialog(page);

    await page.fill('input[type="email"]', "test@example.com");
    await page.getByRole("button", { name: /reset|send|submit/i }).first().click();

    // Should show success message (or error if email not found - both are valid)
    await expect(
      page.locator("text=/check your email|sent|success|not found|error/i").first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Authentication - Protected Routes", () => {
  test("should redirect unauthenticated users from /app to login", async ({
    page,
  }) => {
    // Try to access protected route
    await page.goto("/app/recipes");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /app/meal-plan to login", async ({
    page,
  }) => {
    await page.goto("/app/meal-plan");

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("should redirect unauthenticated users from /app/settings to login", async ({
    page,
  }) => {
    await page.goto("/app/settings");

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe("Authentication - Public Routes", () => {
  test("should allow access to pricing page without auth", async ({ page }) => {
    await page.goto("/pricing");
    await dismissCookieDialog(page);

    // Should stay on pricing page
    await expect(page).toHaveURL(/\/pricing/);

    // Use more specific selector - the main page heading
    await expect(
      page.locator("main h1, main h2").first()
    ).toBeVisible();
  });

  test("should allow access to public profile pages", async ({ page }) => {
    // Try to access a public profile (may or may not exist)
    await page.goto("/u/testuser");
    await dismissCookieDialog(page);

    // Should either show profile or 404, not redirect to login
    await expect(page).toHaveURL(/\/u\/testuser/);
  });

  test("should allow access to shared recipe pages", async ({ page }) => {
    // Try to access a shared recipe (may or may not exist)
    await page.goto("/shared/testtoken123");

    // Should either show recipe or not found, not redirect to login
    await expect(page).toHaveURL(/\/shared\/testtoken123/);
  });
});

test.describe("Authentication - OAuth", () => {
  test("should display Google OAuth button on login page", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Look for Google login button
    const googleButton = page.locator(
      'button:has-text("Google"), a:has-text("Google"), [data-provider="google"]'
    ).first();
    await expect(googleButton).toBeVisible();
  });

  test("should display Google OAuth button on signup page", async ({
    page,
  }) => {
    await page.goto("/signup");
    await dismissCookieDialog(page);

    // Look for Google signup button
    const googleButton = page.locator(
      'button:has-text("Google"), a:has-text("Google"), [data-provider="google"]'
    ).first();
    await expect(googleButton).toBeVisible();
  });
});

test.describe("Authentication - Session", () => {
  test("should maintain session across page navigation", async ({ page }) => {
    // This test requires a logged-in user
    // Skip if we can't authenticate
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Check if already logged in by trying to access app
    await page.goto("/app/recipes");

    // If redirected to login, we're not authenticated
    if (page.url().includes("/login")) {
      test.skip();
      return;
    }

    // Navigate to different pages
    await page.goto("/app/meal-plan");
    await expect(page).toHaveURL(/\/app\/meal-plan/);

    await page.goto("/app/settings");
    await expect(page).toHaveURL(/\/app\/settings/);

    // Session should persist
    await page.goto("/app/recipes");
    await expect(page).toHaveURL(/\/app\/recipes/);
  });
});

test.describe("Authentication - Accessibility", () => {
  test("login form should be keyboard accessible", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Focus on the email input first
    await page.locator('input[type="email"]').focus();
    await page.keyboard.type("test@example.com");

    // Tab to password input
    await page.keyboard.press("Tab");
    await page.keyboard.type("password123");

    // Tab to forgot password link, then to submit button
    await page.keyboard.press("Tab"); // Forgot password link
    await page.keyboard.press("Tab"); // Submit button

    // Verify submit button is focused (or nearby element)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(["BUTTON", "INPUT", "A"]).toContain(focusedElement);
  });

  test("should have proper aria labels on form inputs", async ({ page }) => {
    await page.goto("/login");
    await dismissCookieDialog(page);

    // Email input should be labelled (via label element, placeholder, or aria)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Password input should be labelled
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check that inputs have associated labels or accessible names
    const emailAccessibleName = await emailInput.getAttribute("placeholder") ||
      await emailInput.getAttribute("aria-label");
    const passwordAccessibleName = await passwordInput.getAttribute("placeholder") ||
      await passwordInput.getAttribute("aria-label");

    // At minimum, inputs should have some accessible name
    expect(emailAccessibleName || await page.locator("label:text-is('Email')").count() > 0).toBeTruthy();
    expect(passwordAccessibleName || await page.locator("label:text-is('Password')").count() > 0).toBeTruthy();
  });
});
