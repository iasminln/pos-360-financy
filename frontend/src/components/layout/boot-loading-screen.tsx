import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const WAKE_HINT_DELAY_MS = 3000;

type BootLoadingScreenProps = {
  className?: string;
};

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function BootLoadingScreen({ className }: BootLoadingScreenProps) {
  const [showWakeHint, setShowWakeHint] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const hintTimer = window.setTimeout(() => {
      setShowWakeHint(true);
    }, WAKE_HINT_DELAY_MS);

    const startedAt = Date.now();
    const tick = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      window.clearTimeout(hintTimer);
      window.clearInterval(tick);
    };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-6 bg-gray-100 px-4 py-10",
        className,
      )}
    >
      <Logo to={undefined} className="h-7" />

      <div className="flex flex-col items-center gap-3 text-center">
        <LoaderCircle
          className="h-9 w-9 animate-spin text-brand-base"
          aria-hidden
        />
        <p className="text-sm font-medium text-gray-700">Carregando</p>
      </div>

      <div
        className={cn(
          "max-w-sm overflow-hidden transition-all duration-500 ease-out",
          showWakeHint
            ? "max-h-48 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0",
        )}
        aria-live="polite"
      >
        <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm leading-normal text-gray-600">
          <p>
            O servidor gratuito pode demorar de 30 a 60 segundos para <span className="font-medium text-gray-800">despertar</span> após ficar inativo. Aguarde um momento, isso é normal.
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-3 text-xs text-gray-500">
            Tempo decorrido
            <span
              className="font-semibold tabular-nums text-brand-base"
              aria-label={`${elapsedSeconds} segundos decorridos`}
            >
              {formatElapsed(elapsedSeconds)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
