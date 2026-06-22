import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import type { Editor } from "@tiptap/react";
import {
  db,
  createPost,
  savePost,
  deletePost,
  renamePost,
  type Post,
  type Published,
} from "./db";
import { I18nProvider, useI18n } from "./i18n";
import { renderPublished, downloadHtml } from "./publish";
import { readingMinutes } from "./editor";
import { tightenParagraph, suggestTitle } from "./api";
import EditorSurface from "./components/Editor";
import CommandPalette, { type Action } from "./components/CommandPalette";
import Onboarding from "./components/Onboarding";
import Reader from "./components/Reader";
import PublishedList from "./components/PublishedList";
import Toast, { type ToastMsg } from "./components/Toast";
import { IconSearch, IconPlus, IconPublish, IconBook } from "./components/icons";

const ONBOARD_KEY = "feuillet.onboarded";
const ACTIVE_KEY = "feuillet.active";

function AppInner() {
  const { t, lang, setLang } = useI18n();

  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_KEY),
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showPublished, setShowPublished] = useState(false);
  const [reader, setReader] = useState<{ title: string; html: string } | null>(null);
  const [onboard, setOnboard] = useState(() => !localStorage.getItem(ONBOARD_KEY));
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [stats, setStats] = useState({ words: 0 });

  const editorRef = useRef<Editor | null>(null);
  const saveTimer = useRef<number | null>(null);
  const toastId = useRef(0);
  const aiEnabled = true; // function is optional but available; UI never blocks on it.

  const post = useLiveQuery(
    () => (activeId ? db.posts.get(activeId) : undefined),
    [activeId],
  );
  const allPosts = useLiveQuery(() => db.posts.orderBy("updatedAt").reverse().toArray(), []);

  const notify = useCallback((text: string, tone?: ToastMsg["tone"]) => {
    setToast({ id: ++toastId.current, text, tone });
  }, []);

  // ── Ensure there is always at least one post to write in ────────────────────
  useEffect(() => {
    if (allPosts === undefined) return;
    if (allPosts.length === 0) {
      void createPost().then((p) => {
        setActiveId(p.id);
        localStorage.setItem(ACTIVE_KEY, p.id);
      });
    } else if (!activeId || !allPosts.some((p) => p.id === activeId)) {
      const first = allPosts[0];
      setActiveId(first.id);
      localStorage.setItem(ACTIVE_KEY, first.id);
    }
  }, [allPosts, activeId]);

  useEffect(() => {
    if (post) setStats({ words: post.words });
  }, [post?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── ⌘K / Ctrl-K palette + Esc handling ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Autosave (debounced) ────────────────────────────────────────────────────
  const handleChange = useCallback(
    (doc: unknown, text: string, words: number) => {
      if (!activeId) return;
      setStats({ words });
      setSaveState("saving");
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void savePost(activeId, { doc, text, words }).then(() => {
          setSaveState("saved");
        });
      }, 600);
    },
    [activeId],
  );

  const handleTitle = useCallback(
    (title: string) => {
      if (!activeId) return;
      setSaveState("saving");
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        void savePost(activeId, { title }).then(() => setSaveState("saved"));
      }, 400);
    },
    [activeId],
  );

  const openPost = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    setShowPublished(false);
    setReader(null);
  }, []);

  const doNew = useCallback(async () => {
    const p = await createPost();
    openPost(p.id);
    requestAnimationFrame(() => editorRef.current?.commands.focus("end"));
  }, [openPost]);

  // ── Publish: render to standalone HTML, store, then preview ─────────────────
  const buildRender = useCallback(
    (target: Post): { result: ReturnType<typeof renderPublished>; record: Published } | null => {
      const editor = editorRef.current;
      if (!editor) return null;
      const bodyHtml = editor.getHTML();
      const plain = editor.getText();
      const result = renderPublished(target, bodyHtml, plain, lang);
      const record: Published = {
        id: target.id,
        postId: target.id,
        title: target.title.trim() || (lang === "fr" ? "Sans titre" : "Untitled"),
        html: result.html,
        excerpt: result.excerpt,
        words: result.words,
        readingMinutes: result.readingMinutes,
        publishedAt: Date.now(),
      };
      return { result, record };
    },
    [lang],
  );

  const doPublish = useCallback(async () => {
    if (!post) return;
    const built = buildRender(post);
    if (!built) return;
    await db.published.put(built.record);
    notify(t("toast.published"), "ok");
    setReader({ title: built.record.title, html: built.record.html });
  }, [post, buildRender, notify, t]);

  const doPreview = useCallback(() => {
    if (!post) return;
    const built = buildRender(post);
    if (!built) return;
    setReader({ title: built.record.title, html: built.result.html });
  }, [post, buildRender]);

  const doCopyHtml = useCallback(
    async (html?: string) => {
      let payload = html;
      if (!payload) {
        if (!post) return;
        const built = buildRender(post);
        if (!built) return;
        payload = built.result.html;
      }
      try {
        await navigator.clipboard.writeText(payload);
        notify(t("toast.copied"), "ok");
      } catch {
        notify(t("toast.aiError"), "err");
      }
    },
    [post, buildRender, notify, t],
  );

  const doExport = useCallback(() => {
    if (!post) return;
    const built = buildRender(post);
    if (!built) return;
    downloadHtml(`${built.record.title}.html`, built.result.html);
    notify(t("toast.exported"), "ok");
  }, [post, buildRender, notify, t]);

  const doRename = useCallback(() => {
    if (!post) return;
    const next = window.prompt(t("rename.prompt"), post.title);
    if (next === null) return;
    void renamePost(post.id, next.trim());
  }, [post, t]);

  const doDelete = useCallback(() => {
    if (!post) return;
    if (!window.confirm(t("confirm.delete"))) return;
    void deletePost(post.id);
  }, [post, t]);

  // ── Optional AI actions (graceful, never block the app) ─────────────────────
  const doTighten = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const { state } = editor;
    const $from = state.selection.$from;
    const node = $from.node($from.depth);
    const text = node?.textContent ?? "";
    if (text.trim().length < 8) {
      notify(t("toast.aiNeedSelect"), "err");
      return;
    }
    const start = $from.start($from.depth);
    const end = start + node.content.size;
    notify(t("ai.thinking"), "ai");
    try {
      const { paragraph } = await tightenParagraph(text, lang);
      editor
        .chain()
        .focus()
        .insertContentAt({ from: start, to: end }, paragraph)
        .run();
      notify(t("toast.tightened"), "ok");
    } catch {
      notify(t("toast.aiError"), "err");
    }
  }, [lang, notify, t]);

  const doSuggestTitle = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || !post) return;
    const text = editor.getText();
    if (text.trim().length < 8) {
      notify(t("toast.aiNeedText"), "err");
      return;
    }
    notify(t("ai.thinking"), "ai");
    try {
      const { title } = await suggestTitle(text, lang);
      void renamePost(post.id, title);
      notify(t("toast.titled"), "ok");
    } catch {
      notify(t("toast.aiError"), "err");
    }
  }, [post, lang, notify, t]);

  const handleAction = useCallback(
    (a: Action) => {
      switch (a) {
        case "new": void doNew(); break;
        case "publish": void doPublish(); break;
        case "preview": doPreview(); break;
        case "copyHtml": void doCopyHtml(); break;
        case "exportHtml": doExport(); break;
        case "rename": doRename(); break;
        case "delete": doDelete(); break;
        case "tighten": void doTighten(); break;
        case "suggestTitle": void doSuggestTitle(); break;
        case "openPublished": setShowPublished(true); break;
      }
    },
    [doNew, doPublish, doPreview, doCopyHtml, doExport, doRename, doDelete, doTighten, doSuggestTitle],
  );

  const finishOnboard = useCallback(() => {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboard(false);
    requestAnimationFrame(() => editorRef.current?.commands.focus("end"));
  }, []);

  const minutes = readingMinutes(stats.words);
  const savedLabel =
    saveState === "saving"
      ? t("save.saving")
      : saveState === "saved"
        ? t("save.saved")
        : t("save.never");

  return (
    <div className="relative min-h-screen bg-paper">
      {/* faint letterpress texture wash */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 16% 10%, rgba(156,59,46,0.04), transparent 40%), radial-gradient(circle at 84% 88%, rgba(94,107,79,0.045), transparent 44%)",
        }}
      />

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-paper-rim/70 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[52rem] items-center gap-3 px-5 py-3">
          <button
            onClick={() => setShowPublished(false)}
            className="flex items-center gap-2.5"
            aria-label="Le Feuillet"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-paper-card">
              <span className="font-display text-base font-semibold leading-none">F</span>
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[15px] font-semibold text-ink">Le Feuillet</span>
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                {t("app.tag")}
              </span>
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="mr-1 hidden items-center gap-1.5 font-sans text-xs text-ink-faint sm:flex">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  saveState === "saving" ? "bg-madder animate-pulseDot" : "bg-sage"
                }`}
              />
              {savedLabel}
            </span>
            <button
              onClick={() => setShowPublished(true)}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper-deep"
              title={t("action.published")}
            >
              <IconBook className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => void doPublish()}
              className="hidden items-center gap-1.5 rounded-lg bg-madder px-3 py-2 font-sans text-sm font-medium text-paper-card shadow-leaf transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex"
            >
              <IconPublish className="h-4 w-4" />
              {t("action.publish").replace(" ce feuillet", "").replace(" this leaf", "")}
            </button>
            <button
              onClick={() => void doNew()}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper-deep"
              title={t("action.new")}
            >
              <IconPlus className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-paper-rim bg-paper-card px-3 py-2 font-sans text-sm text-ink-soft shadow-leaf transition-colors hover:bg-paper-deep"
            >
              <IconSearch className="h-4 w-4" />
              <kbd className="font-mono text-[11px] text-ink-faint">⌘K</kbd>
            </button>
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="grid h-9 w-9 place-items-center rounded-lg font-sans text-xs font-semibold text-ink-faint transition-colors hover:bg-paper-deep"
              title="Langue / Language"
            >
              {t("lang.toggle")}
            </button>
          </div>
        </div>
      </header>

      {/* ── Writing surface ── */}
      <main className="relative mx-auto max-w-[52rem] px-5 pb-40 pt-10 sm:pt-16">
        {post && (
          <>
            <input
              value={post.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder={t("title.placeholder")}
              className="mb-6 w-full bg-transparent font-display text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.015em] text-ink placeholder:text-ink-faint/60 focus:outline-none sm:text-[3.1rem]"
              spellCheck={false}
            />
            <EditorSurface
              key={post.id}
              docJSON={post.doc}
              onChange={handleChange}
              onReady={(ed) => (editorRef.current = ed)}
            />
          </>
        )}
      </main>

      {/* ── Floating word/read meter ── */}
      {post && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-paper-rim bg-paper-card/90 px-4 py-2 font-mono text-[11px] text-ink-faint shadow-leaf backdrop-blur">
            <span>{stats.words} {t("meta.words")}</span>
            <span className="h-3 w-px bg-paper-rim" />
            <span>{minutes} {t("meta.read")}</span>
            <span className="h-3 w-px bg-paper-rim sm:hidden" />
            <span className="sm:hidden">{savedLabel}</span>
          </div>
        </div>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenPost={openPost}
        onAction={handleAction}
        hasActivePost={!!post}
        aiEnabled={aiEnabled}
      />

      {showPublished && (
        <PublishedList
          onClose={() => setShowPublished(false)}
          onPreview={(p) => setReader({ title: p.title, html: p.html })}
          onCopy={(html) => void doCopyHtml(html)}
        />
      )}

      {reader && (
        <Reader title={reader.title} html={reader.html} onClose={() => setReader(null)} />
      )}

      {onboard && <Onboarding onDone={finishOnboard} />}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  );
}
