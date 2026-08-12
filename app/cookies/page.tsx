import Link from "next/link";
import { LegalPageLayout, LEGAL_H2, LEGAL_P, LEGAL_UL, LEGAL_LINK } from "@/components/legal-page-layout";

export default function CookiesPolicyPage() {
  return (
    <LegalPageLayout title="Cookies e Armazenamento Local">
      <section className="flex flex-col gap-3">
        <p className={LEGAL_P}>
          Este documento explica, de forma simples e transparente, quais
          cookies e mecanismos de armazenamento são realmente utilizados
          atualmente pela SUZZY AI. Ele complementa a{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          , os{" "}
          <Link href="/termos" className={LEGAL_LINK}>
            Termos de Uso
          </Link>{" "}
          e a página de{" "}
          <Link href="/ia" className={LEGAL_LINK}>
            Transparência sobre Inteligência Artificial
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Cookies necessários</h2>
        <p className={LEGAL_P}>
          A plataforma utiliza mecanismos de sessão relacionados à
          autenticação por meio do Supabase. Esses mecanismos são
          necessários para o login, a manutenção da sessão do usuário e o
          funcionamento do acesso autenticado à plataforma — sem eles, não
          é possível permanecer conectado à SUZZY AI.
        </p>
        <p className={LEGAL_P}>
          Não afirmamos, neste documento, nomes específicos de cookies,
          duração, domínio, características de criptografia ou outros
          detalhes técnicos não confirmados — esses mecanismos são geridos
          automaticamente pela biblioteca de autenticação utilizada.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Login com Google</h2>
        <p className={LEGAL_P}>
          Quando o usuário escolhe se autenticar utilizando sua conta
          Google, esse fornecedor também pode utilizar tecnologias e
          mecanismos próprios, conforme suas próprias políticas e
          funcionamento. Não detalhamos aqui características técnicas
          desses mecanismos, por não serem controlados pela SUZZY AI.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Armazenamento local</h2>
        <p className={LEGAL_P}>
          A versão atual da plataforma utiliza o{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
            localStorage
          </code>{" "}
          do navegador para armazenar o histórico de gerações do usuário.
          Sobre esse armazenamento:
        </p>
        <ul className={LEGAL_UL}>
          <li>ele fica no navegador/dispositivo do próprio usuário;</li>
          <li>
            pode ser perdido caso os dados de navegação do navegador sejam
            apagados;
          </li>
          <li>
            não existe, atualmente, sincronização desse histórico em um
            banco de dados próprio da aplicação — o histórico não é
            enviado a nenhum servidor.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Chats Suzzy Assist e Suzzy Support</h2>
        <p className={LEGAL_P}>
          A plataforma conta com dois assistentes de conversa (Suzzy
          Assist, público, na página inicial; e Suzzy Support, autenticado,
          no Dashboard — descritos em detalhe na{" "}
          <Link href="/privacidade" className={LEGAL_LINK}>
            Política de Privacidade
          </Link>
          ). Com base na auditoria técnica do projeto:
        </p>
        <ul className={LEGAL_UL}>
          <li>nenhum dos dois chats cria cookie próprio;</li>
          <li>
            nenhum dos dois chats usa{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
              localStorage
            </code>{" "}
            para guardar a conversa — cada conversa existe apenas na
            memória da página enquanto ela estiver aberta, e é perdida ao
            fechá-la ou recarregar;
          </li>
          <li>
            o controle de limite de uso desses chats (rate limiting, usado
            para prevenir abuso e conter custos) é feito inteiramente no
            servidor e não depende de cookie nem de armazenamento local;
          </li>
          <li>
            o mesmo mecanismo, também sem depender de cookie, protege a
            geração principal do Dashboard, usando o mesmo tipo de
            identificador interno de conta já usado pela Suzzy Support;
          </li>
          <li>
            o acesso à Suzzy Support continua dependendo dos mesmos
            mecanismos de sessão/autenticação já descritos acima — nenhum
            cookie ou mecanismo adicional foi introduzido para viabilizar
            esse chat.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Essa conclusão descreve o estado técnico atual do projeto,
          verificado por auditoria de código — não é, por si só, um parecer
          jurídico definitivo sobre a ausência de necessidade de banner de
          consentimento (ver seção abaixo).
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Analytics, publicidade e rastreamento</h2>
        <p className={LEGAL_P}>Na versão atual da plataforma:</p>
        <ul className={LEGAL_UL}>
          <li>não utilizamos cookies de publicidade;</li>
          <li>não utilizamos ferramentas de analytics;</li>
          <li>não utilizamos mecanismos de rastreamento (tracking) comercial.</li>
        </ul>
        <p className={LEGAL_P}>
          Esta seção descreve a versão atual da plataforma — incluindo os
          chats Suzzy Assist e Suzzy Support — e poderá ser atualizada caso
          novas tecnologias desse tipo sejam adicionadas no futuro.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Consentimento e banner de cookies</h2>
        <p className={LEGAL_P}>
          Com base na configuração técnica atual — na qual são utilizados
          apenas mecanismos necessários à autenticação e um armazenamento
          local de natureza funcional (histórico de gerações) — não
          implementamos, nesta etapa, um banner de consentimento nem um
          mecanismo de &quot;Aceitar todos&quot;. Cookies estritamente
          necessários ao funcionamento do serviço, em geral, não dependem
          desse tipo de banner.
        </p>
        <p className={LEGAL_P}>
          Esta conclusão preliminar deve ser revista caso a SUZZY AI passe a
          utilizar, futuramente, cookies de analytics, publicidade ou
          quaisquer outros cookies não essenciais.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Gerenciamento pelo usuário</h2>
        <p className={LEGAL_P}>
          O usuário pode, por meio das configurações do próprio navegador,
          apagar cookies e dados armazenados localmente. É importante saber
          que isso pode:
        </p>
        <ul className={LEGAL_UL}>
          <li>encerrar a sessão ativa na plataforma;</li>
          <li>remover o histórico local de gerações;</li>
          <li>afetar funcionalidades que dependem desses dados.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Alterações futuras</h2>
        <p className={LEGAL_P}>
          Este documento poderá ser atualizado caso a SUZZY AI passe a
          utilizar novas tecnologias de cookies, armazenamento local ou
          mecanismos semelhantes.
        </p>
      </section>
    </LegalPageLayout>
  );
}
