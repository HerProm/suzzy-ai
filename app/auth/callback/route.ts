import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Client dedicado a esta rota (em vez de lib/supabase/server.ts): os
// cookies de sessão são escritos diretamente no mesmo objeto de resposta
// que será devolvido (`response.cookies.set`), não pela API ambiente
// `cookies()` do next/headers. Isso evita depender de o Next.js reaplicar
// corretamente cookies escritos separadamente a um NextResponse.redirect()
// recém-criado — a causa mais provável do login exigir dois cliques.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Instrumentação temporária para diagnosticar o login Google em produção
  // (remover após confirmar a causa raiz). Só booleanos/status sanitizado —
  // nunca o código, o token ou dados do usuário.
  console.log("[auth-debug] oauth_callback_started", `code_present=${Boolean(code)}`);

  if (code) {
    const response = NextResponse.redirect(`${origin}/dashboard`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log(
      "[auth-debug] oauth_exchange_result",
      `success=${!error}`,
      `error_code=${error?.code ?? "null"}`,
    );
    console.log(
      "[auth-debug] oauth_exchange_user",
      `user_available=${Boolean(data?.user)}`,
    );

    if (!error) {
      console.log("[auth-debug] oauth_callback_redirect", "target=/dashboard");
      return response;
    }
  }

  console.log("[auth-debug] oauth_callback_redirect", "target=/login");
  return NextResponse.redirect(`${origin}/login`);
}
