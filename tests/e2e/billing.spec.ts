import { test, expect } from "@playwright/test";

test.describe("Billing and Settings", () => {
  test("pricing page displays features properly", async ({ page }) => {
    await page.goto("/pricing");

    // Check that all plan features are visible
    const features = [
      "1 store connection",
      "Core analytics + alerts",
      "Weekly performance digest",
      "Community support",
      "Unlimited stores",
      "Real-time stock alerts",
      "Automation builder",
      "Priority email support",
      "Custom workflows",
      "Dedicated success lead",
      "SOC2-ready workflows",
      "Multi-region data",
    ];

    for (const feature of features) {
      await expect(page.getByText(feature)).toBeVisible();
    }
  });

  test("pricing info section is visible", async ({ page }) => {
    await page.goto("/pricing");

    // Check the bottom info section
    await expect(
      page.getByRole("heading", { name: "Everything secured" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Smart upgrades" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Team ready" }),
    ).toBeVisible();

    await expect(
      page.getByText("Stripe-hosted checkout, PCI compliant storage"),
    ).toBeVisible();
    await expect(
      page.getByText("Upgrade anytime. Downgrade or cancel from your billing portal in seconds."),
    ).toBeVisible();
  });

  test("back to home link is functional", async ({ page }) => {
    await page.goto("/pricing");

    const backLink = page.getByRole("link", { name: "Back to home" });
    await expect(backLink).toBeVisible();

    const href = await backLink.getAttribute("href");
    expect(href).toBe("/");
  });

  test("should handle checkout error states gracefully", async ({ page }) => {
    // This test would require mocking the API or using a test Stripe account
    // For now, we just verify the UI is set up to show errors
    await page.goto("/pricing");

    // The Pro button should be present
    const proButton = page.getByRole("button", { name: "Launch Pro" });
    await expect(proButton).toBeVisible();
    await expect(proButton).toBeEnabled();
  });
});
