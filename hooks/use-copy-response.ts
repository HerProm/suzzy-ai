"use client";

import { useEffect, useRef, useState } from "react";

const COPY_ERROR_MESSAGE = "Não foi possível copiar o texto. Tente novamente.";
const COPY_FEEDBACK_DURATION_MS = 2000;

export function useCopyResponse() {
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = null;
      }
    };
  }, []);

  async function handleCopy(text: string) {
    if (text.trim() === "") return;

    try {
      await navigator.clipboard.writeText(text);
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

  function resetCopyFeedback() {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }

    setCopyLabel("Copiar");
    setCopyError(null);
  }

  return {
    copyLabel,
    copyError,
    handleCopy,
    resetCopyFeedback,
  };
}
