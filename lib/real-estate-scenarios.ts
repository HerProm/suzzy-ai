export type ScenarioCategory =
  | "Atendimento"
  | "Negociação"
  | "Captação"
  | "Marketing";

export type RealEstateScenario = {
  id: string;
  categoria: ScenarioCategory;
  nome: string;
  descricao: string;
};

export const REAL_ESTATE_SCENARIOS: RealEstateScenario[] = [
  {
    id: "primeiro-contato",
    categoria: "Atendimento",
    nome: "Primeiro contato",
    descricao:
      "Iniciar a conversa com um lead que acabou de demonstrar interesse em um imóvel.",
  },
  {
    id: "follow-up",
    categoria: "Atendimento",
    nome: "Follow-up",
    descricao:
      "Retomar contato com um lead que já demonstrou interesse, mas ainda não avançou na conversa.",
  },
  {
    id: "cliente-sem-resposta",
    categoria: "Atendimento",
    nome: "Cliente sem resposta",
    descricao:
      "Reengajar um cliente que parou de responder após alguma etapa do atendimento.",
  },
  {
    id: "confirmacao-de-visita",
    categoria: "Atendimento",
    nome: "Confirmação de visita",
    descricao:
      "Confirmar data, horário e detalhes de uma visita agendada ao imóvel.",
  },
  {
    id: "recebeu-proposta",
    categoria: "Negociação",
    nome: "Recebeu proposta",
    descricao: "Responder a uma proposta de compra recebida do cliente.",
  },
  {
    id: "contra-proposta",
    categoria: "Negociação",
    nome: "Contra-proposta",
    descricao: "Elaborar uma contraproposta em resposta à oferta do cliente.",
  },
  {
    id: "negociacao-de-preco",
    categoria: "Negociação",
    nome: "Negociação de preço",
    descricao: "Conduzir a negociação de valor entre comprador e vendedor.",
  },
  {
    id: "convencer-proprietario",
    categoria: "Captação",
    nome: "Convencer proprietário",
    descricao:
      "Argumentar com um proprietário para que ele autorize a captação do imóvel.",
  },
  {
    id: "solicitar-documentos",
    categoria: "Captação",
    nome: "Solicitar documentos",
    descricao:
      "Pedir ao proprietário os documentos necessários para formalizar a captação.",
  },
  {
    id: "criar-anuncio",
    categoria: "Marketing",
    nome: "Criar anúncio",
    descricao: "Gerar um texto de anúncio para divulgar um imóvel.",
  },
];

export const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  "Atendimento",
  "Negociação",
  "Captação",
  "Marketing",
];

export type ScenarioGroup = {
  categoria: ScenarioCategory;
  cenarios: RealEstateScenario[];
};

export const SCENARIOS_BY_CATEGORY: ScenarioGroup[] = SCENARIO_CATEGORIES.map(
  (categoria) => ({
    categoria,
    cenarios: REAL_ESTATE_SCENARIOS.filter(
      (scenario) => scenario.categoria === categoria,
    ),
  }),
);
