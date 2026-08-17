import Link from "next/link";
import { LegalPageLayout, LEGAL_H2, LEGAL_P, LEGAL_UL, LEGAL_LINK } from "@/components/legal-page-layout";

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout title="Termos de Uso">
      <section className="flex flex-col gap-3">
        <p className={LEGAL_P}>
          Estes Termos de Uso regulam o acesso e a utilização da plataforma
          SUZZY AI. O serviço é destinado, nesta fase inicial, ao mercado
          brasileiro. Ao acessar ou utilizar a SUZZY AI, o usuário declara
          estar de acordo com estes Termos e com a{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>O que é a SUZZY AI</h2>
        <p className={LEGAL_P}>
          A SUZZY AI é uma plataforma de inteligência artificial voltada ao
          apoio de corretores de imóveis no seu dia a dia comercial. Ela
          pode auxiliar em atividades como:
        </p>
        <ul className={LEGAL_UL}>
          <li>elaboração de respostas para leads e clientes;</li>
          <li>atendimento inicial a leads;</li>
          <li>follow-ups;</li>
          <li>tratamento de objeções apresentadas por clientes;</li>
          <li>apoio em estratégias de negociação;</li>
          <li>
            orientação sobre possíveis próximos passos em um atendimento.
          </li>
        </ul>
        <p className={LEGAL_P}>
          A SUZZY AI é uma ferramenta de apoio ao trabalho do corretor. Ela
          não substitui o corretor, sua atuação profissional, seu
          julgamento ou sua responsabilidade perante clientes e terceiros.
        </p>
        <p className={LEGAL_P}>
          A plataforma também disponibiliza dois assistentes de conversa
          baseados em IA, complementares à geração principal:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            <strong>Suzzy Assist</strong> — chat público, disponível na
            página inicial, que responde dúvidas informativas sobre a SUZZY
            AI (como funciona, planos, uso da plataforma) para quem ainda
            não é usuário. A Suzzy Assist não executa ações, navegação ou
            contato futuro em nome do visitante — ela apenas informa.
          </li>
          <li>
            <strong>Suzzy Support</strong> — chat disponível no Dashboard
            para usuários autenticados, que orienta sobre como usar a
            plataforma (por exemplo, como preencher o contexto, escolher
            cenários e objeções). A Suzzy Support orienta o usuário; quem
            executa é o próprio usuário — ela não realiza automaticamente
            ações no Dashboard em nome dele.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Assim como a geração principal, nenhum dos dois assistentes de
          conversa substitui o julgamento profissional do corretor, e ambos
          podem cometer erros.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Inteligência Artificial e limitações</h2>
        <p className={LEGAL_P}>
          Esta seção se aplica à geração principal da plataforma e também
          aos dois assistentes de conversa descritos acima (Suzzy Assist e
          Suzzy Support). A SUZZY AI utiliza inteligência artificial para
          gerar parte relevante do conteúdo oferecido ao usuário. É
          essencial que o usuário compreenda que:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            as respostas e recomendações são geradas por um modelo de
            inteligência artificial e podem conter erros, imprecisões ou
            recomendações inadequadas à situação real;
          </li>
          <li>
            o usuário deve revisar o conteúdo gerado antes de utilizá-lo,
            adaptá-lo ou enviá-lo a um cliente;
          </li>
          <li>
            a decisão de enviar, adaptar ou utilizar qualquer resposta
            gerada é exclusivamente do usuário;
          </li>
          <li>
            a SUZZY AI não garante fechamento de vendas, conversão de leads,
            comissões ou qualquer outro resultado comercial decorrente do
            uso da plataforma;
          </li>
          <li>o serviço não substitui o julgamento profissional do corretor;</li>
          <li>
            o conteúdo gerado não deve ser tratado como orientação jurídica,
            financeira, tributária ou técnica especializada.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Conta e acesso</h2>
        <p className={LEGAL_P}>
          O acesso à SUZZY AI é feito por meio dos mecanismos de
          autenticação disponíveis na plataforma. O usuário é responsável
          por:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            manter a confidencialidade e a segurança do acesso à sua conta;
          </li>
          <li>
            fornecer informações legítimas, quando aplicável, ao utilizar os
            mecanismos de autenticação disponíveis;
          </li>
          <li>
            a veracidade e a exatidão dos dados informados no cadastro de
            perfil, incluindo o número do CRECI — que é autodeclarado e não
            verificado pela plataforma;
          </li>
          <li>todas as atividades realizadas em sua conta.</li>
        </ul>
        <p className={LEGAL_P}>
          A SUZZY AI não utiliza uma senha própria armazenada pela
          aplicação — o acesso é intermediado pelos mecanismos de
          autenticação descritos na Política de Privacidade. O procedimento
          de exclusão de conta ainda não está implementado nesta versão da
          plataforma; quando definido, este documento e a Política de
          Privacidade serão atualizados.
        </p>
        <p className={LEGAL_P}>
          No primeiro acesso, o usuário precisa completar um cadastro de
          perfil (nome completo, CRECI e UF do CRECI, cidade e estado de
          atuação, tipo de atuação e, opcionalmente, telefone/WhatsApp)
          antes de utilizar o Dashboard e a geração de respostas.{" "}
          <strong>
            O número do CRECI informado é autodeclarado pelo próprio
            usuário
          </strong>{" "}
          — a SUZZY AI não verifica, confirma ou garante, perante o órgão
          regulador ou qualquer terceiro, que o CRECI informado é válido,
          ativo ou pertence de fato ao usuário; a responsabilidade pela
          veracidade dessa informação é exclusivamente do usuário.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Responsabilidades do usuário</h2>
        <p className={LEGAL_P}>Ao utilizar a SUZZY AI, o usuário é responsável por:</p>
        <ul className={LEGAL_UL}>
          <li>o contexto e as demais informações que inserir na plataforma;</li>
          <li>
            revisar as respostas geradas antes de enviá-las a qualquer
            cliente ou terceiro;
          </li>
          <li>utilizar a plataforma de forma lícita;</li>
          <li>respeitar os direitos de seus clientes e de terceiros;</li>
          <li>não inserir dados pessoais desnecessários de clientes;</li>
          <li>
            evitar a inserção de dados pessoais sensíveis quando não forem
            necessários e adequadamente fundamentados;
          </li>
          <li>
            possuir base legal ou autorização apropriada para qualquer
            informação de terceiros que decida inserir na plataforma;
          </li>
          <li>
            não utilizar a plataforma para fraude, discriminação, assédio,
            atividades ilícitas ou violação de direitos de terceiros.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Uso aceitável</h2>
        <p className={LEGAL_P}>Ao utilizar a SUZZY AI, o usuário concorda em não:</p>
        <ul className={LEGAL_UL}>
          <li>utilizar a plataforma para fins ilegais;</li>
          <li>tentar comprometer a segurança da plataforma;</li>
          <li>obter acesso não autorizado a contas, sistemas ou dados;</li>
          <li>fazer uso abusivo ou deliberadamente excessivo do serviço;</li>
          <li>utilizar a plataforma para violar direitos de terceiros;</li>
          <li>
            tentar contornar limitações técnicas ou controles de acesso da
            plataforma.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Dados e privacidade</h2>
        <p className={LEGAL_P}>
          O tratamento de dados pessoais pela SUZZY AI é detalhado na{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          , que integra estes Termos de Uso. Consulte-a para informações
          sobre quais dados podem ser tratados, os fornecedores tecnológicos
          envolvidos, o armazenamento local de dados no navegador e os
          direitos previstos pela LGPD.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Histórico local</h2>
        <p className={LEGAL_P}>
          Na versão atual da plataforma, o histórico de gerações (contexto,
          tarefa e resposta) é armazenado localmente no navegador do
          usuário. Isso significa que:
        </p>
        <ul className={LEGAL_UL}>
          <li>limpar os dados de navegação do navegador pode apagar esse histórico;</li>
          <li>
            trocar de dispositivo ou de navegador não transfere
            automaticamente o histórico;
          </li>
          <li>
            a SUZZY AI não promete, nesta versão, sincronização em nuvem do
            histórico nem sua recuperação caso seja perdido localmente.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Propriedade intelectual</h2>
        <p className={LEGAL_P}>
          A marca, a identidade visual, a interface, o software e os demais
          materiais próprios da SUZZY AI são protegidos e de titularidade da
          SUZZY AI ou de seus licenciantes, conforme aplicável. Nada nestes
          Termos transfere ao usuário direitos de propriedade intelectual
          sobre a plataforma além do necessário para sua utilização
          regular.
        </p>
        <p className={LEGAL_P}>
          O conteúdo inserido pelo usuário na plataforma continua sujeito
          aos direitos e responsabilidades que já lhe são aplicáveis fora da
          plataforma. Questões relativas a direitos de autoria e
          titularidade sobre conteúdo produzido por inteligência artificial
          ainda não possuem entendimento jurídico consolidado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Planos, teste gratuito e cobrança</h2>
        <p className={LEGAL_P}>
          A plataforma ainda não possui sistema de cobrança ou assinatura
          implementado.
        </p>
        <p className={LEGAL_P}>
          Há um planejamento comercial, comunicado na Landing Page, que
          inclui um período de teste gratuito de 15 dias e planos pagos
          apresentados publicamente (incluindo condições do &quot;Programa
          Fundadores&quot;). Até que o sistema de cobrança seja formalmente
          implementado:
        </p>
        <ul className={LEGAL_UL}>
          <li>essas informações não constituem obrigação contratual definitiva;</li>
          <li>não há meio de pagamento definido nestes Termos;</li>
          <li>não há cobrança automática implementada;</li>
          <li>não há política de reembolso definida;</li>
          <li>não há renovação automática implementada.</li>
        </ul>
        <p className={LEGAL_P}>
          A regulamentação comercial definitiva (preço final, forma e
          periodicidade de cobrança, renovação, cancelamento, reembolso e
          condições definitivas do Programa Fundadores) ainda será
          publicada assim que o sistema de assinatura for formalmente
          implementado.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Disponibilidade e evolução do serviço</h2>
        <p className={LEGAL_P}>
          A SUZZY AI poderá evoluir, receber melhorias, e ter funcionalidades
          adicionadas, alteradas ou descontinuadas ao longo do tempo. Não
          prometemos disponibilidade ininterrupta do serviço nem um acordo
          de nível de serviço (SLA) nesta versão dos Termos.
        </p>
        <p className={LEGAL_P}>
          Para proteger a segurança, a estabilidade e o funcionamento
          técnico da plataforma — incluindo a geração principal e os
          assistentes de conversa Suzzy Assist e Suzzy Support — a SUZZY AI
          pode aplicar limites técnicos de uso (rate limiting), como um
          número máximo de
          mensagens em um curto período de tempo ou ao longo de um dia.
          Esses limites existem para prevenir abuso e uso excessivo e para
          controlar a operação técnica do serviço, e não representam uma
          promessa de disponibilidade ilimitada.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Suspensão e encerramento</h2>
        <p className={LEGAL_P}>
          O acesso do usuário à plataforma poderá ser suspenso ou encerrado
          em situações como:
        </p>
        <ul className={LEGAL_UL}>
          <li>violação destes Termos de Uso;</li>
          <li>uso ilegal da plataforma;</li>
          <li>
            tentativa de comprometer a segurança ou o funcionamento da
            plataforma.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Limitação de responsabilidade</h2>
        <p className={LEGAL_P}>
          A SUZZY AI é uma ferramenta de apoio à atividade do corretor, cujo
          conteúdo gerado exige revisão humana antes de qualquer uso. Não
          há garantia de resultado comercial decorrente do uso da
          plataforma. A prestação do serviço depende, em parte, de serviços
          tecnológicos de terceiros, cuja disponibilidade não está sob
          controle exclusivo da SUZZY AI.
        </p>
        <p className={LEGAL_P}>
          Esta seção deve ser lida em conjunto com a legislação brasileira
          aplicável, inclusive o Código de Defesa do Consumidor quando
          cabível, e não pretende excluir direitos que não possam ser
          legalmente afastados.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Alterações destes Termos</h2>
        <p className={LEGAL_P}>
          Estes Termos poderão ser atualizados conforme a plataforma evolua,
          respeitando as obrigações legais aplicáveis. A data da versão
          vigente será indicada no início deste documento.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Legislação</h2>
        <p className={LEGAL_P}>Estes Termos são regidos pela legislação brasileira.</p>
      </section>
    </LegalPageLayout>
  );
}
