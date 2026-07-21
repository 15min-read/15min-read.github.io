import { escapeHtml } from "./utils.js";

function getLocalizedValue(book, field, locale) {
  const suffix = locale === "en" ? "En" : "";
  return book[`${field}${suffix}`] || book[field] || "";
}

function getLocalizedCategory(book, locale) {
  return getLocalizedValue(book, "category", locale) || book.category;
}

export function renderFilters(books, state, filtersEl, locale, localeText) {
  // Validate inputs
  if (!books || !Array.isArray(books)) {
    console.error("renderFilters: books must be an array");
    return;
  }
  if (!filtersEl) {
    console.error("renderFilters: filtersEl required");
    return;
  }

  const availableCategories = [
    localeText.allCategory,
    ...new Set(books.map((book) => getLocalizedCategory(book, locale))),
  ];
  filtersEl.innerHTML = availableCategories
    .map((category) => {
      const active = category === state.category ? "active" : "";
      const pressed = category === state.category ? "true" : "false";
      return `<button class="filter-chip ${active}" data-category="${escapeHtml(category)}" aria-pressed="${pressed}">${escapeHtml(category)}</button>`;
    })
    .join("");
}

export function renderBooks(
  books,
  state,
  booksGrid,
  categoryColors,
  bookCountEl,
  categoryCountEl,
  locale,
  localeText,
) {
  // Validate inputs
  if (!books || !Array.isArray(books)) {
    console.error("renderBooks: books must be an array");
    return;
  }
  if (!booksGrid || !bookCountEl || !categoryCountEl) {
    console.error("renderBooks: missing required DOM elements");
    return;
  }

  const query = state.query.trim().toLowerCase();
  const visibleBooks = books.filter((book) => {
    const title = getLocalizedValue(book, "title", locale);
    const hook = getLocalizedValue(book, "hook", locale);
    const summary =
      getLocalizedValue(book, "summary", locale) || book.summary || "";
    const matchesQuery =
      !query ||
      [title, book.author, hook, summary, ...(book.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const bookCategory = getLocalizedCategory(book, locale);
    const matchesCategory =
      state.category === localeText.allCategory ||
      bookCategory === state.category;
    return matchesQuery && matchesCategory;
  });

  bookCountEl.textContent = String(visibleBooks.length);
  categoryCountEl.textContent = String(
    new Set(books.map((book) => getLocalizedCategory(book, locale))).size,
  );
  booksGrid.classList.toggle("single-book", visibleBooks.length === 1);

  if (!visibleBooks.length) {
    booksGrid.classList.remove("single-book");
    booksGrid.innerHTML = `<div class="empty-state">${escapeHtml(localeText.noResultsMessage)}</div>`;
    return;
  }

  booksGrid.innerHTML = visibleBooks
    .map((book, index) => {
      const color = categoryColors[book.category] ||
        "linear-gradient(90deg, #3a281d 0%, #5b4130 45%, #2a1d15 100%)";
      const category = getLocalizedCategory(book, locale);
      return `
        <article class="book-card" data-slug="${book.slug}" role="button" tabindex="0" aria-label="${escapeHtml(localeText.openSummaryLabel)} ${escapeHtml(getLocalizedValue(book, "title", locale))}">
          <div class="book-card__cover" style="--cover-gradient: ${color};">
            <div class="book-card__light"></div>
            <p class="book-card__category">${escapeHtml(category)}</p>
            <h3 class="book-card__title">${escapeHtml(getLocalizedValue(book, "title", locale))}</h3>
            <p class="book-card__author">${escapeHtml(book.author)}</p>
            <p class="book-card__quote">“${escapeHtml(getLocalizedValue(book, "hook", locale))}”</p>
            <div class="book-card__footer">
              <span>${book.minutes} ${escapeHtml(localeText.minuteShort)}</span>
              <span>${escapeHtml(localeText.readSummary)}</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

export async function renderDetail(
  book,
  allBooks,
  detailViewEl,
  loadBookMarkdownFn,
  locale,
  localeText,
) {
  const related = (allBooks || [])
    .filter(
      (entry) => entry.slug !== book.slug && entry.category === book.category,
    )
    .slice(0, 3);
  const markdownHtml = await loadBookMarkdownFn(book, locale, localeText);
  const category = getLocalizedCategory(book, locale);
  const title = getLocalizedValue(book, "title", locale);
  const hook = getLocalizedValue(book, "hook", locale);

  detailViewEl.innerHTML = `
    <article class="detail-page">
      <header class="detail-page__header">
       <nav class="detail-page__nav">
         <a href="#" data-home-link>&lt; ${escapeHtml(localeText.detailNavHome)}</a>
         <span>/</span>
         <span>${escapeHtml(category)}</span>
       </nav>
       <p class="detail-page__meta">${escapeHtml(category)} · ${book.year} · ${book.minutes} ${escapeHtml(localeText.minuteLabel)}</p>
       <h1>${escapeHtml(title)}</h1>
       <p class="detail-page__subtitle">${escapeHtml(book.author)}</p>
       <blockquote class="detail-page__hook">“${escapeHtml(hook)}”</blockquote>
       <div class="detail-page__tags">
         ${(book.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
       </div>
      </header>

      <section class="detail-page__body">
       <div class="detail-page__content">
         <h2>${escapeHtml(localeText.detailSectionTitle)}</h2>
         <div class="markdown-body">${markdownHtml}</div>
       </div>
       <aside class="detail-page__sidebar">
         <h3>${escapeHtml(localeText.detailWhyTitle)}</h3>
         <ul>
           <li>${escapeHtml(localeText.reasonOne)}</li>
           <li>${escapeHtml(localeText.reasonTwo)}</li>
           <li>${escapeHtml(localeText.reasonThree)}</li>
         </ul>
       </aside>
      </section>

      <section class="detail-page__related">
       <p class="eyebrow">${escapeHtml(localeText.relatedHeadingPrefix)} ${escapeHtml(category)}</p>
       <div class="related-grid">
         ${related
           .map(
             (entry) => `
           <a class="related-card" href="#/livros/${entry.slug}">
             <h4>${escapeHtml(getLocalizedValue(entry, "title", locale))}</h4>
             <p>“${escapeHtml(getLocalizedValue(entry, "hook", locale))}”</p>
           </a>
         `,
           )
           .join("")}
       </div>
      </section>
    </article>
  `;
}
