import Link from "next/link";
import { SuzzyAssistChat } from "@/components/suzzy-assist-chat";

const PROBLEMS = [
  {
    emoji: "💬",
    title: "Responder muitas mensagens",
    description:
      "O volume de contatos diários dificulta dar atenção de qualidade a cada lead.",
  },
  {
    emoji: "🤔",
    title: "Lidar com objeções dos clientes",
    description:
      "Nem sempre é fácil encontrar a resposta certa na hora certa durante uma negociação.",
  },
  {
    emoji: "⏰",
    title: "Lembrar e preparar follow-ups",
    description:
      "É fácil perder o timing de retomar contato com quem já demonstrou interesse.",
  },
  {
    emoji: "✍️",
    title: "Escrever respostas repetidas",
    description:
      "Muito tempo é gasto redigindo mensagens parecidas para situações parecidas.",
  },
  {
    emoji: "😰",
    title: "Insegurança durante negociações",
    description:
      "Faltam, às vezes, uma estratégia clara e a confiança para conduzir a conversa.",
  },
];

const STEPS = [
  {
    title: "Descreva o contexto",
    description: "Explique rapidamente a situação do cliente.",
  },
  {
    title: "Escolha o cenário",
    description: "Informe em qual etapa da negociação o cliente está.",
  },
  {
    title: "Escolha a objeção",
    description:
      "Selecione a principal dúvida ou resistência apresentada pelo cliente.",
  },
  {
    title: "Receba uma resposta estratégica",
    description:
      "Receba uma resposta pronta, recomendações de negociação e o próximo passo sugerido.",
  },
];

const PILLARS = [
  {
    emoji: "💬",
    title: "Atendimento Inteligente",
    description:
      "Gere respostas profissionais em segundos utilizando o contexto da conversa, o cenário do atendimento e a situação do cliente.",
  },
  {
    emoji: "🤝",
    title: "Negociação Estratégica",
    description:
      "Receba sugestões para lidar com objeções, conduzir negociações e identificar o próximo passo ideal em cada atendimento.",
  },
  {
    emoji: "🎯",
    title: "Orientação Comercial",
    description:
      "Além da resposta pronta, a SUZZY AI explica por que aquela estratégia foi sugerida, ajudando você a evoluir como profissional.",
  },
];

const BENEFITS = [
  {
    emoji: "⏱️",
    title: "Economia de tempo",
    description:
      "Reduza o tempo gasto escrevendo respostas repetitivas e organizando follow-ups.",
  },
  {
    emoji: "✅",
    title: "Comunicação profissional",
    description:
      "Envie respostas claras, organizadas e adaptadas para cada situação do cliente.",
  },
  {
    emoji: "🤝",
    title: "Apoio na negociação",
    description:
      "Receba sugestões para conduzir objeções e definir o próximo passo da negociação.",
  },
  {
    emoji: "📈",
    title: "Mais produtividade",
    description:
      "Atenda mais clientes com qualidade, mantendo um padrão profissional em todos os atendimentos.",
  },
];

const AUDIENCES = [
  {
    emoji: "👤",
    title: "Corretor Autônomo",
    description:
      "Ideal para profissionais que desejam responder clientes mais rapidamente, organizar seus atendimentos e negociar com mais segurança.",
  },
  {
    emoji: "🏢",
    title: "Pequenas Imobiliárias",
    description:
      "Perfeita para equipes que desejam padronizar o atendimento, aumentar a produtividade e oferecer uma experiência mais profissional aos clientes.",
  },
];

const PLAN_FEATURES = [
  "Respostas com IA",
  "Cenários de atendimento",
  "Objeções",
  "Estratégias de negociação",
  "Histórico",
  "Atualizações futuras",
];

type Faq = {
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

const FAQS: Faq[] = [
  {
    question: "A SUZZY AI substitui o corretor?",
    answer:
      "Não.\nA SUZZY AI foi criada para apoiar o corretor durante o atendimento e as negociações.\nA decisão final sempre é do profissional.",
    link: { href: "/ia", label: "Saiba mais sobre como usamos IA" },
  },
  {
    question: "Preciso instalar algum programa?",
    answer: "Não.\nA SUZZY AI funciona diretamente pelo navegador.",
  },
  {
    question: "Posso testar gratuitamente?",
    answer: "Sim.\nVocê pode experimentar gratuitamente durante 15 dias.",
  },
  {
    question: "Preciso informar cartão de crédito?",
    answer: "Não.\nO teste gratuito não exige cartão.",
  },
  {
    question: "Meus dados ficam protegidos?",
    answer: "Utilizamos autenticação segura para proteger o acesso à plataforma.",
    link: { href: "/privacidade", label: "Leia nossa Política de Privacidade" },
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            SUZZY AI
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a
              href="#recursos"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Como funciona
            </a>
            <a
              href="#planos"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Planos
            </a>
            <a
              href="#perguntas-frequentes"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Perguntas frequentes
            </a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Entrar
          </Link>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 py-16 sm:py-24 lg:flex-row lg:items-center lg:gap-16 lg:py-32">
          <div className="flex max-w-xl flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              A Inteligência Artificial criada para Corretores de Imóveis.
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Responda clientes com mais rapidez, conduza negociações com
              estratégia e economize horas de trabalho toda semana.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Experimente gratuitamente por 15 dias
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Entrar
              </Link>
            </div>
          </div>

          <div className="w-full max-w-lg lg:max-w-none lg:flex-1">
            <div
              aria-hidden="true"
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl"
            >
              <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="flex flex-col gap-4 p-6">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-24 rounded-lg border border-slate-200 bg-white" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 rounded-lg border border-slate-200 bg-white" />
                  <div className="h-16 rounded-lg border border-slate-200 bg-white" />
                </div>
                <div className="h-10 w-1/2 rounded-lg bg-slate-900/90" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problema" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              O dia do corretor já é corrido demais.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              Entre atender clientes, acompanhar negociações e não deixar
              nenhum lead esfriar, sobra pouco tempo para o que realmente
              gera resultado. Grande parte desse tempo é consumido por
              tarefas repetitivas de atendimento e negociação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROBLEMS.map((problem) => (
              <div
                key={problem.title}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5"
              >
                <span aria-hidden="true" className="text-2xl">
                  {problem.emoji}
                </span>
                <p className="text-sm font-medium text-slate-900">
                  {problem.title}
                </p>
                <p className="text-sm text-slate-600">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="recursos" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Uma IA especializada para transformar seu atendimento.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              A SUZZY AI foi desenvolvida exclusivamente para o mercado
              imobiliário, ajudando corretores a responder clientes com mais
              rapidez, conduzir negociações com segurança e tomar decisões
              mais estratégicas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6"
              >
                <span aria-hidden="true" className="text-2xl">
                  {pillar.emoji}
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {pillar.title}
                </p>
                <p className="text-sm text-slate-600">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Comece a usar em poucos minutos.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              Você não precisa aprender um sistema complexo. Basta informar o
              contexto do atendimento e a SUZZY AI faz o restante.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div
              aria-hidden="true"
              className="absolute top-6 right-0 left-0 hidden h-px bg-slate-200 lg:block"
            />
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="relative flex flex-col items-start gap-3"
              >
                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {step.title}
                </p>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Mais tempo para vender. Mais segurança para negociar.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              Enquanto a SUZZY AI cuida da parte repetitiva do atendimento,
              você pode dedicar mais tempo ao que realmente importa:
              construir relacionamentos e fechar negócios.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <span aria-hidden="true" className="text-2xl">
                  {benefit.emoji}
                </span>
                <p className="text-sm font-medium text-slate-900">
                  {benefit.title}
                </p>
                <p className="text-sm text-slate-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="publico" className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Feita para quem vive o mercado imobiliário.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              A SUZZY AI foi desenvolvida pensando na rotina de quem atende
              clientes, conduz negociações e busca fechar mais negócios com
              organização e agilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {AUDIENCES.map((audience) => (
              <div
                key={audience.title}
                className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-6"
              >
                <span aria-hidden="true" className="text-2xl">
                  {audience.emoji}
                </span>
                <p className="text-base font-semibold text-slate-900">
                  {audience.title}
                </p>
                <p className="text-sm text-slate-600">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-24">
          <div className="flex flex-col gap-6 rounded-2xl border-2 border-slate-900 bg-slate-50 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              🚀 Programa Fundadores SUZZY AI
            </h2>
            <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
              A SUZZY AI está iniciando sua jornada ao lado dos primeiros
              corretores que acreditam em uma nova forma de atender, negociar
              e vender imóveis.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-slate-700 sm:text-base">
              <li className="flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                Preço de lançamento garantido por 12 meses.
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                Acesso antecipado às novas funcionalidades.
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden="true">✓</span>
                Participação mais próxima na evolução da plataforma.
              </li>
            </ul>
            <p className="text-sm font-medium text-slate-500">
              Oferta válida para os 100 primeiros assinantes.
            </p>
          </div>
        </div>
      </section>

      <section id="planos" className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Escolha o plano ideal para você.
            </h2>
            <p className="text-base text-slate-600 sm:text-lg">
              Comece gratuitamente por 15 dias. Sem cartão de crédito.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-6 rounded-2xl border-2 border-slate-900 bg-white p-8 shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-500">
                    Corretor Autônomo
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    🟢 Disponível agora
                  </span>
                </div>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  R$ 97
                  <span className="text-base font-normal text-slate-500">
                    /mês
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Após o período gratuito de 15 dias.
                </p>
              </div>

              <ul className="flex flex-col gap-2 text-sm text-slate-600">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-slate-900">
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                🚀 Experimente gratuitamente por 15 dias
              </Link>
            </div>

            <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-500">
                  Pequena Imobiliária
                </p>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  🟡 Em desenvolvimento
                </span>
              </div>

              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                R$ 247
                <span className="text-base font-normal text-slate-500">
                  /mês
                </span>
              </p>

              <p className="text-sm text-slate-600">
                Estamos preparando recursos específicos para equipes, como
                gestão de usuários e administração centralizada.
              </p>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-400 disabled:cursor-not-allowed"
              >
                Avise-me quando estiver disponível
              </button>
            </div>
          </div>
        </div>
      </section>

      <section
        id="perguntas-frequentes"
        className="border-t border-slate-200 bg-slate-50"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Perguntas frequentes
          </h2>

          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6"
              >
                <p className="text-base font-semibold text-slate-900">
                  {faq.question}
                </p>
                <p className="whitespace-pre-line text-sm text-slate-600">
                  {faq.answer}
                </p>
                {faq.link && (
                  <Link
                    href={faq.link.href}
                    className="text-sm font-medium text-slate-900 underline underline-offset-2 transition-colors hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {faq.link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center sm:py-24">
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Pronto para transformar seu atendimento?
          </h2>
          <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
            Experimente gratuitamente por 15 dias e descubra como a SUZZY AI
            pode ajudar você a atender melhor, negociar com mais segurança e
            vender mais.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            🚀 Experimente gratuitamente por 15 dias
          </Link>
          <p className="text-xs text-slate-500">
            Sem cartão de crédito • Sem compromisso
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center sm:items-start sm:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              SUZZY AI
            </span>
            <p className="text-sm text-slate-500">
              Inteligência Artificial para Corretores de Imóveis.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600 sm:justify-start">
            <Link
              href="/login"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Entrar
            </Link>
            <Link
              href="/termos"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/ia"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Transparência sobre IA
            </Link>
            <Link
              href="/cookies"
              className="transition-colors hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Cookies
            </Link>
          </nav>

          <p className="text-xs text-slate-400">
            © 2026 SUZZY AI. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <SuzzyAssistChat />
    </div>
  );
}
