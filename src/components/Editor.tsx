import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, BubbleMenu, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useI18n } from "../i18n";
import { countWords } from "../editor";
import { insertImageFromFile, pickAndInsertImage } from "../editor";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrike,
  IconLink,
  IconH1,
  IconH2,
  IconH3,
  IconQuote,
  IconList,
  IconOrdered,
  IconCode,
  IconRule,
  IconImage,
} from "./icons";

export interface EditorHandle {
  editor: Editor | null;
}

interface Props {
  docJSON: unknown;
  // Called (debounced by parent) whenever content changes.
  onChange: (doc: unknown, text: string, words: number) => void;
  onReady: (editor: Editor) => void;
}

interface SlashItem {
  key: string;
  labelKey: string;
  icon: (p: { className?: string }) => React.ReactNode;
  run: (editor: Editor) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  { key: "h1", labelKey: "slash.heading1", icon: IconH1, run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { key: "h2", labelKey: "slash.heading2", icon: IconH2, run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { key: "h3", labelKey: "slash.heading3", icon: IconH3, run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { key: "ul", labelKey: "slash.bullet", icon: IconList, run: (e) => e.chain().focus().toggleBulletList().run() },
  { key: "ol", labelKey: "slash.ordered", icon: IconOrdered, run: (e) => e.chain().focus().toggleOrderedList().run() },
  { key: "quote", labelKey: "slash.quote", icon: IconQuote, run: (e) => e.chain().focus().toggleBlockquote().run() },
  { key: "code", labelKey: "slash.code", icon: IconCode, run: (e) => e.chain().focus().toggleCodeBlock().run() },
  { key: "rule", labelKey: "slash.rule", icon: IconRule, run: (e) => e.chain().focus().setHorizontalRule().run() },
  { key: "image", labelKey: "slash.image", icon: IconImage, run: (e) => pickAndInsertImage(e) },
];

export default function EditorSurface({ docJSON, onChange, onReady }: Props) {
  const { t } = useI18n();
  const [slash, setSlash] = useState<{ left: number; top: number; query: string } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const editorRef = useRef<Editor | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow" },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: t("body.placeholder") }),
    ],
    content: docJSON as never,
    editorProps: {
      attributes: { class: "feuillet-editor" },
      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const it of items) {
          if (it.type.startsWith("image/")) {
            const file = it.getAsFile();
            if (file && editorRef.current) {
              void insertImageFromFile(editorRef.current, file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop(_view, event) {
        const files = (event as DragEvent).dataTransfer?.files;
        if (files && files.length && editorRef.current) {
          const img = Array.from(files).find((f) => f.type.startsWith("image/"));
          if (img) {
            event.preventDefault();
            void insertImageFromFile(editorRef.current, img);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      const text = editor.getText();
      onChange(editor.getJSON(), text, countWords(text));
      updateSlash(editor);
    },
    onSelectionUpdate({ editor }) {
      updateSlash(editor);
    },
  });

  // Detect a "/" slash trigger at the cursor: when the text immediately before
  // the caret on the current line is "/" + an optional query word.
  const updateSlash = useCallback((ed: Editor) => {
    const { state } = ed;
    const { from, empty } = state.selection;
    if (!empty) {
      setSlash(null);
      return;
    }
    const $from = state.selection.$from;
    const textBefore = $from.parent.textBetween(
      0,
      $from.parentOffset,
      undefined,
      "￼",
    );
    const match = /(?:^|\s)\/([\p{L}\d]*)$/u.exec(textBefore);
    // Only allow slash menu in an empty-ish block start context or after space.
    const isStart = textBefore.replace(/\/[\p{L}\d]*$/u, "").trim() === "";
    if (match && isStart) {
      const coords = ed.view.coordsAtPos(from);
      const wrap = wrapRef.current?.getBoundingClientRect();
      setSlash({
        left: coords.left - (wrap?.left ?? 0),
        top: coords.bottom - (wrap?.top ?? 0) + 6,
        query: match[1] ?? "",
      });
      setSlashIndex(0);
    } else {
      setSlash(null);
    }
  }, []);

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
      onReady(editor);
    }
  }, [editor, onReady]);

  // Keep the displayed doc in sync when the parent switches posts.
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(docJSON);
    if (current !== next) {
      editor.commands.setContent(docJSON as never, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docJSON, editor]);

  const filtered = slash
    ? SLASH_ITEMS.filter((it) =>
        t(it.labelKey).toLowerCase().includes(slash.query.toLowerCase()),
      )
    : [];

  const runSlash = useCallback(
    (item: SlashItem) => {
      if (!editor) return;
      // Delete the "/query" text first.
      const { state } = editor;
      const $from = state.selection.$from;
      const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
      const m = /\/[\p{L}\d]*$/u.exec(textBefore);
      const len = m ? m[0].length : 0;
      const to = state.selection.from;
      editor.chain().focus().deleteRange({ from: to - len, to }).run();
      item.run(editor);
      setSlash(null);
    },
    [editor],
  );

  // Keyboard nav for the slash menu.
  useEffect(() => {
    if (!slash || filtered.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        runSlash(filtered[slashIndex] ?? filtered[0]);
      } else if (e.key === "Escape") {
        setSlash(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [slash, filtered, slashIndex, runSlash]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(t("link.prompt"), prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor, t]);

  if (!editor) return null;

  const tbBtn =
    "grid place-items-center h-9 w-9 rounded-md text-paper-card/90 hover:text-paper-card hover:bg-white/10 transition-colors";
  const tbActive = "bg-white/15 text-paper-card";

  return (
    <div ref={wrapRef} className="relative">
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 140, maxWidth: "none" }}
        shouldShow={({ editor, state }) =>
          !state.selection.empty && !editor.isActive("image")
        }
      >
        <div className="flex items-center gap-0.5 rounded-xl bg-ink px-1.5 py-1 shadow-palette ring-1 ring-black/20 animate-fadeIn">
          <button className={`${tbBtn} ${editor.isActive("bold") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Gras"><IconBold className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("italic") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italique"><IconItalic className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("underline") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Souligné"><IconUnderline className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("strike") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Barré"><IconStrike className="h-4 w-4" /></button>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <button className={`${tbBtn} ${editor.isActive("heading", { level: 1 }) ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-label="Titre 1"><IconH1 className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("heading", { level: 2 }) ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Titre 2"><IconH2 className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("blockquote") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Citation"><IconQuote className="h-4 w-4" /></button>
          <button className={`${tbBtn} ${editor.isActive("bulletList") ? tbActive : ""}`} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Liste"><IconList className="h-4 w-4" /></button>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <button className={`${tbBtn} ${editor.isActive("link") ? tbActive : ""}`} onClick={setLink} aria-label="Lien"><IconLink className="h-4 w-4" /></button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />

      {slash && filtered.length > 0 && (
        <div
          className="absolute z-30 w-64 overflow-hidden rounded-xl bg-paper-card shadow-palette ring-1 ring-ink/10 animate-fadeIn"
          style={{ left: Math.max(0, slash.left), top: slash.top }}
          role="listbox"
        >
          <div className="border-b border-paper-rim px-3 py-1.5 font-sans text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            {t("slash.placeholder")}
          </div>
          <ul className="max-h-72 overflow-y-auto py-1 scrollbar-quiet">
            {filtered.map((it, i) => {
              const Icon = it.icon;
              return (
                <li key={it.key}>
                  <button
                    onMouseEnter={() => setSlashIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      runSlash(it);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left font-sans text-sm transition-colors ${
                      i === slashIndex ? "bg-madder/10 text-madder-deep" : "text-ink-soft hover:bg-paper-deep"
                    }`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-paper-deep text-ink-soft">
                      <Icon className="h-4 w-4" />
                    </span>
                    {t(it.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
