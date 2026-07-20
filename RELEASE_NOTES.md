## Principles
- Priorize simplicity, eficiência e legibilidade.
- Faça melhorias incrementais de baixo risco; evite recursos que aumentem complexidade ou fragilidade.

# Release Notes (draft)

Release candidate: v1.0.0 (draft)

Highlights
- Curated catalog of 15 books with cleaned metadata
- Improved markdown fallback and placeholder behavior
- Mobile layout fixes for the filter bar
- File protocol guard to avoid `file://` fetch failures
- Favicons added for better browser compatibility
- End-to-end test suite using Playwright: 10/10 passing

Notes for release
- Run `npm test` before tagging and pushing.
- Verify GitHub Pages build if publishing to Pages.

Suggested GitHub release title: "v1.0.0 — curated catalog and stability fixes"

Suggested body: paste the "Highlights" section above and link to `CHANGELOG.md` for details.
