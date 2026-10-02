import { expect, test } from "@playwright/test";

test("landing renders hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "reread it",
  );
});
