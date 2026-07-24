# CLAUDE.md

## Nome do projeto
SUZZY AI

## Objetivo do MVP
Criar uma assistente inteligente para corretores de imóveis, com foco em validação rápida de um produto útil e simples.

## Restrições permanentes
- O produto não é um CRM.
- Não criar funil, pipeline, gestão completa de leads ou cadastro complexo de imóveis.
- O MVP deve priorizar velocidade de validação sobre riqueza de funcionalidades.
- O prazo de MVP é de aproximadamente 20 dias.
- O usuário poderá informar o contexto manualmente em texto.

## Escopo aprovado do MVP
O MVP terá somente:
1. autenticação simples;
2. dashboard enxuto;
3. campo para contexto;
4. seleção da tarefa;
5. geração de resposta com IA;
6. histórico básico, apenas se não aumentar significativamente a complexidade.

## Tarefas iniciais aprovadas
- responder um lead;
- criar follow-up;
- gerar texto de anúncio;
- sugerir próximos passos.

## Regras de construção
- Manter a arquitetura simples, sem overengineering.
- Dividir todas as entregas em etapas pequenas.
- Nunca implementar uma funcionalidade grande sem confirmar antes.
- Preferir validação rápida com uma interface mínima e um fluxo útil.
- Evitar criação de módulos de gestão, cadastros extensivos ou automações complexas.

## Stack prevista
- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Arquitetura esperada
- Frontend simples em Next.js.
- Autenticação básica via Supabase.
- Persistência mínima de dados e histórico, apenas quando estiver bem justificada.
- Integração com IA por endpoint simples e objetivo claro.

## Definição de pronto para o MVP
O MVP estará pronto para validação quando:
- o usuário conseguir entrar com autenticação simples;
- abrir um dashboard enxuto;
- informar contexto em texto;
- escolher uma tarefa;
- receber resposta gerada por IA;
- ter uma experiência clara e rápida, sem dependências extras.

## Regra de trabalho
Toda implementação deve ser entregue em pequenas tarefas, com resumo ao final de cada etapa, e sem ampliar o escopo sem confirmação prévia.
