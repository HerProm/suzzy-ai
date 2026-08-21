import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  // Instrumentação temporária para diagnosticar o login Google em produção
  // (remover após confirmar a causa raiz). Só um booleano — nunca cookie ou
  // dado do usuário.
  console.log("[auth-debug] logout_executed", `signout_error=${Boolean(error)}`);

  return NextResponse.redirect(`${origin}/login`, { status: 303 });
}
