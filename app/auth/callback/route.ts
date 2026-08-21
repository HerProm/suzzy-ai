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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
