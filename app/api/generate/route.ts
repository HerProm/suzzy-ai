import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_TASKS, buildAiInput, type Task } from "@/lib/ai/tasks";
import { REAL_ESTATE_SCENARIOS } from "@/lib/real-estate-scenarios";
import { REAL_ESTATE_OBJECTIONS } from "@/lib/real-estate-objections";
import {
  STRATEGIES_BY_CATEGORY,
  type StrategyCategory,
} from "@/lib/real-estate-strategies";
import { getGenerateRateLimiters, checkRateLimit } from "@/lib/rate-limit";

const MAX_CONTEXT_LENGTH = 5000;
const GENERATION_ERROR =
  "Não foi possível gerar a resposta no momento. Tente novamente.";
const RATE_LIMIT_MESSAGE =
  "Você atingiu o limite temporário de gerações. Aguarde um momento e tente novamente.";
const SERVICE_UNAVAILABLE_MESSAGE =
  "A geração de respostas está temporariamente indisponível. Tente novamente em instantes.";
// Aprovado na Tarefa 4 da Sprint 18 após microvalidação com 6 gerações reais
// (pior caso observado: 1673 output_tokens, incluindo tokens de raciocínio,
// que /api/generate não limita via reasoning.effort). 2500 dá ~50% de
// margem sobre o pior caso observado.
const MAX_OUTPUT_TOKENS = 2500;

function isValidTask(value: unknown): value is Task {
  return (
    typeof value === "string" &&
    (ALLOWED_TASKS as readonly string[]).includes(value)
  );
}

const TASK_STRATEGY_CATEGORY: Partial<Record<Task, StrategyCategory>> = {
  responder_lead: "Primeiro Contato",
  criar_follow_up: "Follow-up",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return NextResponse.json(
      { error: "Sessão não encontrada. Faça login novamente." },
      { status: 401 },
    );
  }

  // Rate limiting só depois da autenticação: um visitante sem sessão recebe
  // 401 sem nunca chegar a consultar o Upstash. O identificador é o `sub`
  // (claim padrão do JWT do Supabase, sempre presente) — estável por
  // usuário, sem precisar de e-mail. Nunca logado, nunca enviado à OpenAI.
  // Mesmo padrão já usado em /api/support (Sprint 17, Tarefa 4).
  const generateRateLimiters = getGenerateRateLimiters();

  // Fail-closed (mesma decisão de /api/assist e /api/support, registrada em
  // lib/rate-limit/index.ts): sem limitadores válidos, a rota não segue
  // para a OpenAI.
  if (!generateRateLimiters) {
    console.error(
      "[api/generate] Rate limiter indisponível: credenciais do Upstash ausentes ou inválidas.",
    );
    return NextResponse.json(
      { error: SERVICE_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  const identifier = `generate:${data.claims.sub}`;

  let rateLimitResult;
  try {
    rateLimitResult = await checkRateLimit(generateRateLimiters, identifier);
  } catch (error) {
    // Fail-closed também para falha durante a verificação. Não registrar a
    // mensagem bruta do erro nem o identificador — só o tipo da exceção.
    console.error(
      "[api/generate] Falha ao verificar rate limit (tipo:",
      error instanceof Error ? error.constructor.name : typeof error,
      ")",
    );
    return NextResponse.json(
      { error: SERVICE_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  if (!rateLimitResult.success) {
    const retryAfterSeconds = Math.max(
      0,
      Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
    );

    return NextResponse.json(
      { error: RATE_LIMIT_MESSAGE },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dados inválidos enviados para a geração de resposta." },
      { status: 400 },
    );
  }

  const { context, task, scenarioId, objectionId } = (body ?? {}) as {
    context?: unknown;
    task?: unknown;
    scenarioId?: unknown;
    objectionId?: unknown;
  };

  if (
    typeof context !== "string" ||
    context.trim() === "" ||
    context.length > MAX_CONTEXT_LENGTH ||
    !isValidTask(task)
  ) {
    return NextResponse.json(
      { error: "Dados inválidos enviados para a geração de resposta." },
      { status: 400 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: GENERATION_ERROR }, { status: 500 });
  }

  const scenario =
    typeof scenarioId === "string"
      ? REAL_ESTATE_SCENARIOS.find((item) => item.id === scenarioId)
      : undefined;

  const objection =
    typeof objectionId === "string"
      ? REAL_ESTATE_OBJECTIONS.find((item) => item.id === objectionId)
      : undefined;

  const relevantStrategyCategory: StrategyCategory | undefined = objection
    ? "Negociação"
    : scenario?.categoria === "Negociação"
      ? "Negociação"
      : TASK_STRATEGY_CATEGORY[task];

  const strategies = relevantStrategyCategory
    ? STRATEGIES_BY_CATEGORY.find(
        (group) => group.categoria === relevantStrategyCategory,
      )?.estrategias
    : undefined;

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { instructions, input } = buildAiInput(
      task,
      context,
      scenario,
      objection,
      strategies,
    );

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions,
      input,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    const text = response.output_text?.trim();

    if (!text) {
      return NextResponse.json({ error: GENERATION_ERROR }, { status: 502 });
    }

    return NextResponse.json({ response: text });
  } catch {
    return NextResponse.json({ error: GENERATION_ERROR }, { status: 502 });
  }
}
