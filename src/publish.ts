// ── Render a post to a fully self-contained, handsome standalone HTML page ─────
// No external requests at view time except the Google Fonts stylesheet (with a
// serif fallback). The post's body HTML (already containing base64 images from
// the editor) is inlined directly. All CSS is inlined in a <style> block.

import type { Post } from "./db";

export interface RenderResult {
  html: string;
  excerpt: string;
  words: number;
  readingMinutes: number;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

function frenchDate(ts: number, lang: "fr" | "en"): string {
  return new Date(ts).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// The reader's own typography — distinct from the editor, optimised for reading.
const READER_CSS = `
:root {
  --paper: #f7f1e6;
  --paper-card: #fcf8ef;
  --ink: #2a231b;
  --ink-soft: #5b4f40;
  --ink-faint: #8a7c67;
  --rim: #e6dabf;
  --madder: #9c3b2e;
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--paper);
  background-image:
    radial-gradient(circle at 18% 12%, rgba(156,59,46,0.035), transparent 42%),
    radial-gradient(circle at 86% 88%, rgba(94,107,79,0.04), transparent 46%);
  color: var(--ink);
  font-family: "Newsreader", Georgia, "Times New Roman", serif;
  font-size: 21px;
  line-height: 1.72;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.wrap { max-width: 44rem; margin: 0 auto; padding: 8vh 1.5rem 14vh; }
header.masthead { margin-bottom: 3.2rem; }
.kicker {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--madder);
  font-weight: 600;
  margin: 0 0 1.1rem;
}
h1.post-title {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  font-size: clamp(2.3rem, 6vw, 3.5rem);
  line-height: 1.06;
  letter-spacing: -0.015em;
  margin: 0 0 1.1rem;
  color: var(--ink);
}
.byline {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 0.84rem;
  color: var(--ink-faint);
  letter-spacing: 0.01em;
}
.byline .dot { margin: 0 0.55em; opacity: 0.5; }
.rule {
  height: 1px; border: 0;
  background: linear-gradient(90deg, var(--madder), transparent);
  margin: 2.4rem 0 0;
}
article { font-variant-numeric: oldstyle-nums; }
article > *:first-child { margin-top: 0; }
article p { margin: 0 0 1.35em; }
article h1, article h2, article h3 {
  font-family: "Fraunces", Georgia, serif;
  font-weight: 600;
  line-height: 1.18;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin: 2.2em 0 0.6em;
}
article h1 { font-size: 1.9em; }
article h2 { font-size: 1.5em; }
article h3 { font-size: 1.22em; }
article a { color: var(--madder); text-underline-offset: 3px; text-decoration-thickness: 1px; }
article a:hover { color: #7c2b22; }
article strong { font-weight: 600; }
article em { font-style: italic; }
article blockquote {
  margin: 1.8em 0;
  padding: 0.2em 0 0.2em 1.4em;
  border-left: 3px solid var(--madder);
  color: var(--ink-soft);
  font-style: italic;
  font-size: 1.06em;
}
article ul, article ol { margin: 0 0 1.35em; padding-left: 1.4em; }
article li { margin: 0.35em 0; padding-left: 0.2em; }
article li::marker { color: var(--madder); }
article hr {
  border: 0;
  text-align: center;
  margin: 2.8em 0;
}
article hr::before {
  content: "✦";
  color: var(--ink-faint);
  font-size: 0.9em;
  letter-spacing: 0.6em;
}
article img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 2em auto;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(42,35,27,0.08), 0 18px 40px rgba(42,35,27,0.14);
}
article pre {
  background: #2a231b;
  color: #f6efe1;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.82em;
  line-height: 1.6;
  padding: 1.1em 1.3em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.8em 0;
}
article code {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.86em;
  background: rgba(42,35,27,0.06);
  padding: 0.12em 0.36em;
  border-radius: 4px;
}
article pre code { background: none; padding: 0; }
footer.colophon {
  margin-top: 5rem;
  padding-top: 1.6rem;
  border-top: 1px solid var(--rim);
  font-family: "Inter", system-ui, sans-serif;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  color: var(--ink-faint);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
}
@media (max-width: 640px) {
  body { font-size: 19px; }
  .wrap { padding: 6vh 1.2rem 10vh; }
}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;

/**
 * Render a post into a standalone HTML document.
 * `bodyHtml` is the editor's `getHTML()` output (images already base64-embedded).
 * `plainText` is the editor's plain-text mirror, used for word/reading stats.
 */
export function renderPublished(
  post: Post,
  bodyHtml: string,
  plainText: string,
  lang: "fr" | "en",
): RenderResult {
  const words = countWords(plainText);
  const minutes = readingMinutes(words);
  const title = post.title.trim() || (lang === "fr" ? "Sans titre" : "Untitled");
  const date = frenchDate(post.updatedAt, lang);
  const excerpt = plainText.trim().replace(/\s+/g, " ").slice(0, 180);

  const readLabel =
    lang === "fr" ? `${minutes} min de lecture` : `${minutes} min read`;
  const wordsLabel = lang === "fr" ? `${words} mots` : `${words} words`;
  const colophon =
    lang === "fr"
      ? "Composé avec Le Feuillet"
      : "Set with Le Feuillet";

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${escapeHtml(excerpt)}">
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap">
<style>${READER_CSS}</style>
</head>
<body>
<main class="wrap">
<header class="masthead">
<p class="kicker">${lang === "fr" ? "Feuillet" : "A leaf"}</p>
<h1 class="post-title">${escapeHtml(title)}</h1>
<p class="byline">${escapeHtml(date)}<span class="dot">·</span>${escapeHtml(readLabel)}</p>
<hr class="rule">
</header>
<article>
${bodyHtml}
</article>
<footer class="colophon">
<span>${escapeHtml(colophon)}</span>
<span>${escapeHtml(wordsLabel)}</span>
</footer>
</main>
</body>
</html>`;

  return { html, excerpt, words, readingMinutes: minutes };
}

export function downloadHtml(filename: string, html: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/[^\w\dÀ-ÿ -]+/g, "").trim() || "feuillet";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
