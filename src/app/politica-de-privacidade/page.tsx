import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade | Comali",
  description: "Política de Privacidade da Comali - Como coletamos, utilizamos, armazenamos e protegemos os dados pessoais dos nossos clientes.",
}

export default function PoliticaPrivacidadePage() {
  return (
    <div className="container mx-auto px-4 py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
          Política de Privacidade
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Última atualização: 28 de maio de 2026
        </p>

        <div className="bg-white rounded-xl shadow-md p-8 space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">1. Introdução</h2>
            <p>
              A Comali valoriza a privacidade dos seus clientes, visitantes, parceiros e usuários que interagem com seus canais digitais. Esta Política de Privacidade explica como coletamos, utilizamos, armazenamos e protegemos os dados pessoais fornecidos em nosso site, em canais de atendimento, em formulários de contato, cotações, pedidos e formulários de geração de leads, incluindo formulários vinculados a campanhas no LinkedIn Ads.
            </p>
            <p className="mt-2">
              Esta Política de Privacidade se aplica aos dados pessoais coletados por meio do site <strong>comali.com.br</strong>, incluindo informações fornecidas em formulários de contato, cotações, pedidos, cadastro de clientes, navegação no site, atendimento por WhatsApp, e-mail, telefone, campanhas digitais e demais interações digitais.
            </p>
            <p className="mt-2">
              Esta política também se aplica aos dados pessoais fornecidos por usuários em formulários de geração de leads do LinkedIn Ads, também conhecidos como Lead Gen Forms, quando utilizados pela Comali em suas campanhas comerciais.
            </p>
            <p className="mt-2">
              Ao acessar ou utilizar nosso site, preencher formulários, solicitar cotações ou interagir com campanhas digitais da Comali, você declara estar ciente dos termos desta Política de Privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">2. Quais dados podemos coletar</h2>
            <p>Podemos coletar informações fornecidas diretamente pelo usuário ou geradas automaticamente durante a navegação no site e interação com nossos canais digitais.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nome completo ou razão social;</li>
              <li>E-mail e telefone de contato;</li>
              <li>Empresa, cargo, área de atuação ou segmento profissional, quando fornecidos em formulários comerciais ou campanhas digitais;</li>
              <li>CPF, CNPJ ou dados necessários para emissão fiscal, quando aplicável;</li>
              <li>Endereço de entrega e cobrança;</li>
              <li>Informações de pedidos, produtos adquiridos ou solicitados em cotação;</li>
              <li>Dados de navegação, como endereço IP, páginas acessadas, dispositivo e navegador utilizado;</li>
              <li>Mensagens enviadas por formulários, WhatsApp, e-mail ou canais de atendimento;</li>
              <li>Informações fornecidas ou confirmadas em formulários do LinkedIn Ads, conforme os campos exibidos no próprio formulário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">3. Dados coletados por formulários do LinkedIn Ads</h2>
            <p>
              Quando você preenche um formulário da Comali no LinkedIn Ads, a Comali pode receber os dados que você informou ou confirmou no próprio LinkedIn, como nome, e-mail, telefone, empresa, cargo, localidade, respostas a perguntas personalizadas e demais informações comerciais solicitadas no formulário.
            </p>
            <p className="mt-2">
              A Comali utiliza esses dados para responder à sua solicitação, entrar em contato, enviar orçamentos, apresentar produtos e serviços, qualificar o atendimento comercial e fornecer informações sobre soluções de higiene e limpeza profissional.
            </p>
            <p className="mt-2">
              Quando houver envio de comunicações promocionais, newsletters ou campanhas de marketing, a Comali utilizará os dados apenas quando houver base legal aplicável, consentimento ou permissão adequada. O usuário poderá solicitar o descadastramento, a revogação do consentimento ou a exclusão de seus dados pelos canais oficiais de atendimento da Comali.
            </p>
            <p className="mt-2">
              O LinkedIn também pode tratar dados pessoais conforme suas próprias políticas, termos e configurações de privacidade. Recomendamos que o usuário consulte a Política de Privacidade do LinkedIn para entender como a plataforma trata dados em seus serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">4. Como utilizamos seus dados</h2>
            <p>Os dados coletados podem ser utilizados para as seguintes finalidades:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Processar pedidos, orçamentos, entregas e solicitações comerciais;</li>
              <li>Entrar em contato com o cliente ou interessado para atendimento, suporte, cotação ou confirmação de informações;</li>
              <li>Apresentar produtos, serviços e soluções de higiene e limpeza profissional;</li>
              <li>Qualificar oportunidades comerciais recebidas por meio de formulários, campanhas digitais ou canais de atendimento;</li>
              <li>Emitir notas fiscais e cumprir obrigações legais e regulatórias;</li>
              <li>Melhorar a experiência de navegação e personalizar conteúdos do site;</li>
              <li>Enviar comunicações institucionais, promocionais ou informativas, quando permitido;</li>
              <li>Medir o desempenho de campanhas, anúncios e canais digitais;</li>
              <li>Prevenir fraudes, garantir segurança e proteger os direitos da Comali e de seus clientes.</li>
            </ul>
            <p className="mt-2">
              A Comali utiliza os dados pessoais apenas para finalidades legítimas, necessárias e compatíveis com a relação mantida com seus clientes e usuários.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">5. Uso de cookies</h2>
            <p>
              Nosso site pode utilizar cookies e tecnologias semelhantes para melhorar o funcionamento das páginas, analisar estatísticas de acesso, lembrar preferências do usuário, medir o desempenho de campanhas e oferecer uma experiência mais eficiente.
            </p>
            <p className="mt-2">
              Também podemos utilizar ferramentas de análise, mídia e marketing, como Google Analytics, Google Tag Manager, RD Station, pixels de publicidade ou tecnologias semelhantes, quando aplicável.
            </p>
            <p className="mt-2">
              O usuário pode configurar seu navegador para bloquear ou excluir cookies. No entanto, algumas funcionalidades do site podem ser afetadas caso os cookies sejam desativados.
            </p>
            <p className="mt-2">
              Quando exigido pela legislação aplicável, a Comali adotará mecanismos de informação e consentimento para o uso de cookies e tecnologias de rastreamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">6. Compartilhamento de dados</h2>
            <p>A Comali não vende dados pessoais de seus clientes, visitantes ou leads.</p>
            <p className="mt-2">
              O compartilhamento de informações pode ocorrer apenas quando necessário para a execução dos serviços, atendimento das finalidades descritas nesta política ou cumprimento de obrigações legais.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Empresas de transporte e logística para realização de entregas;</li>
              <li>Operadores de pagamento e instituições financeiras;</li>
              <li>Plataformas tecnológicas responsáveis pela hospedagem, segurança e funcionamento do site;</li>
              <li>Ferramentas de atendimento, CRM, automação de marketing, análise de dados e gestão de campanhas;</li>
              <li>Plataformas de anúncios e mídia, quando necessário para mensuração, integração ou gestão de campanhas;</li>
              <li>Autoridades públicas, quando houver obrigação legal ou solicitação válida.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">7. Segurança das informações</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os dados pessoais contra acessos não autorizados, perda, alteração, divulgação indevida ou uso inadequado.
            </p>
            <p className="mt-2">
              Embora sejam utilizados esforços razoáveis para manter a segurança das informações, nenhum sistema digital é totalmente imune a riscos. Por isso, recomendamos que os usuários também adotem boas práticas de segurança ao navegar na internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">8. Direitos do titular dos dados</h2>
            <p>De acordo com a Lei Geral de Proteção de Dados Pessoais — LGPD, o titular dos dados pode solicitar, quando aplicável:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Confirmação da existência de tratamento de dados pessoais;</li>
              <li>Acesso aos dados pessoais armazenados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;</li>
              <li>Revogação do consentimento, quando o tratamento depender de consentimento;</li>
              <li>Informações sobre compartilhamento de dados com terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">9. Retenção dos dados</h2>
            <p>
              Os dados pessoais serão mantidos pelo tempo necessário para cumprir as finalidades descritas nesta Política de Privacidade, respeitando obrigações legais, fiscais, regulatórias e prazos necessários para defesa de direitos.
            </p>
            <p className="mt-2">
              Quando os dados não forem mais necessários, poderão ser excluídos, anonimizados ou mantidos apenas quando houver base legal adequada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">10. Alterações nesta Política</h2>
            <p>
              Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças legais, operacionais ou tecnológicas.
            </p>
            <p className="mt-2">
              Recomendamos que o usuário consulte esta página regularmente. A data da última atualização estará sempre indicada no início desta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">11. Contato</h2>
            <p>Para dúvidas, solicitações ou exercício de direitos relacionados aos seus dados pessoais, entre em contato com a Comali pelos canais oficiais de atendimento.</p>
            <div className="mt-4 space-y-1">
              <p><strong>Comali</strong></p>
              <p>E-mail: <a href="mailto:atendimento@comali.com.br" className="text-cyan-600 hover:underline">atendimento@comali.com.br</a></p>
              <p>Telefone: <a href="tel:+554130295678" className="text-cyan-600 hover:underline">(41) 3029-5678</a></p>
              <p>WhatsApp: <a href="https://wa.me/5541987560649" className="text-cyan-600 hover:underline">(41) 98756-0649</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
