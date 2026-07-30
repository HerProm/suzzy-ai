"use client";

import { useState } from "react";
import { PROMPT_TEMPLATES } from "@/lib/prompt-templates";

export function usePromptTemplates(setContext: (context: string) => void) {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);

    if (templateId === "") return;

    const template = PROMPT_TEMPLATES.find((item) => item.id === templateId);

    if (template) {
      setContext(template.context);
    }
  }

  function clearSelectedTemplate() {
    setSelectedTemplateId("");
  }

  return {
    selectedTemplateId,
    handleTemplateChange,
    clearSelectedTemplate,
  };
}
