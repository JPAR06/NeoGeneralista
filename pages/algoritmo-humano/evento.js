import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { client, getEventoProximo } from "../../lib/sanity";
import Lightbox from "../../components/Lightbox";

export default function EventoDetalhe({ evento, prev, next }) {
  const { data: session } = useSession();
  const [reserva, setReserva] = useState(null);
  const [contagem, setContagem] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const fotos = evento?.fotosPostEventoUrls || [];
  const isPast = evento?.dataISO && new Date(evento.dataISO).getTime() < Date.now();

  // Horizontal photo strip controls
  const galleryRef = useRef(null);
  const [galLeft, setGalLeft] = useState(false);
  const [galRight, setGalRight] = useState(false);

  const updateGalArrows = () => {
    const el = galleryRef.current;
    if (!el) return;
    setGalLeft(el.scrollLeft > 4);
    setGalRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateGalArrows();
    const onResize = () => updateGalArrows();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [fotos.length]);

  const galleryScrollBy = (dir) => {
    const el = galleryRef.current;
    if (!el) return;
    const card = el.querySelector(".ev-gallery-img-wrap");
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => {
    if (!evento?._id) return;
    fetch(`/api/reserva-status?eventoId=${evento._id}`)
      .then((r) => r.json())
      .then((data) => {
        setContagem(data.contagem ?? 0);
        setReserva(data.reserva ?? null);
      });
  }, [session, evento?._id]);

  const handleReservar = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoId: evento._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setReserva({ estado: data.estado });
        if (data.estado === "confirmado") setContagem((c) => c + 1);
      } else {
        setMsg(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/cancelar-reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventoId: evento._id }),
      });
      if (res.ok) {
        if (reserva?.estado === "confirmado") setContagem((c) => Math.max(0, c - 1));
        setReserva(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: "" }),
      });
      if (!res.ok) throw new Error();
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    } catch {
      alert("Erro ao subscrever. Tenta novamente.");
    }
  };

  const spotsLeft = evento?.maxParticipantes ? evento.maxParticipantes - contagem : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <div className="ev-page">
      {/* ── NAV ── */}
      <header className="ev-nav">
        <div className="ev-nav-inner">
          <Link href="/algoritmo-humano" className="ev-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            AlgoritmoHumano
          </Link>
          <Link href="/algoritmo-humano" className="ev-nav-logo-link">
            <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ev-nav-logo" />
          </Link>
        </div>
      </header>

      <main className="ev-main">
        <div className="ev-container">

          <div className="ev-layout">
            {/* ── LEFT: info ── */}
            <div className="ev-info">
              {(prev || next) && (
                <nav className="ev-nav-bar" aria-label="Navegação entre edições">
                  {prev ? (
                    <Link href={`/algoritmo-humano/evento?id=${prev._id}`} className="ev-nav-link ev-nav-link--prev">
                      <span className="ev-nav-meta">← Edição anterior</span>
                      <span className="ev-nav-tema">{prev.edicao || prev.tema || "Sem tema"}</span>
                    </Link>
                  ) : (
                    <span className="ev-nav-link ev-nav-link--disabled">
                      <span className="ev-nav-meta">←</span>
                    </span>
                  )}
                  {next ? (
                    <Link href={`/algoritmo-humano/evento?id=${next._id}`} className="ev-nav-link ev-nav-link--next">
                      <span className="ev-nav-meta">Próxima edição →</span>
                      <span className="ev-nav-tema">{next.edicao || next.tema || "Sem tema"}</span>
                    </Link>
                  ) : (
                    <span className="ev-nav-link ev-nav-link--disabled">
                      <span className="ev-nav-meta">→</span>
                    </span>
                  )}
                </nav>
              )}
              <div className="ev-header">
                <p className="ev-kicker">{isPast ? "Edição passada" : "Próximo Evento"}</p>
                {evento?.edicao && <p className="ev-edition">{evento.edicao}</p>}
                <h1 className="ev-theme">{evento?.tema || "A Anunciar"}</h1>
              </div>

              {evento?.descricaoCurta && (
                <p className="ev-desc-curta">{evento.descricaoCurta}</p>
              )}

              <div className="ev-meta-grid">
                {evento?.data && (
                  <div className="ev-meta-item">
                    <span className="ev-meta-icon">📅</span>
                    <div>
                      <p className="ev-meta-label">Data</p>
                      <p className="ev-meta-value">{evento.data}</p>
                    </div>
                  </div>
                )}
                {evento?.horario && (
                  <div className="ev-meta-item">
                    <span className="ev-meta-icon">🕡</span>
                    <div>
                      <p className="ev-meta-label">Horário</p>
                      <p className="ev-meta-value">{evento.horario}</p>
                    </div>
                  </div>
                )}
                {evento?.local && (
                  <div className="ev-meta-item">
                    <span className="ev-meta-icon">📍</span>
                    <div>
                      <p className="ev-meta-label">Local</p>
                      <p className="ev-meta-value">
                        {evento.localUrl ? (
                          <a href={evento.localUrl} target="_blank" rel="noreferrer" className="ev-local-link">{evento.local}</a>
                        ) : evento.local}
                      </p>
                    </div>
                  </div>
                )}
                {evento?.tema && (
                  <div className="ev-meta-item">
                    <span className="ev-meta-icon">🧠</span>
                    <div>
                      <p className="ev-meta-label">Tema</p>
                      <p className="ev-meta-value">{evento.tema}</p>
                    </div>
                  </div>
                )}
                {evento?.convidado && (
                  <div className="ev-meta-item">
                    <span className="ev-meta-icon">🎤</span>
                    <div>
                      <p className="ev-meta-label">Convidado/a</p>
                      <p className="ev-meta-value">
                        {(() => {
                          const speakerLink = evento.convidadoInstagram
                            ? (evento.convidadoInstagram.startsWith('http')
                                ? evento.convidadoInstagram
                                : `https://instagram.com/${evento.convidadoInstagram.replace('@','')}`)
                            : evento.convidadoLinkedIn || null;
                          return speakerLink ? (
                            <a
                              href={speakerLink}
                              target="_blank"
                              rel="noreferrer"
                              className="ev-speaker-name-link"
                            >
                              {evento.convidado}
                            </a>
                          ) : evento.convidado;
                        })()}
                      </p>
                      <div className="ev-speaker-socials">
                        {evento.convidadoLinkedIn && (
                          <a href={evento.convidadoLinkedIn} target="_blank" rel="noreferrer" className="ev-social-link">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {evento?.descricaoLonga && (
                <p className="ev-desc-longa">{evento.descricaoLonga}</p>
              )}

              {fotos.length > 0 && (
                <div className="ev-gallery">
                  <p className="ev-gallery-title">Fotos do evento ({fotos.length})</p>
                  <div className="ev-gallery-strip-wrap">
                    {galLeft && (
                      <button
                        type="button"
                        className="ev-gallery-arrow ev-gallery-arrow--left"
                        onClick={() => galleryScrollBy(-1)}
                        aria-label="Fotos anteriores"
                      >‹</button>
                    )}
                    {galRight && (
                      <button
                        type="button"
                        className="ev-gallery-arrow ev-gallery-arrow--right"
                        onClick={() => galleryScrollBy(1)}
                        aria-label="Fotos seguintes"
                      >›</button>
                    )}
                    <div ref={galleryRef} className="ev-gallery-strip" onScroll={updateGalArrows}>
                      {fotos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          className="ev-gallery-img-wrap"
                          onClick={() => setLightboxIdx(i)}
                          aria-label={`Abrir foto ${i + 1}`}
                        >
                          <img src={url} alt={`Foto ${i + 1}`} className="ev-gallery-img" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {evento?.videosEventoUrls?.length > 0 && (
                <div className="ev-gallery">
                  <p className="ev-gallery-title">Vídeos do evento</p>
                  <div className="ev-video-grid">
                    {evento.videosEventoUrls.map((url, i) => (
                      <video
                        key={i}
                        src={url}
                        controls
                        playsInline
                        preload="metadata"
                        className="ev-video"
                      />
                    ))}
                  </div>
                </div>
              )}

              <Lightbox
                photos={fotos}
                index={lightboxIdx}
                onClose={() => setLightboxIdx(null)}
                onNav={(d) => setLightboxIdx((i) => {
                  if (i == null) return i;
                  const next = i + d;
                  if (next < 0 || next >= fotos.length) return i;
                  return next;
                })}
              />
            </div>

            {/* ── RIGHT: image + reservation ── */}
            <div className="ev-sidebar">

              {/* ── Reserve button / status ── */}
              <div className="ev-reserve-card">
                {evento?.formularioAtivo ? (
                  <>
                    {isFull && (
                      <p className="ev-spots-note ev-spots-note--full">Evento lotado · podes entrar na lista de espera</p>
                    )}

                    {session ? (
                      reserva ? (
                        /* ── Already reserved ── */
                        <div className="ev-reserved-wrap">
                          <div className={`ev-status ev-status--${reserva.estado}`}>
                            {reserva.estado === "confirmado" ? "✓ Lugar confirmado" : "⏳ Em lista de espera"}
                          </div>
                          <p className="ev-reserve-as">
                            Inscrito/a como <strong>{session.user.name}</strong>
                            <br />
                            <span className="ev-reserve-email">{session.user.email}</span>
                          </p>
                          <button
                            className="ev-btn-cancel"
                            onClick={handleCancelar}
                            disabled={loading}
                          >
                            {loading ? "A processar…" : "Cancelar reserva"}
                          </button>
                        </div>
                      ) : (
                        /* ── Logged in, no reservation yet ── */
                        <div className="ev-reserve-action">
                          <button
                            className="ev-btn-reserve ev-btn-reserve--hero"
                            onClick={handleReservar}
                            disabled={loading || !evento?._id}
                          >
                            {loading ? "A processar…" : isFull ? "Entrar na lista de espera" : "Inscreve-te"}
                          </button>
                          <p className="ev-reserve-as">
                            A reservar como <strong>{session.user.name}</strong>
                            <br />
                            <span className="ev-reserve-email">{session.user.email}</span>
                          </p>
                          {!evento?._id && (
                            <p className="ev-msg-error">Evento ainda não configurado no Sanity Studio.</p>
                          )}
                        </div>
                      )
                    ) : (
                      /* ── Not logged in ── */
                      <div className="ev-login-prompt">
                        <Link href="/auth/entrar" className="ev-btn-reserve ev-btn-reserve--hero">
                          Inscreve-te
                        </Link>
                        <p className="ev-reserve-sub">
                          Precisas de uma conta para reservares o teu lugar.
                        </p>
                        <Link href="/auth/registar" className="ev-btn-register-link">
                          Não tens conta? Regista-te
                        </Link>
                      </div>
                    )}

                    {msg && <p className="ev-msg-error">{msg}</p>}
                  </>
                ) : (
                  <>
                    <p className="ev-reserve-title">Inscrições em breve</p>
                    <p className="ev-reserve-sub">
                      Deixa o teu e-mail e avisamos quando as inscrições abrirem.
                    </p>
                    <form onSubmit={handleSubscribe} className="ev-notify-form">
                      <input
                        type="email"
                        placeholder="O teu e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="ev-input"
                      />
                      <button type="submit" className="ev-btn-reserve">Notifica-me</button>
                    </form>
                    {subscribed && <p className="ev-msg-ok">✓ Ficaste na lista!</p>}
                  </>
                )}
              </div>

              {/* ── Event image ── */}
              {evento?.imagemEventoUrl && (
                <div className="ev-sidebar-img-wrap">
                  <img src={evento.imagemEventoUrl} alt={evento.tema} className="ev-sidebar-img" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps({ query }) {
  try {
    let evento = null;

    if (query.id) {
      evento = await client.fetch(
        `*[_type == "eventoProximo" && _id == $id][0]{
          ...,
          "imagemEventoUrl": imagemEvento.asset->url,
          "fotosPostEventoUrls": fotosPostEvento[].asset->url,
          "videosEventoUrls": videosEvento[].asset->url
        }`,
        { id: query.id }
      );
    }

    if (!evento) {
      const eventos = await getEventoProximo();
      evento = Array.isArray(eventos) ? eventos[0] : eventos;
    }

    // Compute previous/next neighbors by chronological order so the
    // detail page can render arrows. Uses a slim projection — one query.
    let prev = null;
    let next = null;
    if (evento?._id) {
      const todos = await client.fetch(
        `*[_type == "eventoProximo"] | order(coalesce(dataISO, _createdAt) asc){_id, edicao, tema, dataISO}`
      );
      const idx = todos.findIndex((e) => e._id === evento._id);
      if (idx > 0) prev = todos[idx - 1];
      if (idx >= 0 && idx < todos.length - 1) next = todos[idx + 1];
    }

    return {
      props: { evento: evento ?? null, prev, next },
    };
  } catch (err) {
    console.error("[evento gSSP]", err);
    return {
      props: { evento: null, prev: null, next: null },
    };
  }
}
