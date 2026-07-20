# Project Planning

## Current Status
- App is now driven by `books/catalog.json` and individual markdown files in `books/`.
- `app.js` loads the catalog and renders book cards dynamically.
- Detail page content is rendered from `.md` files via `loadBookMarkdown()`.
- `books/catalog.js` exists as a fallback manifest if `catalog.json` cannot be fetched.
- Playwright checks for markdown rendering and catalog items are passing in current focused tests.
- The app requires serving over HTTP; `file://` access is blocked by browser CORS.

## Bugs / Issues
- `file://` mode is unsupported. Must use `http://` local server for the app to work.
- There was a missing markdown file: `books/habitos-atomicos-otimizado.md` was missing and has now been added.
- If markdown fetch fails, the app currently falls back to `book.summary`.
- Some prior test/debug commands failed because Playwright modules were referenced incorrectly outside the app context.

## Immediate Fixes
- Keep the current HTTP server requirement documented clearly for testing and deployment.
- Remove old `file://` assumptions from docs and instructions.
- Ensure the fallback path logic in `loadBookMarkdown()` is robust and only used when needed.
- Add `README.md` with local server instructions.

## Future Improvements
- Add an explicit UI warning if the app is loaded via `file://`, telling users to use a local server.
- Improve the detail page layout so markdown content is more visually prominent.
- Add a deployment or `README.md` section with one command to run locally and one command to deploy.
- Add automated end-to-end tests for the full book catalog and at least one representative markdown file.
- Audit `books/catalog.json` metadata for consistency and completeness across all books.

## Next Actions
1. Confirm all book markdown files are present and correctly named in `books/catalog.json`.
2. Add a local server note to `README.md` or `index.html` if not present.
3. Optionally remove the fallback `book.summary` if we want strict markdown-only content.- Fix mobile filter bar sticky behavior.4. Create a small deploy checklist once the app is stable.
