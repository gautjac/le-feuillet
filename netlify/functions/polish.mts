import type { Context } from "@netlify/functions";
import { tighten, title, type Lang } from "./lib/editor.ts";
import { ndjsonStream, jsonError } from "./lib/stream.ts";

interface Body {
  mode: "tighten" | "title";
  lang: Lang;
  text: string;
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return jsonError("POST only", 405);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const { mode, lang, text } = body;
  const safeLang: Lang = lang === "en" ? "en" : "fr";

  if (mode === "tighten") {
    if (!text || text.trim().length < 8)
      return jsonError("Write a little more first.", 400);
    return ndjsonStream(() => tighten(text, safeLang));
  }
  if (mode === "title") {
    if (!text || text.trim().length < 8)
      return jsonError("Write a little more first.", 400);
    return ndjsonStream(() => title(text, safeLang));
  }
  return jsonError("Unknown mode", 400);
};
