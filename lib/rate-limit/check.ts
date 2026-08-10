import type { AgentRateLimiters } from "./limiters";

export type RateLimitCheckResult = {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix timestamp em milissegundos de quando a janela bloqueada libera de novo. */
  reset: number;
};

/**
 * Verifica as duas janelas (curta + diária) de um agente para um identificador
 * já calculado pelo chamador (IP com hash para o Assist, `sub` do usuário para
 * o Support — ver decisão de identificadores na Tarefa 1). Esta função não
 * decide qual identificador usar, apenas combina o resultado das duas janelas
 * em uma única decisão: passa somente se as duas permitirem.
 *
 * Ainda não é chamada por nenhuma rota (Tarefa 2 é só preparar a
 * infraestrutura) — será usada em app/api/assist/route.ts (Tarefa 3) e
 * app/api/support/route.ts (Tarefa 4).
 */
export async function checkRateLimit(
  limiters: AgentRateLimiters,
  identifier: string,
): Promise<RateLimitCheckResult> {
  const [shortWindow, daily] = await Promise.all([
    limiters.shortWindow.limit(identifier),
    limiters.daily.limit(identifier),
  ]);

  const blockedBy = !shortWindow.success
    ? shortWindow
    : !daily.success
      ? daily
      : shortWindow;

  return {
    success: shortWindow.success && daily.success,
    limit: blockedBy.limit,
    remaining: blockedBy.remaining,
    reset: blockedBy.reset,
  };
}
