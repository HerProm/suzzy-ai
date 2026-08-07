import Link from "next/link";
import { LegalPageLayout, LEGAL_H2, LEGAL_P, LEGAL_UL, LEGAL_LINK } from "@/components/legal-page-layout";

export default function AiTransparencyPage() {
  return (
    <LegalPageLayout title="Transparência sobre Inteligência Artificial">
      <section className="flex flex-col gap-3">
        <p className={LEGAL_P}>
          Este documento explica, em linguagem simples, como a SUZZY AI
          utiliza Inteligência Artificial (IA) e quais são os limites dessa
          tecnologia. Ele complementa a{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>{" "}
          e os{" "}
          <Link href="/termos" className={LEGAL_LINK}>
            Termos de Uso
          </Link>
          , e deve ser lido em conjunto com esses documentos.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>O que é a IA da SUZZY AI</h2>
        <p className={LEGAL_P}>
          A SUZZY AI utiliza inteligência artificial para auxiliar
          corretores de imóveis na criação de respostas para leads e
          clientes, follow-ups, tratamento de objeções, apoio em
          estratégias de negociação e orientação sobre possíveis próximos
          passos em um atendimento. A IA é o mecanismo por trás da geração
          desse conteúdo, mas a plataforma continua sendo, acima de tudo,
          uma ferramenta de apoio ao trabalho do corretor.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Como as respostas são produzidas</h2>
        <p className={LEGAL_P}>
          De forma simples, a resposta gerada pela IA leva em conta:
        </p>
        <ul className={LEGAL_UL}>
          <li>o contexto informado pelo corretor no momento da solicitação;</li>
          <li>
            a tarefa selecionada (por exemplo, responder um lead ou criar
            um follow-up);
          </li>
          <li>o cenário de atendimento, quando selecionado pelo corretor;</li>
          <li>a objeção do cliente, quando selecionada pelo corretor;</li>
          <li>
            estratégias internas de negociação relevantes para a situação,
            escolhidas automaticamente pela plataforma quando aplicável.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Não detalhamos publicamente os prompts internos, as instruções
          proprietárias ou os demais detalhes técnicos de como esses
          elementos são combinados.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Processamento por fornecedor externo</h2>
        <p className={LEGAL_P}>
          A geração das respostas utiliza tecnologia de um fornecedor
          externo especializado em inteligência artificial: a{" "}
          <strong>OpenAI</strong>. Isso significa que o conteúdo necessário
          para gerar a resposta solicitada (como o contexto informado pelo
          corretor e os demais elementos descritos acima) pode ser
          processado por esse fornecedor.
        </p>
        <p className={LEGAL_P}>
          Não afirmamos, neste documento, a localização geográfica dos
          servidores utilizados, prazos específicos de retenção de dados
          por esse fornecedor, certificações obtidas ou quaisquer condições
          contratuais não confirmadas para a conta da SUZZY AI — para mais
          detalhes sobre fornecedores e tratamento de dados, consulte a{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Limitações da IA</h2>
        <p className={LEGAL_P}>
          É importante que o corretor compreenda que a inteligência
          artificial tem limitações. A IA:
        </p>
        <ul className={LEGAL_UL}>
          <li>pode errar;</li>
          <li>pode interpretar o contexto informado de forma incorreta;</li>
          <li>
            pode produzir informações inadequadas à situação real do
            atendimento.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Por isso, as respostas geradas devem ser revisadas pelo corretor
          antes de qualquer uso. A decisão final de utilizar, adaptar ou
          enviar uma resposta a um cliente é sempre humana — nunca
          automática.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Resultados comerciais</h2>
        <p className={LEGAL_P}>A SUZZY AI não garante:</p>
        <ul className={LEGAL_UL}>
          <li>vendas;</li>
          <li>conversão de leads;</li>
          <li>fechamento de negócios;</li>
          <li>comissões ou qualquer outro resultado financeiro.</li>
        </ul>
        <p className={LEGAL_P}>
          O uso da plataforma é um apoio ao trabalho comercial do corretor,
          não uma promessa de resultado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Uso responsável</h2>
        <p className={LEGAL_P}>Ao utilizar a IA da SUZZY AI, o corretor deve:</p>
        <ul className={LEGAL_UL}>
          <li>revisar o conteúdo gerado antes de utilizá-lo;</li>
          <li>
            adaptar a resposta quando necessário para refletir a realidade
            do atendimento;
          </li>
          <li>não inserir dados pessoais desnecessários de clientes;</li>
          <li>
            evitar dados pessoais sensíveis quando não forem necessários e
            adequadamente fundamentados;
          </li>
          <li>
            não utilizar a IA para práticas ilegais, discriminatórias,
            fraudulentas ou abusivas.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Conteúdo especializado</h2>
        <p className={LEGAL_P}>
          As respostas produzidas pela SUZZY AI não substituem
          aconselhamento jurídico, financeiro, tributário ou qualquer outro
          serviço profissional especializado. Para essas áreas, o corretor
          (ou seu cliente) deve buscar um profissional habilitado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Supervisão humana</h2>
        <p className={LEGAL_P}>
          A SUZZY AI é uma ferramenta de apoio ao corretor. Ela não
          substitui a experiência, a responsabilidade ou o julgamento
          profissional do corretor perante seus clientes e o mercado
          imobiliário.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Evolução da tecnologia</h2>
        <p className={LEGAL_P}>
          Os modelos de inteligência artificial utilizados, os recursos
          disponíveis e o funcionamento da IA na plataforma podem evoluir ao
          longo do tempo, à medida que a SUZZY AI e a tecnologia de seus
          fornecedores avançam. Quando essas mudanças forem relevantes, este
          documento poderá ser atualizado.
        </p>
      </section>
    </LegalPageLayout>
  );
}
