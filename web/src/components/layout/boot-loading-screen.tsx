import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const WAKE_HINT_DELAY_MS = 4000;

type BootLoadingScreenProps = {
  className?: string;
};

export function BootLoadingScreen({ className }: BootLoadingScreenProps) {
  const [showWakeHint, setShowWakeHint] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowWakeHint(true);
    }, WAKE_HINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 px-4",
        className,
      )}
    >
      <Logo to={undefined} className="h-7" />

      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          className="h-9 w-9 animate-spin text-brand-base"
          aria-hidden
        />
        <p className="text-sm font-medium text-gray-700">Carregando...</p>
      </div>

      <div
        className={cn(
          "max-w-sm overflow-hidden transition-all duration-500 ease-out",
          showWakeHint
            ? "max-h-40 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0",
        )}
        aria-live="polite"
      >
        <p className="rounded-xl border border-border bg-white px-4 py-3 text-sm leading-relaxed text-gray-600 shadow-sm">
          O servidor gratuito pode demorar alguns segundos para{" "}
          <span className="font-medium text-gray-800">despertar</span> após
          ficar inativo. Aguarde um momento — isso é normal.
        </p>
      </div>
    </div>
  );
}
