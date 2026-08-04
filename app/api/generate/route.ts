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

const MAX_CONTEXT_LENGTH = 5000;
const GENERATION_ERROR =
  "Não foi possível gerar a resposta no momento. Tente novamente.";

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
