import { debounce } from "./lib/utils.js";
import { fetchCatalog, loadBookMarkdown } from "./lib/data.js";
import { renderBooks, renderFilters, renderDetail } from "./lib/render.js";

// Constants
const ROUTE_DETAIL = "#/livros/";
const SEARCH_DEBOUNCE_MS = 100;
const DEFAULT_LOCALE = "pt-BR";
const LOCALE_STORAGE_KEY = "15minread-locale";

const LOCALE_TEXT = {
  "pt-BR": {
    htmlLang: "pt-BR",
    heroEyebrow: "Biblioteca · Edição contínua",
    heroTitle: "Grandes livros,<br><em>lidos em quinze minutos.</em>",
    heroText:
      "Uma coleção curada de resumos editoriais de não-ficção. Cada resumo destila o argumento central, os mecanismos por trás dele e como aplicá-lo — sem slogans e sem enrolação.",
    editorLabel: "Do editor",
    quoteText:
      "Durante uma vida humana média, é possível ler apenas alguns milhares de livros — cerca de 0,1% das maiores bibliotecas do mundo. O segredo é saber quais ler.",
    quoteAttribution: "— Carl Sagan",
    footerLine1:
      "15 min read — resumos interpretativos para estudo e referência.",
    footerLine2:
      "Não substituem a leitura das obras originais. Todos os direitos das obras pertencem aos respectivos autores e editoras.",
    searchPlaceholder: "Buscar por título, autor ou ideia…",
    booksLabel: "livros",
    minuteLabel: "min por leitura",
    minuteShort: "min",
    categoryLabel: "categorias",
    allCategory: "Todos",
    readSummary: "Ler resumo >",
    detailNavHome: "Biblioteca",
    detailSectionTitle: "Resumo interpretativo",
    detailWhyTitle: "Por que vale a pena ler",
    relatedHeadingPrefix: "Continue lendo em",
    unavailableTranslationNotice:
      "Resumo em inglês não disponível. Exibindo o original em português.",
    noResultsMessage:
      "Nada encontrado. Tente outra palavra-chave ou remova o filtro de categoria.",
    openSummaryLabel: "Abrir resumo:",
    reasonOne: "Entende o argumento central sem perder tempo.",
    reasonTwo: "Conecta ideias a hábitos, carreira e pensamento crítico.",
    reasonThree: "Serve como referência rápida para estudo e revisão.",
  },
  en: {
    htmlLang: "en",
    heroEyebrow: "Library · Continuous edition",
    heroTitle: "Great books,<br><em>read in fifteen minutes.</em>",
    heroText:
      "A curated collection of nonfiction summaries designed for quick, practical reading. Each summary distills the central argument, the mechanisms behind it, and how to apply it — without slogans or fluff.",
    editorLabel: "From the editor",
    quoteText:
      "Over an average human lifetime, it's possible to read only a few thousand books — about 0.1% of the world's largest libraries. The secret is knowing which ones to read.",
    quoteAttribution: "— Carl Sagan",
    footerLine1:
      "15 min read — interpretive summaries for study and reference.",
    footerLine2:
      "Not a substitute for reading the original works. All rights belong to the respective authors and publishers.",
    searchPlaceholder: "Search by title, author or idea…",
    booksLabel: "books",
    minuteLabel: "min read",
    minuteShort: "min",
    categoryLabel: "categories",
    allCategory: "All",
    readSummary: "Read summary >",
    detailNavHome: "Library",
    detailSectionTitle: "Interpretive summary",
    detailWhyTitle: "Why it's worth reading",
    relatedHeadingPrefix: "Keep reading in",
    unavailableTranslationNotice:
      "English summary unavailable. Showing the original Portuguese content.",
    noResultsMessage:
      "Nothing found. Try another keyword or clear the category filter.",
    openSummaryLabel: "Open summary:",
    reasonOne: "Understand the central argument without wasting time.",
    reasonTwo: "Connect ideas to habits, career, and critical thinking.",
    reasonThree: "Keep a quick reference for study and review.",
  },
};

let books = [];
const locale = getInitialLocale();
let currentLocale = locale;
let currentLocaleText = LOCALE_TEXT[locale];
const state = { query: "", category: currentLocaleText.allCategory };

const booksGrid = document.getElementById("booksGrid");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("searchInput");
const detailView = document.getElementById("detailView");
const mainContent = document.querySelector(".main-content");
const bookCount = document.getElementById("book-count");
const categoryCount = document.getElementById("category-count");
const localeSwitcher = document.getElementById("localeSwitcher");

const categoryColors = {
  Produtividade:
    "linear-gradient(90deg, #3b2f1f 0%, #8d6b3f 45%, #b68c4a 100%)",
  Psicologia:
    "linear-gradient(90deg, #312832 0%, #6d5a74 45%, #8b5e7a 100%)",
  Filosofia:
    "linear-gradient(90deg, #372f40 0%, #6b5d72 45%, #5a5867 100%)",
  Negócios:
    "linear-gradient(90deg, #1f3f39 0%, #3f6154 45%, #315c4c 100%)",
  Tecnologia:
    "linear-gradient(90deg, #24364a 0%, #3f5e7a 45%, #2a3a52 100%)",
};

function getInitialLocale() {
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale && LOCALE_TEXT[savedLocale]) {
    return savedLocale;
  }
  return DEFAULT_LOCALE;
}

function setLocale(newLocale) {
  if (!LOCALE_TEXT[newLocale]) return;
  currentLocale = newLocale;
  currentLocaleText = LOCALE_TEXT[newLocale];
  state.category = currentLocaleText.allCategory;
  document.documentElement.lang = currentLocaleText.htmlLang;
  localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  translateStaticUI();
  updateLocaleSwitcher();
  updateHomeView();
  if (window.location.hash.startsWith(ROUTE_DETAIL)) {
    routeFromHash();
  }
}

function updateLocaleSwitcher() {
  if (!localeSwitcher) return;
  localeSwitcher.querySelectorAll("[data-locale]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.getAttribute("data-locale") === currentLocale,
    );
  });
}

function translateStaticUI() {
  document.documentElement.lang = currentLocaleText.htmlLang;

  const textNodes = document.querySelectorAll("[data-i18n]");
  textNodes.forEach((element) => {
    const key = element.dataset.i18n;
    if (key && currentLocaleText[key]) {
      element.textContent = currentLocaleText[key];
    }
  });

  const htmlNodes = document.querySelectorAll("[data-i18n-html]");
  htmlNodes.forEach((element) => {
    const key = element.dataset.i18nHtml;
    if (key && currentLocaleText[key]) {
      element.innerHTML = currentLocaleText[key];
    }
  });

  const placeholderNodes = document.querySelectorAll("[data-i18n-placeholder]");
  placeholderNodes.forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (key && currentLocaleText[key]) {
      element.setAttribute("placeholder", currentLocaleText[key]);
    }
  });

  const bookCountLabel = document.getElementById("book-count-label");
  const minuteLabel = document.getElementById("minute-label");
  const categoryCountLabel = document.getElementById("category-count-label");
  if (bookCountLabel) bookCountLabel.textContent = currentLocaleText.booksLabel;
  if (minuteLabel) minuteLabel.textContent = currentLocaleText.minuteLabel;
  if (categoryCountLabel)
    categoryCountLabel.textContent = currentLocaleText.categoryLabel;
}

function getLocalizedValue(book, field) {
  const suffix = currentLocale === "en" ? "En" : "";
  return book[`${field}${suffix}`] || book[field] || "";
}

function getLocalizedCategory(book) {
  if (currentLocale === "en") {
    return book.categoryEn || book.category;
  }
  return book.category;
}

// Warn if app is loaded via file:// protocol
if (window.location.protocol === "file:") {
  const warning = document.createElement("div");
  warning.style.cssText =
    "position: fixed; top: 0; left: 0; right: 0; background: #f44336; color: white; padding: 16px; font-weight: 600; z-index: 9999; text-align: center;";
  warning.textContent =
    "⚠️ A aplicação não funciona com file://. Use um servidor local: npm run serve";
  document.body.insertBefore(warning, document.body.firstChild);
}

async function loadBooks() {
  try {
    books = await fetchCatalog();
    if (!books || books.length === 0) {
      throw new Error("No books loaded from catalog");
    }
    console.log(`Loaded ${books.length} books`);
    renderFilters(books, state, filters, currentLocale, currentLocaleText);
    renderBooks(
      books,
      state,
      booksGrid,
      categoryColors,
      bookCount,
      categoryCount,
      currentLocale,
      currentLocaleText,
    );

    if (window.location.hash.startsWith(ROUTE_DETAIL)) {
      const slug = window.location.hash.replace(ROUTE_DETAIL, "");
      await showDetail(slug);
    }
  } catch (error) {
    console.error("Failed to load books:", error);
    if (booksGrid) {
      booksGrid.innerHTML =
        '<div class="empty-state">Erro ao carregar o catálogo. Por favor, recarregue a página.</div>';
    }
  }
}

function showHome() {
  mainContent.hidden = false;
  detailView.hidden = true;
  detailView.innerHTML = "";
  updateHomeView();
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
  await renderDetail(
    book,
    books,
    detailView,
    loadBookMarkdown,
    currentLocale,
    currentLocaleText,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  resetScroll();
}

async function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash.startsWith("/livros/")) {
    const slug = hash.replace("/livros/", "");
    await showDetail(slug);
  } else {
    showHome();
  }
}

// Helper to navigate to book detail
function navigateTo(slug) {
  window.location.hash = slug ? `${ROUTE_DETAIL}${slug}` : "";
}

// Helper to update UI when home view is shown
function updateHomeView() {
  renderFilters(books, state, filters, currentLocale, currentLocaleText);
  renderBooks(
    books,
    state,
    booksGrid,
    categoryColors,
    bookCount,
    categoryCount,
    currentLocale,
    currentLocaleText,
  );
}

const handleSearchInput = debounce((value) => {
  state.query = String(value || "").trim();
  updateHomeView();
}, SEARCH_DEBOUNCE_MS);

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    handleSearchInput(event.target.value);
  });
}

if (filters) {
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    state.category = button.getAttribute("data-category");
    updateHomeView();
  });
}

if (localeSwitcher) {
  localeSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("[data-locale]");
    if (!button) return;
    const requestedLocale = button.getAttribute("data-locale");
    if (requestedLocale !== currentLocale) {
      setLocale(requestedLocale);
    }
  });
}

if (booksGrid) {
  booksGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".book-card");
    if (!card) return;
    const slug = card.getAttribute("data-slug");
    navigateTo(slug);
  });

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
      navigateTo();
      return;
    }

    const relatedLink = event.target.closest(".related-card");
    if (relatedLink) {
      event.preventDefault();
      window.location.hash = relatedLink.getAttribute("href");
      return;
    }
  });
}

window.addEventListener("hashchange", () => {
  routeFromHash();
});

// Initialize app
async function initializeApp() {
  // Validate required DOM elements
  const requiredElements = {
    booksGrid,
    filters,
    searchInput,
    detailView,
    mainContent,
    bookCount,
    categoryCount,
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, el]) => !el)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error("Missing required DOM elements:", missingElements.join(", "));
    return;
  }

  translateStaticUI();
  updateLocaleSwitcher();
  await loadBooks();
}

initializeApp().catch((error) => {
  console.error("Failed to initialize app", error);
  if (booksGrid) {
    booksGrid.innerHTML =
      '<div class="empty-state">Erro ao carregar catálogo. Tente recarregar a página.</div>';
  }
});
