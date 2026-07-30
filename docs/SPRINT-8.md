# Sprint 8 — Organização da Arquitetura

Objetivo:
Refatorar a estrutura interna do dashboard sem alterar o comportamento da aplicação.

Escopo:

1. Criar a documentação da sprint.
2. Extrair a lógica dos templates para um hook.
3. Extrair a lógica do histórico para um hook.
4. Extrair a lógica de cópia para um hook.
5. Ajustar o dashboard para utilizar os hooks.
6. Validar que não houve alteração funcional.
7. Atualizar documentação e concluir a sprint.

Critérios de aceite:

- Nenhuma funcionalidade muda para o usuário.
- A lógica fica distribuída em hooks reutilizáveis.
- dashboard-form.tsx fica menor e mais focado na interface.
- npm run lint aprovado.
- npm run build aprovado.

## Status

Concluída em 2026-07-30.

## Resumo das mudanças realizadas

- Criação de `hooks/use-prompt-templates.ts`, centralizando a seleção de template e o preenchimento automático do contexto.
- Criação de `hooks/use-generation-history.ts`, centralizando o estado do histórico, a adição de novos itens e a restauração de um item selecionado.
- Criação de `hooks/use-copy-response.ts`, centralizando o rótulo do botão de cópia, o tratamento de erro e o timer do feedback "Copiado!".
- Redução das responsabilidades de `components/dashboard-form.tsx`, que passou a concentrar apenas o estado essencial (contexto, tarefa, resposta, loading, erro de geração), a chamada à API e a orquestração entre os três hooks.
- Nenhuma alteração funcional para o usuário: todos os fluxos (templates, geração, histórico, cópia e limpeza) foram validados por inspeção estática do código como equivalentes ao comportamento anterior à refatoração.

## Observação

Validação manual da interface pendente para o próximo ambiente disponível (localhost ou deploy).
