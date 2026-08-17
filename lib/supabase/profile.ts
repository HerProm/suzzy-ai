import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Confirma se o usuário autenticado já tem um perfil de corretor
 * (linha em `profiles`). Usado como gate server-side antes do Dashboard e
 * dos endpoints autenticados de IA — nunca confiar só numa checagem no
 * cliente.
 *
 * Fail-closed: qualquer erro na consulta é tratado como "perfil
 * incompleto" (força o cadastro), no mesmo espírito das demais decisões
 * fail-closed já tomadas neste projeto (rate limiting, Sprint 17/18).
 */
export async function hasCompleteProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error(
      "[lib/supabase/profile] Falha ao verificar perfil (tipo:",
      error.code ?? typeof error,
      ")",
    );
    return false;
  }

  return data !== null;
}
