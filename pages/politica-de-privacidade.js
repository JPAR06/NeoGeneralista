export default function PoliticaDePrivacidade() {
  return (
    <div className="ycs-page">
      <header className="ycs-header">
        <div className="ycs-container ycs-header-row">
          <a className="ycs-logo" href="/">
            <img className="ycs-logo-lockup" src="/neogeneralista-logo-header.png" alt="NeoGeneralista" />
          </a>
          <nav className="ycs-nav" aria-label="Main navigation">
            <a href="/#about">Sobre</a>
            <a href="/algoritmo-humano">AlgoritmoHumano</a>
            <a href="/algoritmo-humano-v2">AlgoritmoHumano V2</a>
            <a href="/#contact">Contacto</a>
          </nav>
        </div>
      </header>

      <main className="ycs-legal-page">
        <div className="ycs-container">
          <h1>Política de Privacidade</h1>
          <p className="ycs-legal-updated">Última atualização: março de 2025</p>

          <section>
            <h2>1. Responsável pelo Tratamento</h2>
            <p>
              O responsável pelo tratamento dos seus dados pessoais é:
            </p>
            <p>
              <strong>NeoGeneralista</strong><br />
              Titular: Ana Azevedo<br />
              E-mail: <a href="mailto:ana@neogeneralista.pt">ana@neogeneralista.pt</a><br />
              Website: neogeneralista.pt
            </p>
          </section>

          <section>
            <h2>2. Dados Recolhidos e Finalidade</h2>
            <p>Recolhemos apenas os dados necessários para as seguintes finalidades:</p>
            <table className="ycs-legal-table">
              <thead>
                <tr>
                  <th>Dados</th>
                  <th>Finalidade</th>
                  <th>Base Jurídica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nome e endereço de e-mail</td>
                  <td>Envio de newsletter com conteúdos, eventos e novidades do NeoGeneralista</td>
                  <td>Consentimento (art. 6.º, n.º 1, al. a) do RGPD)</td>
                </tr>
                <tr>
                  <td>Endereço IP e dados de navegação</td>
                  <td>Funcionamento técnico do website (cookies de sessão estritamente necessários)</td>
                  <td>Interesse legítimo (art. 6.º, n.º 1, al. f) do RGPD)</td>
                </tr>
              </tbody>
            </table>
            <p>Não recolhemos dados sensíveis, não realizamos decisões automatizadas nem criação de perfis.</p>
          </section>

          <section>
            <h2>3. Subcontratantes e Transferências</h2>
            <p>
              Para o envio da newsletter, utilizamos o serviço <strong>Sender.net</strong> (UAB "Sender", Lituânia),
              que atua como subcontratante e processa os dados em conformidade com o RGPD.
              Os dados não são transferidos para países fora do Espaço Económico Europeu sem as garantias adequadas.
            </p>
            <p>Não partilhamos os seus dados com terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2>4. Prazo de Conservação</h2>
            <p>
              Os seus dados são conservados enquanto mantiver a subscrição da newsletter ativa.
              Após cancelamento da subscrição, os dados são eliminados no prazo de 30 dias.
            </p>
          </section>

          <section>
            <h2>5. Os Seus Direitos</h2>
            <p>Ao abrigo do RGPD e da Lei n.º 58/2019, tem os seguintes direitos:</p>
            <ul>
              <li><strong>Acesso</strong> — saber quais os dados que temos sobre si</li>
              <li><strong>Retificação</strong> — corrigir dados incorretos ou incompletos</li>
              <li><strong>Apagamento</strong> — solicitar a eliminação dos seus dados ("direito a ser esquecido")</li>
              <li><strong>Portabilidade</strong> — receber os seus dados num formato estruturado e legível</li>
              <li><strong>Oposição</strong> — opor-se ao tratamento para fins de marketing direto</li>
              <li><strong>Limitação</strong> — solicitar a suspensão do tratamento em determinadas circunstâncias</li>
              <li><strong>Retirada do consentimento</strong> — a qualquer momento, sem prejuízo da licitude do tratamento anterior</li>
            </ul>
            <p>
              Para exercer qualquer destes direitos, contacte-nos por e-mail:{" "}
              <a href="mailto:ana@neogeneralista.pt">ana@neogeneralista.pt</a>.
              Responderemos no prazo máximo de 30 dias.
            </p>
          </section>

          <section>
            <h2>6. Cookies</h2>
            <p>
              Este website utiliza apenas cookies técnicos estritamente necessários ao seu funcionamento.
              Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.
            </p>
          </section>

          <section>
            <h2>7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados contra
              acesso não autorizado, perda ou destruição, em conformidade com o art. 32.º do RGPD.
            </p>
          </section>

          <section>
            <h2>8. Reclamações</h2>
            <p>
              Se considerar que o tratamento dos seus dados viola o RGPD, tem o direito de apresentar
              reclamação à autoridade de controlo portuguesa:
            </p>
            <p>
              <strong>CNPD — Comissão Nacional de Proteção de Dados</strong><br />
              Website: <a href="https://www.cnpd.pt" target="_blank" rel="noreferrer">www.cnpd.pt</a>
            </p>
          </section>

          <section>
            <h2>9. Alterações a Esta Política</h2>
            <p>
              Reservamo-nos o direito de atualizar esta política. Em caso de alterações significativas,
              notificaremos os subscritores da newsletter. A data de última atualização é sempre indicada no topo desta página.
            </p>
          </section>
        </div>
      </main>

      <footer className="ycs-footer">
        <div className="ycs-container ycs-footer-bottom">
          <p>
            <a href="/politica-de-privacidade">Política de Privacidade</a>
          </p>
          <p>Copyright 2025 NeoGeneralista. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
