import { escapeHtml } from './utils.js';

export function renderFilters(books, state, filtersEl, updateLayoutOffsets) {
  const availableCategories = ['Todos', ...new Set(books.map((book) => book.category))];
  filtersEl.innerHTML = availableCategories
    .map((category) => {
      const active = category === state.category ? 'active' : '';
      const pressed = category === state.category ? 'true' : 'false';
      return `<button class="filter-chip ${active}" data-category="${escapeHtml(category)}" aria-pressed="${pressed}">${escapeHtml(category)}</button>`;
    })
    .join('');
  updateLayoutOffsets();
}

export function renderBooks(books, state, booksGrid, categoryColors, bookCountEl, categoryCountEl) {
  const query = state.query.trim().toLowerCase();
  const visibleBooks = books.filter((book) => {
    const matchesQuery = !query || [book.title, book.author, book.hook, book.summary, ...(book.tags || [])].join(' ').toLowerCase().includes(query);
    const matchesCategory = state.category === 'Todos' || book.category === state.category;
    return matchesQuery && matchesCategory;
  });

  bookCountEl.textContent = String(visibleBooks.length);
  categoryCountEl.textContent = String(new Set(books.map((book) => book.category)).size);
  booksGrid.classList.toggle('single-book', visibleBooks.length === 1);

  if (!visibleBooks.length) {
    booksGrid.classList.remove('single-book');
    booksGrid.innerHTML = '<div class="empty-state">Nada encontrado. Tente outra palavra-chave ou remova o filtro de categoria.</div>';
    return;
  }

  booksGrid.innerHTML = visibleBooks
    .map((book, index) => {
      const color = categoryColors[book.category];
      return `
        <article class="book-card" data-slug="${book.slug}" role="button" tabindex="0" aria-label="Abrir resumo: ${escapeHtml(book.title)}">
          <div class="book-card__cover" style="background: radial-gradient(120% 80% at 0% 0%, ${color} 0%, transparent 55%), linear-gradient(180deg, oklch(0.22 0.02 60) 0%, oklch(0.14 0.02 60) 100%);">
            <div class="meta">
              <span>№ ${String(index + 1).padStart(2, '0')}</span>
              <span>${book.year}</span>
            </div>
            <div>
              <p class="eyebrow">${escapeHtml(book.category)}</p>
              <h3>${escapeHtml(book.title)}</h3>
              <p class="author">${escapeHtml(book.author)}</p>
            </div>
          </div>
          <div class="book-card__body">
            <p>“${escapeHtml(book.hook)}”</p>
            <div class="book-card__footer">
              <span>${book.minutes} min</span>
              <span>Ler resumo ></span>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

export async function renderDetail(book, allBooks, detailViewEl, loadBookMarkdownFn) {
  const related = (allBooks || [])
    .filter((entry) => entry.slug !== book.slug && entry.category === book.category)
    .slice(0, 3);
  const markdownHtml = await loadBookMarkdownFn(book);

  detailViewEl.innerHTML = `
    <article class="detail-page">
      <header class="detail-page__header">
        <nav class="detail-page__nav">
          <a href="#" data-home-link>&lt; Biblioteca</a>
          <span>/</span>
          <span>${escapeHtml(book.category)}</span>
        </nav>
        <p class="detail-page__meta">${escapeHtml(book.category)} · ${book.year} · ${book.minutes} min de leitura</p>
        <h1>${escapeHtml(book.title)}</h1>
        <p class="detail-page__subtitle">${escapeHtml(book.author)}</p>
        <blockquote class="detail-page__hook">“${escapeHtml(book.hook)}”</blockquote>
        <div class="detail-page__tags">
          ${ (book.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('') }
        </div>
      </header>

      <section class="detail-page__body">
        <div class="detail-page__content">
          <h2>Resumo interpretativo</h2>
          <div class="markdown-body">${markdownHtml}</div>
        </div>
        <aside class="detail-page__sidebar">
          <h3>Por que vale a pena ler</h3>
          <ul>
            <li>Entende o argumento central sem perder tempo.</li>
            <li>Conecta ideias a hábitos, carreira e pensamento crítico.</li>
            <li>Serve como referência rápida para estudo e revisão.</li>
          </ul>
        </aside>
      </section>

      <section class="detail-page__related">
        <p class="eyebrow">Continue lendo em ${escapeHtml(book.category)}</p>
        <div class="related-grid">
          ${related.map((entry) => `
            <a class="related-card" href="#/livros/${entry.slug}">
              <h4>${escapeHtml(entry.title)}</h4>
              <p>“${escapeHtml(entry.hook)}”</p>
            </a>
          `).join('')}
        </div>
      </section>
    </article>
  `;
}
