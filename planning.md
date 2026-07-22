# Project Planning

- Don't run tests, I will run it manually always.
- Keep feedback to user as minimum possible to save tokens.

## Active focus

- Keep the PT-BR/EN experience consistent across routing, UI labels, and detail rendering.
- Improve the maintainability of the app by reducing duplicated language handling and keeping shared render logic predictable.
- Keep local setup simple and documented so future changes are easier to review.

## Current priorities

1. Preserve the language-aware catalog and detail-page flow for both "/livros/" and "/books/" routes.
2. Keep markdown rendering robust for headings, lists, quotes, and separators.
3. Keep local setup and documentation simple and easy to follow.
4. Continue improving accessibility for keyboard and screen-reader users.
5. Keep regression coverage around localized metadata, empty states, routing, and focus behavior up to date.

## NEXT IMPROVEMENTS

- Add more complete English content beyond metadata and structural summaries.
- Refine card and detail-page spacing/typography polish.
- Continue reducing duplication in the shared render helpers where it becomes obvious.
- Add richer error handling and retry guidance for missing catalog or markdown assets.
