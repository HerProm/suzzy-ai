"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
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

  async function handleMagicLinkLogin() {
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    setLoading(false);
    setMessage(
      error ? error.message : "Verifique seu e-mail para acessar o link de login.",
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">Entrar</h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="rounded border px-4 py-2"
        >
          Entrar com Google
        </button>

        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-4 py-2"
          />
          <button
            type="button"
            onClick={handleMagicLinkLogin}
            disabled={loading || !email}
            className="rounded border px-4 py-2"
          >
            Entrar com Magic Link
          </button>
        </div>

        {message && <p className="text-sm">{message}</p>}
      </div>
    </div>
  );
}
