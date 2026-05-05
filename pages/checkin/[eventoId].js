import { useEffect, useState } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    const callback = encodeURIComponent(`/checkin/${ctx.params.eventoId}`);
    return { redirect: { destination: `/auth/entrar?callbackUrl=${callback}`, permanent: false } };
  }
  return { props: { eventoId: ctx.params.eventoId } };
}

export default function Checkin({ eventoId }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoId }),
    })
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => setState({ loading: false, ok, data }))
      .catch(() => setState({ loading: false, ok: false, data: { error: "Erro de rede" } }));
  }, [eventoId]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {state.loading ? (
          <>
            <div style={styles.spinner} />
            <p style={styles.muted}>A confirmar a tua presença…</p>
          </>
        ) : (
          <Result data={state.data} />
        )}
      </div>
    </div>
  );
}

function Result({ data }) {
  if (!data) return <Msg icon="⚠️" title="Algo correu mal" body="Tenta outra vez." tone="error" />;

  const { status, evento, reserva, error } = data;
  const titulo = evento ? (evento.edicao || evento.tema || "AlgoritmoHumano") : "";
  const eventoLink = evento?._id ? `/algoritmo-humano/evento?id=${evento._id}` : "/algoritmo-humano";

  if (error) return <Msg icon="⚠️" title="Algo correu mal" body={error} tone="error" />;

  switch (status) {
    case "ok":
      return (
        <Msg
          icon="✅"
          title={`Bem-vindo/a, ${firstName(reserva?.nome)}!`}
          body={`Check-in confirmado para ${titulo}.`}
          tone="success"
          timestamp={reserva?.checkedInAt}
        />
      );
    case "already":
      return (
        <Msg
          icon="🎟️"
          title="Já tinhas feito check-in"
          body={`Presença registada para ${titulo}.`}
          tone="info"
          timestamp={reserva?.checkedInAt}
        />
      );
    case "too_early":
      return (
        <Msg
          icon="⏳"
          title="Ainda é cedo"
          body={`O check-in abre 1h antes de ${titulo} começar.`}
          tone="info"
        />
      );
    case "too_late":
      return (
        <Msg
          icon="⌛"
          title="Check-in encerrado"
          body="A janela de check-in para este evento já terminou."
          tone="info"
        />
      );
    case "not_found":
      return (
        <Msg
          icon="❌"
          title="Sem inscrição"
          body={`Não encontrámos uma inscrição tua para ${titulo}. Vai à página do evento para te inscreveres.`}
          tone="error"
          cta={{ href: eventoLink, label: "Ver evento e inscrever" }}
        />
      );
    case "waitlist":
      return (
        <Msg
          icon="⏳"
          title="Estás em lista de espera"
          body="Só podes fazer check-in depois de a tua inscrição ser confirmada."
          tone="info"
          cta={{ href: eventoLink, label: "Ver evento" }}
        />
      );
    case "cancelled":
      return (
        <Msg
          icon="❌"
          title="Inscrição cancelada"
          body="A tua inscrição para este evento foi cancelada."
          tone="error"
          cta={{ href: eventoLink, label: "Ver evento e inscrever" }}
        />
      );
    default:
      return <Msg icon="⚠️" title="Algo correu mal" body="Tenta outra vez." tone="error" />;
  }
}

function Msg({ icon, title, body, tone, timestamp, cta }) {
  const color = tone === "success" ? "#1a7f37" : tone === "error" ? "#b42318" : "#1a1a1a";
  return (
    <>
      <div style={{ ...styles.icon, color }}>{icon}</div>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.body}>{body}</p>
      {timestamp && (
        <p style={styles.muted}>
          {new Date(timestamp).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
      {cta && (
        <Link href={cta.href} style={styles.cta}>{cta.label} →</Link>
      )}
    </>
  );
}

function firstName(name) {
  if (!name) return "";
  return name.trim().split(/\s+/)[0];
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#f4f4f4",
    fontFamily: "Arial, sans-serif",
    color: "#1a1a1a",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "40px 28px",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,.06)",
  },
  icon: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 22, margin: "8px 0 12px" },
  body: { fontSize: 15, color: "#555", margin: 0 },
  muted: { fontSize: 13, color: "#888", marginTop: 12 },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #e5e5e5",
    borderTopColor: "#1a1a1a",
    borderRadius: "50%",
    margin: "0 auto 16px",
    animation: "spin 0.8s linear infinite",
  },
  cta: {
    display: "inline-block",
    marginTop: 18,
    padding: "10px 18px",
    background: "#F05A78",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14,
  },
};

// Inline keyframes since we're using inline styles
if (typeof document !== "undefined" && !document.getElementById("checkin-spin-kf")) {
  const s = document.createElement("style");
  s.id = "checkin-spin-kf";
  s.textContent = "@keyframes spin { to { transform: rotate(360deg) } }";
  document.head.appendChild(s);
}
