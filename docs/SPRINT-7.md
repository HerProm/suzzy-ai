# Sprint 7 — Templates de Prompts

Objetivo:
Permitir que o usuário utilize modelos prontos para acelerar a criação de solicitações para a IA.

Escopo:

1. Criar a documentação da sprint. — concluída
2. Criar a estrutura dos templates. — concluída
3. Exibir um seletor de templates. — concluída
4. Preencher automaticamente o contexto ao selecionar um template. — concluída
5. Permitir edição livre do contexto após selecionar um template. — concluída
6. Validar funcionamento. — concluída
7. Atualizar documentação e concluir a sprint. — concluída

Critérios de aceite:

- Existem templates padrão disponíveis.
- O usuário pode selecionar um template.
- O contexto é preenchido automaticamente.
- O contexto continua totalmente editável.
- Nenhuma persistência em banco de dados nesta sprint.
- Templates definidos em código.

## Resultado da validação

Validação realizada com sucesso em 2026-07-29:

- Tipo `PromptTemplate` criado, com `id`, `name`, `description` e `context`.
- `PROMPT_TEMPLATES` criado em arquivo separado (`lib/prompt-templates.ts`).
- 5 templates voltados ao mercado imobiliário disponíveis (atendimento inicial, follow-up, captação de imóvel, anúncio de imóvel, negociação).
- Seletor de templates adicionado ao formulário (`components/dashboard-form.tsx`), com opção vazia "Selecione um template" e as demais opções vindas de `PROMPT_TEMPLATES`.
- Selecionar um template preenche automaticamente o campo de contexto.
- Trocar de template substitui o contexto anterior pelo do novo template.
- Selecionar a opção vazia não apaga o contexto atual.
- O contexto continua totalmente editável após o preenchimento automático.
- "Limpar" redefine o template selecionado para a opção vazia.
- Restaurar um item do histórico também redefine o template selecionado para a opção vazia.
- Selecionar um template não altera a tarefa selecionada, não chama a API e não cria entrada no histórico.
- Templates permanecem definidos apenas em código, sem persistência.
- Sem `localStorage` e sem banco de dados envolvidos nos templates.
- `npm run lint`: aprovado.
- `npm run build`: aprovado.
- Validação estática do código (revisão manual dos requisitos acima): concluída sem problemas.
- **Sprint 7: concluída.**
