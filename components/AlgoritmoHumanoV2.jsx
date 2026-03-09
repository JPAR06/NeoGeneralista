import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "sobre", label: "Sobre" },
  { id: "evento", label: "Evento" },
  { id: "conversas", label: "Conversas" },
  { id: "equipa", label: "Equipa" },
  { id: "comunidade", label: "Comunidade" },
  { id: "patrocinadores", label: "Patrocinadores" },
];

const CONVERSAS = [
  {
    numero: 3,
    tema: "Liberdade",
    orador: "Sofia Carvalho",
    titulo: "Criar sem limites impostos",
    coracoes: 18,
    cor: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    data: "8 Mar 2025",
    duracao: "22 min",
  },
  {
    numero: 2,
    tema: "Identidade",
    orador: "Miguel Santos",
    titulo: "Quem somos quando ninguém está a ver",
    coracoes: 31,
    cor: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    data: "9 Fev 2025",
    duracao: "18 min",
  },
  {
    numero: 1,
    tema: "Casa",
    orador: "Ana Ferreira",
    titulo: "O espaço que nos define",
    coracoes: 24,
    cor: "linear-gradient(135deg, #7b2d8b 0%, #c94b4b 100%)",
    data: "12 Jan 2025",
    duracao: "25 min",
  },
  {
    numero: 0,
    tema: "Resiliência",
    orador: "Tiago Lopes",
    titulo: "Cair, levantar, recomeçar",
    coracoes: 42,
    cor: "linear-gradient(135deg, #b34700 0%, #f7971e 100%)",
    data: "13 Out 2024",
    duracao: "21 min",
  },
  {
    numero: -1,
    tema: "Curiosidade",
    orador: "Inês Monteiro",
    titulo: "A pergunta que muda tudo",
    coracoes: 27,
    cor: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
    data: "10 Nov 2024",
    duracao: "19 min",
  },
];

const MEMBROS = [
  { iniciais: "AF", cor: "#fcc225" },
  { iniciais: "MS", cor: "#a78bfa" },
  { iniciais: "SC", cor: "#34d399" },
  { iniciais: "TL", cor: "#f87171" },
  { iniciais: "IM", cor: "#60a5fa" },
  { iniciais: "PA", cor: "#fb923c" },
  { iniciais: "RR", cor: "#e879f9" },
  { iniciais: "JM", cor: "#2dd4bf" },
  { iniciais: "KL", cor: "#fbbf24" },
  { iniciais: "BN", cor: "#818cf8" },
  { iniciais: "CD", cor: "#4ade80" },
  { iniciais: "EF", cor: "#f472b6" },
  { iniciais: "GH", cor: "#fb7185" },
  { iniciais: "IJ", cor: "#38bdf8" },
  { iniciais: "MN", cor: "#facc15" },
  { iniciais: "OP", cor: "#a3e635" },
];

export default function AlgoritmoHumanoV2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const [featured, ...sideTalks] = CONVERSAS;

  return (
    <div className="ahv2-page">

      {/* ── NAV ── */}
      <header className={`ahv2-nav${scrolled ? " ahv2-nav--scrolled" : ""}`}>
        <div className="ahv2-container ahv2-nav-inner">
          <Link href="/" className="ahv2-nav-logo">
            Algoritmo<span className="ahv2-nav-logo-accent">Humano</span>
          </Link>
          <nav className="ahv2-nav-links" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className="ahv2-nav-link" onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="ahv2-nav-end">
            <button className="ahv2-nav-cta" onClick={() => scrollTo("evento")}>
              Próximo Evento
            </button>
            <button
              className="ahv2-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              <span className="ahv2-hb-line" />
              <span className="ahv2-hb-line" />
              <span className="ahv2-hb-line" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="ahv2-mobile-menu">
            <div className="ahv2-container ahv2-mobile-menu-inner">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} className="ahv2-mobile-link" onClick={() => scrollTo(item.id)}>
                  {item.label}
                </button>
              ))}
              <div className="ahv2-mobile-footer">
                <Link href="/" className="ahv2-mobile-back">← NeoGeneralista</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="ahv2-hero">
        <div className="ahv2-hero-grid" aria-hidden="true" />
        <div className="ahv2-container ahv2-hero-content">
          <div className="ahv2-hero-eyebrow">
            <span className="ahv2-chip">Porto</span>
            <span className="ahv2-chip ahv2-chip--muted">Gratuito · Mensal</span>
          </div>
          <h1 className="ahv2-hero-h1">
            <span className="ahv2-h1-solid">Algoritmo</span>
            <span className="ahv2-h1-outline">Humano</span>
          </h1>
          <p className="ahv2-hero-tagline">
            Conversas mensais sobre a interceção entre humanos e inteligência artificial.
          </p>
          <div className="ahv2-hero-btns">
            <button className="ahv2-btn-primary" onClick={() => scrollTo("evento")}>
              Próximo Evento →
            </button>
            <button className="ahv2-btn-ghost" onClick={() => scrollTo("conversas")}>
              Ver Conversas
            </button>
          </div>
        </div>
        <div className="ahv2-hero-foot">
          <div className="ahv2-container ahv2-hero-foot-inner">
            <div className="ahv2-hero-stat-row">
              <div className="ahv2-hero-stat">
                <strong>6</strong>
                <span>edições</span>
              </div>
              <div className="ahv2-stat-div" />
              <div className="ahv2-hero-stat">
                <strong>+100</strong>
                <span>participantes</span>
              </div>
              <div className="ahv2-stat-div" />
              <div className="ahv2-hero-stat">
                <strong>Porto</strong>
                <span>cidade</span>
              </div>
            </div>
            <p className="ahv2-hero-scroll">↓ scroll</p>
          </div>
        </div>
      </section>

      {/* ── EVENTO ── */}
      <section className="ahv2-section" id="evento">
        <div className="ahv2-container">
          <div className="ahv2-section-kicker">Próximo Evento</div>
          <div className="ahv2-evento-wrap">
            <div className="ahv2-evento-info">
              <div className="ahv2-evento-edition">AlgoritmoHumano #7</div>
              <h2 className="ahv2-evento-theme">
                <span className="ahv2-evento-theme-label">Tema</span>
                A Anunciar
              </h2>
              <div className="ahv2-evento-meta">
                <div className="ahv2-evento-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Data a anunciar
                </div>
                <div className="ahv2-evento-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Porto, Portugal
                </div>
              </div>
            </div>
            <div className="ahv2-signup-card">
              <p className="ahv2-signup-title">Sê o primeiro a saber</p>
              <p className="ahv2-signup-sub">
                Deixa o teu e-mail e avisamos quando o próximo evento for anunciado.
              </p>
              <form className="ahv2-signup-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="O teu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ahv2-input"
                />
                <button type="submit" className="ahv2-btn-primary">
                  Notifica-me
                </button>
              </form>
              {subscribed && <p className="ahv2-feedback-ok">✓ Inscrição confirmada!</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONVERSAS ── */}
      <section className="ahv2-section ahv2-section--tinted" id="conversas">
        <div className="ahv2-container">
          <div className="ahv2-section-header">
            <div>
              <div className="ahv2-section-kicker">Conversas</div>
              <h2 className="ahv2-section-h2">Todas as edições</h2>
            </div>
            <a href="#" className="ahv2-link-arrow">Ver todas →</a>
          </div>

          <div className="ahv2-mag-layout">
            {/* Featured talk */}
            <div className="ahv2-mag-featured" style={{ background: featured.cor }}>
              <div className="ahv2-mag-overlay">
                <div className="ahv2-mag-featured-top">
                  <span className="ahv2-tema-tag">{featured.tema}</span>
                  <span className="ahv2-edition-num">#{featured.numero}</span>
                </div>
                <div className="ahv2-mag-featured-body">
                  <p className="ahv2-mag-speaker">{featured.orador}</p>
                  <h3 className="ahv2-mag-talk-title">"{featured.titulo}"</h3>
                  <div className="ahv2-mag-meta">
                    <span>{featured.data}</span>
                    <span>·</span>
                    <span>{featured.duracao}</span>
                    <span>·</span>
                    <span>♥ {featured.coracoes}</span>
                  </div>
                  <button className="ahv2-play-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Ver conversa
                  </button>
                </div>
              </div>
            </div>

            {/* Side list */}
            <div className="ahv2-mag-list">
              {sideTalks.map((c, i) => (
                <div key={i} className="ahv2-mag-item">
                  <div className="ahv2-mag-thumb" style={{ background: c.cor }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                  <div className="ahv2-mag-item-body">
                    <div className="ahv2-mag-item-top">
                      <span className="ahv2-tema-tag ahv2-tema-tag--sm">{c.tema}</span>
                      <span className="ahv2-mag-item-date">{c.data}</span>
                    </div>
                    <p className="ahv2-mag-item-speaker">{c.orador}</p>
                    <p className="ahv2-mag-item-title">"{c.titulo}"</p>
                  </div>
                  <span className="ahv2-mag-item-hearts">♥ {c.coracoes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section className="ahv2-section ahv2-section--dark" id="sobre">
        <div className="ahv2-container ahv2-sobre-layout">
          <div className="ahv2-sobre-left">
            <div className="ahv2-section-kicker ahv2-section-kicker--on-dark">Sobre</div>
            <h2 className="ahv2-sobre-h2">
              O que é o<br />AlgoritmoHumano?
            </h2>
            <p className="ahv2-sobre-p">
              Uma vez por mês, reunimos pessoas criativas, pensadoras e curiosas
              em torno de um tema que nos une: a interceção entre o humano e a
              inteligência artificial.
            </p>
            <p className="ahv2-sobre-p">
              Cada sessão tem um orador convidado, uma conversa aberta e muito
              espaço para ligações inesperadas. Sem jargão, sem hierarquias.
              Apenas ideias a circular entre pessoas com vontade de pensar.
            </p>
            <div className="ahv2-sobre-stats">
              <div className="ahv2-sobre-stat">
                <strong>+100</strong>
                <span>participantes</span>
              </div>
              <div className="ahv2-sobre-stat">
                <strong>6</strong>
                <span>edições</span>
              </div>
              <div className="ahv2-sobre-stat">
                <strong>Mensal</strong>
                <span>frequência</span>
              </div>
            </div>
          </div>
          <blockquote className="ahv2-manifesto">
            <p>"Não somos<br />o algoritmo.<br />Somos os que<br />escolhem como<br />usá-lo."</p>
            <cite>— AlgoritmoHumano</cite>
          </blockquote>
        </div>
      </section>

      {/* ── EQUIPA ── */}
      <section className="ahv2-section" id="equipa">
        <div className="ahv2-container">
          <div className="ahv2-section-kicker">Equipa</div>
          <h2 className="ahv2-section-h2">As pessoas por trás</h2>
          <div className="ahv2-team-grid">
            <div className="ahv2-team-card">
              <div className="ahv2-team-avatar" style={{ background: "#fcc225", color: "#111" }}>RM</div>
              <div className="ahv2-team-info">
                <p className="ahv2-team-name">Ana Azevedo</p>
                <p className="ahv2-team-role">Fundadora & Anfitriã</p>
                <p className="ahv2-team-bio">
                  Criativa, estratega de conteúdos e fundadora do NeoGeneralista.
                  Organiza o AlgoritmoHumano desde 2024.
                </p>
              </div>
            </div>
            <div className="ahv2-team-card ahv2-team-card--tbd">
              <div className="ahv2-team-avatar" style={{ background: "#f0f0f0", color: "#bbb" }}>?</div>
              <div className="ahv2-team-info">
                <p className="ahv2-team-name">A Definir</p>
                <p className="ahv2-team-role">Curadoria de Conteúdo</p>
              </div>
            </div>
            <div className="ahv2-team-card ahv2-team-card--tbd">
              <div className="ahv2-team-avatar" style={{ background: "#f0f0f0", color: "#bbb" }}>?</div>
              <div className="ahv2-team-info">
                <p className="ahv2-team-name">A Definir</p>
                <p className="ahv2-team-role">Parcerias & Comunidade</p>
              </div>
            </div>
            <div className="ahv2-team-join">
              <p className="ahv2-join-h">Faz parte da equipa</p>
              <p className="ahv2-join-p">
                Gostas de organizar eventos e queres ajudar a construir esta comunidade?
              </p>
              <a href="mailto:hello@yellowcreativestudio.net" className="ahv2-btn-outline">
                Fala connosco
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMUNIDADE ── */}
      <section className="ahv2-section ahv2-section--tinted" id="comunidade">
        <div className="ahv2-container ahv2-com-layout">
          <div className="ahv2-com-left">
            <div className="ahv2-section-kicker">Comunidade</div>
            <h2 className="ahv2-section-h2">Já estiveram aqui</h2>
            <p className="ahv2-section-sub">
              Pessoas que já participaram num AlgoritmoHumano e fazem parte desta conversa.
            </p>
            <button className="ahv2-btn-primary" onClick={() => scrollTo("evento")}>
              Junta-te →
            </button>
          </div>
          <div className="ahv2-com-right">
            <div className="ahv2-av-mosaic">
              {MEMBROS.map((m, i) => (
                <div key={i} className="ahv2-av" style={{ background: m.cor }}>
                  {m.iniciais}
                </div>
              ))}
              <div className="ahv2-av ahv2-av--more">+88</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PATROCINADORES ── */}
      <section className="ahv2-section" id="patrocinadores">
        <div className="ahv2-container ahv2-pat-inner">
          <div className="ahv2-section-kicker">Patrocinadores</div>
          <h2 className="ahv2-section-h2">Quem torna isto possível</h2>
          <p className="ahv2-section-sub">
            O AlgoritmoHumano existe graças ao apoio de organizações que
            acreditam em conversas que importam.
          </p>
          <div className="ahv2-pat-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ahv2-pat-slot">Parceiro {n}</div>
            ))}
          </div>
          <a href="mailto:hello@yellowcreativestudio.net" className="ahv2-btn-outline">
            Torna-te Patrocinador
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ahv2-footer">
        <div className="ahv2-container ahv2-footer-inner">
          <div className="ahv2-footer-top">
            <div className="ahv2-footer-brand">
              <p className="ahv2-footer-wordmark">AlgoritmoHumano</p>
              <p className="ahv2-footer-tagline-sm">
                Um evento mensal organizado por{" "}
                <Link href="/" className="ahv2-footer-hl">NeoGeneralista</Link>.
              </p>
              <div className="ahv2-footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ahv2-footer-soc" aria-label="Instagram">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="ahv2-footer-soc" aria-label="LinkedIn">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="ahv2-footer-col">
              <p className="ahv2-footer-col-title">Navegação</p>
              {NAV_ITEMS.map((item) => (
                <button key={item.id} className="ahv2-footer-nav-btn" onClick={() => scrollTo(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="ahv2-footer-col">
              <p className="ahv2-footer-col-title">Contacto</p>
              <a href="mailto:hello@yellowcreativestudio.net" className="ahv2-footer-email">
                hello@yellowcreativestudio.net
              </a>
            </div>
          </div>
          <div className="ahv2-footer-bottom">
            <p>&copy; {new Date().getFullYear()} NeoGeneralista. Todos os direitos reservados.</p>
            <div className="ahv2-footer-bottom-links">
              <a href="https://yellowcreativestudio.net/politica-de-privacidade/" target="_blank" rel="noreferrer">Privacidade</a>
              <a href="https://yellowcreativestudio.net/termos-de-servico/" target="_blank" rel="noreferrer">Termos</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
