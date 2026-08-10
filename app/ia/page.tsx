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

      <section className="flex flex-col gap-4">
        <h2 className={LEGAL_H2}>Onde a SUZZY AI usa Inteligência Artificial</h2>
        <p className={LEGAL_P}>A plataforma utiliza IA em três fluxos distintos:</p>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">Geração principal</h3>
          <p className={LEGAL_P}>
            O uso central da plataforma: a partir do contexto informado pelo
            corretor, da tarefa selecionada (por exemplo, responder um lead
            ou criar um follow-up) e, quando aplicável, do cenário e da
            objeção selecionados, a IA produz uma resposta ou recomendação
            para apoiar o atendimento.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">Suzzy Assist</h3>
          <p className={LEGAL_P}>
            Chat público, disponível na página inicial, que não exige login.
            Responde dúvidas informativas sobre a SUZZY AI — como a
            plataforma funciona, planos, uso geral — para visitantes que
            ainda não são usuários.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">Suzzy Support</h3>
          <p className={LEGAL_P}>
            Chat disponível no Dashboard, para usuários já autenticados.
            Orienta sobre como usar a plataforma (por exemplo, como
            preencher o contexto, escolher cenários e objeções, interpretar
            o histórico). A Suzzy Support orienta o usuário; quem executa é
            o próprio usuário — ela não realiza ações automaticamente no
            Dashboard em nome dele.
          </p>
        </div>

        <p className={LEGAL_P}>
          Nos três casos, a IA é o mecanismo por trás da geração do
          conteúdo, mas a plataforma continua sendo, acima de tudo, uma
          ferramenta de apoio ao trabalho do corretor.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Como as respostas são produzidas</h2>
        <p className={LEGAL_P}>
          <strong>Geração principal</strong>: de forma simples, a resposta
          gerada leva em conta:
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
          <strong>Suzzy Assist e Suzzy Support</strong>: funcionam de forma
          diferente da geração principal — não usam contexto, tarefa,
          cenário ou objeção. Cada uma responde com base na mensagem
          digitada pelo usuário naquele chat e no histórico recente da
          própria conversa, orientada por um conjunto interno de
          informações sobre a plataforma.
        </p>
        <p className={LEGAL_P}>
          Não detalhamos publicamente os prompts internos, as instruções
          proprietárias ou os demais detalhes técnicos de como esses
          elementos são combinados, em nenhum dos três usos.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Processamento por fornecedor externo</h2>
        <p className={LEGAL_P}>
          A geração de respostas nos três usos descritos acima utiliza
          tecnologia de um fornecedor externo especializado em inteligência
          artificial: a <strong>OpenAI</strong>. Isso significa que o
          conteúdo necessário para gerar cada resposta (o contexto e demais
          elementos da geração principal; ou a mensagem e o histórico
          recente da conversa, no caso da Suzzy Assist e da Suzzy Support)
          pode ser processado por esse fornecedor.
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
        <p className={LEGAL_P}>
          À parte do processamento de IA, a Suzzy Assist e a Suzzy Support
          também usam um mecanismo técnico de controle de limite de uso
          (rate limiting), operado por outro fornecedor, com a finalidade
          de prevenir abuso e conter custos — esse mecanismo não participa
          da geração das respostas em si. Detalhes sobre esse fornecedor e
          os identificadores usados estão na{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Limitações da IA</h2>
        <p className={LEGAL_P}>
          É importante que o usuário compreenda que a inteligência
          artificial tem limitações — nos três usos descritos acima. A IA:
        </p>
        <ul className={LEGAL_UL}>
          <li>pode errar;</li>
          <li>pode interpretar o contexto ou a pergunta de forma incorreta;</li>
          <li>
            pode produzir informações inadequadas à situação real.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Por isso, as respostas geradas devem ser revisadas pelo usuário
          antes de qualquer uso. A decisão final de utilizar, adaptar ou
          enviar uma resposta a um cliente é sempre humana — nunca
          automática. Em particular:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            a Suzzy Support orienta o uso da plataforma, mas não executa
            ações no Dashboard em nome do usuário;
          </li>
          <li>
            a Suzzy Assist informa sobre a SUZZY AI, mas não executa ações,
            navegação ou contato futuro em nome do visitante.
          </li>
        </ul>
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
