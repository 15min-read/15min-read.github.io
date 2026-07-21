# 15 min read

A small static site that showcases curated nonfiction summaries as book-style cards and detail pages.

## Local development

The site is served as a static app, so use an HTTP server instead of opening `index.html` directly.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm run serve
   ```
3. Open the site at `http://localhost:4173`.

## Notes

- The app loads catalog metadata from `books/catalog.json` and falls back to the embedded manifest in `books/catalog.js` if needed.
- Book summaries are rendered from markdown files in `books/`.
- Playwright tests live under `tests/` and are not required for local browsing.

