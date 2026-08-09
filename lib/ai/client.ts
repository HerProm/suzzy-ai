import OpenAI from "openai";

/**
 * Cria uma instância do cliente OpenAI a partir da chave de API do servidor.
 *
 * Usado pelos endpoints dos agentes conversacionais (Suzzy Assist, Suzzy
 * Support). `app/api/generate/route.ts` continua instanciando o cliente
 * inline e não foi alterado para usar este helper.
 */
export function createOpenAiClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
