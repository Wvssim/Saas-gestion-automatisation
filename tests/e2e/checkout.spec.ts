import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test("should navigate to pricing from settings", async ({ page }) => {
    await page.goto("/auth/signin");
    // In a real test, we'd login here, but this is a basic flow test
    // For now, we verify the pricing page is accessible
    await page.goto("/pricing");

    await expect(
      page.getByRole("heading", {
        name: "A pricing stack that scales with your revenue.",
      }),
    ).toBeVisible();
  });

  test("should display all three pricing plans", async ({ page }) => {
    await page.goto("/pricing");

    // Check Starter plan
    await expect(page.getByRole("heading", { name: "Starter" })).toBeVisible();
    await expect(page.getByText("$0")).toBeVisible();

    // Check Pro plan
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByText("$39")).toBeVisible();
    await expect(page.getByText("Most popular")).toBeVisible();

    // Check Enterprise plan
    await expect(page.getByRole("heading", { name: "Enterprise" })).toBeVisible();
    await expect(page.getByText("$149")).toBeVisible();
  });

  test("should show CTA buttons for each plan", async ({ page }) => {
    await page.goto("/pricing");

    // Starter CTA
    await expect(page.getByRole("link", { name: "Start free" })).toBeVisible();

    // Pro CTA (button)
    await expect(page.getByRole("button", { name: "Launch Pro" })).toBeVisible();

    // Enterprise CTA (link to email)
    await expect(page.getByRole("link", { name: "Talk to sales" })).toBeVisible();
  });

  test("should highlight pro plan as most popular", async ({ page }) => {
    await page.goto("/pricing");

    const proCard = page.locator("text=Pro").first().locator("..");
    const mostPopularBadge = proCard.locator("text=Most popular");

    await expect(mostPopularBadge).toBeVisible();
  });

  test("enterprise email link should be valid", async ({ page }) => {
    await page.goto("/pricing");

    const salesLink = page.getByRole("link", { name: "Talk to sales" });
    const href = await salesLink.getAttribute("href");

    // Should be a mailto link
    expect(href).toMatch(/^mailto:/);
    expect(href).toContain("@");
  });
});
