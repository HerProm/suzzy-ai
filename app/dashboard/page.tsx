import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteProfile } from "@/lib/supabase/profile";
import { DashboardForm } from "@/components/dashboard-form";
import { SuzzySupportChat } from "@/components/suzzy-support-chat";

const LOGOUT_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // Instrumentação temporária para diagnosticar o login Google em produção
  // (remover após confirmar a causa raiz). Só booleanos/status — nunca
  // cookie, claim bruta ou dado do usuário.
  console.log(
    "[auth-debug] dashboard_claims_check",
    `claims_present=${Boolean(data?.claims)}`,
  );

  if (!data?.claims) {
    console.log("[auth-debug] dashboard_decision", "target=/login");
    redirect("/login");
  }

  const complete = await hasCompleteProfile(supabase, data.claims.sub);
  console.log("[auth-debug] dashboard_profile_check", `profile_complete=${complete}`);

  if (!complete) {
    console.log("[auth-debug] dashboard_decision", "target=/cadastro");
    redirect("/cadastro");
  }

  console.log("[auth-debug] dashboard_decision", "target=render");

  // Nome usado só na saudação (cosmético) — não é um novo gate de acesso, o
  // gate real já é o hasCompleteProfile acima. Se a consulta falhar por
  // qualquer motivo, cai numa saudação genérica em vez de quebrar a página.
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.claims.sub)
    .maybeSingle();

  const firstName = profileRow?.full_name?.trim().split(" ")[0];

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 flex-col justify-between border-r border-slate-200 bg-white px-5 py-6 sm:flex">
        <Image
          src="/logo-suzzy.png"
          alt="Suzzy AI"
          width={1408}
          height={768}
          priority
          className="h-auto w-full max-w-[190px]"
        />
        <form action="/auth/logout" method="POST">
          <button type="submit" className={LOGOUT_BUTTON_CLASS}>
            Sair
          </button>
        </form>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 sm:hidden">
          <Image
            src="/logo-suzzy.png"
            alt="Suzzy AI"
            width={1408}
            height={768}
            priority
            className="h-9 w-auto"
          />
          <form action="/auth/logout" method="POST">
            <button type="submit" className={LOGOUT_BUTTON_CLASS}>
              Sair
            </button>
          </form>
        </header>

        <main className="flex flex-1 justify-center px-6 py-10 sm:py-12">
          <div className="w-full max-w-5xl">
            <DashboardForm firstName={firstName} />
          </div>
        </main>
      </div>

      <SuzzySupportChat />
    </div>
  );
}
