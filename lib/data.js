import { renderMarkdown } from "./markdown.js";
import { escapeHtml, normalizeCategory } from "./utils.js";

const _markdownCache = new Map();

function normalizeBook(book) {
  return {
    ...book,
    category: normalizeCategory(book.category),
  };
}

async function tryFetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Fetch failed: ${url} (${response.status})`);
  return response.text();
}

export async function fetchCatalog() {
  try {
    const response = await fetch("./books/catalog.json");
    if (!response.ok) throw new Error("catalog not found");
    const catalog = await response.json();
    if (!Array.isArray(catalog))
      throw new Error("catalog payload is not an array");
    return catalog.map(normalizeBook);
  } catch (err) {
    console.warn("Falling back to embedded catalog manifest", err);
    const manifest = Array.isArray(window.BOOKS_MANIFEST)
      ? window.BOOKS_MANIFEST
      : [];
    if (!manifest.length) {
      throw new Error("catalog unavailable");
    }
    return manifest.map(normalizeBook);
  }
}

export function invalidateBookMarkdown(slug, language = "pt") {
  _markdownCache.delete(`${slug}-${language}`);
}

export async function loadBookMarkdown(book, language = "pt", locale) {
  const cacheKey = `${book.slug}-${language}`;
  if (_markdownCache.has(cacheKey)) return _markdownCache.get(cacheKey);

  const fallbackEnglishFile = book.file
    ? book.file.replace(/\.md$/i, "-en.md")
    : `${book.slug}-en.md`;
  const primaryFiles =
    language === "en"
      ? [book.file_en, fallbackEnglishFile, book.file]
      : [book.file, book.file_en, `${book.slug}.md`];

  let markdown = null;
  for (const candidate of primaryFiles) {
    if (!candidate) continue;
    const url = new URL(`books/${candidate}`, window.location.href).href;
    try {
      markdown = await tryFetchText(url);
      break;
    } catch (error) {
      // Try next candidate.
    }
  }

  if (markdown !== null) {
    const rendered = {
      html: renderMarkdown(markdown),
      status: "ready",
    };
    _markdownCache.set(cacheKey, rendered);
    return rendered;
  }

  if (language === "en" && book.summary_en) {
    const fallback = {
      html: `<p>${escapeHtml(book.summary_en)}</p>`,
      status: "fallback",
    };
    _markdownCache.set(cacheKey, fallback);
    return fallback;
  }

  if (book.summary) {
    const fallback = {
      html: `<p>${escapeHtml(book.summary)}</p>`,
      status: "fallback",
    };
    _markdownCache.set(cacheKey, fallback);
    return fallback;
  }

  const unavailable = {
    html: `<p>${escapeHtml(locale.summaryUnavailable)}</p>`,
    status: "missing",
  };
  _markdownCache.set(cacheKey, unavailable);
  return unavailable;
}
