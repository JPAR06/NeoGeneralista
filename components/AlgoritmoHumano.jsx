import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ConstellationCanvasAH from "./ConstellationCanvasAH";
import AuthButtons from "./AuthButtons";

const ComunidadeAvatars = dynamic(() => import("./ComunidadeAvatars"), { ssr: false });

const NAV_ITEMS = [
  { id: "sobre", label: "Sobre" },
  { id: "evento", label: "Evento" },
  { id: "conversas", label: "Conversas" },
  { id: "equipa", label: "Equipa" },
  { id: "comunidade", label: "Comunidade" },
  { id: "patrocinadores", label: "Patrocinadores" },
];


export default function AlgoritmoHumano({
  eventos = [],
  conversas = [],
  equipa = [],
  patrocinadores = [],
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const displayedConversas = conversas.length > 0 ? conversas : [];
  const [featured, ...sideTalks] = displayedConversas;

  return (
    <div className="ahv4-page">

      {/* ── NAV ── */}
      <header className={`ahv4-nav${scrolled ? " ahv4-nav--scrolled" : ""}`}>
        <div className="ahv4-container ahv4-nav-inner">
          <Link href="/algoritmo-humano" className="ahv4-nav-logo">
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
            <AuthButtons />
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
              <div className="ahv4-mobile-auth">
                <AuthButtons />
              </div>
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
            <span className="ahv4-chip ahv4-chip--mint">Mensal</span>
          </div>
          <p className="ahv4-hero-tagline">
            Conversas mensais sobre a interceção<br />entre humanos e inteligência artificial.
          </p>
        </div>
      </section>

      {/* ── PRÓXIMO(S) EVENTO(S) ── */}
      <section className="ahv4-section" id="evento">
        <div className="ahv4-container">
          <div className={`ahv4-events-grid ahv4-events-grid--${eventos.length === 2 ? "two" : "one"}`}>
            {eventos.length > 0 ? eventos.map((evento, i) => (
              <Link key={evento._id ?? i} href={`/algoritmo-humano/evento${evento._id ? `?id=${evento._id}` : ''}`} className="ahv4-event-card">
                {evento.imagemEventoUrl ? (
                  <img src={evento.imagemEventoUrl} alt={evento.tema} className="ahv4-event-card-img" />
                ) : (
                  <div className="ahv4-event-card-img ahv4-event-card-img--placeholder" />
                )}
                <div className="ahv4-event-card-body">
                  <p className="ahv4-event-card-kicker">{i === 0 ? "Próximo Evento" : "A Seguir"}</p>
                  <p className="ahv4-event-card-theme">{evento.tema || "Em breve"}</p>
                  <div className="ahv4-event-card-meta">
                    {evento.convidado && <span className="ahv4-event-card-detail">🎤 {evento.convidado}</span>}
                    {evento.data && <span className="ahv4-event-card-detail">📅 {evento.data}</span>}
                    {evento.horario && <span className="ahv4-event-card-detail">🕡 {evento.horario}</span>}
                    {evento.local && <span className="ahv4-event-card-detail">📍 {evento.local}</span>}
                  </div>
                  <span className="ahv4-event-card-cta">Inscreve-te →</span>
                </div>
              </Link>
            )) : (
              <div className="ahv4-event-card">
                <div className="ahv4-event-card-img ahv4-event-card-img--placeholder" />
                <div className="ahv4-event-card-body">
                  <p className="ahv4-event-card-kicker">Próximo Evento</p>
                  <p className="ahv4-event-card-theme">Em breve</p>
                </div>
              </div>
            )}
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
              <div className="ahv4-empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p className="ahv4-empty-title">Em breve, a primeira conversa</p>
              <p className="ahv4-empty-sub">
                Estamos a preparar o primeiro episódio. Subscreve para seres dos primeiros a saber.
              </p>
            </div>
          ) : (
            <div className="ahv4-mag-layout">
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
                    <div className="ev-speaker-socials">
                      {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" className="ev-social-link">LinkedIn</a>}
                      {m.instagram && <a href={`https://instagram.com/${m.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="ev-social-link">{m.instagram}</a>}
                    </div>
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
            <Link href="/auth/registar" className="ahv4-btn-coral">
              Junta-te →
            </Link>
          </div>
          <div className="ahv4-com-right">
            <ComunidadeAvatars />
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
                <a key={i} href={p.website || "#"} target="_blank" rel="noreferrer" className="ahv4-pat-slot">
                  {(p.logotipoUrl || p.logoUrl) ? <img src={p.logotipoUrl || p.logoUrl} alt={p.nome} /> : <span>{p.nome}</span>}
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
              <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-footer-logo" />
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
