import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders the hero and primary navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Likiya", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /fast fashion/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Shop New Arrivals" })).toBeVisible();
  });

  test("has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });
});

test.describe("Navigation", () => {
  test("cart drawer opens from the header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /cart/i }).click();
    await expect(page.getByRole("heading", { name: /your bag/i })).toBeVisible();
  });

  test("search page accepts a query", async ({ page }) => {
    await page.goto("/search?q=coat");
    await expect(page.getByRole("heading", { name: /results for "coat"/i })).toBeVisible();
  });
});
