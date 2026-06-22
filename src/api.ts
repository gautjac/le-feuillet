import type { Lang } from "./i18n";

// The Opus function streams NDJSON: keepalive heartbeats (bare newlines) hold
// the connection open during the long generation, then a final JSON line carries
// the payload or { error }. Read to end-of-stream and parse the last non-empty
// line. Plain-JSON errors are a single line and parse identically.
async function readResult<T>(res: Response): Promise<T> {
  const raw = await res.text();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1] ?? "";
  let parsed: (T & { error?: string }) | null = null;
  try {
    parsed = last ? (JSON.parse(last) as T & { error?: string }) : null;
  } catch {
    parsed = null;
  }
  if (!res.ok) throw new Error(parsed?.error || `Erreur ${res.status}`);
  if (!parsed) throw new Error("Réponse invalide du serveur.");
  if (parsed.error) throw new Error(parsed.error);
  return parsed;
}

async function post<T>(payload: unknown): Promise<T> {
  const res = await fetch("/api/polish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readResult<T>(res);
}

export interface TightenResult {
  paragraph: string;
}
export interface TitleResult {
  title: string;
}

/** Resserrer ce paragraphe — return a tightened version of the supplied text. */
export function tightenParagraph(
  text: string,
  lang: Lang,
): Promise<TightenResult> {
  return post<TightenResult>({ mode: "tighten", lang, text });
}

/** Suggest a title for the whole post, given its plain text. */
export function suggestTitle(text: string, lang: Lang): Promise<TitleResult> {
  return post<TitleResult>({ mode: "title", lang, text });
}
