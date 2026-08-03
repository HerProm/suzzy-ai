export type ObjectionCategory =
  | "Preço"
  | "Financiamento"
  | "Tempo"
  | "Comparação"
  | "Decisão Familiar";

export type RealEstateObjection = {
  id: string;
  categoria: ObjectionCategory;
  nome: string;
  descricao: string;
  objetivoResposta: string;
};

export const REAL_ESTATE_OBJECTIONS: RealEstateObjection[] = [
  {
    id: "preco-esta-caro",
    categoria: "Preço",
    nome: "Está caro.",
    descricao: "O cliente considera o valor pedido pelo imóvel alto.",
    objetivoResposta:
      "Demonstrar valor, entender a comparação feita pelo cliente e evitar uma negociação baseada apenas em preço.",
  },
  {
    id: "preco-encontrei-mais-barato",
    categoria: "Preço",
    nome: "Encontrei mais barato.",
    descricao:
      "O cliente diz ter encontrado uma opção mais barata em outro imóvel.",
    objetivoResposta:
      "Entender o que está sendo comparado e destacar diferenciais que justificam o valor do imóvel.",
  },
  {
    id: "financiamento-esperar-juros",
    categoria: "Financiamento",
    nome: "Vou esperar os juros baixarem.",
    descricao:
      "O cliente quer adiar a decisão até que as taxas de juros melhorem.",
    objetivoResposta:
      "Mostrar o custo de esperar e ajudar o cliente a avaliar o cenário atual com segurança.",
  },
  {
    id: "financiamento-aprovacao-credito",
    categoria: "Financiamento",
    nome: "Não sei se meu financiamento será aprovado.",
    descricao:
      "O cliente está inseguro sobre sua capacidade de obter crédito.",
    objetivoResposta:
      "Tranquilizar o cliente e orientá-lo sobre os próximos passos para simular ou confirmar o crédito.",
  },
  {
    id: "tempo-vou-pensar",
    categoria: "Tempo",
    nome: "Vou pensar.",
    descricao: "O cliente adia a decisão sem dar um motivo específico.",
    objetivoResposta:
      "Entender a real objeção por trás da hesitação e manter o cliente engajado sem pressioná-lo.",
  },
  {
    id: "tempo-sem-pressa",
    categoria: "Tempo",
    nome: "Não tenho pressa.",
    descricao: "O cliente demonstra que não vê urgência em decidir agora.",
    objetivoResposta:
      "Respeitar o ritmo do cliente enquanto reforça o valor de agir e mantém o relacionamento aquecido.",
  },
  {
    id: "comparacao-visitar-outros-imoveis",
    categoria: "Comparação",
    nome: "Quero visitar outros imóveis.",
    descricao: "O cliente quer conhecer outras opções antes de decidir.",
    objetivoResposta:
      "Apoiar a decisão informada do cliente e reforçar os diferenciais do imóvel atual.",
  },
  {
    id: "comparacao-ainda-pesquisando",
    categoria: "Comparação",
    nome: "Ainda estou pesquisando.",
    descricao: "O cliente está no início do processo de comparação.",
    objetivoResposta:
      "Posicionar-se como referência confiável durante a pesquisa do cliente, sem parecer insistente.",
  },
  {
    id: "decisao-familiar-conversar-conjuge",
    categoria: "Decisão Familiar",
    nome: "Preciso conversar com meu esposo(a).",
    descricao:
      "O cliente precisa alinhar a decisão com o cônjuge antes de avançar.",
    objetivoResposta:
      "Facilitar essa conversa oferecendo informações claras que o cliente possa compartilhar com a família.",
  },
  {
    id: "decisao-familiar-decidir-com-familia",
    categoria: "Decisão Familiar",
    nome: "Vou decidir com a família.",
    descricao: "A decisão depende de um consenso entre vários familiares.",
    objetivoResposta:
      "Apoiar o processo de decisão em grupo, oferecendo-se para esclarecer dúvidas de todos os envolvidos.",
  },
];

export const OBJECTION_CATEGORIES: ObjectionCategory[] = [
  "Preço",
  "Financiamento",
  "Tempo",
  "Comparação",
  "Decisão Familiar",
];

export type ObjectionGroup = {
  categoria: ObjectionCategory;
  objecoes: RealEstateObjection[];
};

export const OBJECTIONS_BY_CATEGORY: ObjectionGroup[] =
  OBJECTION_CATEGORIES.map((categoria) => ({
    categoria,
    objecoes: REAL_ESTATE_OBJECTIONS.filter(
      (objection) => objection.categoria === categoria,
    ),
  }));
