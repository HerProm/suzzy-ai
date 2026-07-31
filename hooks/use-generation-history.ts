"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/ai/tasks";

export type HistoryItem = {
  id: string;
  context: string;
  task: Task;
  response: string;
  createdAt: Date;
};

type NewHistoryEntry = {
  context: string;
  task: Task;
  response: string;
};

type UseGenerationHistoryOptions = {
  setContext: (context: string) => void;
  setSelectedTask: (task: Task) => void;
  setResponse: (response: string) => void;
  clearSelectedTemplate: () => void;
};

const HISTORY_STORAGE_KEY = "suzzy-ai:generation-history";

function isStoredHistoryItem(value: unknown): value is HistoryItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.context === "string" &&
    typeof item.task === "string" &&
    typeof item.response === "string" &&
    typeof item.createdAt === "string" &&
    !Number.isNaN(new Date(item.createdAt).getTime())
  );
}

function loadStoredHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isStoredHistoryItem)
      .map((item) => ({ ...item, createdAt: new Date(item.createdAt) }));
  } catch {
    return [];
  }
}

export function useGenerationHistory({
  setContext,
  setSelectedTask,
  setResponse,
  clearSelectedTemplate,
}: UseGenerationHistoryOptions) {
  const [history, setHistory] = useState<HistoryItem[]>(loadStoredHistory);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignora falhas de gravação (ex.: quota excedida ou localStorage
      // indisponível) para não interromper o uso da aplicação.
    }
  }, [history]);

  function addHistoryItem(entry: NewHistoryEntry) {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...entry,
    };
    setHistory((currentHistory) => [newItem, ...currentHistory]);
  }

  function restoreHistoryItem(item: HistoryItem) {
    setContext(item.context);
    setSelectedTask(item.task);
    setResponse(item.response);
    clearSelectedTemplate();
  }

  return {
    history,
    addHistoryItem,
    restoreHistoryItem,
  };
}
