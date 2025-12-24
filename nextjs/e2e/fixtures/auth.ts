import { test as base, Page, expect } from "@playwright/test";

/**
 * Test user credentials
 * In CI, these should come from environment variables
 */
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@example.com",
  password: process.env.TEST_USER_PASSWORD || "testpassword123",
};

/**
 * Helper to dismiss cookie dialog if present
 */
export async function dismissCookieDialog(page: Page): Promise<void> {
  try {
    const acceptButton = page.locator('dialog button:has-text("Accept")');
    const declineButton = page.locator('dialog button:has-text("Decline")');

    // Wait a short time for the dialog to appear
    await page.waitForTimeout(500);

    // Try to dismiss by clicking Accept or Decline
    if (await acceptButton.isVisible({ timeout: 1000 })) {
      await acceptButton.click();
    } else if (await declineButton.isVisible({ timeout: 500 })) {
      await declineButton.click();
    }
  } catch {
    // Cookie dialog not present - continue
  }
}

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Attempt to authenticate via test-auth endpoint (dev only)
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

    try {
      const response = await page.request.post(`${baseUrl}/api/test-auth`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        if (data.access_token) {
          // Set the auth cookie/token for subsequent requests
          await page.context().addCookies([
            {
              name: "sb-access-token",
              value: data.access_token,
              domain: "localhost",
              path: "/",
            },
          ]);
        }
      }
    } catch {
      // Test auth not available - tests will need to handle unauthenticated state
      console.log("Test auth endpoint not available");
    }

    await use(page);
  },
});

export { expect };

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";
  const response = await page.request.get(`${baseUrl}/api/test-auth`);

  if (response.ok()) {
    const data = await response.json();
    return data.authenticated === true;
  }

  return false;
}

/**
 * Helper to login via the UI
 */
export async function loginViaUI(
  page: Page,
  email: string = TEST_USER.email,
  password: string = TEST_USER.password
): Promise<void> {
  await page.goto("/login");

  // Wait for the login form
  await page.waitForSelector('input[type="email"]');

  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for redirect to app
  await page.waitForURL(/\/app/, { timeout: 10000 });
}

/**
 * Helper to signup via the UI
 */
export async function signupViaUI(
  page: Page,
  email: string,
  password: string,
  firstName: string = "Test",
  lastName: string = "User"
): Promise<void> {
  await page.goto("/signup");

  // Wait for the signup form
  await page.waitForSelector('input[type="email"]');

  // Fill in credentials
  await page.fill('input[name="firstName"]', firstName);
  await page.fill('input[name="lastName"]', lastName);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for success or error
  await page.waitForSelector('[role="alert"], [data-success="true"]', {
    timeout: 10000,
  });
}

/**
 * Helper to logout
 */
export async function logout(page: Page): Promise<void> {
  // Click user menu
  await page.click('[data-testid="user-menu"]');

  // Click logout
  await page.click('text=Sign out');

  // Wait for redirect to login
  await page.waitForURL(/\/login/);
}
