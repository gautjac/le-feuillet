import { useEffect } from "react";

export interface ToastMsg {
  id: number;
  text: string;
  tone?: "ok" | "err" | "ai";
}

export default function Toast({
  toast,
  onDone,
}: {
  toast: ToastMsg | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!toast || toast.tone === "ai") return;
    const id = setTimeout(onDone, 2600);
    return () => clearTimeout(id);
  }, [toast, onDone]);

  if (!toast) return null;
  const tone =
    toast.tone === "err"
      ? "bg-madder text-paper-card"
      : toast.tone === "ai"
        ? "bg-ink text-paper-card"
        : "bg-ink text-paper-card";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-7 z-[70] flex justify-center px-4">
      <div
        className={`pointer-events-auto inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 font-sans text-sm shadow-palette animate-riseIn ${tone}`}
      >
        {toast.tone === "ai" && (
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-paper-card animate-pulseDot" />
            <span className="h-1.5 w-1.5 rounded-full bg-paper-card animate-pulseDot [animation-delay:.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-paper-card animate-pulseDot [animation-delay:.4s]" />
          </span>
        )}
        {toast.text}
      </div>
    </div>
  );
}
