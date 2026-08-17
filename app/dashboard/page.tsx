import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteProfile } from "@/lib/supabase/profile";
import { DashboardForm } from "@/components/dashboard-form";
import { SuzzySupportChat } from "@/components/suzzy-support-chat";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const complete = await hasCompleteProfile(supabase, data.claims.sub);
  if (!complete) {
    redirect("/cadastro");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Assistente para corretores
            </span>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 py-10 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Informe o contexto, escolha uma tarefa e gere uma resposta em
              segundos.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <DashboardForm />
          </div>
        </div>
      </main>

      <SuzzySupportChat />
    </div>
  );
}
