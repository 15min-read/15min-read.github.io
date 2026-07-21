import { test, expect } from "@playwright/test";

test("full catalog detail pages render", async ({ page }) => {
  const res = await page.request.get("/books/catalog.json");
  expect(res.ok()).toBeTruthy();
  const catalog = await res.json();
  expect(Array.isArray(catalog)).toBe(true);

  // Load home first so app initializes and the catalog is rendered
  await page.goto("/");

  await page.waitForFunction(
    () => document.querySelectorAll(".book-card").length > 0,
    { timeout: 15000 },
  );

  for (const book of catalog) {
    const card = page.locator(`article.book-card[data-slug="${book.slug}"]`);
    await card.scrollIntoViewIfNeeded();
    await card.click();
    await page.waitForFunction(() => location.hash.startsWith("#/livros/"), {
      timeout: 5000,
    });
    await page.waitForFunction(
      () =>
        document.getElementById("detailView") &&
        document.getElementById("detailView").innerHTML.length > 50,
      { timeout: 20000 },
    );
    await expect(page.locator(".detail-page__header h1")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator(".markdown-body")).toBeVisible({ timeout: 5000 });
    // go back to home
    const home = page.locator("[data-home-link]");
    await home.click();
    await page.waitForSelector("article.book-card");
  }
});
