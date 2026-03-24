import { useState, useEffect } from "react";
import Link from "next/link";
import ConstellationCanvasAH from "./ConstellationCanvasAH";

const NAV_ITEMS = [
  { id: "sobre", label: "Sobre" },
  { id: "evento", label: "Evento" },
  { id: "conversas", label: "Conversas" },
  { id: "equipa", label: "Equipa" },
  { id: "comunidade", label: "Comunidade" },
  { id: "patrocinadores", label: "Patrocinadores" },
];

const FALLBACK_MEMBROS = [
  { iniciais: "AF", cor: "#F05A78" },
  { iniciais: "MS", cor: "#7EDDB8" },
  { iniciais: "SC", cor: "#f87171" },
  { iniciais: "TL", cor: "#a78bfa" },
  { iniciais: "IM", cor: "#F05A78" },
  { iniciais: "PA", cor: "#7EDDB8" },
  { iniciais: "RR", cor: "#fb923c" },
  { iniciais: "JM", cor: "#F05A78" },
  { iniciais: "KL", cor: "#7EDDB8" },
  { iniciais: "BN", cor: "#818cf8" },
  { iniciais: "CD", cor: "#F05A78" },
  { iniciais: "EF", cor: "#7EDDB8" },
  { iniciais: "GH", cor: "#fb7185" },
  { iniciais: "IJ", cor: "#F05A78" },
  { iniciais: "MN", cor: "#7EDDB8" },
  { iniciais: "OP", cor: "#a3e635" },
];

export default function AlgoritmoHumanoV4({
  evento = null,
  conversas = [],
  equipa = [],
  comunidade = [],
  patrocinadores = [],
}) {
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

  const displayedConversas = conversas.length > 0 ? conversas : [];
  const [featured, ...sideTalks] = displayedConversas;

  const displayedMembros = comunidade.length > 0 ? comunidade : FALLBACK_MEMBROS;
  const visibleMembros = displayedMembros.slice(0, 16);
  const extraMembros = displayedMembros.length > 16 ? displayedMembros.length - 16 : 88;

  return (
    <div className="ahv4-page">

      {/* ── NAV ── */}
      <header className={`ahv4-nav${scrolled ? " ahv4-nav--scrolled" : ""}`}>
        <div className="ahv4-container ahv4-nav-inner">
          <Link href="/" className="ahv4-nav-logo">
            <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-nav-logo-img" />
          </Link>
          <nav className="ahv4-nav-links" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className="ahv4-nav-link" onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="ahv4-nav-end">
            <button className="ahv4-nav-cta" onClick={() => scrollTo("evento")}>
              Próximo Evento
            </button>
            <button
              className="ahv4-hamburger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
            >
              <span className="ahv4-hb-line" />
              <span className="ahv4-hb-line" />
              <span className="ahv4-hb-line" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="ahv4-mobile-menu">
            <div className="ahv4-container ahv4-mobile-menu-inner">
              {NAV_ITEMS.map((item) => (
                <button key={item.id} className="ahv4-mobile-link" onClick={() => scrollTo(item.id)}>
                  {item.label}
                </button>
              ))}
              <div className="ahv4-mobile-footer">
                <Link href="/" className="ahv4-mobile-back">← NeoGeneralista</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="ahv4-hero">
        <ConstellationCanvasAH />
        <div className="ahv4-container ahv4-hero-content">
          <img
            src="/algoritmo-humano-logo-cor.png"
            alt="AlgoritmoHumano"
            className="ahv4-hero-logo"
          />
          <div className="ahv4-hero-eyebrow">
            <span className="ahv4-chip ahv4-chip--coral">Porto</span>
            <span className="ahv4-chip ahv4-chip--mint">Mensal · Gratuito</span>
          </div>
          <p className="ahv4-hero-tagline">
            Conversas mensais sobre a interceção<br />entre humanos e inteligência artificial.
          </p>
          <div className="ahv4-hero-btns">
            <button className="ahv4-btn-coral" onClick={() => scrollTo("evento")}>
              Próximo Evento →
            </button>
            <button className="ahv4-btn-mint" onClick={() => scrollTo("conversas")}>
              Ver Conversas
            </button>
          </div>
        </div>
        <div className="ahv4-hero-foot">
          <div className="ahv4-container ahv4-hero-stat-row">
            <div className="ahv4-hero-stat">
              <strong>6</strong>
              <span>edições</span>
            </div>
            <div className="ahv4-stat-div" />
            <div className="ahv4-hero-stat">
              <strong>+100</strong>
              <span>participantes</span>
            </div>
            <div className="ahv4-stat-div" />
            <div className="ahv4-hero-stat">
              <strong>Porto</strong>
              <span>cidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRÓXIMO EVENTO ── */}
      <section className="ahv4-section" id="evento">
        <div className="ahv4-container">
          <div className="ahv4-section-kicker">Próximo Evento</div>
          <div className="ahv4-evento-wrap">
            <div className="ahv4-evento-info">
              <div className="ahv4-evento-edition">
                {evento?.edicao || "AlgoritmoHumano"}
              </div>
              <h2 className="ahv4-evento-theme">
                <span className="ahv4-evento-theme-label">Tema</span>
                {evento?.tema || "A Anunciar"}
              </h2>
              <div className="ahv4-evento-meta">
                <div className="ahv4-evento-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {evento?.data || "Data a anunciar"}
                </div>
                <div className="ahv4-evento-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {evento?.local || "Porto, Portugal"}
                </div>
              </div>
            </div>
            <div className="ahv4-signup-card">
              <p className="ahv4-signup-title">Sê o primeiro a saber</p>
              <p className="ahv4-signup-sub">
                Deixa o teu e-mail e avisamos quando o próximo evento for anunciado.
              </p>
              <form className="ahv4-signup-form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="O teu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ahv4-input"
                />
                <button type="submit" className="ahv4-btn-coral">
                  Notifica-me
                </button>
              </form>
              {subscribed && <p className="ahv4-feedback-ok">✓ Inscrição confirmada!</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONVERSAS ── */}
      <section className="ahv4-section ahv4-section--tinted" id="conversas">
        <div className="ahv4-container">
          <div className="ahv4-section-header">
            <div>
              <div className="ahv4-section-kicker">Conversas</div>
              <h2 className="ahv4-section-h2">Todas as edições</h2>
            </div>
          </div>

          {displayedConversas.length === 0 ? (
            <div className="ahv4-empty-state">
              <p>A primeira conversa está a caminho.</p>
            </div>
          ) : (
            <div className="ahv4-mag-layout">
              {/* Featured talk */}
              <div
                className="ahv4-mag-featured"
                style={{ background: featured.cor || "linear-gradient(135deg, #1a0a10, #0c0c10)" }}
              >
                <div className="ahv4-mag-overlay">
                  <div className="ahv4-mag-featured-top">
                    <span className="ahv4-tema-tag">{featured.tema}</span>
                    <span className="ahv4-edition-num">#{featured.numero}</span>
                  </div>
                  <div className="ahv4-mag-featured-body">
                    <p className="ahv4-mag-speaker">{featured.orador}</p>
                    <h3 className="ahv4-mag-talk-title">"{featured.titulo}"</h3>
                    <div className="ahv4-mag-meta">
                      <span>{featured.data}</span>
                      <span>·</span>
                      <span>{featured.duracao}</span>
                      <span>·</span>
                      <span>♥ {featured.coracoes}</span>
                    </div>
                    <a href={`/conversa/${featured.numero}`} className="ahv4-play-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                      Ver conversa
                    </a>
                  </div>
                </div>
              </div>

              {/* Side list */}
              <div className="ahv4-mag-list">
                {sideTalks.map((c, i) => (
                  <a key={i} className="ahv4-mag-item" href={`/conversa/${c.numero}`}>
                    <div className="ahv4-mag-thumb" style={{ background: c.cor || "#16161e" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                    <div className="ahv4-mag-item-body">
                      <div className="ahv4-mag-item-top">
                        <span className="ahv4-tema-tag ahv4-tema-tag--sm">{c.tema}</span>
                        <span className="ahv4-mag-item-date">{c.data}</span>
                      </div>
                      <p className="ahv4-mag-item-speaker">{c.orador}</p>
                      <p className="ahv4-mag-item-title">"{c.titulo}"</p>
                    </div>
                    <span className="ahv4-mag-item-hearts">♥ {c.coracoes}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── SOBRE ── */}
      <section className="ahv4-section ahv4-section--dark" id="sobre">
        <div className="ahv4-container ahv4-sobre-layout">
          <div className="ahv4-sobre-left">
            <div className="ahv4-section-kicker ahv4-section-kicker--light">Sobre</div>
            <h2 className="ahv4-sobre-h2">
              O que é o<br />AlgoritmoHumano?
            </h2>
            <p className="ahv4-sobre-p">
              Uma vez por mês, reunimos pessoas criativas, pensadoras e curiosas
              em torno de um tema que nos une: a interceção entre o humano e a
              inteligência artificial.
            </p>
            <p className="ahv4-sobre-p">
              Cada sessão tem um orador convidado, uma conversa aberta e muito
              espaço para ligações inesperadas. Sem jargão, sem hierarquias.
              Apenas ideias a circular entre pessoas com vontade de pensar.
            </p>
            <div className="ahv4-sobre-stats">
              <div className="ahv4-sobre-stat">
                <strong>+100</strong>
                <span>participantes</span>
              </div>
              <div className="ahv4-sobre-stat">
                <strong>6</strong>
                <span>edições</span>
              </div>
              <div className="ahv4-sobre-stat">
                <strong>Mensal</strong>
                <span>frequência</span>
              </div>
            </div>
          </div>
          <blockquote className="ahv4-manifesto">
            <p>"Não somos<br />o algoritmo.<br />Somos os que<br />escolhem como<br />usá-lo."</p>
            <cite>— AlgoritmoHumano</cite>
          </blockquote>
        </div>
      </section>

      {/* ── EQUIPA ── */}
      <section className="ahv4-section" id="equipa">
        <div className="ahv4-container">
          <div className="ahv4-section-kicker">Equipa</div>
          <h2 className="ahv4-section-h2">As pessoas por trás</h2>
          <div className="ahv4-team-grid">
            {equipa.length > 0 ? (
              equipa.map((m, i) => (
                <div key={i} className="ahv4-team-card">
                  <div
                    className="ahv4-team-avatar"
                    style={{ background: m.corAvatar || "#F05A78", color: m.corTexto || "#fff" }}
                  >
                    {m.iniciais}
                  </div>
                  <div className="ahv4-team-info">
                    <p className="ahv4-team-name">{m.nome}</p>
                    <p className="ahv4-team-role">{m.funcao}</p>
                    {m.bio && <p className="ahv4-team-bio">{m.bio}</p>}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="ahv4-team-card">
                  <div className="ahv4-team-avatar" style={{ background: "#F05A78", color: "#fff" }}>AA</div>
                  <div className="ahv4-team-info">
                    <p className="ahv4-team-name">Ana Azevedo</p>
                    <p className="ahv4-team-role">Fundadora & Anfitriã</p>
                    <p className="ahv4-team-bio">
                      Criativa, consultora e fundadora do NeoGeneralista.
                      Organiza o AlgoritmoHumano desde 2024.
                    </p>
                  </div>
                </div>
                <div className="ahv4-team-card ahv4-team-card--tbd">
                  <div className="ahv4-team-avatar" style={{ background: "#1e1e2a", color: "#555" }}>?</div>
                  <div className="ahv4-team-info">
                    <p className="ahv4-team-name">A Definir</p>
                    <p className="ahv4-team-role">Curadoria de Conteúdo</p>
                  </div>
                </div>
                <div className="ahv4-team-card ahv4-team-card--tbd">
                  <div className="ahv4-team-avatar" style={{ background: "#1e1e2a", color: "#555" }}>?</div>
                  <div className="ahv4-team-info">
                    <p className="ahv4-team-name">A Definir</p>
                    <p className="ahv4-team-role">Parcerias & Comunidade</p>
                  </div>
                </div>
              </>
            )}
            <div className="ahv4-team-join">
              <p className="ahv4-join-h">Faz parte da equipa</p>
              <p className="ahv4-join-p">
                Gostas de organizar eventos e queres ajudar a construir esta comunidade?
              </p>
              <a href="mailto:ana@neogeneralista.pt" className="ahv4-btn-outline-coral">
                Fala connosco
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMUNIDADE ── */}
      <section className="ahv4-section ahv4-section--tinted" id="comunidade">
        <div className="ahv4-container ahv4-com-layout">
          <div className="ahv4-com-left">
            <div className="ahv4-section-kicker">Comunidade</div>
            <h2 className="ahv4-section-h2">Já estiveram aqui</h2>
            <p className="ahv4-section-sub">
              Pessoas que já participaram num AlgoritmoHumano e fazem parte desta conversa.
            </p>
            <button className="ahv4-btn-coral" onClick={() => scrollTo("evento")}>
              Junta-te →
            </button>
          </div>
          <div className="ahv4-com-right">
            <div className="ahv4-av-mosaic">
              {visibleMembros.map((m, i) => (
                <div key={i} className="ahv4-av" style={{ background: m.cor }}>
                  {m.iniciais}
                </div>
              ))}
              <div className="ahv4-av ahv4-av--more">+{extraMembros}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PATROCINADORES ── */}
      <section className="ahv4-section" id="patrocinadores">
        <div className="ahv4-container ahv4-pat-inner">
          <div className="ahv4-section-kicker">Patrocinadores</div>
          <h2 className="ahv4-section-h2">Quem torna isto possível</h2>
          <p className="ahv4-section-sub">
            O AlgoritmoHumano existe graças ao apoio de organizações que
            acreditam em conversas que importam.
          </p>
          <div className="ahv4-pat-grid">
            {patrocinadores.length > 0 ? (
              patrocinadores.map((p, i) => (
                <a
                  key={i}
                  href={p.website || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="ahv4-pat-slot"
                >
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.nome} />
                  ) : (
                    <span>{p.nome}</span>
                  )}
                </a>
              ))
            ) : (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="ahv4-pat-slot ahv4-pat-slot--empty">Parceiro {n}</div>
              ))
            )}
          </div>
          <a href="mailto:ana@neogeneralista.pt" className="ahv4-btn-outline-coral">
            Torna-te Patrocinador
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ahv4-footer">
        <div className="ahv4-container ahv4-footer-inner">
          <div className="ahv4-footer-top">
            <div className="ahv4-footer-brand">
              <img
                src="/algoritmo-humano-logo-cor.png"
                alt="AlgoritmoHumano"
                className="ahv4-footer-logo"
              />
              <p className="ahv4-footer-tagline-sm">
                Um evento mensal organizado por{" "}
                <Link href="/" className="ahv4-footer-hl">NeoGeneralista</Link>.
              </p>
              <div className="ahv4-footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="ahv4-footer-soc" aria-label="Instagram">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="ahv4-footer-soc" aria-label="LinkedIn">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="ahv4-footer-col">
              <p className="ahv4-footer-col-title">Navegação</p>
              {NAV_ITEMS.map((item) => (
                <button key={item.id} className="ahv4-footer-nav-btn" onClick={() => scrollTo(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="ahv4-footer-col">
              <p className="ahv4-footer-col-title">Contacto</p>
              <a href="mailto:ana@neogeneralista.pt" className="ahv4-footer-email">
                ana@neogeneralista.pt
              </a>
            </div>
          </div>
          <div className="ahv4-footer-bottom">
            <p>© {new Date().getFullYear()} NeoGeneralista. Todos os direitos reservados.</p>
            <a href="/politica-de-privacidade" className="ahv4-footer-bottom-link">Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
