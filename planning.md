# Project Planning

## Completed ✓

### Core Cleanup & Merge Conflict Resolution

- ✓ Resolved all merge conflicts in app.js, README.md, and documentation
- ✓ Removed unused src/, summaries.js, tests, playwright config from tracked files
- ✓ Updated .gitignore to exclude devDependencies and build artifacts
- ✓ Removed unused CSS classes (.site-header, .site-nav)

### Modular Architecture

- ✓ Created lib/markdown.js with heading anchor support and ID generation
- ✓ Updated app.js with clean modular imports from lib/
- ✓ Fixed index.html to load app.js as type="module" with #category-count element
- ✓ Created lib/utils.js with utility functions (debounce, rafThrottle, escapeHtml, normalizeCategory)
- ✓ Created lib/data.js for catalog and markdown loading with caching
- ✓ Created lib/render.js for UI rendering functions

### Features & UX Improvements

- ✓ Dynamic category count display on hero (#category-count)
- ✓ Verified catalog.json matches all 16 book markdown files
- ✓ Added markdown heading anchor CSS styling with hover effect
- ✓ Added file:// protocol detection warning (red banner at top)
- ✓ Improved error handling with user-friendly fallback messages
- ✓ Added keyboard navigation support (Tab, Enter) on book cards
- ✓ Added locale support structure for PT-BR and English with language toggle
- ✓ Implemented English UI and metadata support with PT-BR fallback for markdown content
- ✓ Added English markdown translations for all current book summaries

### Accessibility & Code Quality

- ✓ Added keyboard focus styles (focus-visible) for all interactive elements
- ✓ Added ARIA labels and aria-pressed attributes to buttons
- ✓ Proper HTML escaping throughout with escapeHtml() function
- ✓ Added code constants (ROUTE_DETAIL, SEARCH_DEBOUNCE_MS, DEFAULT_CATEGORY)
- ✓ Created navigateTo() helper for consistent routing
- ✓ Created updateHomeView() helper to eliminate code duplication
- ✓ Added JSDoc comments to all exported functions
- ✓ Added defensive input validation to renderFilters() and renderBooks()
- ✓ Added debug console logging for troubleshooting

## Code Improvements Applied (This Session)

### Error Handling Enhancements

- Added error boundary in loadBooks() with console logging
- Enhanced fetchCatalog() with array validation and debug logging
- Added defensive checks to renderFilters() and renderBooks()
- Improved error messages to help debugging

### Code Quality

- Removed unused updateLayoutOffsets() parameter from renderFilters()
- All files formatted with Prettier
- All JavaScript files pass syntax validation (node -c)

## Testing Status

- ✓ App module loading fixed with `type="module"` on `app.js`
- ✓ Fallback manifest rebuilt cleanly from `books/catalog.json`
- ✓ Markdown heading anchors now expose `.markdown-anchor` for tests
- ✓ Playwright suite passes: `11 passed`
- ✓ No merge conflict markers remain in the current worktree

## Test Checklist (Verified)

Run: `npx playwright test --reporter=list`

Results:

- [x] 11 total tests (10 app.spec.js + 1 catalog.full.spec.js)
- [x] All tests pass
- [x] App loads without errors
- [x] All 16 books display on home page
- [x] Search and category filters work correctly
- [x] Detail pages render with markdown content
- [x] Fallback catalog manifest renders when books/catalog.json fails
- [x] Keyboard navigation works
- [x] Focus indicators visible on interactive elements

## Next Improvements

### Performance & Caching

- Add service worker for offline support and faster repeat visits
- Implement IndexedDB for client-side catalog caching
- Optimize CSS with critical path extraction
- Lazy-load related books section on detail pages
- Add request deduplication in `loadBookMarkdown()`

### Features & Content

- Add "Reading history" using localStorage
- Implement "Mark as read" with visual indicator
- Add reading time estimate calculation per book
- Create book recommendation algorithm based on tags
- Add "Featured" or "Trending" books section

### UX Enhancements

- Add "Copy to clipboard" button for book summaries
- Implement smooth scroll-to-top on detail view transitions
- Add toast notifications for user feedback
- Create micro-animations for book card hover states
- Add night mode toggle with theme persistence
- Improve mobile responsiveness with touch-friendly interactions
- Redesign book cards using the premium matte cover template

### Book Card Redesign

- Analyze `/home/kaiorampz/15min-read.github.io/lib/bookcard-template.html`
- Replace the current book card layout with a premium matte book cover design
- Keep book metadata visible: category, title, author, hook, and reading time
- Use category-specific gradient backgrounds and subtle texture/lighting
- Preserve hover interactions, accessibility, and locale-aware text
- Begin by updating render markup and CSS for the new card shape
- Initial implementation started with new cover markup and category-aware gradients

### Analytics & Monitoring

- Add basic analytics with privacy (page views, searches, filtered categories)
- Implement error tracking/reporting for production
- Monitor performance metrics (FCP, LCP, CLS)

### Code Refactoring

- Extract category-color mapping to separate `colorScheme.js`
- Consolidate state management pattern
- Add TypeScript support for better type safety
- Create reusable event handler patterns
- Add constants for aria labels and error messages

### Testing & CI/CD

- Extend Playwright test suite with more edge cases
- Add visual regression testing
- Implement pre-commit hooks for linting
- Set up GitHub Actions for automated testing
- Add performance benchmarking tests

## Localization Strategy

- Keep `books/catalog.json` as the canonical metadata source
- Add per-language fields to each book entry for UI text and metadata
- Add locale-specific markdown files for each translated summary
- Add English markdown translations for all current book summaries
- Abstract all UI copy into a locale dictionary and render from that object
- Add a simple language toggle and persist the user choice
- Use a clean, site-themed language switcher button with matching colors, typography, and no emojis

This gives us:

- full EN/PT-BR support now, with the ability to expand to more languages later
- consistent slugs and URLs across locales
- maintainable content separation without a heavy build system
- a UX-friendly language switcher that fits the current visual identity
