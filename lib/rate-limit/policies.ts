import type { Duration } from "@upstash/ratelimit";

/**
 * Política inicial de limites (definida na Tarefa 1 da Sprint 17).
 *
 * Números de partida, não definitivos — podem ser ajustados aqui sem alterar
 * a arquitetura de rate limiting em nenhum outro arquivo.
 */

export type RateLimitWindowConfig = {
  /** Quantidade máxima de requisições permitidas dentro da janela. */
  requests: number;
  /** Janela no formato aceito por Ratelimit.slidingWindow (ex.: "60 s", "1 d"). */
  window: Duration;
};

export type AgentRateLimitPolicy = {
  shortWindow: RateLimitWindowConfig;
  daily: RateLimitWindowConfig;
};

/** Suzzy Assist (pública, por IP): rajada curta + teto diário. */
export const ASSIST_RATE_LIMIT_POLICY: AgentRateLimitPolicy = {
  shortWindow: { requests: 5, window: "60 s" },
  daily: { requests: 40, window: "1 d" },
};

/** Suzzy Support (autenticada, por usuário): rajada curta + teto diário. */
export const SUPPORT_RATE_LIMIT_POLICY: AgentRateLimitPolicy = {
  shortWindow: { requests: 10, window: "60 s" },
  daily: { requests: 100, window: "1 d" },
};
