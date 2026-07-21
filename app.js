import { debounce, rafThrottle } from './lib/utils.js';
import { fetchCatalog, loadBookMarkdown } from './lib/data.js';
import { renderFilters, renderBooks, renderDetail } from './lib/render.js';

let books = [];

async function loadBooks() {
  try {
    const response = await fetch('./books/catalog.json');
    if (!response.ok) {
      throw new Error('Catalogo não encontrado');
    }

    books = await response.json();
  } catch (error) {
    console.warn('Falling back to embedded catalog manifest', error);
    books = window.BOOKS_MANIFEST || [];
  }

  renderFilters();
  renderBooks();
  if (window.location.hash.startsWith('#/livros/')) {
    const slug = window.location.hash.replace('#/livros/', '');
    await showDetail(slug);
  }
}

const categoryColors = {
  Produtividade: 'oklch(0.72 0.14 75)',
  Psicologia: 'oklch(0.55 0.14 25)',
  Filosofia: 'oklch(0.45 0.08 250)',
  Negócios: 'oklch(0.5 0.12 155)',
  Tecnologia: 'oklch(0.35 0.05 260)'
};

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push(`<p>${paragraphLines.join(' ')}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join('')}</ul>`);
      listItems = [];
    }
  };

  const formatInline = (text) => text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push(`<h2>${formatInline(trimmed.replace(/^##\s+/, ''))}</h2>`);
      return;
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push(`<h3>${formatInline(trimmed.replace(/^###\s+/, ''))}</h3>`);
      return;
    }

    if (/^-\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(formatInline(trimmed.replace(/^-\s+/, '')));
      return;
    }

    paragraphLines.push(formatInline(trimmed));
  });

  flushParagraph();
  flushList();

  return blocks.join('');
}

async function loadBookMarkdown(book) {
  const primaryFile = book.file || `${book.slug}.md`;
  const fallbackFile = `${book.slug}.md`;
  const primaryUrl = new URL(`books/${primaryFile}`, window.location.href).href;
  const fallbackUrl = new URL(`books/${fallbackFile}`, window.location.href).href;

  const tryFetch = async (url) => {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Markdown não encontrado: ${url} (${response.status})`);
    }
    return response.text();
  };

  try {
    const markdown = await tryFetch(primaryUrl);
    return renderMarkdown(markdown);
  } catch (error) {
    if (primaryUrl !== fallbackUrl) {
      try {
        const markdown = await tryFetch(fallbackUrl);
        return renderMarkdown(markdown);
      } catch (fallbackError) {
        console.warn(`Resumo não encontrado para ${book.slug}`, fallbackError);
      }
    } else {
      console.warn(`Resumo não encontrado para ${book.slug}`, error);
    }

    return `<p>${book.summary}</p>`;
  }
}
// `debounce` and `rafThrottle` are imported from `lib/utils.js`.

// `loadBookMarkdown` is provided by `lib/data.js`.

const state = { query: '', category: 'Todos' };

const booksGrid = document.getElementById('booksGrid');
const filters = document.getElementById('filters');
const searchInput = document.getElementById('searchInput');
const detailView = document.getElementById('detailView');
const mainContent = document.querySelector('.main-content');
const bookCount = document.getElementById('book-count');

function renderFilters() {
  const availableCategories = ['Todos', ...new Set(books.map((book) => book.category))];
  filters.innerHTML = availableCategories
    .map((category) => {
      const active = category === state.category ? 'active' : '';
      return `<button class="filter-chip ${active}" data-category="${category}">${category}</button>`;
    })
    .join('');
}

function matchesBook(book) {
  const query = state.query.trim().toLowerCase();
  const matchesQuery = !query || [book.title, book.author, book.hook, book.summary, ...book.tags].join(' ').toLowerCase().includes(query);
  const matchesCategory = state.category === 'Todos' || book.category === state.category;
  return matchesQuery && matchesCategory;
}

function renderBooks() {
  const visibleBooks = books.filter(matchesBook);
  bookCount.textContent = String(visibleBooks.length);
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
        <article class="book-card" data-slug="${book.slug}">
          <div class="book-card__cover" style="background: radial-gradient(120% 80% at 0% 0%, ${color} 0%, transparent 55%), linear-gradient(180deg, oklch(0.22 0.02 60) 0%, oklch(0.14 0.02 60) 100%);">
            <div class="meta">
              <span>№ ${String(index + 1).padStart(2, '0')}</span>
              <span>${book.year}</span>
            </div>
            <div>
              <p class="eyebrow">${book.category}</p>
              <h3>${book.title}</h3>
              <p class="author">${book.author}</p>
            </div>
          </div>
          <div class="book-card__body">
            <p>“${book.hook}”</p>
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

async function renderDetail(book) {
  const related = books.filter((entry) => entry.slug !== book.slug && entry.category === book.category).slice(0, 3);
  const markdownHtml = await loadBookMarkdown(book);

  detailView.innerHTML = `
    <article class="detail-page">
      <header class="detail-page__header">
        <nav class="detail-page__nav">
          <a href="#" data-home-link>&lt; Biblioteca</a>
          <span>/</span>
          <span>${book.category}</span>
        </nav>
        <p class="detail-page__meta">${book.category} · ${book.year} · ${book.minutes} min de leitura</p>
        <h1>${book.title}</h1>
        <p class="detail-page__subtitle">${book.author}</p>
        <blockquote class="detail-page__hook">“${book.hook}”</blockquote>
        <div class="detail-page__tags">
          ${book.tags.map((tag) => `<span>${tag}</span>`).join('')}
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
        <p class="eyebrow">Continue lendo em ${book.category}</p>
        <div class="related-grid">
          ${related.map((entry) => `
            <a class="related-card" href="#/livros/${entry.slug}">
              <h4>${entry.title}</h4>
              <p>“${entry.hook}”</p>
            </a>
          `).join('')}
        </div>
      </section>
    </article>
  `;
}

function showHome() {
  mainContent.hidden = false;
  detailView.hidden = true;
  detailView.innerHTML = '';
  renderFilters(books, state, filters, updateLayoutOffsets);
  renderBooks(books, state, booksGrid, categoryColors, bookCount, categoryCount);
}

function resetScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

async function showDetail(slug) {
  const book = books.find((entry) => entry.slug === slug);
  if (!book) {
    window.location.hash = '';
    showHome();
    return;
  }

  mainContent.hidden = true;
  detailView.hidden = false;
  await renderDetail(book, books, detailView, loadBookMarkdown);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  resetScroll();
}

async function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/livros/')) {
    const slug = hash.replace('/livros/', '');
    await showDetail(slug);
  } else {
    showHome();
  }
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderBooks();
});
if (searchInput) {
  const handleSearchInput = debounce((value) => {
    state.query = String(value || '').trim();
    renderBooks(books, state, booksGrid, categoryColors, bookCount, categoryCount);
  }, 180);

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  state.category = button.getAttribute('data-category');
  renderFilters();
  renderBooks();
});

booksGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.book-card');
  if (!card) return;
  const slug = card.getAttribute('data-slug');
  window.location.hash = `#/livros/${slug}`;
});

detailView.addEventListener('click', (event) => {
  const link = event.target.closest('[data-home-link]');
  if (link) {
    event.preventDefault();
    window.location.hash = '';
  }
});

detailView.addEventListener('click', (event) => {
  const link = event.target.closest('.related-card');
  if (link) {
    event.preventDefault();
    window.location.hash = link.getAttribute('href');
  }
});

if (filters) {
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.getAttribute('data-category');
    renderFilters(books, state, filters, updateLayoutOffsets);
    renderBooks(books, state, booksGrid, categoryColors, bookCount, categoryCount);
  });
}

if (booksGrid) {
  booksGrid.addEventListener('click', (event) => {
    const card = event.target.closest('.book-card');
    if (!card) return;
    const slug = card.getAttribute('data-slug');
    window.location.hash = `#/livros/${slug}`;
  });
}

if (booksGrid) {
  booksGrid.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const card = event.target.closest('.book-card');
      if (!card) return;
      event.preventDefault();
      card.click();
    }
  });
}

if (detailView) {
  detailView.addEventListener('click', (event) => {
    const homeLink = event.target.closest('[data-home-link]');
    if (homeLink) {
      event.preventDefault();
      window.location.hash = '';
      return;
    }

    const anchor = event.target.closest('[data-anchor]');
    if (anchor) {
      event.preventDefault();
      const targetId = anchor.getAttribute('data-anchor');
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const link = event.target.closest('.related-card');
    if (link) {
      event.preventDefault();
      window.location.hash = link.getAttribute('href');
    }
  });
}

window.addEventListener('hashchange', () => {
  routeFromHash();
});

loadBooks().catch((error) => {
  console.error(error);
  showHome();
});
