import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_H2 = "text-xl font-semibold tracking-tight text-slate-900";
export const LEGAL_P = "text-slate-700";
export const LEGAL_UL = "flex flex-col gap-1.5 pl-5 text-slate-700 list-disc";
export const LEGAL_LINK =
  "font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </span>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Voltar para o início
          </Link>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-3xl">
          <h1 className="mb-10 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <div className="flex flex-col gap-10 text-sm leading-relaxed sm:text-base">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
