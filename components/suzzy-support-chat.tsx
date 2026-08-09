"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Olá! 👋 Eu sou a Suzzy Support. Posso te ajudar a usar a SUZZY AI, escolher cenários e objeções ou melhorar o contexto da sua solicitação.",
};

const MAX_CLIENT_HISTORY = 6;
const GENERIC_ERROR_MESSAGE =
  "Não consegui responder agora. Tente novamente em alguns instantes.";
const SESSION_EXPIRED_MESSAGE =
  "Sua sessão expirou. Entre novamente para continuar usando o suporte.";

function HelpIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.75c0 1.75-2.4 2-2.4 3.5" />
      <path d="M12 17.25h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

export function SuzzySupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleMessages = [GREETING, ...messages];

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const historyToSend = messages.slice(-MAX_CLIENT_HISTORY);

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: historyToSend }),
      });

      if (res.status === 401) {
        setError(SESSION_EXPIRED_MESSAGE);
        return;
      }

      const data = await res.json();

      if (res.ok) {
        setMessages((current) => [
          ...current,
          { role: "assistant", content: data.response },
        ]);
      } else {
        setError(GENERIC_ERROR_MESSAGE);
      }
    } catch {
      setError(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {isOpen ? (
        <div
          role="dialog"
          aria-label="Chat de suporte com a Suzzy Support"
          className="flex h-[min(32rem,calc(100vh-6rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Suzzy Support</span>
              <span className="text-xs text-slate-300">
                Suporte virtual com IA
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar chat de suporte"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {visibleMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-sm ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500">
                  Suzzy está pensando...
                </p>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-slate-200 p-3"
          >
            <label htmlFor="suzzy-support-input" className="sr-only">
              Escreva sua mensagem para a Suzzy Support
            </label>
            <input
              ref={inputRef}
              id="suzzy-support-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escreva sua dúvida..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || input.trim() === ""}
              aria-label="Enviar mensagem para o suporte"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de suporte com a Suzzy Support"
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <HelpIcon />
          Precisa de ajuda?
        </button>
      )}
    </div>
  );
}
