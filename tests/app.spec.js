import { test, expect } from "@playwright/test";

const bookTitles = [
  "Hábitos Atômicos",
  "Deep Work",
  "Essencialismo",
  "O Poder do Hábito",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("home page loads with hero and filters", async ({ page }) => {
  await expect(page.locator(".hero-copy h1")).toHaveText(/Grandes livros/i);
  await expect(page.locator(".search-box input")).toHaveAttribute(
    "placeholder",
    /Buscar por título/i,
  );
  await expect(page.locator(".filter-chip")).toHaveCount(6);
  await expect(page.locator("#book-count")).not.toHaveText("0");
  await expect(page.locator("#category-count")).not.toHaveText("0");
});

test("search filters the book grid", async ({ page }) => {
  await page.fill(".search-box input", "Mindset");
  await page.waitForTimeout(100);
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(page.locator(".book-card h3")).toHaveText("Mindset");
});

test("clicking a book opens detail page and loads summary", async ({
  page,
}) => {
  await page.locator(".book-card").first().click();
  await expect(page.locator(".detail-page__header h1")).toBeVisible();
  await expect(page.locator(".markdown-body")).toContainText("Ficha Técnica");
  await expect(page.locator(".markdown-body")).toContainText("Título:");
});

test("catalog includes books from the markdown manifest", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("article.book-card", { hasText: "Agile Testing" })).toHaveCount(1);
  await expect(page.locator("#book-count")).toHaveText("15");
});

test("detail page renders content from a markdown file", async ({ page }) => {
  await page.goto("/#/livros/habitos-atomicos");
  await expect(page.locator(".markdown-body")).toContainText("Ficha Técnica");
});

test("related book navigation scrolls to top", async ({ page }) => {
  await page.locator(".book-card").first().click();
  const relatedLink = page.locator(".related-card").first();
  await expect(relatedLink).toBeVisible();
  await relatedLink.click();
  await expect(page.locator(".detail-page__header h1")).toBeVisible();
  await page.waitForFunction(() => window.scrollY === 0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("category filter changes book count", async ({ page }) => {
  const firstCount = await page.locator("#book-count").textContent();
  await page
    .locator(".filter-chip")
    .filter({ hasText: "Produtividade" })
    .click();
  await expect(page.locator("#book-count")).not.toHaveText(firstCount);
});

test("catalog metadata is complete and each markdown file exists", async ({ page }) => {
  const response = await page.request.get('/books/catalog.json');
  expect(response.ok()).toBeTruthy();
  const catalog = await response.json();

  expect(Array.isArray(catalog)).toBe(true);
  expect(catalog.length).toBeGreaterThan(0);

  for (const book of catalog) {
    expect(book).toMatchObject({
      slug: expect.any(String),
      file: expect.any(String),
      title: expect.any(String),
      author: expect.any(String),
      year: expect.any(Number),
      category: expect.any(String),
      minutes: expect.any(Number),
      hook: expect.any(String),
      summary: expect.any(String),
      tags: expect.any(Array),
    });

    expect(book.category).toMatch(/^[^\\\/,&]+$/);

    const fileResponse = await page.request.get(`/books/${book.file}`);
    expect(fileResponse.ok()).toBeTruthy();
  }
});

test("catalog fallback manifest renders when books/catalog.json fails", async ({ page }) => {
  await page.route('**/books/catalog.json', (route) => {
    route.fulfill({ status: 500, body: 'Server error' });
  });

  await page.goto('/');
  await expect(page.locator('.book-card')).toHaveCount(15);
  await expect(page.locator('#book-count')).toHaveText('15');
  await expect(page.locator('.book-card h3').first()).toBeVisible();
});

test('markdown headings expose anchors and scroll smoothly', async ({ page }) => {
  await page.goto('/#/livros/habitos-atomicos');
  const heading = page.locator('.markdown-body h2').first();
  await expect(heading).toBeVisible();
  const anchor = heading.locator('.markdown-anchor');
  await expect(anchor).toBeVisible();
  await anchor.click();
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeGreaterThanOrEqual(0);
});
