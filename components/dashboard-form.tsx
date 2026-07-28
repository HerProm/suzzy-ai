"use client";

import { useState } from "react";
import type { Task } from "@/lib/ai/tasks";

const TASKS: { id: Task; label: string }[] = [
  { id: "responder_lead", label: "Responder um lead" },
  { id: "criar_follow_up", label: "Criar follow-up" },
  { id: "gerar_anuncio", label: "Gerar texto de anúncio" },
  { id: "sugerir_proximos_passos", label: "Sugerir próximos passos" },
];

const NETWORK_ERROR_MESSAGE =
  "Não foi possível gerar a resposta no momento. Tente novamente.";

export function DashboardForm() {
  const [context, setContext] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = context.trim() === "" || selectedTask === null;

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
      } else {
        setError(data.error ?? NETWORK_ERROR_MESSAGE);
      }
    } catch {
      setError(NETWORK_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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

        <div aria-live="polite" className="flex flex-col gap-2">
          {response && (
            <div>
              <h2 className="font-medium">Resposta gerada</h2>
              <p>{response}</p>
            </div>
          )}
          {error && <p>{error}</p>}
        </div>
      </div>
    </div>
  );
}
