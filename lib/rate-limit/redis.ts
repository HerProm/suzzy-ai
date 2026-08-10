import { Redis } from "@upstash/redis";

/**
 * Mesmo padrão já usado em lib/supabase/proxy.ts para NEXT_PUBLIC_SUPABASE_URL/
 * NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: verifica a presença das variáveis antes
 * de tentar usá-las, em vez de deixar a aplicação quebrar quando ainda não
 * estiverem configuradas (ex.: ambiente local sem credenciais do Upstash).
 */
export function hasUpstashCredentials(): boolean {
  return (
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

let redisClient: Redis | null = null;

/**
 * Cliente Redis (Upstash) compartilhado, reutilizado por todos os limitadores.
 * Retorna `null` quando as credenciais ainda não estão configuradas, em vez de
 * lançar uma exceção — quem chamar esta função decide o que fazer nesse caso
 * (ver decisão de fail-open/fail-closed neste mesmo diretório).
 */
export function getRedisClient(): Redis | null {
  if (!hasUpstashCredentials()) return null;

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisClient;
}
