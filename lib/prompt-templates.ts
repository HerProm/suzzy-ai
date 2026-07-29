export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  context: string;
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "atendimento-inicial",
    name: "Atendimento inicial",
    description: "Primeiro contato com um lead que demonstrou interesse.",
    context:
      "Lead chegou pelo anúncio de um apartamento de 2 quartos no bairro Jardim das Flores, faixa de R$ 350.000. Ainda não conversamos, só sei o nome: Marina.",
  },
  {
    id: "follow-up",
    name: "Follow-up",
    description: "Retomar contato com um lead que ficou sem resposta.",
    context:
      "Cliente visitou a casa na Rua das Acácias há 5 dias e disse que ia pensar. Desde então não respondeu mais nenhuma mensagem.",
  },
  {
    id: "captacao-imovel",
    name: "Captação de imóvel",
    description: "Abordar um proprietário para captar um imóvel para venda.",
    context:
      "Proprietário anunciou um imóvel por conta própria em um portal online. Quero oferecer meus serviços de corretagem para ajudar na venda.",
  },
  {
    id: "anuncio-imovel",
    name: "Anúncio de imóvel",
    description: "Gerar um texto de anúncio para divulgar um imóvel.",
    context:
      "Casa térrea, 3 quartos (1 suíte), quintal amplo, garagem para 2 carros, bairro tranquilo próximo a escolas. Valor: R$ 480.000.",
  },
  {
    id: "negociacao",
    name: "Negociação",
    description: "Responder a uma contraproposta durante a negociação.",
    context:
      "Comprador ofereceu R$ 20.000 a menos que o valor anunciado, alegando que o imóvel precisa de reforma no telhado.",
  },
];
