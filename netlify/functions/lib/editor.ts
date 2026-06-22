import Anthropic from "@anthropic-ai/sdk";

export type Lang = "fr" | "en";

const MODEL = "claude-opus-4-8";

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

function langName(l: Lang): string {
  return l === "fr" ? "French (Québécois, idiomatic)" : "English";
}

const VOICE = `You are the discreet editorial hand inside Le Feuillet, a calm writing tool used by a Québécois filmmaker and musician. You serve the writer's voice — you never impose your own. You are exact, unfussy, allergic to cliché and to filler. When you work in French you write idiomatic Québécois French, never translated English; in English, the same. You preserve the author's meaning, register and intent absolutely.`;

// ── Tighten a paragraph ───────────────────────────────────────────────────────
export interface Tightened {
  paragraph: string;
}

const TIGHTEN_TOOL: Anthropic.Tool = {
  name: "deliver_tightened",
  description: "Return one tightened version of the supplied paragraph.",
  input_schema: {
    type: "object",
    required: ["paragraph"],
    properties: {
      paragraph: {
        type: "string",
        description:
          "The same paragraph, tightened: same meaning, same voice and register, fewer words. No new ideas, no commentary, plain text only (no markdown).",
      },
    },
  },
};

export async function tighten(text: string, lang: Lang): Promise<Tightened> {
  const c = client();
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: VOICE,
    tools: [TIGHTEN_TOOL],
    tool_choice: { type: "tool", name: "deliver_tightened" },
    messages: [
      {
        role: "user",
        content: `Language: ${langName(lang)}.\n\nTighten this paragraph. Keep the author's exact meaning, voice and register; cut filler, redundancy and limp phrasing; do not add ideas or change the point. Return plain text only.\n\nPARAGRAPH:\n${text}`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No tool result");
  const out = block.input as Tightened;
  if (!out.paragraph) throw new Error("Empty result");
  return out;
}

// ── Suggest a title ───────────────────────────────────────────────────────────
export interface Titled {
  title: string;
}

const TITLE_TOOL: Anthropic.Tool = {
  name: "deliver_title",
  description: "Return one strong title for the supplied piece of writing.",
  input_schema: {
    type: "object",
    required: ["title"],
    properties: {
      title: {
        type: "string",
        description:
          "A single, strong, specific title for the piece. No quotation marks, no trailing punctuation, no subtitle. It should feel like the author's own.",
      },
    },
  },
};

export async function title(text: string, lang: Lang): Promise<Titled> {
  const c = client();
  const excerpt = text.slice(0, 6000);
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: VOICE,
    tools: [TITLE_TOOL],
    tool_choice: { type: "tool", name: "deliver_title" },
    messages: [
      {
        role: "user",
        content: `Language: ${langName(lang)}.\n\nPropose one strong, specific title for this piece — true to its content and the author's voice, never generic or clickbait. Return the title only.\n\nPIECE:\n${excerpt}`,
      },
    ],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("No tool result");
  const out = block.input as Titled;
  if (!out.title) throw new Error("Empty result");
  return out;
}
