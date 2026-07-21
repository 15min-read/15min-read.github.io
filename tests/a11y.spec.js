import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const accessibilityScan = await new AxeBuilder({ page }).analyze();
  if (accessibilityScan.violations.length) {
    console.log('Accessibility violations:', JSON.stringify(accessibilityScan.violations, null, 2));
  }
  // Fail the test if there are violations
  if (accessibilityScan.violations.length) {
    throw new Error(`A11y: ${accessibilityScan.violations.length} violations found`);
  }
});

test('detail page has no detectable accessibility violations', async ({ page }) => {
  await page.goto('http://localhost:4173/#/livros/habitos-atomicos', { waitUntil: 'networkidle' });
  // Wait for the detail content to be attached, then ensure it's visible for analysis
  // Wait until the app shows the detail view (the app toggles the hidden attribute)
  await page.waitForFunction(() => {
    const dv = document.getElementById('detailView');
    return dv && dv.hidden === false;
  }, { timeout: 15000 });
  await page.waitForSelector('.detail-page__header h1', { state: 'attached', timeout: 5000 });
  // Scope the analysis to the detail view to avoid page-level landmark false-positives
  const accessibilityScan = await new AxeBuilder({ page }).include('#detailView').analyze();
  if (accessibilityScan.violations.length) {
    console.log('Accessibility violations:', JSON.stringify(accessibilityScan.violations, null, 2));
  }
  if (accessibilityScan.violations.length) {
    throw new Error(`A11y: ${accessibilityScan.violations.length} violations found`);
  }
});
