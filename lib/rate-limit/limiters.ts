import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "./redis";
import {
  ASSIST_RATE_LIMIT_POLICY,
  SUPPORT_RATE_LIMIT_POLICY,
  type AgentRateLimitPolicy,
} from "./policies";

export type AgentRateLimiters = {
  shortWindow: Ratelimit;
  daily: Ratelimit;
};

function createAgentRateLimiters(
  prefix: string,
  policy: AgentRateLimitPolicy,
): AgentRateLimiters | null {
  const redis = getRedisClient();
  if (!redis) return null;

  return {
    shortWindow: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        policy.shortWindow.requests,
        policy.shortWindow.window,
      ),
      prefix: `${prefix}:short`,
      analytics: true,
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        policy.daily.requests,
        policy.daily.window,
      ),
      prefix: `${prefix}:daily`,
      analytics: true,
    }),
  };
}

let assistRateLimiters: AgentRateLimiters | null | undefined;
let supportRateLimiters: AgentRateLimiters | null | undefined;

/**
 * Limitadores da Suzzy Assist (pública). Retorna `null` quando as credenciais
 * do Upstash ainda não estão configuradas — não implementado ainda em
 * app/api/assist/route.ts (isso é a Tarefa 3).
 */
export function getAssistRateLimiters(): AgentRateLimiters | null {
  if (assistRateLimiters === undefined) {
    assistRateLimiters = createAgentRateLimiters(
      "ratelimit:assist",
      ASSIST_RATE_LIMIT_POLICY,
    );
  }
  return assistRateLimiters;
}

/**
 * Limitadores da Suzzy Support (autenticada). Retorna `null` quando as
 * credenciais do Upstash ainda não estão configuradas — não implementado
 * ainda em app/api/support/route.ts (isso é a Tarefa 4).
 */
export function getSupportRateLimiters(): AgentRateLimiters | null {
  if (supportRateLimiters === undefined) {
    supportRateLimiters = createAgentRateLimiters(
      "ratelimit:support",
      SUPPORT_RATE_LIMIT_POLICY,
    );
  }
  return supportRateLimiters;
}
