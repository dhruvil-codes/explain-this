import { expect, test } from "@playwright/test";

/**
 * Mock-provider landing → explain flow (PRD §6.2 copy, §8 flow).
 *
 * TODO(Phase 3): un-fixme these once the `shell` landing (input card, CTA)
 * and `read` result view land — GitHub issues: shell/landing, read/flow.
 * Selectors below pin the locked PRD copy so drift fails loudly at
 * integration time. LLM_PROVIDER=mock is set by playwright.config.ts.
 */

test.fixme("landing shows hero, input, and CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Don't reread it.",
  );
  await expect(
    page.getByPlaceholder(/Paste an AI answer here/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Explain this/i }),
  ).toBeVisible();
});

test.fixme("mock flow: paste text → Explain this → result tabs", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByPlaceholder(/Paste an AI answer here/)
    .fill(
      "Photosynthesis is the process by which green plants convert light energy into chemical energy stored as glucose.",
    );
  await page.getByRole("button", { name: /Explain this/i }).click();
  await expect(page).toHaveURL(/\/explain/);
  await expect(page.getByRole("tab", { name: /Read/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /See/i })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Play/i })).toBeVisible();
});
