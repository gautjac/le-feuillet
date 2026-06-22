import { useLiveQuery } from "dexie-react-hooks";
import { db, type Published } from "../db";
import { useI18n } from "../i18n";
import { downloadHtml } from "../publish";
import { IconDownload, IconCopy, IconEye, IconTrash } from "./icons";

interface Props {
  onClose: () => void;
  onPreview: (p: Published) => void;
  onCopy: (html: string) => void;
}

export default function PublishedList({ onClose, onPreview, onCopy }: Props) {
  const { t, lang } = useI18n();
  const items = useLiveQuery(
    () => db.published.orderBy("publishedAt").reverse().toArray(),
    [],
    [] as Published[],
  );

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-paper scrollbar-quiet animate-fadeIn">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            {t("published.title")}
          </h1>
          <button
            onClick={onClose}
            className="rounded-lg border border-paper-rim bg-paper-card px-4 py-2 font-sans text-sm text-ink-soft shadow-leaf transition-colors hover:bg-paper-deep"
          >
            ← {t("published.back")}
          </button>
        </div>

        {(items ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper-rim bg-paper-card/60 px-6 py-16 text-center font-body text-lg text-ink-faint">
            {t("published.empty")}
          </div>
        ) : (
          <ul className="space-y-4">
            {(items ?? []).map((p) => (
              <li
                key={p.id}
                className="group rounded-2xl border border-paper-rim bg-paper-card p-5 shadow-leaf transition-transform hover:-translate-y-0.5 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-xl font-semibold text-ink">
                      {p.title}
                    </h2>
                    <p className="mt-1 font-sans text-xs text-ink-faint">
                      {t("published.at")} {fmt(p.publishedAt)} · {p.readingMinutes}{" "}
                      {t("meta.read")} · {p.words} {t("meta.words")}
                    </p>
                    <p className="mt-3 line-clamp-2 font-body text-[1.02rem] leading-relaxed text-ink-soft">
                      {p.excerpt}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onPreview(p)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 font-sans text-xs text-paper-card transition-transform hover:scale-[1.03] active:scale-95"
                  >
                    <IconEye className="h-3.5 w-3.5" /> {t("published.open")}
                  </button>
                  <button
                    onClick={() => downloadHtml(`${p.title || "feuillet"}.html`, p.html)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-paper-rim bg-paper px-3 py-1.5 font-sans text-xs text-ink-soft transition-colors hover:bg-paper-deep"
                  >
                    <IconDownload className="h-3.5 w-3.5" /> {t("published.download")}
                  </button>
                  <button
                    onClick={() => onCopy(p.html)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-paper-rim bg-paper px-3 py-1.5 font-sans text-xs text-ink-soft transition-colors hover:bg-paper-deep"
                  >
                    <IconCopy className="h-3.5 w-3.5" /> {t("published.copy")}
                  </button>
                  <button
                    onClick={() => db.published.delete(p.id)}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs text-ink-faint transition-colors hover:bg-madder/10 hover:text-madder-deep"
                  >
                    <IconTrash className="h-3.5 w-3.5" /> {t("published.unpublish")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
