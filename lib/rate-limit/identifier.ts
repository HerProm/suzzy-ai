import { createHash } from "node:crypto";

const UNKNOWN_IP_FALLBACK = "unknown";

/**
 * Extrai o IP do visitante a partir dos headers de encaminhamento padrão
 * (`x-forwarded-for`, depois `x-real-ip`).
 *
 * IMPORTANTE — limitação conhecida: o ambiente de hospedagem em produção
 * ainda não está confirmado (ver docs/SPRINT-15.md e docs/SPRINT-17.md).
 * Esses headers só são confiáveis quando a camada de borda os define/
 * sobrescreve (verdadeiro, por exemplo, na Vercel) — um visitante que não
 * passe por um proxy confiável poderia, em tese, enviar um valor arbitrário
 * neles. Por isso são tratados aqui como identificador de "melhor esforço"
 * para fins de limitar abuso/custo, não como prova criptográfica de origem.
 * Esta premissa deve ser revalidada quando o ambiente de produção real for
 * confirmado.
 *
 * Quando nenhum header estiver presente, todos os visitantes sem IP
 * detectável compartilham o mesmo identificador de fallback (`unknown`) e,
 * portanto, o mesmo bloco de limite — mais restritivo entre si do que o
 * ideal, mas deliberadamente seguro: garante que a ausência de IP nunca
 * abra uma via sem limite algum.
 */
function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();

  return UNKNOWN_IP_FALLBACK;
}

/**
 * Identificador pseudonimizado para o rate limiting da Suzzy Assist.
 *
 * O IP nunca é armazenado nem enviado cru ao Redis (nem a nenhum outro
 * lugar): passa por hash SHA-256 (node:crypto, já disponível no ambiente
 * server-side, sem dependência nova) antes de virar a chave usada no
 * limitador. Namespace explícito (`assist:`) evita colisão com outras
 * chaves do mesmo Redis.
 *
 * Limitação registrada conforme a Tarefa 1 (docs/SPRINT-17.md, seção de
 * privacidade): isso é pseudonimização, não anonimização — sem um "sal"
 * secreto, um hash SHA-256 de um endereço IPv4 pode ser revertido por força
 * bruta (o espaço de IPv4 é pequeno o suficiente para uma tabela pré-
 * computada). Adicionar um sal exigiria um novo segredo de ambiente, o que
 * não foi introduzido nesta tarefa — fica registrado como melhoria futura
 * possível, não implementada aqui.
 */
export function getAssistRateLimitIdentifier(request: Request): string {
  const ip = extractClientIp(request);
  const hash = createHash("sha256").update(ip).digest("hex");
  return `assist:${hash}`;
}
