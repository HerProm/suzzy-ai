import Link from "next/link";
import {
  LegalPageLayout,
  LEGAL_H2,
  LEGAL_P,
  LEGAL_UL,
  LEGAL_LINK,
} from "@/components/legal-page-layout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Política de Privacidade">
      <section className="flex flex-col gap-3">
        <p className={LEGAL_P}>
          Esta Política de Privacidade explica, de forma simples e
          transparente, como a SUZZY AI trata os dados das pessoas que
          utilizam a plataforma. Ela se aplica a todos os usuários da SUZZY
          AI — uma assistente de inteligência artificial voltada a
          corretores de imóveis e pequenas imobiliárias, com lançamento
          inicial voltado ao Brasil.
        </p>
        <p className={LEGAL_P}>
          Esta Política foi elaborada com base na Lei Geral de Proteção de
          Dados Pessoais (Lei nº 13.709/2018 — LGPD) como referência
          principal, e descreve as práticas atualmente adotadas pela
          plataforma.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className={LEGAL_H2}>Quais dados podem ser tratados</h2>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">
            Dados de conta e autenticação
          </h3>
          <p className={LEGAL_P}>Para permitir o acesso à plataforma, podem ser tratados:</p>
          <ul className={LEGAL_UL}>
            <li>o e-mail utilizado no login;</li>
            <li>
              identificadores necessários para autenticação e manutenção da
              sessão;
            </li>
            <li>
              informações eventualmente disponibilizadas pelo provedor de
              login escolhido (ex.: Google), conforme as permissões
              concedidas pelo usuário naquele momento.
            </li>
          </ul>
          <p className={LEGAL_P}>
            Não garantimos que dados como nome ou foto de perfil sejam
            sempre coletados — isso depende das permissões concedidas pelo
            usuário ao provedor de login no momento do acesso.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">
            Conteúdo fornecido pelo usuário
          </h3>
          <p className={LEGAL_P}>
            Ao utilizar a plataforma, o corretor pode inserir, no campo de
            contexto, informações sobre o atendimento e a situação comercial
            em análise, para solicitar a geração de uma resposta pela IA. O
            corretor também pode selecionar, entre opções pré-definidas pela
            própria plataforma, a tarefa, o cenário e a objeção relacionados
            ao atendimento — essas seleções não são dados pessoais, são
            escolhas entre categorias já existentes no sistema.
          </p>
          <p className={LEGAL_P}>
            O usuário não deve inserir dados pessoais desnecessários, dados
            pessoais sensíveis, ou informações confidenciais de clientes
            quando isso não for necessário para o uso da plataforma. Veja a
            seção &quot;Responsabilidade do usuário&quot; para mais
            detalhes.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">
            Conteúdo gerado pela IA
          </h3>
          <p className={LEGAL_P}>
            A plataforma produz respostas e recomendações a partir das
            informações fornecidas pelo usuário (contexto, tarefa, cenário e
            objeção, quando aplicável) combinadas com recursos internos da
            própria aplicação (bibliotecas de cenários, objeções e
            estratégias de negociação pré-definidas). Esse conteúdo gerado
            não é, por si só, uma nova coleta de dados pessoais além do que
            já foi fornecido pelo usuário.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">Histórico local</h3>
          <p className={LEGAL_P}>
            Na versão atual da plataforma, o histórico de gerações
            (contexto, tarefa e resposta) é armazenado localmente no
            navegador do usuário, por meio da tecnologia{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
              localStorage
            </code>
            , e não é armazenado em uma tabela própria da aplicação no
            servidor. Essa afirmação descreve o funcionamento técnico atual
            e não deve ser generalizada para versões futuras da plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">
            Conversas com a Suzzy Assist e a Suzzy Support, e limites de uso
          </h3>
          <p className={LEGAL_P}>
            A plataforma conta com dois assistentes de conversa baseados em
            IA: a <strong>Suzzy Assist</strong>, chat público disponível na
            página inicial, que não exige login e processa apenas as
            mensagens digitadas pelo próprio visitante naquela conversa e o
            histórico recente da mesma conversa; e a{" "}
            <strong>Suzzy Support</strong>, chat disponível no Dashboard
            para usuários já autenticados, que processa apenas as mensagens
            digitadas pelo próprio usuário naquele chat e o histórico
            recente da mesma conversa — sem enviar automaticamente à IA o
            conteúdo do formulário de geração, o histórico de gerações, nome,
            e-mail ou identificador de conta.
          </p>
          <p className={LEGAL_P}>
            Em nenhum dos dois casos a conversa é salva em uma tabela
            própria da aplicação no servidor nem em{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
              localStorage
            </code>{" "}
            do navegador nesta versão — a conversa existe apenas enquanto a
            página estiver aberta e é perdida ao fechá-la ou recarregar.
          </p>
          <p className={LEGAL_P}>
            Para prevenir abuso e conter custos, a plataforma aplica limites
            técnicos de uso (rate limiting) também à geração principal, além
            desses dois chats, com base em um identificador diferente
            conforme o caso:
          </p>
          <ul className={LEGAL_UL}>
            <li>
              <strong>Suzzy Assist</strong>: o endereço IP do visitante,
              transformado em um valor de hash antes de ser usado como
              chave técnica — o IP original não é armazenado. Isso é uma
              técnica de pseudonimização, não de anonimização: o valor de
              hash ainda pode, em tese, ser associado a um IP conhecido,
              então não tratamos esse dado como anônimo.
            </li>
            <li>
              <strong>Suzzy Support e geração principal</strong>: um
              identificador interno já associado à conta do usuário
              autenticado, reaproveitado da própria autenticação, usado
              apenas como chave técnica de controle de limite.
            </li>
          </ul>
          <p className={LEGAL_P}>
            Esses identificadores são usados exclusivamente para aplicar os
            limites técnicos de uso descritos acima, nunca são enviados ao
            fornecedor de inteligência artificial e nunca são associados ao
            conteúdo das conversas ou das solicitações de geração.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-slate-900">
            Dados de perfil do corretor (cadastro)
          </h3>
          <p className={LEGAL_P}>
            O primeiro acesso à plataforma exige a conclusão de um cadastro
            de perfil, guardado em uma tabela própria da aplicação
            associada ao mesmo identificador da conta de autenticação — sem
            duplicar o e-mail. Podem ser tratados:
          </p>
          <ul className={LEGAL_UL}>
            <li>nome completo (obrigatório);</li>
            <li>
              número do CRECI e UF do CRECI (obrigatórios) —{" "}
              <strong>
                informados pelo próprio usuário, sem qualquer verificação
                automática contra o CRECI ou outro órgão regulador
              </strong>{" "}
              nesta versão da plataforma. Não afirmamos, em nenhum momento,
              que um CRECI exibido é válido, ativo ou foi conferido;
            </li>
            <li>cidade e estado de atuação (obrigatórios);</li>
            <li>
              tipo de atuação — corretor autônomo ou imobiliária
              (obrigatório);
            </li>
            <li>telefone/WhatsApp (opcional);</li>
            <li>
              registro de aceite dos Termos de Uso e da Política de
              Privacidade, com data/hora e a versão do documento aceita
              naquele momento;
            </li>
            <li>
              consentimento para receber comunicações de marketing
              (opcional, desmarcado por padrão e apresentado separadamente
              do aceite dos Termos e da Política — nunca é uma condição
              para usar a plataforma).
            </li>
          </ul>
          <p className={LEGAL_P}>
            Não coletamos o CPF do usuário nesta versão da plataforma — não
            há, hoje, uma finalidade concreta que justifique coletar esse
            dado. Enquanto o cadastro não for concluído, o acesso ao
            Dashboard e à geração de respostas fica bloqueado.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Finalidades</h2>
        <p className={LEGAL_P}>
          Os dados tratados pela SUZZY AI têm as seguintes finalidades,
          compatíveis com o funcionamento atual do sistema:
        </p>
        <ul className={LEGAL_UL}>
          <li>autenticar o usuário e permitir o acesso à plataforma;</li>
          <li>
            completar e manter o cadastro de perfil do corretor, exigido
            antes do acesso ao Dashboard e à geração de respostas;
          </li>
          <li>processar as solicitações de geração enviadas pelo usuário;</li>
          <li>
            produzir respostas e recomendações por meio de inteligência
            artificial;
          </li>
          <li>
            manter o histórico de gerações localmente no navegador do
            usuário, para sua própria conveniência;
          </li>
          <li>
            processar as mensagens trocadas com a Suzzy Assist e a Suzzy
            Support, para gerar respostas de apoio e orientação em tempo
            real;
          </li>
          <li>
            aplicar limites técnicos de uso (rate limiting) à geração
            principal e a esses dois chats, para prevenir abuso e conter
            custos operacionais;
          </li>
          <li>
            garantir a segurança e o funcionamento técnico da plataforma,
            quando aplicável.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Não realizamos, hoje, atividades de marketing direcionado, criação
          de perfil de comportamento (profiling), publicidade ou analytics
          de rastreamento.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Bases legais</h2>
        <p className={LEGAL_P}>
          Considerando a LGPD, as finalidades descritas acima podem se
          relacionar, em princípio, com as seguintes bases legais, sem
          prejuízo de análise jurídica específica:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            execução de contrato ou de procedimentos preliminares
            relacionados a contrato, para autenticação, acesso à plataforma
            e processamento das solicitações de geração;
          </li>
          <li>
            legítimo interesse, quando juridicamente adequado, para
            finalidades de segurança e funcionamento técnico da plataforma;
          </li>
          <li>cumprimento de obrigação legal ou regulatória, quando aplicável.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Fornecedores e terceiros</h2>
        <p className={LEGAL_P}>
          Para funcionar, a SUZZY AI utiliza os seguintes fornecedores
          tecnológicos:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            <strong>Supabase</strong> — utilizado para autenticação (login,
            manutenção de sessão e logout) e para armazenar os dados de
            perfil do corretor em uma tabela própria da aplicação,
            protegida por Row Level Security (RLS): cada usuário só
            consegue ler ou alterar sua própria linha de perfil;
          </li>
          <li>
            <strong>Google</strong> — utilizado apenas quando o usuário
            escolhe fazer login com sua conta Google, conforme as permissões
            concedidas por ele naquele momento;
          </li>
          <li>
            <strong>OpenAI</strong> — utilizado para o processamento das
            solicitações de inteligência artificial em três fluxos da
            plataforma: a geração principal, a Suzzy Assist (mensagens do
            chat público e o histórico recente da própria conversa) e a
            Suzzy Support (mensagens do chat autenticado e o histórico
            recente da própria conversa). Os identificadores usados para
            rate limiting (IP com hash, identificador de conta) não são
            enviados a esse fornecedor.
          </li>
          <li>
            <strong>Upstash</strong> — utilizado como infraestrutura de
            controle de limite de uso (rate limiting) da geração principal,
            da Suzzy Assist e da Suzzy Support, por meio de um banco de
            dados Redis gerenciado por esse fornecedor. Trata apenas os
            identificadores descritos acima e um contador numérico de uso —
            nunca o conteúdo do contexto informado, das respostas geradas ou
            das mensagens trocadas nos chats. O banco utilizado está
            configurado, na infraestrutura atual, na região de São Paulo,
            Brasil; essa informação é um dado técnico operacional, e não
            deve ser interpretada, por si só, como conclusão jurídica sobre
            residência ou transferência internacional de dados — ver seção
            &quot;Transferências internacionais&quot;.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Não informamos, neste momento, a localização geográfica dos
          servidores dos demais fornecedores, prazos específicos de
          retenção, certificações obtidas ou condições contratuais
          aplicáveis à conta da SUZZY AI.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Cookies e armazenamento local</h2>
        <p className={LEGAL_P}>A plataforma utiliza:</p>
        <ul className={LEGAL_UL}>
          <li>
            cookies ou mecanismos de sessão estritamente necessários à
            autenticação, geridos automaticamente pelo provedor de
            autenticação (Supabase), para manter o usuário conectado;
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">
              localStorage
            </code>{" "}
            do navegador, para manter o histórico local de gerações.
          </li>
        </ul>
        <p className={LEGAL_P}>
          A Suzzy Assist e a Suzzy Support não criam cookies próprios nem
          usam <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em]">localStorage</code> para
          guardar as conversas — o controle de limite de uso desses chats e
          da geração principal (rate limiting) é feito inteiramente no
          servidor, sem depender de nenhum mecanismo de armazenamento no
          navegador do usuário.
        </p>
        <p className={LEGAL_P}>
          Não utilizamos cookies de publicidade, rastreamento ou analytics.
          Uma análise mais detalhada está disponível em nossa{" "}
          <Link href="/cookies" className={LEGAL_LINK}>
            Política de Cookies e Armazenamento Local
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Retenção</h2>
        <p className={LEGAL_P}>
          Sobre o tempo de retenção dos dados tratados pela plataforma:
        </p>
        <ul className={LEGAL_UL}>
          <li>
            o histórico local de gerações permanece no dispositivo/navegador
            do usuário até que seja removido por ele, conforme os
            mecanismos disponíveis no próprio navegador;
          </li>
          <li>
            as conversas com a Suzzy Assist e a Suzzy Support não são
            retidas pela aplicação — existem apenas enquanto a página
            estiver aberta;
          </li>
          <li>
            os dados de perfil do corretor permanecem armazenados enquanto
            a conta existir; não há, nesta versão, exclusão automática por
            tempo nem um mecanismo de autoatendimento para apagá-los;
          </li>
          <li>
            os identificadores usados para rate limiting da geração
            principal, da Suzzy Assist e da Suzzy Support ficam armazenados
            no Upstash apenas pelo tempo técnico da própria janela de limite
            (contadores da janela curta expiram em cerca de 1 minuto;
            contadores diários expiram em cerca de 1 dia) — não configuramos
            retenção além do necessário para aplicar o limite;
          </li>
          <li>
            os dados processados pelos fornecedores externos (Supabase,
            Google, OpenAI, Upstash) estão sujeitos às práticas e
            configurações de retenção aplicáveis a cada um desses
            fornecedores;
          </li>
          <li>
            períodos específicos de retenção da sessão de autenticação e de
            eventuais dados tratados pelos fornecedores ainda precisam ser
            confirmados.
          </li>
        </ul>
        <p className={LEGAL_P}>
          Não estabelecemos, nesta versão do documento, um prazo de
          retenção próprio da SUZZY AI para dados de conta.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Direitos do titular</h2>
        <p className={LEGAL_P}>
          Nos termos da LGPD, quando aplicáveis, o titular dos dados pode
          exercer os seguintes direitos:
        </p>
        <ul className={LEGAL_UL}>
          <li>confirmação da existência de tratamento;</li>
          <li>acesso aos dados;</li>
          <li>
            correção de dados incompletos, inexatos ou desatualizados;
          </li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários,
            excessivos ou tratados em desconformidade com a LGPD, quando
            cabíveis;
          </li>
          <li>portabilidade dos dados, quando aplicável;</li>
          <li>
            informação sobre as entidades públicas e privadas com as quais o
            controlador realizou uso compartilhado de dados;
          </li>
          <li>
            revogação do consentimento, quando essa for a base legal
            utilizada para o tratamento;
          </li>
          <li>demais direitos previstos na legislação aplicável.</li>
        </ul>
        <p className={LEGAL_P}>
          Não existe, na versão atual da plataforma, um botão ou
          funcionalidade de autoatendimento para exclusão de conta ou do
          cadastro de perfil — uma solicitação de exclusão precisará ser
          tratada manualmente, quando o canal de contato estiver definido.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Responsabilidade do usuário</h2>
        <p className={LEGAL_P}>Ao utilizar a SUZZY AI, o corretor deve:</p>
        <ul className={LEGAL_UL}>
          <li>
            evitar inserir dados pessoais desnecessários de seus clientes no
            campo de contexto;
          </li>
          <li>
            não inserir dados pessoais sensíveis de clientes sem necessidade
            e sem uma base legal adequada para fazê-lo;
          </li>
          <li>
            possuir autorização ou base legal apropriada para qualquer
            informação de terceiros que decida inserir na plataforma;
          </li>
          <li>
            revisar cuidadosamente as respostas geradas pela IA antes de
            enviá-las a um cliente.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Inteligência Artificial</h2>
        <p className={LEGAL_P}>
          A SUZZY AI utiliza inteligência artificial para gerar respostas e
          recomendações. As respostas geradas podem conter erros,
          imprecisões ou inadequações, não substituem o julgamento
          profissional do corretor, e não há garantia de resultado
          comercial decorrente do uso das respostas ou recomendações
          geradas. Saiba mais em nossa página de{" "}
          <Link href="/ia" className={LEGAL_LINK}>
            Transparência sobre Inteligência Artificial
          </Link>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Segurança</h2>
        <p className={LEGAL_P}>
          Adotamos medidas técnicas e organizacionais compatíveis com o
          funcionamento atual da plataforma, sujeitas à evolução contínua do
          produto. Não declaramos segurança absoluta — nenhum sistema é
          inteiramente livre de riscos.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Transferências internacionais</h2>
        <p className={LEGAL_P}>
          Como a SUZZY AI utiliza fornecedores tecnológicos internacionais,
          poderá existir tratamento ou transferência internacional de
          dados, conforme a infraestrutura e os serviços efetivamente
          utilizados por esses fornecedores. Não indicamos, nesta versão do
          documento, países ou servidores específicos.
        </p>
        <p className={LEGAL_P}>
          Exceção operacional conhecida: o banco de dados Redis utilizado
          pelo Upstash para o rate limiting da geração principal, da Suzzy
          Assist e da Suzzy Support está configurado, na infraestrutura
          atual, na região de São Paulo, Brasil. Isso é registrado aqui
          apenas como informação
          técnica sobre a configuração atual do serviço — não representa,
          por si só, uma conclusão jurídica sobre onde os dados efetivamente
          residem, sob qual contrato, ou se ainda assim há transferência
          internacional. Este ponto específico também deve ser confirmado em
          revisão jurídica profissional.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={LEGAL_H2}>Alterações desta Política</h2>
        <p className={LEGAL_P}>
          Esta Política poderá ser atualizada conforme a plataforma evolua.
          Sempre que isso ocorrer, a data da versão vigente será indicada no
          início deste documento.
        </p>
      </section>
    </LegalPageLayout>
  );
}
