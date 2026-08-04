export type StrategyCategory =
  | "Primeiro Contato"
  | "Follow-up"
  | "Negociação"
  | "Pós-visita"
  | "Fechamento";

export type RealEstateStrategy = {
  id: string;
  categoria: StrategyCategory;
  nome: string;
  descricao: string;
  recomendacao: string;
  objetivo: string;
};

export const REAL_ESTATE_STRATEGIES: RealEstateStrategy[] = [
  {
    id: "primeiro-contato-responder-rapidamente",
    categoria: "Primeiro Contato",
    nome: "Responder rapidamente",
    descricao: "Velocidade de resposta logo após o primeiro contato do lead.",
    recomendacao:
      "Responder preferencialmente nos primeiros minutos após o contato.",
    objetivo: "Aumentar as chances de engajamento do cliente.",
  },
  {
    id: "primeiro-contato-personalizar-abordagem",
    categoria: "Primeiro Contato",
    nome: "Personalizar a abordagem",
    descricao:
      "Adaptar a primeira mensagem ao imóvel e ao interesse específico do lead.",
    recomendacao:
      "Mencionar o imóvel ou anúncio específico que motivou o contato.",
    objetivo:
      "Gerar identificação imediata e evitar respostas genéricas.",
  },
  {
    id: "follow-up-intervalos-estrategicos",
    categoria: "Follow-up",
    nome: "Retomar contato em intervalos estratégicos",
    descricao: "Reengajar leads que pararam de responder.",
    recomendacao:
      "Reenviar mensagem curta após 2 ou 3 dias de silêncio, trazendo uma novidade ou pergunta objetiva.",
    objetivo:
      "Manter o relacionamento aquecido sem parecer inconveniente.",
  },
  {
    id: "follow-up-agregar-valor",
    categoria: "Follow-up",
    nome: "Agregar valor a cada follow-up",
    descricao: "Cada nova mensagem deve trazer algo novo ao cliente.",
    recomendacao:
      "Compartilhar uma informação nova (novo imóvel, condição ou dado de mercado) a cada retomada de contato.",
    objetivo:
      "Evitar follow-ups repetitivos que soam como cobrança.",
  },
  {
    id: "negociacao-reforcar-valor-antes-do-preco",
    categoria: "Negociação",
    nome: "Reforçar valor antes de negociar preço",
    descricao:
      "Apresentar os diferenciais do imóvel antes de entrar na discussão de valores.",
    recomendacao:
      "Destacar diferenciais do imóvel antes de discutir valores.",
    objetivo: "Evitar que a conversa fique focada apenas em desconto.",
  },
  {
    id: "negociacao-buscar-ganho-mutuo",
    categoria: "Negociação",
    nome: "Buscar ganho mútuo na negociação",
    descricao:
      "Conduzir a negociação como uma troca, não uma concessão unilateral.",
    recomendacao:
      "Ao ceder em um ponto, buscar algo em troca, como prazo, condição de pagamento ou data de mudança.",
    objetivo:
      "Chegar a um acordo satisfatório para as duas partes, preservando a margem do vendedor.",
  },
  {
    id: "pos-visita-colher-feedback",
    categoria: "Pós-visita",
    nome: "Colher feedback logo após a visita",
    descricao:
      "Buscar a percepção do cliente enquanto a experiência ainda está fresca.",
    recomendacao:
      "Enviar mensagem no mesmo dia perguntando o que mais e o que menos agradou no imóvel.",
    objetivo:
      "Identificar objeções reais antes que esfriem ou sejam esquecidas.",
  },
  {
    id: "pos-visita-reforcar-diferenciais-observados",
    categoria: "Pós-visita",
    nome: "Reforçar diferenciais observados na visita",
    descricao:
      "Retomar pontos positivos que o cliente destacou durante a visita.",
    recomendacao:
      "Mencionar especificamente os pontos que o cliente elogiou durante a visita.",
    objetivo: "Fortalecer a conexão emocional do cliente com o imóvel.",
  },
  {
    id: "fechamento-criar-senso-de-urgencia-real",
    categoria: "Fechamento",
    nome: "Criar senso de urgência real",
    descricao:
      "Comunicar prazos ou condições genuínas que favoreçam a decisão.",
    recomendacao:
      "Informar fatos reais, como outras propostas em análise ou prazos de condições especiais, sem exagerar.",
    objetivo: "Ajudar o cliente a avançar sem parecer manipulação.",
  },
  {
    id: "fechamento-confirmar-detalhes-antes-de-fechar",
    categoria: "Fechamento",
    nome: "Confirmar todos os detalhes antes de fechar",
    descricao:
      "Revisar valores, condições e documentação antes da assinatura.",
    recomendacao:
      "Fazer um checklist com o cliente confirmando valor, forma de pagamento, prazo e documentos pendentes.",
    objetivo:
      "Evitar surpresas de última hora que possam travar o negócio.",
  },
];

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
  "Primeiro Contato",
  "Follow-up",
  "Negociação",
  "Pós-visita",
  "Fechamento",
];

export type StrategyGroup = {
  categoria: StrategyCategory;
  estrategias: RealEstateStrategy[];
};

export const STRATEGIES_BY_CATEGORY: StrategyGroup[] =
  STRATEGY_CATEGORIES.map((categoria) => ({
    categoria,
    estrategias: REAL_ESTATE_STRATEGIES.filter(
      (strategy) => strategy.categoria === categoria,
    ),
  }));
