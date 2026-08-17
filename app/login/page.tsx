"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Entre na sua conta ou comece agora seu teste gratuito de 15
            dias.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar com Google
            </button>

            <p className="text-center text-xs text-slate-400">
              Novo por aqui? Sua conta é criada automaticamente no primeiro
              acesso.
            </p>
          </div>

          {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
        </div>
      </div>
    </div>
  );
}
