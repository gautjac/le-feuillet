import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Post, type Published } from "../db";
import { useI18n } from "../i18n";
import {
  IconSearch,
  IconPlus,
  IconPublish,
  IconEye,
  IconCopy,
  IconDownload,
  IconRename,
  IconTrash,
  IconSpark,
  IconBook,
} from "./icons";

export type Action =
  | "new"
  | "publish"
  | "preview"
  | "copyHtml"
  | "exportHtml"
  | "rename"
  | "delete"
  | "tighten"
  | "suggestTitle"
  | "openPublished";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenPost: (id: string) => void;
  onAction: (action: Action) => void;
  hasActivePost: boolean;
  aiEnabled: boolean;
}

interface Row {
  kind: "action" | "post" | "published";
  id: string;
  label: string;
  meta?: string;
  icon: (p: { className?: string }) => React.ReactNode;
  run: () => void;
  group: string;
}

export default function CommandPalette({
  open,
  onClose,
  onOpenPost,
  onAction,
  hasActivePost,
  aiEnabled,
}: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const posts = useLiveQuery(
    () => db.posts.orderBy("updatedAt").reverse().toArray(),
    [],
    [] as Post[],
  );
  const published = useLiveQuery(
    () => db.published.orderBy("publishedAt").reverse().toArray(),
    [],
    [] as Published[],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const actions = useMemo<Row[]>(() => {
    const a: Row[] = [
      {
        kind: "action",
        id: "new",
        label: t("action.new"),
        icon: IconPlus,
        group: t("palette.actions"),
        run: () => onAction("new"),
      },
    ];
    if (hasActivePost) {
      a.push(
        { kind: "action", id: "publish", label: t("action.publish"), icon: IconPublish, group: t("palette.actions"), run: () => onAction("publish") },
        { kind: "action", id: "preview", label: t("action.preview"), icon: IconEye, group: t("palette.actions"), run: () => onAction("preview") },
        { kind: "action", id: "copyHtml", label: t("action.copyHtml"), icon: IconCopy, group: t("palette.actions"), run: () => onAction("copyHtml") },
        { kind: "action", id: "exportHtml", label: t("action.exportHtml"), icon: IconDownload, group: t("palette.actions"), run: () => onAction("exportHtml") },
        { kind: "action", id: "rename", label: t("action.rename"), icon: IconRename, group: t("palette.actions"), run: () => onAction("rename") },
      );
      if (aiEnabled) {
        a.push(
          { kind: "action", id: "tighten", label: t("action.tighten"), icon: IconSpark, group: t("palette.actions"), run: () => onAction("tighten") },
          { kind: "action", id: "suggestTitle", label: t("action.suggestTitle"), icon: IconSpark, group: t("palette.actions"), run: () => onAction("suggestTitle") },
        );
      }
      a.push({ kind: "action", id: "delete", label: t("action.delete"), icon: IconTrash, group: t("palette.actions"), run: () => onAction("delete") });
    }
    a.push({ kind: "action", id: "openPublished", label: t("action.published"), icon: IconBook, group: t("palette.actions"), run: () => onAction("openPublished") });
    return a;
  }, [t, hasActivePost, aiEnabled, onAction]);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const postRows: Row[] = (posts ?? []).map((p) => ({
      kind: "post",
      id: p.id,
      label: p.title.trim() || (t("title.placeholder") as string),
      meta: `${p.words} ${t("meta.words")}`,
      icon: IconSearch,
      group: t("palette.posts"),
      run: () => onOpenPost(p.id),
    }));
    const pubRows: Row[] = (published ?? []).map((p) => ({
      kind: "published",
      id: "pub-" + p.id,
      label: p.title,
      meta: `${p.readingMinutes} ${t("meta.read")}`,
      icon: IconBook,
      group: t("palette.published"),
      run: () => onAction("openPublished"),
    }));
    const all = [...actions, ...postRows, ...pubRows];
    if (!q) return all;
    return all.filter((r) => r.label.toLowerCase().includes(q));
  }, [actions, posts, published, query, t, onOpenPost, onAction]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-i="${index}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[index];
      if (row) {
        row.run();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // group consecutive rows
  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-sm animate-fadeIn"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-paper-card shadow-palette ring-1 ring-ink/10 animate-riseIn"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKey}
      >
        <div className="flex items-center gap-3 border-b border-paper-rim px-4">
          <IconSearch className="h-5 w-5 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("palette.placeholder")}
            className="w-full bg-transparent py-4 font-sans text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded border border-paper-rim bg-paper px-1.5 py-0.5 font-sans text-[11px] text-ink-faint sm:block">
            esc
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[52vh] overflow-y-auto py-2 scrollbar-quiet">
          {rows.length === 0 && (
            <li className="px-4 py-8 text-center font-sans text-sm text-ink-faint">
              {t("palette.empty")}
            </li>
          )}
          {rows.map((row, i) => {
            const showGroup = row.group !== lastGroup;
            lastGroup = row.group;
            const Icon = row.icon;
            const active = i === index;
            return (
              <li key={row.id} data-i={i}>
                {showGroup && (
                  <div className="px-4 pb-1 pt-3 font-sans text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                    {row.group}
                  </div>
                )}
                <button
                  onMouseEnter={() => setIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    row.run();
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left font-sans text-sm transition-colors ${
                    active ? "bg-madder/10" : "hover:bg-paper-deep"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                      row.kind === "action" ? "bg-madder/15 text-madder-deep" : "bg-paper-deep text-ink-soft"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className={`flex-1 truncate ${active ? "text-ink" : "text-ink-soft"}`}>
                    {row.label}
                  </span>
                  {row.meta && (
                    <span className="shrink-0 font-mono text-[11px] text-ink-faint">{row.meta}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-paper-rim px-4 py-2 font-sans text-[11px] text-ink-faint">
          <span>{t("palette.hint")}</span>
          <span className="font-mono">Le Feuillet</span>
        </div>
      </div>
    </div>
  );
}
