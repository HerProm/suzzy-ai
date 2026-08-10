/**
 * Infraestrutura compartilhada de rate limiting (Upstash Redis), preparada na
 * Tarefa 2 da Sprint 17 para uso futuro por /api/assist (Tarefa 3) e
 * /api/support (Tarefa 4). Nenhuma rota chama esta infraestrutura ainda.
 *
 * DECISÃO: FAIL-CLOSED PARA OS DOIS ENDPOINTS
 * --------------------------------------------
 * Quando o Upstash estiver indisponível (erro de rede, timeout, credenciais
 * ausentes/inválidas) durante `checkRateLimit()`, a rota que chamar esta
 * função deve tratar a falha como limite excedido (fail-closed), e não deixar
 * a requisição passar (fail-open). Esta função não implementa esse
 * comportamento sozinha — cabe à rota (Tarefa 3/4) envolver a chamada em
 * try/catch e decidir com base nesta política.
 *
 * Por quê, para os dois casos:
 * - Suzzy Assist (pública): fail-open significaria que uma falha no mecanismo
 *   de proteção reabriria exatamente o risco que ele existe para evitar —
 *   custo de API sem limite em um endpoint sem nenhuma outra barreira
 *   (não é autenticado). O objetivo principal do rate limiting aqui é conter
 *   custo, então uma falha de infraestrutura não deve remover essa contenção.
 * - Suzzy Support (autenticada): também recomendado fail-closed nesta
 *   primeira versão, por consistência e para manter o mesmo nível de proteção
 *   de custo em ambos os agentes enquanto o produto está em estágio inicial —
 *   mesmo autenticado, um usuário ainda poderia gerar custo sem limite
 *   durante uma indisponibilidade do Redis. O custo dessa escolha é
 *   indisponibilidade temporária do chat de suporte durante uma falha rara do
 *   Upstash, considerada aceitável nesta fase. Esta é uma escolha revisável
 *   pelo dono do produto, não uma decisão arquitetural irreversível — nada
 *   nesta infraestrutura impede trocar para fail-open no Support depois, se
 *   desejado.
 *
 * Nenhum comportamento de fail-open/fail-closed foi implementado nos
 * endpoints nesta tarefa — apenas documentado aqui para orientar as Tarefas
 * 3 e 4.
 */

export { hasUpstashCredentials, getRedisClient } from "./redis";
export {
  getAssistRateLimiters,
  getSupportRateLimiters,
  type AgentRateLimiters,
} from "./limiters";
export { checkRateLimit, type RateLimitCheckResult } from "./check";
export { getAssistRateLimitIdentifier } from "./identifier";
export {
  ASSIST_RATE_LIMIT_POLICY,
  SUPPORT_RATE_LIMIT_POLICY,
  type AgentRateLimitPolicy,
  type RateLimitWindowConfig,
} from "./policies";
