import { test, expect } from "@playwright/test";

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
  await expect(page.locator(".book-card h2")).toHaveText("Mindset");
});

test("language switch toggles the UI and loads English detail routes", async ({
  page,
}) => {
  await page.click('.language-button:has-text("EN")');
  await expect(page.locator(".search-box input")).toHaveAttribute(
    "placeholder",
    /Search by title/i,
  );
  await expect(page.locator("#bookCountLabel")).toHaveText("books");
  await expect(page.locator(".language-button.active")).toHaveText("EN");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /quick, practical reading/i,
  );

  await page.locator(".book-card").first().click();
  await expect(page).toHaveURL(/#\/books\//);
  await expect(page.locator(".detail-page__header h1")).toBeVisible();
  await expect(page.locator(".markdown-body")).toContainText("Summary:");
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
  await expect(
    page.locator("article.book-card", { hasText: "Agile Testing" }),
  ).toHaveCount(1);
  await expect(page.locator("#book-count")).toHaveText("15");
});

test("empty searches show a friendly empty state", async ({ page }) => {
  await page.fill(".search-box input", "this-query-will-not-match-anything");
  await page.waitForTimeout(220);
  await expect(page.locator(".empty-state")).toContainText(
    /Nada encontrado|Nothing found/i,
  );
});

test("skip link moves keyboard focus to the main content", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.locator(".skip-link");
  await expect(skipLink).toBeVisible();
  await skipLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".main-content")).toBeFocused();
});

test("detail page renders content from a markdown file", async ({ page }) => {
  await page.goto("/#/livros/habitos-atomicos");
  await expect(page.locator(".markdown-body")).toContainText("Ficha Técnica");
});

test("ordered markdown lists render correctly in detail pages", async ({
  page,
}) => {
  await page.goto("/#/livros/habitos-atomicos");
  expect(await page.locator(".markdown-body ol").count()).toBeGreaterThan(0);
  await expect(page.locator(".markdown-body ol li").first()).toContainText(
    "A Ideia Central",
  );
});

test("related book navigation scrolls to top", async ({ page }) => {
  await page.locator(".book-card").first().click();
  const relatedLink = page.locator(".related-card").first();
  await expect(relatedLink).toBeVisible();
  await relatedLink.click();
  await expect(page.locator(".detail-page__header h1")).toBeVisible();
  // Allow a tiny offset due to rendering/scroll rounding in headless browsers
  // Allow a small offset due to sticky header height or rendering rounding in headless browsers
  await page.waitForFunction(() => window.scrollY < 100);
  expect(await page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test("category filter changes book count", async ({ page }) => {
  const firstCount = await page.locator("#book-count").textContent();
  await page
    .locator(".filter-chip")
    .filter({ hasText: "Produtividade" })
    .click();
  await expect(page.locator("#book-count")).not.toHaveText(firstCount);
});

test("catalog metadata is complete and each markdown file exists", async ({
  page,
}) => {
  const response = await page.request.get("/books/catalog.json");
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

test("catalog fallback manifest renders when books/catalog.json fails", async ({
  page,
}) => {
  await page.route("**/books/catalog.json", (route) => {
    route.fulfill({ status: 500, body: "Server error" });
  });

  await page.goto("/");
  await expect(page.locator(".book-card")).toHaveCount(15);
  await expect(page.locator("#book-count")).toHaveText("15");
  await expect(page.locator(".book-card h2").first()).toBeVisible();
});

test("catalog shows retry guidance when remote and embedded sources fail", async ({
  page,
}) => {
  await page.route("**/books/catalog.js", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.BOOKS_MANIFEST = [];",
    });
  });
  await page.route("**/books/catalog.json", (route) => {
    route.fulfill({ status: 500, body: "Server error" });
  });

  await page.goto("/");
  await expect(page.locator(".empty-state")).toContainText(
    /Could not load the catalog|Nao foi possivel carregar o catalogo/i,
  );
  await expect(page.locator("[data-retry-catalog]")).toBeVisible();
});

test("markdown headings expose anchors and scroll smoothly", async ({
  page,
}) => {
  await page.goto("/#/livros/habitos-atomicos");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(
    () => document.querySelectorAll(".markdown-body .markdown-anchor").length > 2,
  );
  await page.evaluate(() => {
    document.querySelectorAll(".markdown-body .markdown-anchor")[2].click();
  });
  await page.waitForFunction(() => window.scrollY > 200);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
});

test("detail page shows fallback guidance when markdown asset is missing", async ({
  page,
}) => {
  await page.route("**/books/habitos-atomicos.md", (route) => {
    route.fulfill({ status: 404, body: "Not found" });
  });
  await page.route("**/books/habitos-atomicos-en.md", (route) => {
    route.fulfill({ status: 404, body: "Not found" });
  });

  await page.goto("/#/livros/habitos-atomicos");
  await expect(page.locator(".asset-notice")).toContainText(
    /Arquivo completo indisponivel|Full source unavailable/i,
  );
  await expect(page.locator("[data-retry-detail]")).toBeVisible();
});
