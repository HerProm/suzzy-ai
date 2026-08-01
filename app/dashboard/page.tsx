import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardForm } from "@/components/dashboard-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </span>
          <span className="text-sm text-slate-500">
            Assistente para corretores
          </span>
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
    </div>
  );
}
