import type { ReactNode } from "react";
import { Logo } from "@/components/ui/logo";
import { Footer } from "@/components/layout/footer";

type CardInitialProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function CardInitial({ title, subtitle, children }: CardInitialProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10">
        <div className="flex justify-center">
          <Logo to={undefined} />
        </div>
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <p className="mt-2 text-base text-gray-600">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
