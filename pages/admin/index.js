import Link from "next/link";
import { client } from "../../lib/sanity";
import { requireAdmin } from "../../lib/admin";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const eventos = await client.fetch(
    `*[_type == "eventoProximo"] | order(dataISO desc){
      _id, edicao, tema, data, horario, local, dataISO, formularioAtivo,
      "inscritos": count(*[_type == "reserva" && eventoId == ^._id && estado == "confirmado"]),
      "presentes": count(*[_type == "reserva" && eventoId == ^._id && estado == "confirmado" && checkedIn == true])
    }`
  );

  return {
    props: {
      eventos,
      user: { name: guard.session.user?.name || "", email: guard.session.user?.email || "" },
    },
  };
}

export default function AdminDashboard({ eventos, user }) {
  const now = Date.now();
  const upcoming = eventos.filter((e) => e.dataISO && new Date(e.dataISO).getTime() >= now - 6 * 60 * 60 * 1000);
  const past = eventos.filter((e) => !upcoming.includes(e));

  return (
    <div style={s.page}>
      <div style={s.container}>
        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>Admin</p>
            <h1 style={s.h1}>Eventos</h1>
          </div>
          <div style={s.userBox}>
            <span style={s.muted}>Sessão: {user.email}</span>
            <a href="/api/exportar-utilizadores" style={s.exportUsers}>Exportar site/newsletter</a>
          </div>
        </header>

        <Section title="Próximos eventos" empty="Não há eventos futuros.">
          {upcoming.map((e) => <EventoCard key={e._id} evento={e} upcoming />)}
        </Section>

        {past.length > 0 && (
          <Section title="Eventos passados">
            {past.map((e) => <EventoCard key={e._id} evento={e} />)}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, empty, children }) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <section style={s.section}>
      <h2 style={s.h2}>{title}</h2>
      {items.length === 0 && empty ? (
        <p style={s.muted}>{empty}</p>
      ) : (
        <div style={s.grid}>{items}</div>
      )}
    </section>
  );
}

function EventoCard({ evento, upcoming }) {
  const taxa = evento.inscritos ? Math.round((evento.presentes / evento.inscritos) * 100) : 0;
  const dataFmt = evento.dataISO
    ? new Date(evento.dataISO).toLocaleString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : (evento.data || "Sem data");

  return (
    <Link href={`/admin/evento/${evento._id}/presencas`} style={s.card}>
      <div style={s.cardHead}>
        <span style={s.eyebrow}>{evento.edicao || "Evento"}</span>
        {upcoming && evento.formularioAtivo && <span style={s.badgeOpen}>Inscrições abertas</span>}
        {upcoming && !evento.formularioAtivo && <span style={s.badgeClosed}>Fechadas</span>}
      </div>
      <h3 style={s.cardTitle}>{evento.tema || "A Anunciar"}</h3>
      <p style={s.cardMeta}>{dataFmt}{evento.local ? ` · ${evento.local}` : ""}</p>
      <div style={s.cardStats}>
        <div><strong>{evento.inscritos}</strong> <span style={s.muted}>inscritos</span></div>
        <div><strong>{evento.presentes}</strong> <span style={s.muted}>presentes</span></div>
        <div><strong>{taxa}%</strong> <span style={s.muted}>taxa</span></div>
      </div>
    </Link>
  );
}

const s = {
  page: { minHeight: "100dvh", background: "#f4f4f4", fontFamily: "Arial, sans-serif", color: "#1a1a1a", padding: "32px 16px" },
  container: { maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 },
  eyebrow: { textTransform: "uppercase", fontSize: 11, letterSpacing: 1, color: "#888" },
  h1: { fontSize: 32, margin: "6px 0 0" },
  h2: { fontSize: 18, margin: "0 0 16px" },
  muted: { color: "#888", fontSize: 13 },
  userBox: { textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  exportUsers: { display: "inline-block", padding: "9px 12px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, textDecoration: "none", color: "#1a1a1a", fontSize: 13 },
  section: { marginBottom: 40 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  card: {
    display: "block",
    background: "#fff",
    borderRadius: 10,
    padding: 18,
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 1px 2px rgba(0,0,0,.04)",
    border: "1px solid #eee",
    transition: "transform .1s, box-shadow .1s",
  },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 18, margin: "4px 0" },
  cardMeta: { fontSize: 13, color: "#666", margin: "4px 0 12px" },
  cardStats: { display: "flex", gap: 16, fontSize: 14, paddingTop: 10, borderTop: "1px solid #f0f0f0" },
  badgeOpen: { background: "#e6f6ec", color: "#1a7f37", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 },
  badgeClosed: { background: "#f5f5f5", color: "#666", fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600 },
};
