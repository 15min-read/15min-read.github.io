import { escapeHtml } from "./utils.js";

/**
 * Generate HTML-safe heading ID from text.
 * Converts to lowercase, replaces spaces with hyphens, removes special chars.
 * @param {string} text - Heading text
 * @returns {string} Normalized ID (e.g., "my-heading")
 */
function makeHeadingId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format inline markdown syntax in text (bold, italic).
 * Converts **text** to <strong>, *text* to <em>
 * @param {string} text - Text with markdown formatting
 * @returns {string} HTML with inline tags
 */
function formatInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

/**
 * Convert markdown text to HTML.
 * Supports headings (with anchors), paragraphs, lists, and inline formatting.
 * @param {string} markdown - Raw markdown text
 * @returns {string} Rendered HTML
 */
export function renderMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push(`<p>${paragraphLines.join(" ")}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      blocks.push(
        `<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`,
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line: flush paragraph
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const id = makeHeadingId(headingText);
      const formatted = formatInline(headingText);
      blocks.push(
        `<h${level} id="${id}"><a class="markdown-anchor" href="#${id}" data-anchor="#${id}">${formatted}</a></h${level}>`,
      );
      continue;
    }

    // List item
    if (trimmed.startsWith("- ")) {
      const itemText = trimmed.slice(2);
      listItems.push(formatInline(itemText));
      continue;
    }

    // Paragraph
    paragraphLines.push(formatInline(trimmed));
  }

  flushParagraph();
  flushList();
  return blocks.join("");
}
