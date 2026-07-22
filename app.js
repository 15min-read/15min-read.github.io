import { debounce, normalizeLanguage } from "./lib/utils.js";
import {
  fetchCatalog,
  loadBookMarkdown,
  invalidateBookMarkdown,
} from "./lib/data.js";
import { renderFilters, renderBooks, renderDetail } from "./lib/render.js";

const SUPPORTED_LANGUAGES = ["pt", "en"];
const DEFAULT_LANGUAGE = "pt";

const localeTexts = {
  pt: {
    htmlLang: "pt-BR",
    pageTitle: "15 min read",
    metaDescription:
      "15 min read reúne resumos editoriais de não-ficção em leitura rápida e prática.",
    skipLinkText: "Pular para o conteúdo",
    heroEyebrow: "Biblioteca · Edição contínua",
    heroTitle: "Grandes livros, <em>lidos em quinze minutos.</em>",
    heroDescription:
      "Uma coleção curada de resumos editoriais de não-ficção. Cada resumo destila o argumento central, os mecanismos por trás dele e como aplicá-lo — sem slogans e sem enrolação.",
    searchPlaceholder: "Buscar por título, autor ou ideia…",
    bookCountLabel: "livros",
    categoryCountLabel: "categorias",
    readingTimeLabel: "min por leitura",
    footerLineOne:
      "15 min read — resumos interpretativos para estudo e referência.",
    footerLineTwo:
      "Não substituem a leitura das obras originais. Todos os direitos das obras pertencem aos respectivos autores e editoras.",
    allCategory: "Todos",
    quoteEyebrow: "Do editor",
    quoteText: "Durante uma vida humana média, é possível ler apenas alguns milhares de livros — cerca de 0,1% das maiores bibliotecas do mundo. O segredo é saber quais ler.",
    quoteAuthor: "— Carl Sagan",
    catalogLoading: "Carregando livros…",
    catalogEmpty: "Nenhum livro disponível no momento. Tente novamente mais tarde.",
    searchEmpty: "Nada encontrado. Tente outra palavra-chave ou remova o filtro de categoria.",
    readSummary: "Ler resumo >",
    openSummary: "Abrir resumo: ",
    detailLoading: "Carregando resumo…",
    detailHome: "Biblioteca",
    detailSummaryHeading: "Resumo interpretativo",
    detailSidebarHeading: "Por que vale a pena ler",
    detailContinueReading: "Continue lendo em",
    detailSidebarPoints: [
      "Entende o argumento central sem perder tempo.",
      "Conecta ideias a hábitos, carreira e pensamento crítico.",
      "Serve como referência rápida para estudo e revisão.",
    ],
    summaryUnavailable: "Resumo indisponível.",
    retryAction: "Tentar novamente",
    catalogErrorTitle: "Não foi possível carregar o catálogo agora.",
    catalogErrorHelp: "Verifique a conexão ou recarregue os arquivos e tente novamente.",
    detailFallbackTitle: "Arquivo completo indisponível.",
    detailFallbackHelp:
      "Exibindo a versão curta disponível enquanto o arquivo original não carrega.",
    detailMissingTitle: "Conteúdo indisponível.",
    detailMissingHelp:
      "Não foi possível localizar este resumo completo agora. Tente novamente em instantes.",
    statusReading: "Lendo",
    statusRead: "Lido",
    markAsRead: "Marcar como lido",
  },
  en: {
    htmlLang: "en",
    pageTitle: "15 min read",
    metaDescription:
      "15 min read gathers editorial nonfiction summaries for quick, practical reading.",
    skipLinkText: "Skip to content",
    heroEyebrow: "Library · Ongoing edition",
    heroTitle: "Great books, <em>read in fifteen minutes.</em>",
    heroDescription:
      "A curated collection of nonfiction summaries. Each summary distills the core argument, the mechanisms behind it, and how to apply them — no slogans, no fluff.",
    searchPlaceholder: "Search by title, author, or idea…",
    bookCountLabel: "books",
    categoryCountLabel: "categories",
    readingTimeLabel: "min reading",
    footerLineOne:
      "15 min read — interpretive summaries for study and quick reference.",
    footerLineTwo:
      "Not a substitute for the original works. All rights belong to the authors and publishers.",
    allCategory: "All",
    quoteEyebrow: "From the editor",
    quoteText: "In an average human lifetime, you can read only a few thousand books — about 0.1% of the world's greatest libraries. The secret is knowing which ones to read.",
    quoteAuthor: "— Carl Sagan",
    catalogLoading: "Loading books…",
    catalogEmpty: "No books are available right now. Please try again later.",
    searchEmpty: "Nothing found. Try another keyword or clear the category filter.",
    readSummary: "Read summary >",
    openSummary: "Open summary: ",
    detailLoading: "Loading summary…",
    detailHome: "Library",
    detailSummaryHeading: "Interpretive Summary",
    detailSidebarHeading: "Why it is worth reading",
    detailContinueReading: "Keep reading in",
    detailSidebarPoints: [
      "Understand the core argument without wasting time.",
      "Connect ideas to habits, career, and critical thinking.",
      "Use it as a quick reference for study and review.",
    ],
    summaryUnavailable: "Summary unavailable.",
    retryAction: "Try again",
    catalogErrorTitle: "Could not load the catalog right now.",
    catalogErrorHelp: "Check the connection or reload the assets, then try again.",
    detailFallbackTitle: "Full source unavailable.",
    detailFallbackHelp:
      "Showing the shorter available version while the original file cannot be loaded.",
    detailMissingTitle: "Content unavailable.",
    detailMissingHelp:
      "This full summary could not be located right now. Please try again shortly.",
    statusReading: "Reading",
    statusRead: "Read",
    markAsRead: "Mark as read",
  },
};

const categoryColors = {
  Produtividade: "oklch(0.72 0.14 75)",
  Psicologia: "oklch(0.55 0.14 25)",
  Filosofia: "oklch(0.45 0.08 250)",
  Negócios: "oklch(0.5 0.12 155)",
  Tecnologia: "oklch(0.35 0.05 260)",
  Productivity: "oklch(0.72 0.14 75)",
  Psychology: "oklch(0.55 0.14 25)",
  Philosophy: "oklch(0.45 0.08 250)",
  Business: "oklch(0.5 0.12 155)",
  Technology: "oklch(0.35 0.05 260)",
};

let books = [];

function getPreferredLanguage() {
  const stored = window.localStorage.getItem("siteLanguage");
  return normalizeLanguage(stored, DEFAULT_LANGUAGE);
}

function getRoutePrefix(language) {
  return normalizeLanguage(language, DEFAULT_LANGUAGE) === "en"
    ? "#/books/"
    : "#/livros/";
}

function getLanguageLabel(language) {
  return normalizeLanguage(language, DEFAULT_LANGUAGE) === "en"
    ? "EN"
    : "PT-BR";
}

function getBookTitle(book, language) {
  const normalizedLanguage = normalizeLanguage(language, DEFAULT_LANGUAGE);
  return normalizedLanguage === "en"
    ? book.title_en || book.title || book.slug
    : book.title || book.slug;
}

function parseRouteHash(hash) {
  const cleaned = hash.replace(/^#/, "");
  if (cleaned.startsWith("/livros/")) {
    return { slug: cleaned.replace("/livros/", ""), language: "pt" };
  }
  if (cleaned.startsWith("/books/")) {
    return { slug: cleaned.replace("/books/", ""), language: "en" };
  }
  return { slug: null, language: null };
}

const state = {
  query: "",
  category: localeTexts[getPreferredLanguage()].allCategory,
  language: getPreferredLanguage(),
  isChangingLanguage: false,
  catalogError: false,
};

const booksGrid = document.getElementById("booksGrid");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");
const detailView = document.getElementById("detailView");
const mainContent = document.querySelector(".main-content");
const heroSection = document.querySelector(".hero-section");
const filterBar = document.querySelector(".filter-bar");
const bookCount = document.getElementById("book-count");
const categoryCount = document.getElementById("category-count");
const languageSwitcher = document.getElementById("languageSwitcher");
const siteShell = document.querySelector(".site-shell");
const skipLink = document.getElementById("skipLink");
const metaDescription = document.querySelector('meta[name="description"]');

function getLocale(language = state.language) {
  const normalizedLanguage = normalizeLanguage(language, DEFAULT_LANGUAGE);
  return localeTexts[normalizedLanguage];
}

const PROGRESS_STORAGE_KEY = "bookProgress";

function getBookProgress() {
  try {
    const stored = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load book progress from storage:", error);
    return {};
  }
}

function setBookProgress(slug, status) {
  try {
    const progress = getBookProgress();
    progress[slug] = status;
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save book progress to storage:", error);
  }
}

function markBookAsReading(slug) {
  const progress = getBookProgress();
  if (!progress[slug] || progress[slug] !== "read") {
    setBookProgress(slug, "reading");
  }
}

function markBookAsRead(slug) {
  setBookProgress(slug, "read");
}

function applyDocumentMetadata(title = "") {
  const locale = getLocale();
  document.title = title ? `${title} · ${locale.pageTitle}` : locale.pageTitle;
  if (metaDescription) {
    metaDescription.content = title
      ? `${title} — ${locale.metaDescription}`
      : locale.metaDescription;
  }
}

function focusMainContent() {
  if (!mainContent) return;
  mainContent.setAttribute("tabindex", "-1");
  mainContent.focus();
}

function focusDetailHeading() {
  if (!detailView) return;
  detailView.setAttribute("tabindex", "-1");
  const heading = detailView.querySelector(".detail-page__header h1");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  } else {
    detailView.focus();
  }
}

function translateStaticText() {
  const locale = getLocale();
  document.documentElement.lang = locale.htmlLang;
  if (skipLink) {
    skipLink.textContent = locale.skipLinkText;
  }
  document.getElementById("heroEyebrow").textContent = locale.heroEyebrow;
  document.getElementById("heroTitle").innerHTML = locale.heroTitle;
  document.getElementById("heroDescription").textContent =
    locale.heroDescription;
  if (searchInput) {
    searchInput.placeholder = locale.searchPlaceholder;
  }
  document.getElementById("bookCountLabel").textContent = locale.bookCountLabel;
  document.getElementById("categoryCountLabel").textContent =
    locale.categoryCountLabel;
  document.getElementById("readingTimeLabel").textContent =
    locale.readingTimeLabel;
  document.getElementById("footerLineOne").textContent = locale.footerLineOne;
  document.getElementById("footerLineTwo").textContent = locale.footerLineTwo;
  document.getElementById("quoteEyebrow").textContent = locale.quoteEyebrow;
  document.getElementById("quoteText").textContent = `"${locale.quoteText}"`;
  document.getElementById("quoteAuthor").textContent = locale.quoteAuthor;
  applyDocumentMetadata();
}

function renderLanguageSwitcher() {
  if (!languageSwitcher) return;
  languageSwitcher.innerHTML = SUPPORTED_LANGUAGES.map((lang) => {
    const active = lang === state.language ? " active" : "";
    const pressed = lang === state.language ? "true" : "false";
    return `<button type="button" class="language-button${active}" data-language="${lang}" aria-pressed="${pressed}">${getLanguageLabel(lang)}</button>`;
  }).join("");
}

// Compact filter behavior: add/remove class when scrolling past hero
(function setupCompactFilterBehavior() {
  const compactThreshold = 240; // px scrolled before compact filter appears
  let lastState = false;

  function setCompact(enabled) {
    if (!siteShell) return;
    lastState = enabled;
    if (enabled) {
      siteShell.classList.add("compact-filter-visible");
      const fb = document.querySelector(".filter-bar");
      if (fb) fb.classList.add("filter-bar--compact");
    } else {
      siteShell.classList.remove("compact-filter-visible");
      const fb = document.querySelector(".filter-bar");
      if (fb) fb.classList.remove("filter-bar--compact");
    }
  }

  function onScroll() {
    const scrolled = window.scrollY || window.pageYOffset || 0;
    if (scrolled > compactThreshold && !lastState) setCompact(true);
    if (scrolled <= compactThreshold && lastState) setCompact(false);
  }

  window.addEventListener("scroll", debounce(onScroll, 80));
})();

function applyLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language, DEFAULT_LANGUAGE);
  state.language = normalizedLanguage;
  state.category = localeTexts[normalizedLanguage].allCategory;
  window.localStorage.setItem("siteLanguage", normalizedLanguage);
  translateStaticText();
  renderLanguageSwitcher();
  if (books.length) {
    renderCatalogView();
  }
}

function setLanguage(language) {
  const normalizedLanguage = normalizeLanguage(language, DEFAULT_LANGUAGE);
  if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) return;
  const currentRoute = parseRouteHash(window.location.hash);
  applyLanguage(normalizedLanguage);

  if (currentRoute.slug) {
    // Save current scroll position before updating hash
    const currentScrollY = window.scrollY;
    state.isChangingLanguage = true;
    window.location.hash = `${getRoutePrefix(normalizedLanguage)}${currentRoute.slug}`;
    // Restore scroll position after hash change
    window.scrollTo(0, currentScrollY);
    // Reset the flag after a short time
    setTimeout(() => {
      state.isChangingLanguage = false;
    }, 100);
    return;
  }

  // When on home, don't call routeFromHash (which triggers focus/scroll), just re-render
  renderCatalogView();
}

function getCatalogLoadingMessage() {
  return getLocale().catalogLoading;
}

function getCatalogEmptyMessage() {
  return getLocale().catalogEmpty;
}

function getDetailLoadingMessage() {
  return getLocale().detailLoading;
}

function renderCatalogMessage(message, options = {}) {
  const { isError = false, detail = "", showRetry = false } = options;
  booksGrid.classList.remove("single-book");
  booksGrid.innerHTML = `
    <div class="empty-state${isError ? " empty-state--error" : ""}" role="status">
      <p class="empty-state__title">${message}</p>
      ${detail ? `<p class="empty-state__detail">${detail}</p>` : ""}
      ${
        showRetry
          ? `<button type="button" class="inline-action-button" data-retry-catalog>${getLocale().retryAction}</button>`
          : ""
      }
    </div>
  `;
}

function renderCatalogView() {
  const locale = getLocale();
  if (state.catalogError) {
    renderCatalogMessage(locale.catalogErrorTitle, {
      isError: true,
      detail: locale.catalogErrorHelp,
      showRetry: true,
    });
    return;
  }

  if (!books.length) {
    renderCatalogMessage(getCatalogEmptyMessage(), { isError: true });
    return;
  }

  const progress = getBookProgress();
  renderFilters(books, state, filters, locale);
  renderBooks(
    books,
    state,
    booksGrid,
    categoryColors,
    bookCount,
    categoryCount,
    locale,
    progress,
  );
}

function showHome(shouldScrollAndFocus = true) {
  heroSection.hidden = false;
  filterBar.hidden = false;
  booksGrid.hidden = false;
  detailView.hidden = true;
  detailView.innerHTML = "";
  renderCatalogView();
  applyDocumentMetadata();
  if (shouldScrollAndFocus) {
    focusMainContent();
  }
}

function resetScroll() {
  const root = document.documentElement;
  const behavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = behavior;
}

async function showDetail(slug, shouldScrollAndFocus = true) {
  const book = books.find((entry) => entry.slug === slug);
  if (!book) {
    window.location.hash = "";
    showHome(shouldScrollAndFocus);
    return;
  }

  markBookAsReading(slug);
  
  const language = normalizeLanguage(state.language, DEFAULT_LANGUAGE);
  const locale = localeTexts[language];
  const progress = getBookProgress();

  
  heroSection.hidden = true;
  filterBar.hidden = true;
  booksGrid.hidden = true;
  detailView.hidden = false;
  detailView.innerHTML = `<article class="detail-page"><div class="detail-page__loading" role="status">${getDetailLoadingMessage()}</div></article>`;
  await renderDetail(book, books, detailView, loadBookMarkdown, state.language, locale, progress);
  applyDocumentMetadata(getBookTitle(book, state.language));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  if (shouldScrollAndFocus) {
    focusDetailHeading();
    resetScroll();
  }
}

async function routeFromHash(shouldScrollAndFocus = true) {
  const route = parseRouteHash(window.location.hash);
  if (route.language && route.language !== state.language) {
    applyLanguage(route.language);
  }
  if (route.slug) {
    await showDetail(route.slug, shouldScrollAndFocus);
  } else if (heroSection.hidden === false || booksGrid.hidden === false) {
    // Only show home if we're not already in detail view (to avoid closing detail when clicking internal anchors)
    showHome(shouldScrollAndFocus);
  }
}

async function loadBooks() {
  state.catalogError = false;
  renderCatalogMessage(getCatalogLoadingMessage());

  try {
    books = await fetchCatalog();
    state.catalogError = false;
  } catch (error) {
    console.error(error);
    books = [];
    state.catalogError = true;
  }

  translateStaticText();
  renderLanguageSwitcher();
  renderCatalogView();
  await routeFromHash();
}

if (searchInput) {
  const handleSearchInput = debounce(() => {
    renderCatalogView();
  }, 180);

  searchInput.addEventListener("input", (event) => {
    state.query = String(event.target.value || "").trim();
    handleSearchInput();
  });
}

if (filters) {
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.getAttribute("data-category");
    renderCatalogView();
  });
}

if (booksGrid) {
  booksGrid.addEventListener("click", (event) => {
    const retryButton = event.target.closest("[data-retry-catalog]");
    if (!retryButton) return;
    loadBooks().catch((error) => {
      console.error(error);
      state.catalogError = true;
      renderCatalogView();
    });
  });
}

if (languageSwitcher) {
  languageSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-language]");
    if (!button) return;
    setLanguage(button.getAttribute("data-language"));
  });
}



if (detailView) {
  detailView.addEventListener("click", (event) => {
    const homeLink = event.target.closest("[data-home-link]");
    if (homeLink) {
      event.preventDefault();
      window.location.hash = "";
      return;
    }

    const anchorData = event.target.closest("[data-anchor]");
    const anchorHref = event.target.closest('a[href^="#"]:not([data-home-link]):not(.related-card)');
    console.log("detailView click event", {
      target: event.target,
      anchorData,
      anchorHref,
    });
    if (anchorData || anchorHref) {
      event.preventDefault();
      event.stopPropagation();
      let targetId;
      if (anchorData) {
        targetId = anchorData.getAttribute("data-anchor");
      } else if (anchorHref) {
        targetId = anchorHref.getAttribute("href").slice(1);
      }
      
      if (targetId) {
        // Normalize target ID to match makeHeadingId: remove diacritics, normalize
        const normalizedTargetId = targetId
          .toLowerCase()
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[\s]+/g, "-")
          .replace(/[^a-z0-9\-]+/g, "")
          .replace(/^-+|-+$/g, "");
        const target = document.getElementById(normalizedTargetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      return;
    }

    const retryDetailButton = event.target.closest("[data-retry-detail]");
    if (retryDetailButton) {
      event.preventDefault();
      const route = parseRouteHash(window.location.hash);
      if (!route.slug) return;
      invalidateBookMarkdown(route.slug, state.language);
      showDetail(route.slug, false).catch((error) => {
        console.error(error);
      });
      return;
    }

    const markReadButton = event.target.closest("[data-mark-as-read]");
    if (markReadButton) {
      event.preventDefault();
      const slug = markReadButton.getAttribute("data-mark-as-read");
      markBookAsRead(slug);
      showDetail(slug, false).catch((error) => console.error(error));
      return;
    }

    const link = event.target.closest(".related-card");
    if (link) {
      event.preventDefault();
      window.location.hash = link.getAttribute("href");
    }
  });
}

window.addEventListener("hashchange", () => {
  routeFromHash(!state.isChangingLanguage);
});

loadBooks().catch((error) => {
  console.error(error);
  state.catalogError = true;
  showHome();
});
