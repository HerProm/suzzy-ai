# Sprint 6 — Histórico de Gerações

Objetivo:
Permitir que o usuário visualize e reutilize respostas geradas anteriormente.

Escopo:

1. Criar a documentação da sprint. — concluída
2. Criar estrutura de histórico no frontend. — concluída
3. Salvar automaticamente cada geração. — concluída
4. Exibir lista das gerações recentes. — concluída
5. Permitir restaurar uma geração ao clicar. — concluída
6. Validar funcionamento. — concluída
7. Atualizar documentação e concluir a sprint. — concluída

Critérios de aceite:

- Cada geração é armazenada no histórico.
- O histórico exibe contexto, tipo de tarefa e data.
- Ao selecionar um item, contexto, tarefa e resposta são restaurados.
- Nenhuma integração com banco de dados nesta sprint.
- O histórico existe apenas durante a sessão da página.

## Resultado da validação

Validação realizada com sucesso em 2026-07-29:

- Estrutura de histórico (`HistoryItem` e estado `history`) criada no frontend, em `components/dashboard-form.tsx`.
- Cada geração bem-sucedida salva automaticamente uma nova entrada no histórico.
- O botão "Gerar novamente" reutiliza o mesmo fluxo de geração e também cria uma nova entrada.
- O histórico só é exibido na interface quando existem itens (`history.length > 0`).
- Cada item exibe tipo de tarefa (label amigável), data/hora (`pt-BR`), prévia do contexto e prévia da resposta.
- Itens do histórico são selecionáveis (botão acessível) e restauram contexto, tarefa e resposta no formulário.
- A restauração não chama a API e não cria uma nova entrada no histórico.
- O histórico é mantido apenas em memória (estado do componente), sem `localStorage` e sem banco de dados.
- `npm run lint`: aprovado.
- `npm run build`: aprovado.
- Validação estática do código (revisão manual dos requisitos acima): concluída sem problemas.
- **Sprint 6: concluída.**
