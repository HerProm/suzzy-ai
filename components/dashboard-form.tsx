"use client";

import { useState } from "react";
import type { Task } from "@/lib/ai/tasks";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";
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

const NETWORK_ERROR_MESSAGE =
  "Não foi possível gerar a resposta no momento. Tente novamente.";
const HISTORY_PREVIEW_LENGTH = 80;

const FIELD_LABEL_CLASS = "text-sm font-medium text-slate-700";
const FIELD_INPUT_CLASS =
  "w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function getTaskLabel(task: Task) {
  return TASKS.find((item) => item.id === task)?.label ?? task;
}

function previewText(text: string) {
  return text.length > HISTORY_PREVIEW_LENGTH
    ? `${text.slice(0, HISTORY_PREVIEW_LENGTH)}...`
    : text;
}

export function DashboardForm() {
  const [context, setContext] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleGenerate() {
    if (isLoading) return;

    setIsLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, task: selectedTask }),
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
    <div className="flex flex-col gap-8">
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="context" className={FIELD_LABEL_CLASS}>
          Contexto
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={6}
          placeholder="Cole aqui a conversa, os dados do imóvel ou qualquer informação relevante..."
          className={FIELD_INPUT_CLASS}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={FIELD_LABEL_CLASS}>Tarefa</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TASKS.map(({ id, label }) => (
            <label
              key={id}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                selectedTask === id
                  ? "border-slate-900 bg-slate-50 text-slate-900"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="task"
                value={id}
                checked={selectedTask === id}
                onChange={() => setSelectedTask(id)}
                className="h-4 w-4 accent-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isDisabled || isLoading}
            onClick={handleGenerate}
            aria-busy={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Gerando..." : "Gerar resposta"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClear}
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpar
          </button>

          {generateHint && !isLoading && (
            <span className="text-xs text-slate-400">{generateHint}</span>
          )}
        </div>

        <div aria-live="polite" className="flex flex-col gap-4">
          {response !== null && (
            <div className="animate-fade-in flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="response" className={FIELD_LABEL_CLASS}>
                  Resposta gerada
                </label>
                <textarea
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  className={FIELD_INPUT_CLASS}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                  {isLoading ? "Gerando..." : "Gerar novamente"}
                </button>
              </div>

              {copyError && <p className="text-sm text-red-600">{copyError}</p>}
            </div>
          )}
          {error && (
            <p className="animate-fade-in rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className={FIELD_LABEL_CLASS}>Histórico recente</h2>
            <span className="text-xs text-slate-400">
              {history.length} {history.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <ul className="flex max-h-80 flex-col divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleRestore(item)}
                  aria-label={`Restaurar geração de ${getTaskLabel(item.task)}`}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">
                      {getTaskLabel(item.task)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {item.createdAt.toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {previewText(item.context)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {previewText(item.response)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
