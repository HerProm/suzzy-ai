"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/ai/tasks";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";

const TASKS: { id: Task; label: string }[] = [
  { id: "responder_lead", label: "Responder um lead" },
  { id: "criar_follow_up", label: "Criar follow-up" },
  { id: "gerar_anuncio", label: "Gerar texto de anúncio" },
  { id: "sugerir_proximos_passos", label: "Sugerir próximos passos" },
];

type HistoryItem = {
  id: string;
  context: string;
  task: Task;
  response: string;
  createdAt: Date;
};

const NETWORK_ERROR_MESSAGE =
  "Não foi possível gerar a resposta no momento. Tente novamente.";
const COPY_ERROR_MESSAGE = "Não foi possível copiar o texto. Tente novamente.";
const COPY_FEEDBACK_DURATION_MS = 2000;
const HISTORY_PREVIEW_LENGTH = 80;

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
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const [copyError, setCopyError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDisabled = context.trim() === "" || selectedTask === null;
  const isCopyDisabled = !response || response.trim() === "";

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

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
          const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            context,
            task: selectedTask,
            response: data.response,
            createdAt: new Date(),
          };
          setHistory((currentHistory) => [newItem, ...currentHistory]);
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

  async function handleCopy() {
    if (isCopyDisabled || !response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopyError(null);
      setCopyLabel("Copiado!");

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopyLabel("Copiar");
        copyTimeoutRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      setCopyError(COPY_ERROR_MESSAGE);
    }
  }

  function handleClear() {
    if (isLoading) return;

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    setContext("");
    setSelectedTask(null);
    setResponse(null);
    setError(null);
    setCopyError(null);
    setCopyLabel("Copiar");
    setSelectedTemplateId("");
  }

  function handleRestore(item: HistoryItem) {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    setContext(item.context);
    setSelectedTask(item.task);
    setResponse(item.response);
    setError(null);
    setCopyError(null);
    setCopyLabel("Copiar");
    setSelectedTemplateId("");
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);

    if (templateId === "") return;

    const template = PROMPT_TEMPLATES.find((item) => item.id === templateId);

    if (template) {
      setContext(template.context);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="template" className="font-medium">
          Template
        </label>
        <select
          id="template"
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <option value="">Selecione um template</option>
          {PROMPT_TEMPLATES.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="context" className="font-medium">
          Contexto
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={6}
          className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-medium">Tarefa</legend>
        {TASKS.map(({ id, label }) => (
          <label key={id} className="flex items-center gap-2">
            <input
              type="radio"
              name="task"
              value={id}
              checked={selectedTask === id}
              onChange={() => setSelectedTask(id)}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={isDisabled || isLoading}
          onClick={handleGenerate}
          className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Gerando..." : "Gerar resposta"}
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleClear}
          className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
        >
          Limpar
        </button>

        <div aria-live="polite" className="flex flex-col gap-2">
          {response !== null && (
            <div className="flex flex-col gap-2">
              <label htmlFor="response" className="font-medium">
                Resposta gerada
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              <button
                type="button"
                disabled={isCopyDisabled}
                onClick={handleCopy}
                className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
              >
                {copyLabel}
              </button>
              {copyError && <p>{copyError}</p>}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className="rounded border px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
              >
                {isLoading ? "Gerando..." : "Gerar novamente"}
              </button>
            </div>
          )}
          {error && <p>{error}</p>}
        </div>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-medium">Histórico recente</h2>
          <ul className="flex flex-col gap-2">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleRestore(item)}
                  aria-label={`Restaurar geração de ${getTaskLabel(item.task)}`}
                  className="w-full rounded border px-4 py-2 text-left hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <p className="font-medium">{getTaskLabel(item.task)}</p>
                  <p>{item.createdAt.toLocaleString("pt-BR")}</p>
                  <p>{previewText(item.context)}</p>
                  <p>{previewText(item.response)}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
