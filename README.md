# 15min-read

## Principles

- Priorize simplicity, eficiência e legibilidade.
- Faça melhorias incrementais de baixo risco; evite recursos que aumentem complexidade ou fragilidade.

Static site that renders a book catalog from `books/catalog.json` and individual markdown files in `books/`.
Supports Portuguese (PT-BR) and English UI text with a built-in language switcher, including English markdown summaries for each book.

## Run locally

```bash
cd /path/to/15min-read.github.io.worktrees/agents-project-maintenance-and-testing
npm install
npm run serve
```

Then open:

```text
http://127.0.0.1:4173
```

To run the end-to-end tests:

```bash
npm test
```

## Notes

- The app must be served over HTTP. Opening `index.html` directly with `file://` will fail because browser fetch requests are blocked by CORS.
- The markdown content for book details is loaded from `books/<file>.md`.
- `books/catalog.js` is a fallback manifest only if `books/catalog.json` cannot be fetched.

## Deploy

This repository is designed to publish as a GitHub Pages site from the `main` branch.

After deployment, the site should be available at:

```bash
git push origin main
```

```text
https://15min-read.github.io
```

> > > > > > > a4d841b (v2.1: catalog restructure — remove stale book shells (7 removed), add 3 new books (flow, ética, em busca de sentido), consolidate book content, shrink app.js, update tests)
