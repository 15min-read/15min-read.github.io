import { test, expect } from '@playwright/test';

test('live site - localized routes and detail pages', async ({ page }) => {
  // Portuguese catalog
  await page.goto('https://15min-read.github.io/#/livros', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.books-grid');
  await expect(page.locator('text=Hábitos Atômicos')).toBeVisible();

  // English catalog — ensure language preference is set in localStorage before loading
  await page.goto('https://15min-read.github.io/#/books', { waitUntil: 'domcontentloaded' });
  // Some deployments may default to PT; enforce English preference and reload
  await page.evaluate(() => localStorage.setItem('siteLanguage', 'en'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.books-grid');
  await expect(page.locator('text=Atomic Habits')).toBeVisible();

  // English detail page (reload with language preference)
  await page.goto('https://15min-read.github.io/#/books/habitos-atomicos', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('siteLanguage', 'en'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.detail-page__header h1');
  await expect(page.locator('.detail-page__header h1')).toContainText('Atomic Habits');
});
