# Project Planning

## Active focus
- Keep the PT-BR/EN experience consistent across routing, UI labels, and detail rendering.
- Improve the maintainability of the app by reducing duplicated language handling and keeping shared render logic predictable.
- Keep local setup simple and documented so future changes are easier to review.

## Current priorities
1. Preserve the language-aware catalog and detail-page flow for both `/livros/` and `/books/` routes.
2. Keep markdown rendering robust for headings, lists, quotes, and separators.
3. Add a concise local development guide and keep the repo structure easy to navigate.
4. Apply small accessibility and interaction polish for keyboard users and focus states.

## NEXT IMPROVEMENTS
- Add more complete English content beyond metadata and structural summaries.
- Refine card and detail-page spacing/typography polish.
- Reduce duplication in the shared render helpers and remove legacy template artifacts that are no longer used.
- Add defensive loading states for missing catalog or markdown assets.
