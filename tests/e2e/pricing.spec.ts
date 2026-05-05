import { test, expect } from "@playwright/test";

test("pricing page loads", async ({ page }) => {
  await page.goto("/pricing");

  await expect(
    page.getByRole("heading", {
      name: "A pricing stack that scales with your revenue.",
    }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: "Start free" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Launch Pro" })).toBeVisible();
});
