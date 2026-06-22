import { useI18n } from "../i18n";
import { downloadHtml } from "../publish";
import { IconDownload } from "./icons";

interface Props {
  title: string;
  html: string;
  onClose: () => void;
}

// A clean in-app reader: renders the published standalone HTML in a sandboxed
// iframe so its inlined CSS is fully honoured, isolated from the app's styles.
export default function Reader({ title, html, onClose }: Props) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/55 backdrop-blur-sm animate-fadeIn">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-paper-card/95 px-4 py-3 shadow-leaf">
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 font-sans text-sm text-ink-soft transition-colors hover:bg-paper-deep"
        >
          ← {t("reader.back")}
        </button>
        <span className="truncate font-display text-sm font-medium text-ink">{title}</span>
        <button
          onClick={() => downloadHtml(`${title || "feuillet"}.html`, html)}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-1.5 font-sans text-sm text-paper-card transition-transform hover:scale-[1.02] active:scale-95"
        >
          <IconDownload className="h-4 w-4" />
          <span className="hidden sm:inline">{t("reader.download")}</span>
        </button>
      </div>
      <iframe
        title={title}
        srcDoc={html}
        className="w-full flex-1 animate-fadeIn bg-paper"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
