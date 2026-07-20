<<<<<<< HEAD
15min-read
=======
## Principles
- Priorize simplicity, eficiência e legibilidade.
- Faça melhorias incrementais de baixo risco; evite recursos que aumentem complexidade ou fragilidade.

# 15min-read

Static site that renders a book catalog from `books/catalog.json` and individual markdown files in `books/`.

## Run locally

```bash
cd /home/kaiorampz/15min-read.github.io
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

Checklist:

- [x] Confirm local changes pass `npm test`
- [x] Commit updates to `main`
- [x] Push to GitHub: `git push origin main`
- [x] Verify the published site at `https://15min-read.github.io`

```bash
git push origin main
```

After deployment, the site should be available at:

```text
https://15min-read.github.io
```
>>>>>>> a4d841b (v2.1: catalog restructure — remove stale book shells (7 removed), add 3 new books (flow, ética, em busca de sentido), consolidate book content, shrink app.js, update tests)
