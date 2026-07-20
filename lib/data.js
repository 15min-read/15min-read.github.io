import { renderMarkdown } from './markdown.js';
import { escapeHtml, normalizeCategory } from './utils.js';

const _markdownCache = new Map();

function normalizeBook(book) {
  return {
    ...book,
    category: normalizeCategory(book.category),
  };
}

async function tryFetchText(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Fetch failed: ${url} (${response.status})`);
  return response.text();
}

export async function fetchCatalog() {
  try {
    const response = await fetch('./books/catalog.json');
    if (!response.ok) throw new Error('catalog not found');
    const catalog = await response.json();
    return catalog.map(normalizeBook);
  } catch (err) {
    console.warn('Falling back to embedded catalog manifest', err);
    return (window.BOOKS_MANIFEST || []).map(normalizeBook);
  }
}

export async function loadBookMarkdown(book) {
  const cacheKey = book.slug || book.file || `${book.slug}.md`;
  if (_markdownCache.has(cacheKey)) return _markdownCache.get(cacheKey);

  const primaryFile = book.file || `${book.slug}.md`;
  const fallbackFile = book.file && book.file !== `${book.slug}.md` ? `${book.slug}.md` : null;
  const primaryUrl = new URL(`books/${primaryFile}`, window.location.href).href;

  try {
    const markdown = await tryFetchText(primaryUrl);
    const rendered = renderMarkdown(markdown);
    _markdownCache.set(cacheKey, rendered);
    return rendered;
  } catch (error) {
    if (fallbackFile) {
      try {
        const fallbackUrl = new URL(`books/${fallbackFile}`, window.location.href).href;
        const markdown = await tryFetchText(fallbackUrl);
        const rendered = renderMarkdown(markdown);
        _markdownCache.set(cacheKey, rendered);
        return rendered;
      } catch (fallbackError) {
        console.warn(`Resumo não encontrado para ${book.slug}`, primaryUrl, fallbackError);
      }
    } else {
      console.warn(`Resumo não encontrado para ${book.slug}`, primaryUrl, error);
    }

    if (book.summary) {
      const html = `<p>${escapeHtml(book.summary)}</p>`;
      _markdownCache.set(cacheKey, html);
      return html;
    }

    const unavailable = '<p>Resumo indisponível.</p>';
    _markdownCache.set(cacheKey, unavailable);
    return unavailable;
  }
}
