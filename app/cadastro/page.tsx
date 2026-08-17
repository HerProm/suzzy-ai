import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteProfile } from "@/lib/supabase/profile";
import { ProfileForm } from "@/components/profile-form";

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const complete = await hasCompleteProfile(supabase, data.claims.sub);

  if (complete) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </span>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-6 py-10 sm:py-12">
        <div className="w-full max-w-3xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Complete seu cadastro
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Só mais um passo antes de você começar a usar a SUZZY AI.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
}
