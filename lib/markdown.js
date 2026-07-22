import { escapeHtml } from "./utils.js";

function makeHeadingId(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD") // separate characters and diacritics
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9\-]+/g, "")
    .replace(/^-+|-+$/g, "");
}

function formatInline(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || "")
    .replace(/\r/g, "")
    .split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];
  let listType = null;

  const flushParagraph = () => {
    if (paragraphLines.length) {
      blocks.push(`<p>${paragraphLines.join(" ")}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      const tag = listType === "ol" ? "ol" : "ul";
      blocks.push(
        `<${tag}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${tag}>`,
      );
      listItems = [];
      listType = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push("<hr />");
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push(
        `<blockquote>${formatInline(trimmed.replace(/^>\s?/, ""))}</blockquote>`,
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const id = makeHeadingId(headingText);
      blocks.push(
        `<h${level} id="${id}"><a class="markdown-anchor" href="#${id}" data-anchor="${id}">${formatInline(
          headingText,
        )}</a></h${level}>`,
      );
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== "ul") {
        flushParagraph();
        flushList();
        listType = "ul";
      }
      listItems.push(formatInline(unorderedMatch[1]));
      continue;
    }

    if (orderedMatch) {
      if (listType !== "ol") {
        flushParagraph();
        flushList();
        listType = "ol";
      }
      listItems.push(formatInline(orderedMatch[1]));
      continue;
    }

    paragraphLines.push(formatInline(trimmed));
  }

  flushParagraph();
  flushList();
  return blocks.join("");
}
