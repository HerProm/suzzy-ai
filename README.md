# SUZZY AI

## Objetivo do MVP

Criar uma assistente inteligente para corretores de imóveis, com foco em validação rápida de um produto útil e simples.

## Stack utilizada

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Prettier

## Pré-requisitos

- Node.js 20 ou superior
- npm

## Como instalar

```bash
npm install
```

## Como executar localmente

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Script           | Descrição                                    |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Inicia o servidor de desenvolvimento          |
| `npm run build`  | Gera a build de produção                      |
| `npm run start`  | Inicia a aplicação a partir da build gerada   |
| `npm run lint`   | Executa a verificação de lint (ESLint)        |
| `npm run format` | Formata o código do projeto (Prettier)        |

## Estrutura resumida de pastas

```
suzzy-ai/
├── app/          # Rotas e páginas (App Router)
├── components/   # Componentes de interface reutilizáveis
├── hooks/        # Hooks customizados do React
├── lib/          # Funções utilitárias e helpers
├── services/     # Camada de integração com serviços externos
├── types/        # Definições de tipos TypeScript
├── public/       # Arquivos estáticos
└── docs/         # Documentação do projeto
```
