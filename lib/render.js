import { escapeHtml, normalizeLanguage } from "./utils.js";

const CATEGORY_LABELS = {
  pt: "Todos",
  en: "All",
};

function localizedField(book, field, language) {
  const key = `${field}_${language}`;
  return book[key] || book[field] || "";
}

function localizedTags(book, language) {
  return book[`tags_${language}`] || book.tags || [];
}

function routeBase(language) {
  return language === "en" ? "/books/" : "/livros/";
}

export function renderFilters(books, state, filtersEl, updateLayoutOffsets) {
  const language = normalizeLanguage(state.language, "pt");
  const availableCategories = [
    CATEGORY_LABELS[language],
    ...new Set(books.map((book) => localizedField(book, "category", language))),
  ];
  filtersEl.innerHTML = availableCategories
    .map((category) => {
      const active = category === state.category ? "active" : "";
      const pressed = category === state.category ? "true" : "false";
      return `<button class="filter-chip ${active}" data-category="${escapeHtml(category)}" aria-pressed="${pressed}">${escapeHtml(category)}</button>`;
    })
    .join("");

  if (typeof updateLayoutOffsets === "function") {
    updateLayoutOffsets();
  }
}

export function renderBooks(
  books,
  state,
  booksGrid,
  categoryColors,
  bookCountEl,
  categoryCountEl,
) {
  const language = normalizeLanguage(state.language, "pt");
  const query = state.query.trim().toLowerCase();
  const visibleBooks = books.filter((book) => {
    const title = localizedField(book, "title", language);
    const hook = localizedField(book, "hook", language);
    const summary = localizedField(book, "summary", language);
    const tags = localizedTags(book, language);
    const matchesQuery =
      !query ||
      [title, book.author, hook, summary, ...(tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const bookCategory = localizedField(book, "category", language);
    const matchesCategory =
      state.category === CATEGORY_LABELS[language] ||
      bookCategory === state.category;
    return matchesQuery && matchesCategory;
  });

  bookCountEl.textContent = String(visibleBooks.length);
  if (categoryCountEl) {
    categoryCountEl.textContent = String(
      new Set(books.map((book) => localizedField(book, "category", language)))
        .size,
    );
  }
  booksGrid.classList.toggle("single-book", visibleBooks.length === 1);

  if (!visibleBooks.length) {
    booksGrid.classList.remove("single-book");
    booksGrid.innerHTML = `<div class="empty-state">${
      state.language === "en"
        ? "Nothing found. Try another keyword or clear the category filter."
        : "Nada encontrado. Tente outra palavra-chave ou remova o filtro de categoria."
    }</div>`;
    return;
  }

  booksGrid.innerHTML = visibleBooks
    .map((book, index) => {
      const title = localizedField(book, "title", language);
      const hook = localizedField(book, "hook", language);
      const category = localizedField(book, "category", language);
      const color =
        categoryColors[book.category] || categoryColors[category] || "#6d4c41";
      const actionLabel = language === "en" ? "Read summary >" : "Ler resumo >";

      return `
        <article class="book-card" data-slug="${book.slug}">
          <a class="book-card__link" href="#${routeBase(language)}${book.slug}" aria-label="${escapeHtml(
            state.language === "en"
              ? `Open summary: ${title}`
              : `Abrir resumo: ${title}`,
          )}">
            <div class="light"></div>
            <div class="book-card__cover" style="background: radial-gradient(120% 80% at 0% 0%, ${color} 0%, transparent 55%), linear-gradient(180deg, oklch(0.22 0.02 60) 0%, oklch(0.14 0.02 60) 100%);">
              <div class="light"></div>
              <div class="meta">
                <span>№ ${String(index + 1).padStart(2, "0")}</span>
                <span>${book.year}</span>
              </div>
              <div class="book-card__headline">
                <p class="category">${escapeHtml(category)}</p>
                <h2>${escapeHtml(title)}</h2>
                <p class="author">${escapeHtml(book.author)}</p>
              </div>
              <div class="book-card__content">
                <p class="quote">"${escapeHtml(hook)}"</p>
                <div class="book-card__footer">
                  <span>${escapeHtml(actionLabel)}</span>
                </div>
              </div>
            </div>
          </a>
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
  language,
) {
  const activeLanguage = normalizeLanguage(language, "pt");
  const title = localizedField(book, "title", activeLanguage);
  const category = localizedField(book, "category", activeLanguage);
  const hook = localizedField(book, "hook", activeLanguage);
  const tags = localizedTags(book, activeLanguage);
  const related = (allBooks || [])
    .filter(
      (entry) => entry.slug !== book.slug && entry.category === book.category,
    )
    .slice(0, 3);
  const markdownHtml = await loadBookMarkdownFn(book, activeLanguage);
  const detailLabels = {
    home: activeLanguage === "en" ? "Library" : "Biblioteca",
    summaryHeading:
      activeLanguage === "en"
        ? "Interpretive Summary"
        : "Resumo interpretativo",
    sidebarHeading:
      activeLanguage === "en"
        ? "Why it is worth reading"
        : "Por que vale a pena ler",
    continueReading:
      activeLanguage === "en" ? "Keep reading in" : "Continue lendo em",
  };
  const routePrefix = routeBase(activeLanguage);
  const relatedMarkup = related.length
    ? `<section class="detail-page__related">
         <p class="eyebrow">${escapeHtml(detailLabels.continueReading)} ${escapeHtml(category)}</p>
         <div class="related-grid">
           ${related
             .map((entry) => {
               const relatedTitle = localizedField(
                 entry,
                 "title",
                 activeLanguage,
               );
               const relatedHook = localizedField(
                 entry,
                 "hook",
                 activeLanguage,
               );
               return `
                 <a class="related-card" href="#${routePrefix}${entry.slug}">
                   <h4>${escapeHtml(relatedTitle)}</h4>
                   <p>“${escapeHtml(relatedHook)}”</p>
                 </a>
               `;
             })
             .join("")}
         </div>
       </section>`
    : "";

  detailViewEl.innerHTML = `
    <article class="detail-page">
      <header class="detail-page__header">
        <nav class="detail-page__nav">
          <a href="#" data-home-link>&lt; ${escapeHtml(detailLabels.home)}</a>
          <span>/</span>
          <span>${escapeHtml(category)}</span>
        </nav>
        <p class="detail-page__meta">${escapeHtml(category)} · ${book.year}</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="detail-page__subtitle">${escapeHtml(book.author)}</p>
        <blockquote class="detail-page__hook">“${escapeHtml(hook)}”</blockquote>
        <div class="detail-page__tags">
          ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
        </div>
      </header>

      <section class="detail-page__body">
        <div class="detail-page__content">
          <h2>${escapeHtml(detailLabels.summaryHeading)}</h2>
          <div class="markdown-body">${markdownHtml}</div>
        </div>
        <aside class="detail-page__sidebar">
          <h3>${escapeHtml(detailLabels.sidebarHeading)}</h3>
          <ul>
            <li>${escapeHtml(
              activeLanguage === "en"
                ? "Understand the core argument without wasting time."
                : "Entende o argumento central sem perder tempo.",
            )}</li>
            <li>${escapeHtml(
              activeLanguage === "en"
                ? "Connect ideas to habits, career, and critical thinking."
                : "Conecta ideias a hábitos, carreira e pensamento crítico.",
            )}</li>
            <li>${escapeHtml(
              activeLanguage === "en"
                ? "Use it as a quick reference for study and review."
                : "Serve como referência rápida para estudo e revisão.",
            )}</li>
          </ul>
        </aside>
      </section>

      ${relatedMarkup}
    </article>
  `;
}
