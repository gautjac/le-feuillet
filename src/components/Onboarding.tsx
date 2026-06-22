import { useState } from "react";
import { useI18n } from "../i18n";

interface Props {
  onDone: () => void;
}

export default function Onboarding({ onDone }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const steps = [
    { title: t("onboard.t1"), body: t("onboard.b1") },
    { title: t("onboard.t2"), body: t("onboard.b2") },
    { title: t("onboard.t3"), body: t("onboard.b3") },
    { title: t("onboard.t4"), body: t("onboard.b4") },
  ];
  const last = step === steps.length - 1;
  const s = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 px-5 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-paper-card shadow-palette ring-1 ring-ink/10 animate-riseIn">
        <div className="relative h-1.5 bg-paper-deep">
          <div
            className="h-full bg-madder transition-[width] duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="px-8 pb-7 pt-9">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-madder/10 px-3 py-1 font-sans text-[11px] font-medium uppercase tracking-[0.18em] text-madder-deep">
            Le Feuillet
          </div>
          <h2 className="mb-3 font-display text-[2rem] font-semibold leading-tight text-ink">
            {s.title}
          </h2>
          <p className="font-body text-[1.15rem] leading-relaxed text-ink-soft">{s.body}</p>

          <div className="mt-9 flex items-center justify-between">
            <button
              onClick={onDone}
              className="font-sans text-sm text-ink-faint transition-colors hover:text-ink-soft"
            >
              {t("onboard.skip")}
            </button>
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-6 bg-madder" : "w-1.5 bg-paper-rim"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => (last ? onDone() : setStep((x) => x + 1))}
              className="rounded-lg bg-ink px-5 py-2.5 font-sans text-sm font-medium text-paper-card transition-transform hover:scale-[1.02] active:scale-95"
            >
              {last ? t("onboard.start") : t("onboard.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
