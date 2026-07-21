import { renderMarkdown } from "./markdown.js";
import { escapeHtml, normalizeCategory } from "./utils.js";

const _markdownCache = new Map();

function normalizeBook(book) {
  return {
    ...book,
    category: normalizeCategory(book.category),
    categoryEn: normalizeCategory(book.categoryEn || book.category),
  };
}

async function tryFetchText(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Fetch failed: ${url} (${response.status})`);
  return response.text();
}

function getLocalizedBookFile(book, locale) {
  const localeSuffix = locale === "en" ? "En" : "";
  const localizedFile = book[`file${localeSuffix}`] || book.file;
  return localizedFile || `${book.slug}.md`;
}

export async function fetchCatalog() {
  try {
    const response = await fetch("./books/catalog.json");
    if (!response.ok) throw new Error("catalog not found");
    const catalog = await response.json();
    if (!Array.isArray(catalog)) throw new Error("catalog is not an array");
    console.log(
      `fetchCatalog: loaded ${catalog.length} books from catalog.json`,
    );
    return catalog.map(normalizeBook);
  } catch (err) {
    console.warn("Falling back to embedded catalog manifest", err);
    const fallback = (window.BOOKS_MANIFEST || []).map(normalizeBook);
    console.log(
      `fetchCatalog: loaded ${fallback.length} books from fallback manifest`,
    );
    if (fallback.length === 0) {
      console.error("No catalog available (primary and fallback failed)");
    }
    return fallback;
  }
}

export async function loadBookMarkdown(book, locale, localeText) {
  const cacheKey = `${book.slug}:${locale}`;
  if (_markdownCache.has(cacheKey)) return _markdownCache.get(cacheKey);

  const primaryFile = getLocalizedBookFile(book, locale);
  const fallbackFile = locale === "en" ? book.file || `${book.slug}.md` : null;
  const primaryUrl = new URL(`books/${primaryFile}`, window.location.href).href;

  try {
    const markdown = await tryFetchText(primaryUrl);
    const rendered = renderMarkdown(markdown);
    _markdownCache.set(cacheKey, rendered);
    return rendered;
  } catch (error) {
    if (fallbackFile) {
      try {
        const fallbackUrl = new URL(
          `books/${fallbackFile}`,
          window.location.href,
        ).href;
        const markdown = await tryFetchText(fallbackUrl);
        const rendered = renderMarkdown(markdown);
        const message = localeText?.unavailableTranslationNotice
          ? `<p class="translation-notice">${escapeHtml(localeText.unavailableTranslationNotice)}</p>`
          : "";
        const html = `${message}${rendered}`;
        _markdownCache.set(cacheKey, html);
        return html;
      } catch (fallbackError) {
        console.warn(
          `Resumo não encontrado para ${book.slug}`,
          primaryUrl,
          fallbackError,
        );
      }
    } else {
      console.warn(
        `Resumo não encontrado para ${book.slug}`,
        primaryUrl,
        error,
      );
    }

    if (book.summary) {
      const html = `<p>${escapeHtml(book.summary)}</p>`;
      _markdownCache.set(cacheKey, html);
      return html;
    }

    const unavailable = "<p>Resumo indisponível.</p>";
    _markdownCache.set(cacheKey, unavailable);
    return unavailable;
  }
}
