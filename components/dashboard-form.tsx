"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Task } from "@/lib/ai/tasks";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
import { SCENARIOS_BY_CATEGORY } from "@/lib/real-estate-scenarios";
import { OBJECTIONS_BY_CATEGORY } from "@/lib/real-estate-objections";
import { usePromptTemplates } from "@/hooks/use-prompt-templates";
import {
  useGenerationHistory,
  type HistoryItem,
} from "@/hooks/use-generation-history";
import { useCopyResponse } from "@/hooks/use-copy-response";

const TASKS: { id: Task; label: string }[] = [
  { id: "responder_lead", label: "Responder um lead" },
  { id: "criar_follow_up", label: "Criar follow-up" },
  { id: "gerar_anuncio", label: "Gerar texto de anúncio" },
  { id: "sugerir_proximos_passos", label: "Sugerir próximos passos" },
];

type ShortcutItem =
  | { kind: "task"; task: Task; label: string }
  | { kind: "highlight"; target: "objection" | "negotiation"; label: string };

// 4 dos 6 atalhos mapeiam 1:1 para as tarefas reais já aceitas por
// /api/generate — só pré-selecionam o mesmo `selectedTask` que o antigo
// fieldset "Tarefa" já controlava. Os outros 2 não têm tarefa própria no
// backend: em vez de simular uma funcionalidade que não existe, eles abrem
// e destacam as opções reais já existentes (Objeção / Cenário-Negociação).
const SHORTCUTS: ShortcutItem[] = [
  { kind: "task", task: "responder_lead", label: "Responder cliente" },
  { kind: "highlight", target: "objection", label: "Contornar objeção" },
  { kind: "task", task: "criar_follow_up", label: "Fazer follow-up" },
  { kind: "highlight", target: "negotiation", label: "Negociar proposta" },
  { kind: "task", task: "gerar_anuncio", label: "Criar anúncio" },
  { kind: "task", task: "sugerir_proximos_passos", label: "O que faço agora?" },
];

const HIGHLIGHT_DURATION_MS = 2200;
const CONTEXT_MIN_HEIGHT_PX = 68;
const CONTEXT_MAX_HEIGHT_PX = 240;

const NETWORK_ERROR_MESSAGE =
  "Não foi possível gerar a resposta no momento. Tente novamente.";
const HISTORY_PREVIEW_LENGTH = 80;

const FIELD_LABEL_CLASS = "text-sm font-medium text-slate-700";
const FIELD_INPUT_CLASS =
  "w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
// Campo de conversa: mesma aparência base do FIELD_INPUT_CLASS, mas sem a
// alça de redimensionar manual (o crescimento é automático via JS) e com
// altura máxima antes de rolar internamente.
const CONTEXT_INPUT_CLASS =
  "w-full resize-none overflow-y-auto rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const HIGHLIGHT_CLASS = "-m-3 rounded-xl bg-amber-50 p-3 ring-2 ring-amber-300";
const BUBBLE_CLASS =
  "rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
const CHIP_CLASS =
  "rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors";
const CHIP_ACTIVE_CLASS = "border-teal-700 bg-teal-50 text-teal-800";
const CHIP_INACTIVE_CLASS =
  "border-slate-300 text-slate-700 hover:border-teal-200 hover:bg-teal-50/60";

type DashboardFormProps = {
  firstName?: string;
};

function getTaskLabel(task: Task) {
  return TASKS.find((item) => item.id === task)?.label ?? task;
}

function previewText(text: string) {
  return text.length > HISTORY_PREVIEW_LENGTH
    ? `${text.slice(0, HISTORY_PREVIEW_LENGTH)}...`
    : text;
}

export function DashboardForm({ firstName }: DashboardFormProps) {
  const greeting = firstName
    ? `Oi, ${firstName}! O que você precisa resolver hoje?`
    : "Oi! O que você precisa resolver hoje?";

  const [context, setContext] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );
  const [selectedObjectionId, setSelectedObjectionId] = useState<
    string | null
  >(null);

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [highlightedSection, setHighlightedSection] = useState<
    "objection" | "negotiation" | null
  >(null);

  const objectionSectionRef = useRef<HTMLFieldSetElement>(null);
  const negotiationGroupRef = useRef<HTMLFieldSetElement>(null);
  const contextTextareaRef = useRef<HTMLTextAreaElement>(null);

  const { copyLabel, copyError, handleCopy, resetCopyFeedback } =
    useCopyResponse();

  const { selectedTemplateId, handleTemplateChange, clearSelectedTemplate } =
    usePromptTemplates(setContext);

  const { history, addHistoryItem, restoreHistoryItem } = useGenerationHistory(
    {
      setContext,
      setSelectedTask,
      setResponse,
      clearSelectedTemplate,
    },
  );

  const isDisabled = context.trim() === "" || selectedTask === null;
  const isCopyDisabled = !response || response.trim() === "";
  const selectedTemplateDescription = PROMPT_TEMPLATES.find(
    (template) => template.id === selectedTemplateId,
  )?.description;

  const generateHint =
    context.trim() === "" && selectedTask === null
      ? "Informe o contexto e selecione uma tarefa para gerar uma resposta."
      : context.trim() === ""
        ? "Informe o contexto para gerar uma resposta."
        : selectedTask === null
          ? "Selecione uma tarefa para gerar uma resposta."
          : null;

  // Rola até a seção real correspondente e agenda o fim do destaque visual.
  // O ref só existe no DOM depois que "Opções avançadas" está aberto, mas
  // como handleShortcutClick já abre o painel no mesmo evento que define
  // highlightedSection, ambos chegam commitados juntos antes deste efeito
  // rodar.
  useEffect(() => {
    if (!highlightedSection) return;

    const ref =
      highlightedSection === "objection"
        ? objectionSectionRef
        : negotiationGroupRef;

    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timeout = setTimeout(
      () => setHighlightedSection(null),
      HIGHLIGHT_DURATION_MS,
    );
    return () => clearTimeout(timeout);
  }, [highlightedSection]);

  // Crescimento automático do campo de conversa: só ajusta a altura do
  // próprio elemento DOM (não é estado novo, `context` continua a única
  // fonte da verdade). Roda tanto na digitação quanto em mudanças
  // programáticas de `context` (template, restaurar histórico, limpar).
  useEffect(() => {
    const el = contextTextareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, CONTEXT_MAX_HEIGHT_PX)}px`;
  }, [context]);

  function handleShortcutClick(item: ShortcutItem) {
    if (item.kind === "task") {
      setSelectedTask(item.task);
      return;
    }

    setIsAdvancedOpen(true);
    setHighlightedSection(item.target);
  }

  async function handleGenerate() {
    if (isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          task: selectedTask,
          scenarioId: selectedScenarioId,
          objectionId: selectedObjectionId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data.response);

        if (selectedTask) {
          addHistoryItem({
            context,
            task: selectedTask,
            response: data.response,
          });
        }
      } else {
        setError(data.error ?? NETWORK_ERROR_MESSAGE);
      }
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    if (isLoading) return;

    resetCopyFeedback();

    setContext("");
    setSelectedTask(null);
    setResponse(null);
    setError(null);
    clearSelectedTemplate();
  }

  function handleRestore(item: HistoryItem) {
    resetCopyFeedback();
    setError(null);

    restoreHistoryItem(item);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
      <div className="flex flex-col gap-6">
        <div className={BUBBLE_CLASS}>
          <Image
            src="/logo-suzzy.png"
            alt="Suzzy AI"
            width={1408}
            height={768}
            className="h-auto w-full max-w-[150px]"
          />
          <p className="mt-3 text-sm text-slate-900">{greeting}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {SHORTCUTS.map((item) => {
              const isActive = item.kind === "task" && selectedTask === item.task;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleShortcutClick(item)}
                  className={`${CHIP_CLASS} ${
                    isActive ? CHIP_ACTIVE_CLASS : CHIP_INACTIVE_CLASS
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-4">
          {response !== null && (
            <div className={`animate-fade-in ${BUBBLE_CLASS}`}>
              <p className="text-xs font-medium text-slate-400">Suzzy</p>
              <label htmlFor="response" className="sr-only">
                Resposta da Suzzy
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className={`mt-1 ${FIELD_INPUT_CLASS}`}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isCopyDisabled}
                  onClick={() => handleCopy(response ?? "")}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {copyLabel}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleGenerate}
                  aria-busy={isLoading}
                  className={SECONDARY_BUTTON_CLASS}
                >
                  {isLoading ? "Enviando..." : "Tentar novamente"}
                </button>
              </div>

              {copyError && <p className="mt-2 text-sm text-red-600">{copyError}</p>}
            </div>
          )}
          {error && (
            <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <label htmlFor="context" className="sr-only">
            Sua mensagem para a Suzzy
          </label>
          <textarea
            id="context"
            ref={contextTextareaRef}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="Cole aqui a conversa, os dados do imóvel ou qualquer informação relevante..."
            style={{ minHeight: CONTEXT_MIN_HEIGHT_PX, maxHeight: CONTEXT_MAX_HEIGHT_PX }}
            className={CONTEXT_INPUT_CLASS}
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isDisabled || isLoading}
              onClick={handleGenerate}
              aria-busy={isLoading}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleClear}
              className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nova conversa
            </button>

            {generateHint && !isLoading && (
              <span className="text-xs text-slate-400">{generateHint}</span>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen((open) => !open)}
            aria-expanded={isAdvancedOpen}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            <span>
              {isAdvancedOpen ? "Ocultar opções avançadas" : "Opções avançadas"}
            </span>
            <span
              aria-hidden="true"
              className={`transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
            >
              ⌄
            </span>
          </button>

          {isAdvancedOpen && (
            <div className="mt-6 flex flex-col gap-8">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="template" className={FIELD_LABEL_CLASS}>
                  Template
                </label>
                <select
                  id="template"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className={FIELD_INPUT_CLASS}
                >
                  <option value="">Selecione um template</option>
                  {PROMPT_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {selectedTemplateDescription && (
                  <p className="text-xs text-slate-500">
                    {selectedTemplateDescription}
                  </p>
                )}
              </div>

              <fieldset className="flex flex-col gap-4">
                <legend className={FIELD_LABEL_CLASS}>Cenário</legend>
                {SCENARIOS_BY_CATEGORY.map((grupo) => (
                  <fieldset
                    key={grupo.categoria}
                    ref={
                      grupo.categoria === "Negociação"
                        ? negotiationGroupRef
                        : undefined
                    }
                    className={`flex flex-col gap-2 transition-colors duration-700 ${
                      highlightedSection === "negotiation" &&
                      grupo.categoria === "Negociação"
                        ? HIGHLIGHT_CLASS
                        : ""
                    }`}
                  >
                    <legend className="text-xs font-medium text-slate-500">
                      {grupo.categoria}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {grupo.cenarios.map((cenario) => (
                        <label
                          key={cenario.id}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                            selectedScenarioId === cenario.id
                              ? "border-slate-900 bg-slate-50 text-slate-900"
                              : "border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="scenario"
                            value={cenario.id}
                            checked={selectedScenarioId === cenario.id}
                            onChange={() => setSelectedScenarioId(cenario.id)}
                            className="mt-0.5 h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          />
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">{cenario.nome}</span>
                            <span className="text-xs text-slate-500">
                              {cenario.descricao}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </fieldset>

              <fieldset
                ref={objectionSectionRef}
                className={`flex flex-col gap-4 transition-colors duration-700 ${
                  highlightedSection === "objection" ? HIGHLIGHT_CLASS : ""
                }`}
              >
                <legend className={FIELD_LABEL_CLASS}>Objeção</legend>
                {OBJECTIONS_BY_CATEGORY.map((grupo) => (
                  <fieldset key={grupo.categoria} className="flex flex-col gap-2">
                    <legend className="text-xs font-medium text-slate-500">
                      {grupo.categoria}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {grupo.objecoes.map((objecao) => (
                        <label
                          key={objecao.id}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                            selectedObjectionId === objecao.id
                              ? "border-slate-900 bg-slate-50 text-slate-900"
                              : "border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="objection"
                            value={objecao.id}
                            checked={selectedObjectionId === objecao.id}
                            onChange={() => setSelectedObjectionId(objecao.id)}
                            className="mt-0.5 h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                          />
                          <span className="flex flex-col gap-0.5">
                            <span className="font-medium">{objecao.nome}</span>
                            <span className="text-xs text-slate-500">
                              {objecao.descricao}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </fieldset>
            </div>
          )}
        </div>
      </div>

      <aside className="flex flex-col gap-6 lg:sticky lg:top-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className={FIELD_LABEL_CLASS}>Hoje</h2>
          <p className="mt-2 text-sm text-slate-400">
            Nenhuma atividade registrada hoje ainda.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className={FIELD_LABEL_CLASS}>Conversas recentes</h2>
            {history.length > 0 && (
              <span className="text-xs text-slate-400">
                {history.length} {history.length === 1 ? "item" : "itens"}
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">
              Suas gerações vão aparecer aqui.
            </p>
          ) : (
            <ul className="mt-3 flex max-h-72 flex-col divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleRestore(item)}
                    aria-label={`Restaurar geração de ${getTaskLabel(item.task)}`}
                    className="flex w-full flex-col gap-1 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {getTaskLabel(item.task)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.createdAt.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {previewText(item.response)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className={FIELD_LABEL_CLASS}>Dica da Suzzy</h2>
          <p className="mt-2 text-sm text-slate-600">
            Quanto mais detalhes você incluir no contexto — a conversa
            completa e as características do imóvel — mais precisa fica a
            resposta gerada.
          </p>
        </div>
      </aside>
    </div>
  );
}
