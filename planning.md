# Project Planning

<<<<<<< HEAD
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
=======
## Principles
- Priorize simplicidade, eficiência e legibilidade.
- Faça melhorias incrementais de baixo risco; evite recursos que aumentem complexidade ou fragilidade.
- Mantenha os arquivos Markdown limpos: remova itens concluídos, notas de tarefa obsoletas e alterações já implementadas.

## Current Status
- App is driven by `books/catalog.json` and individual markdown summaries in `books/`.
- `app.js` renders the catalog and detail pages dynamically.
- `books/catalog.js` remains as a fallback manifest when `catalog.json` is unavailable.
- Each book belongs to a single category; category values are normalized and stable.
- Manifest files now match the active markdown inventory.
- Category count is computed dynamically and shown in the hero.
- Playwright tests cover markdown rendering, fallback loading, hash navigation, and catalog integrity.
- The app requires HTTP serving; `file://` access is intentionally blocked.

## Remaining Work
- Confirm `books/catalog.json` and `books/catalog.js` remain in sync when adding books.
- Commit changelog and update `README.md` with deployment notes.
- Push to `main` and verify GitHub Pages build.
- Smoke test the published URL to ensure assets and manifests load correctly.

## Recent Wins
- Book cards are keyboard-focusable and actionable via Enter/Space.
- Filters expose `aria-pressed` state and category selection is consistent.
- Single-category normalization was added for all book entries.
- Stale catalog entries were removed and only active markdown summaries remain.
- Playwright suite passes against the current 15-book catalog.

## Next Steps
1. Schedule a short release window and tag `v1.0.0` once the checklist is complete.
2. Add one or two broader E2E tests for the full catalog in CI.
3. Consider lightweight analytics or uptime checks after release.
>>>>>>> a4d841b (v2.1: catalog restructure — remove stale book shells (7 removed), add 3 new books (flow, ética, em busca de sentido), consolidate book content, shrink app.js, update tests)

## Next Actions
1. Confirm all book markdown files are present and correctly named in `books/catalog.json`.
2. Add a local server note to `README.md` or `index.html` if not present.
3. Optionally remove the fallback `book.summary` if we want strict markdown-only content.- Fix mobile filter bar sticky behavior.4. Create a small deploy checklist once the app is stable.
