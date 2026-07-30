"use client";

import { useState } from "react";
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

export function useGenerationHistory({
  setContext,
  setSelectedTask,
  setResponse,
  clearSelectedTemplate,
}: UseGenerationHistoryOptions) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
