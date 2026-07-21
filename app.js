import { debounce, normalizeLanguage } from "./lib/utils.js";
import { fetchCatalog, loadBookMarkdown } from "./lib/data.js";
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
    footerLineOne: "15 min read — resumos interpretativos para estudo e referência.",
    footerLineTwo:
      "Não substituem a leitura das obras originais. Todos os direitos das obras pertencem aos respectivos autores e editoras.",
    allCategory: "Todos",
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
    footerLineOne: "15 min read — interpretive summaries for study and quick reference.",
    footerLineTwo:
      "Not a substitute for the original works. All rights belong to the authors and publishers.",
    allCategory: "All",
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
  return normalizeLanguage(language, DEFAULT_LANGUAGE) === "en" ? "#/books/" : "#/livros/";
}

function getLanguageLabel(language) {
  return normalizeLanguage(language, DEFAULT_LANGUAGE) === "en" ? "EN" : "PT-BR";
}

function getBookTitle(book, language) {
  const normalizedLanguage = normalizeLanguage(language, DEFAULT_LANGUAGE);
  return normalizedLanguage === "en" ? book.title_en || book.title || book.slug : book.title || book.slug;
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
};

const booksGrid = document.getElementById("booksGrid");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");
const detailView = document.getElementById("detailView");
const mainContent = document.querySelector(".main-content");
const bookCount = document.getElementById("book-count");
const categoryCount = document.getElementById("category-count");
const languageSwitcher = document.getElementById("languageSwitcher");
const skipLink = document.getElementById("skipLink");
const metaDescription = document.querySelector('meta[name="description"]');

function applyDocumentMetadata(title = "") {
  const language = normalizeLanguage(state.language, DEFAULT_LANGUAGE);
  const locale = localeTexts[language];
  document.title = title ? `${title} · ${locale.pageTitle}` : locale.pageTitle;
  if (metaDescription) {
    metaDescription.content = title ? `${title} — ${locale.metaDescription}` : locale.metaDescription;
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
  const language = normalizeLanguage(state.language, DEFAULT_LANGUAGE);
  const locale = localeTexts[language];
  document.documentElement.lang = locale.htmlLang;
  if (skipLink) {
    skipLink.textContent = locale.skipLinkText;
  }
  document.getElementById("heroEyebrow").textContent = locale.heroEyebrow;
  document.getElementById("heroTitle").innerHTML = locale.heroTitle;
  document.getElementById("heroDescription").textContent = locale.heroDescription;
  if (searchInput) {
    searchInput.placeholder = locale.searchPlaceholder;
  }
  document.getElementById("bookCountLabel").textContent = locale.bookCountLabel;
  document.getElementById("categoryCountLabel").textContent = locale.categoryCountLabel;
  document.getElementById("readingTimeLabel").textContent = locale.readingTimeLabel;
  document.getElementById("footerLineOne").textContent = locale.footerLineOne;
  document.getElementById("footerLineTwo").textContent = locale.footerLineTwo;
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
    window.location.hash = `${getRoutePrefix(normalizedLanguage)}${currentRoute.slug}`;
    return;
  }

  routeFromHash();
}

function getCatalogLoadingMessage() {
  return state.language === "en" ? "Loading books…" : "Carregando livros…";
}

function getCatalogEmptyMessage() {
  return state.language === "en"
    ? "No books are available right now. Please try again later."
    : "Nenhum livro disponível no momento. Tente novamente mais tarde.";
}

function getDetailLoadingMessage() {
  return state.language === "en" ? "Loading summary…" : "Carregando resumo…";
}

function renderCatalogMessage(message, isError = false) {
  booksGrid.classList.remove("single-book");
  booksGrid.innerHTML = `<div class="empty-state${isError ? " empty-state--error" : ""}" role="status">${message}</div>`;
}

function renderCatalogView() {
  if (!books.length) {
    renderCatalogMessage(getCatalogEmptyMessage(), true);
    return;
  }

  renderFilters(books, state, filters);
  renderBooks(books, state, booksGrid, categoryColors, bookCount, categoryCount);
}

function showHome() {
  mainContent.hidden = false;
  detailView.hidden = true;
  detailView.innerHTML = "";
  renderCatalogView();
  applyDocumentMetadata();
  focusMainContent();
}

function resetScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

async function showDetail(slug) {
  const book = books.find((entry) => entry.slug === slug);
  if (!book) {
    window.location.hash = "";
    showHome();
    return;
  }

  mainContent.hidden = true;
  detailView.hidden = false;
  detailView.innerHTML = `<article class="detail-page"><div class="detail-page__loading" role="status">${getDetailLoadingMessage()}</div></article>`;
  await renderDetail(book, books, detailView, loadBookMarkdown, state.language);
  applyDocumentMetadata(getBookTitle(book, state.language));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  resetScroll();
  focusDetailHeading();
}

async function routeFromHash() {
  const route = parseRouteHash(window.location.hash);
  if (route.language && route.language !== state.language) {
    applyLanguage(route.language);
  }

  if (route.slug) {
    await showDetail(route.slug);
  } else {
    showHome();
  }
}

async function loadBooks() {
  renderCatalogMessage(getCatalogLoadingMessage());
  books = await fetchCatalog();
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

if (languageSwitcher) {
  languageSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-language]");
    if (!button) return;
    setLanguage(button.getAttribute("data-language"));
  });
}

if (booksGrid) {
  booksGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".book-card");
    if (!card) return;
    const slug = card.getAttribute("data-slug");
    window.location.hash = `${getRoutePrefix(state.language)}${slug}`;
  });
}

if (booksGrid) {
  booksGrid.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      const card = event.target.closest(".book-card");
      if (!card) return;
      event.preventDefault();
      card.click();
    }
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

    const anchor = event.target.closest("[data-anchor]");
    if (anchor) {
      event.preventDefault();
      const targetId = anchor.getAttribute("data-anchor");
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
  routeFromHash();
});

loadBooks().catch((error) => {
  console.error(error);
  showHome();
});
