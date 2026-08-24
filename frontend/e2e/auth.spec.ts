import { expect, test } from "@playwright/test";

test("an unauthenticated visitor is sent to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
});

test("bad credentials keep you on the login page with a reason", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  // Two role="alert" elements exist in dev: ours, and Next's dev-mode route
  // announcer (id="__next-route-announcer__"), which is always present and
  // always empty. Filter by text so the assertion targets ours regardless.
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("a seeded user can sign in, see the shell, and sign out", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("pw-12345678");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);

  // The shell: six cards, two panels, the actor, and the nav.
  await expect(page.locator("[data-placeholder]")).toHaveCount(8);
  await expect(page.getByText("Ada Admin")).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  // An unbuilt section must not be clickable.
  await expect(page.getByRole("link", { name: "Globe Clients" })).toHaveCount(0);

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);

  // And the session is really gone, not just navigated away from.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});
