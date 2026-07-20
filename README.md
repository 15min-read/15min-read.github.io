# 15min-read

Static site that renders a book catalog from `books/catalog.json` and individual markdown files in `books/`.

## Run locally

```bash
cd /home/kaiorampz/15min-read
npm install
npm run serve
```

Then open:

```text
http://127.0.0.1:4173
```

## Notes

- The app must be served over HTTP. Opening `index.html` directly with `file://` will fail because browser fetch requests are blocked by CORS.
- The markdown content for book details is loaded from `books/<file>.md`.
- `books/catalog.js` is a fallback manifest only if `books/catalog.json` cannot be fetched.
