import { useState } from "react";
import Link from "next/link";

const tabs = [
  { id: "latest", label: "Mais Recente" },
  { id: "conversas", label: "Conversas" },
  { id: "sobre", label: "Sobre" },
  { id: "equipa", label: "Equipa" },
  { id: "comunidade", label: "Comunidade" },
  { id: "patrocinadores", label: "Patrocinadores" },
  { id: "contacto", label: "Contacto" },
];

const conversas = [
  {
    tema: "Casa",
    orador: "Ana Ferreira",
    titulo: "O espaco que nos define",
    coracoes: 24,
    cor: "linear-gradient(135deg, #f5a623 0%, #f76b1c 100%)",
    data: "12 Jan 2025",
  },
  {
    tema: "Identidade",
    orador: "Miguel Santos",
    titulo: "Quem somos quando ninguem esta a ver",
    coracoes: 31,
    cor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    data: "9 Fev 2025",
  },
  {
    tema: "Liberdade",
    orador: "Sofia Carvalho",
    titulo: "Criar sem limites impostos",
    coracoes: 18,
    cor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    data: "8 Mar 2025",
  },
  {
    tema: "Resiliencia",
    orador: "Tiago Lopes",
    titulo: "Cair, levantar, recomecar",
    coracoes: 42,
    cor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    data: "13 Out 2024",
  },
  {
    tema: "Curiosidade",
    orador: "Ines Monteiro",
    titulo: "A pergunta que muda tudo",
    coracoes: 27,
    cor: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    data: "10 Nov 2024",
  },
  {
    tema: "Conexao",
    orador: "Pedro Alves",
    titulo: "Humano a humano, sempre",
    coracoes: 35,
    cor: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)",
    data: "8 Dez 2024",
  },
];

const posts = [
  {
    data: "8 Mar 2025",
    tema: "Liberdade",
    titulo: "AlgoritmoHumano #3: Liberdade — o que significa criar sem limites?",
    resumo:
      "Na terceira edicao do AlgoritmoHumano, Sofia Carvalho explorou como a liberdade criativa e muitas vezes auto-imposta — e como podemos desafiar as nossas proprias barreiras.",
    cor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    data: "9 Fev 2025",
    tema: "Identidade",
    titulo: "AlgoritmoHumano #2: Identidade — quem somos para alem do que fazemos?",
    resumo:
      "Miguel Santos trouxe uma conversa inesperada sobre como a identidade profissional pode ser simultaneamente uma ancora e uma prisao. Uma sala cheia, muitas perguntas.",
    cor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    data: "12 Jan 2025",
    tema: "Casa",
    titulo: "AlgoritmoHumano #1: Casa — o primeiro evento, as primeiras pessoas",
    resumo:
      "Comecamos com Casa. Ana Ferreira abriu o ciclo a falar sobre pertenca, espaco e o que significa sentirmo-nos em casa num mundo em constante mudanca.",
    cor: "linear-gradient(135deg, #f5a623 0%, #f76b1c 100%)",
  },
];

const membros = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  cor: ["#fcc225", "#f5a623", "#a18cd1", "#43e97b", "#fa709a", "#667eea", "#0ba360", "#38f9d7"][i % 8],
  iniciais: ["AF", "MS", "SC", "TL", "IM", "PA", "RR", "JM", "KL", "BN", "CD", "EF", "GH", "IJ", "OQ", "ST", "UV", "WX", "YZ", "AA", "BB", "CC", "DD", "EE"][i],
}));

export default function AlgoritmoHumano() {
  const [activeTab, setActiveTab] = useState("latest");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);

  const scrollTo = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 112;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleNotify = (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    setNotified(true);
    setNotifyEmail("");
    setTimeout(() => setNotified(false), 3500);
  };

  return (
    <div className="ah-page">

      {/* ── Top nav bar ── */}
      <header className="ah-topnav">
        <div className="ah-container ah-topnav-inner">
          <Link href="/" className="ah-topnav-logo">
            AlgoritmoHumano
          </Link>
          <div className="ah-topnav-right">
            <Link href="/" className="ah-topnav-back">
              ← NeoGeneralista
            </Link>
            <a href="#contacto" className="ah-topnav-btn" onClick={(e) => { e.preventDefault(); scrollTo("contacto"); }}>
              Contacto
            </a>
          </div>
        </div>
      </header>

      {/* ── Chapter cover banner ── */}
      <div className="ah-cover">
        <div className="ah-cover-bg" />
        <div className="ah-container ah-cover-content">
          <h1 className="ah-chapter-name">
            AlgoritmoHumano
            <span className="ah-chapter-city">/Porto</span>
          </h1>
        </div>
      </div>

      {/* ── Chapter identity row ── */}
      <div className="ah-identity-bar">
        <div className="ah-container ah-identity-inner">
          <div className="ah-identity-left">
            <div className="ah-host-avatar-wrap">
              <div className="ah-host-avatar">RM</div>
            </div>
            <div className="ah-host-info">
              <span className="ah-host-label">Porto host</span>
              <a href="#sobre" className="ah-host-name" onClick={(e) => { e.preventDefault(); scrollTo("sobre"); }}>
                Ana Azevedo
              </a>
            </div>
          </div>
          <div className="ah-identity-right">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ah-social-icon" aria-label="Instagram">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="ah-social-icon" aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="mailto:hello@yellowcreativestudio.net" className="ah-social-icon" aria-label="Email">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <polyline points="2,4 12,13 22,4"/>
              </svg>
            </a>
            <a
              href="#latest"
              className="ah-newsletter-btn"
              onClick={(e) => { e.preventDefault(); scrollTo("latest"); }}
            >
              Subscrever newsletter
            </a>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <nav className="ah-tabs-bar" aria-label="Secoes">
        <div className="ah-container ah-tabs-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ah-tab${activeTab === tab.id ? " ah-tab--active" : ""}`}
              onClick={() => scrollTo(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Latest / Next event ── */}
      <section className="ah-section" id="latest">
        <div className="ah-container">

          {/* Next event */}
          <div className="ah-next-speaker-wrap">
            <h2 className="ah-next-title">Proximo evento em Porto</h2>
            <div className="ah-next-card">
              <div className="ah-next-coming-soon">Em breve</div>
              <p className="ah-next-sub">
                Para saberes quando e o proximo AlgoritmoHumano, subscreve a{" "}
                <a
                  href="#latest"
                  className="ah-inline-link"
                  onClick={(e) => { e.preventDefault(); document.getElementById("ah-newsletter-form")?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  newsletter local
                </a>
                !
              </p>
              <form className="ah-next-form" id="ah-newsletter-form" onSubmit={handleNotify}>
                <input
                  type="email"
                  placeholder="O teu e-mail"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  required
                  className="ah-next-input"
                />
                <button type="submit" className="ah-next-submit">
                  Subscrever
                </button>
              </form>
              {notified && <p className="ah-next-feedback">Inscricao confirmada!</p>}
            </div>
          </div>

          {/* Divider */}
          <div className="ah-divider" />

          {/* Recent talks heading */}
          <h2 className="ah-section-heading">Conversas recentes</h2>
          <div className="ah-talks-grid">
            {conversas.map((c, i) => (
              <div key={i} className="ah-talk-card">
                <div className="ah-talk-thumb" style={{ background: c.cor }}>
                  <div className="ah-play-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                  <span className="ah-talk-tema">{c.tema}</span>
                </div>
                <div className="ah-talk-info">
                  <p className="ah-talk-orador">{c.orador}</p>
                  <p className="ah-talk-titulo">&ldquo;{c.titulo}&rdquo;</p>
                  <div className="ah-talk-meta">
                    <span className="ah-talk-data">{c.data}</span>
                    <span className="ah-talk-heart">&#9829; {c.coracoes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Conversas / Blog posts ── */}
      <section className="ah-section ah-section--gray" id="conversas">
        <div className="ah-container">
          <h2 className="ah-section-heading">Blog</h2>
          <div className="ah-posts-list">
            {posts.map((p, i) => (
              <article key={i} className="ah-post">
                <div className="ah-post-thumb" style={{ background: p.cor }} />
                <div className="ah-post-body">
                  <div className="ah-post-meta">
                    <span className="ah-post-tema-tag">{p.tema}</span>
                    <span className="ah-post-data">{p.data}</span>
                  </div>
                  <h3 className="ah-post-titulo">{p.titulo}</h3>
                  <p className="ah-post-resumo">{p.resumo}</p>
                  <a href="#" className="ah-post-read-more">Ler mais &rarr;</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre ── */}
      <section className="ah-section" id="sobre">
        <div className="ah-container ah-sobre-grid">
          <div className="ah-sobre-text">
            <h2 className="ah-sobre-title">Sobre o AlgoritmoHumano</h2>
            <p>
              O AlgoritmoHumano e um evento mensal gratuito organizado em Porto. Uma vez por mes,
              reunimos pessoas criativas, pensadoras e curiosas em torno de um tema que nos une a todos.
            </p>
            <p>
              Cada sessao tem um orador convidado, uma conversa aberta e muito espaco para ligacoes
              inesperadas. Sem jargao, sem hierarquias. Apenas ideias a circular entre pessoas com
              vontade de pensar.
            </p>
            <p>
              Inspirado no formato CreativeMornings, o AlgoritmoHumano e organizado por{" "}
              <strong>Ana Azevedo</strong>, fundadora do NeoGeneralista, e acontece
              sempre na segunda semana do mes.
            </p>
            <div className="ah-sobre-stats">
              <div className="ah-stat">
                <strong>+100</strong>
                <span>participantes</span>
              </div>
              <div className="ah-stat">
                <strong>6</strong>
                <span>edicoes</span>
              </div>
              <div className="ah-stat">
                <strong>Porto</strong>
                <span>cidade</span>
              </div>
            </div>
          </div>
          <div className="ah-sobre-img">
            <div className="ah-sobre-img-placeholder">
              <span>Foto do evento</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Equipa ── */}
      <section className="ah-section ah-section--gray" id="equipa">
        <div className="ah-container">
          <h2 className="ah-section-heading">Equipa</h2>
          <div className="ah-equipa-grid">
            <div className="ah-membro">
              <div className="ah-membro-avatar" style={{ background: "#fcc225" }}>RM</div>
              <div className="ah-membro-info">
                <p className="ah-membro-nome">Ana Azevedo</p>
                <p className="ah-membro-papel">Fundadora & Anfitria</p>
              </div>
            </div>
            <div className="ah-membro">
              <div className="ah-membro-avatar" style={{ background: "#e0e0e0" }}>?</div>
              <div className="ah-membro-info">
                <p className="ah-membro-nome">A Definir</p>
                <p className="ah-membro-papel">Curadoria de Conteudo</p>
              </div>
            </div>
            <div className="ah-membro">
              <div className="ah-membro-avatar" style={{ background: "#e0e0e0" }}>?</div>
              <div className="ah-membro-info">
                <p className="ah-membro-nome">A Definir</p>
                <p className="ah-membro-papel">Parcerias & Comunidade</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comunidade ── */}
      <section className="ah-section" id="comunidade">
        <div className="ah-container">
          <h2 className="ah-section-heading">Comunidade</h2>
          <p className="ah-section-sub">Pessoas que ja participaram num AlgoritmoHumano.</p>
          <div className="ah-comunidade-grid">
            {membros.map((m) => (
              <div key={m.id} className="ah-comunidade-av" style={{ background: m.cor }} title={m.iniciais}>
                {m.iniciais}
              </div>
            ))}
            <div className="ah-comunidade-av ah-comunidade-av--more">+</div>
          </div>
          <a
            href="#latest"
            className="ah-cta-link"
            onClick={(e) => { e.preventDefault(); scrollTo("latest"); }}
          >
            Junta-te a comunidade &rarr;
          </a>
        </div>
      </section>

      {/* ── Patrocinadores ── */}
      <section className="ah-section ah-section--gray" id="patrocinadores">
        <div className="ah-container ah-patrocinadores-inner">
          <h2 className="ah-section-heading">Patrocinadores</h2>
          <p className="ah-section-sub">
            O AlgoritmoHumano existe gracas ao apoio de pessoas e organizacoes que acreditam
            em conversas que importam.
          </p>
          <div className="ah-patrocinadores-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ah-patrocinador-slot">Parceiro {n}</div>
            ))}
          </div>
          <a href="mailto:hello@yellowcreativestudio.net" className="ah-outline-btn">
            Torna-te Patrocinador
          </a>
        </div>
      </section>

      {/* ── Contacto ── */}
      <section className="ah-section" id="contacto">
        <div className="ah-container ah-contacto-inner">
          <h2 className="ah-section-heading">Contacto</h2>
          <p className="ah-section-sub">
            Tens uma ideia, queres ser orador, ou so queres saber mais?
          </p>
          <a href="mailto:hello@yellowcreativestudio.net" className="ah-yellow-btn">
            Envia-nos um email
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="ah-footer">
        <div className="ah-container ah-footer-inner">
          <div className="ah-footer-top">
            <div>
              <p className="ah-footer-logo">AlgoritmoHumano</p>
              <p className="ah-footer-desc">
                Um evento mensal organizado por{" "}
                <Link href="/" className="ah-footer-ycl">NeoGeneralista</Link>.
              </p>
            </div>
            <div className="ah-footer-links">
              <a href="#sobre" onClick={(e) => { e.preventDefault(); scrollTo("sobre"); }}>Sobre</a>
              <a href="#conversas" onClick={(e) => { e.preventDefault(); scrollTo("conversas"); }}>Conversas</a>
              <a href="#comunidade" onClick={(e) => { e.preventDefault(); scrollTo("comunidade"); }}>Comunidade</a>
              <a href="#patrocinadores" onClick={(e) => { e.preventDefault(); scrollTo("patrocinadores"); }}>Patrocinadores</a>
              <a href="mailto:hello@yellowcreativestudio.net">Contacto</a>
            </div>
          </div>
          <div className="ah-footer-bottom">
            <p>&copy; {new Date().getFullYear()} NeoGeneralista. Todos os direitos reservados.</p>
            <div className="ah-footer-bottom-links">
              <a href="https://yellowcreativestudio.net/politica-de-privacidade/" target="_blank" rel="noreferrer">Privacidade</a>
              <a href="https://yellowcreativestudio.net/termos-de-servico/" target="_blank" rel="noreferrer">Termos</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
