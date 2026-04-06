import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getEventoProximo } from "../../lib/sanity";

export default function EventoDetalhe({ evento }) {
  const { data: session } = useSession();
  const [reserva, setReserva] = useState(null);
  const [contagem, setContagem] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
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
              <div className="ev-header">
                <p className="ev-kicker">Próximo Evento</p>
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
                      <p className="ev-meta-value">{evento.local}</p>
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
                      <p className="ev-meta-value">{evento.convidado}</p>
                      <div className="ev-speaker-socials">
                        {evento.convidadoLinkedIn && (
                          <a href={evento.convidadoLinkedIn} target="_blank" rel="noreferrer" className="ev-social-link">
                            LinkedIn
                          </a>
                        )}
                        {evento.convidadoInstagram && (
                          <a href={`https://instagram.com/${evento.convidadoInstagram.replace('@','')}`} target="_blank" rel="noreferrer" className="ev-social-link">
                            {evento.convidadoInstagram}
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

              {evento?.fotosPostEventoUrls?.length > 0 && (
                <div className="ev-gallery">
                  <p className="ev-gallery-title">Fotos do evento</p>
                  <div className="ev-gallery-grid">
                    {evento.fotosPostEventoUrls.map((url, i) => (
                      <img key={i} src={url} alt={`Foto ${i + 1}`} className="ev-gallery-img" />
                    ))}
                  </div>
                </div>
              )}
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

export async function getStaticProps() {
  try {
    const evento = await getEventoProximo();
    return {
      props: {
        evento: evento ?? {
          edicao: "AlgoritmoHumano",
          tema: "IA & Psicologia",
          data: "3.ª feira - 7 de abril de 2026",
          horario: "18h30 – 20h30",
          local: "UPTEC Asprela",
          convidado: "Andreia Silva Santos",
          descricaoCurta: "Bem-vindo/a a este ciclo mensal de conversas dedicado a explorar de que forma a Inteligência Artificial está a transformar a sociedade em diferentes dimensões da vida humana.\n\nCada sessão conta com um/a convidado/a especialista e o público para uma conversa aberta e reflexiva sobre as oportunidades, desafios e questões que emergem na era das máquinas inteligentes.",
          descricaoLonga: "Nesta sessão iremos explorar a relação entre Inteligência Artificial e Psicologia, refletindo sobre como as novas tecnologias estão a influenciar a forma como pensamos, sentimos e nos relacionamos. Da utilização de sistemas inteligentes no apoio psicológico às implicações da interação com máquinas no comportamento humano, esta conversa propõe-se discutir os desafios, possibilidades e questões éticas que emergem neste encontro entre mente humana e tecnologia.",
          maxParticipantes: 50,
          formularioAtivo: true,
        },
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: { evento: null },
      revalidate: 60,
    };
  }
}
