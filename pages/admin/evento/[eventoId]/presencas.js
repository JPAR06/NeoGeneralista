import Link from "next/link";
import { client } from "../../../../lib/sanity";
import { requireAdmin } from "../../../../lib/admin";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const { eventoId } = ctx.params;
  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{_id, edicao, tema, data, horario, local, dataISO}`,
    { id: eventoId }
  );
  if (!evento) return { notFound: true };

  const reservas = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"] | order(checkedIn desc, checkedInAt asc, nome asc){_id, nome, email, checkedIn, checkedInAt}`,
    { eventoId }
  );

  const host = ctx.req.headers.host || "";
  const proto =
    ctx.req.headers["x-forwarded-proto"] ||
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = process.env.SITE_URL || `${proto}://${host}`;
  const checkinUrl = `${base.replace(/\/$/, "")}/checkin/${eventoId}`;
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";

  return {
    props: {
      evento,
      reservas,
      qrUrl: `/api/qr/${eventoId}?size=400`,
      qrFullUrl: `/api/qr/${eventoId}?size=1400`,
      printUrl: `/admin/evento/${eventoId}/qr`,
      exportUrl: `/api/exportar-reservas?eventoId=${eventoId}`,
      studioUrl: `/studio/structure/eventoProximo;${eventoId}`,
      checkinUrl,
      projectId,
    },
  };
}

export default function Presencas({
  evento,
  reservas,
  qrUrl,
  qrFullUrl,
  printUrl,
  exportUrl,
  studioUrl,
  checkinUrl,
}) {
  const total = reservas.length;
  const presentes = reservas.filter((r) => r.checkedIn).length;
  const taxa = total ? Math.round((presentes / total) * 100) : 0;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <nav style={s.nav}>
          <Link href="/admin" style={s.navLink}>← Todos os eventos</Link>
        </nav>

        <header style={s.header}>
          <p style={s.eyebrow}>{evento.edicao}</p>
          <h1 style={s.h1}>{evento.tema || "Presenças"}</h1>
          <p style={s.muted}>
            {[evento.data, evento.horario, evento.local].filter(Boolean).join(" · ")}
          </p>
        </header>

        <section style={s.stats}>
          <Stat label="Inscritos" value={total} />
          <Stat label="Presentes" value={presentes} />
          <Stat label="Taxa" value={`${taxa}%`} />
        </section>

        <section style={s.actions}>
          <a href={printUrl} target="_blank" rel="noreferrer" style={{ ...s.btn, ...s.btnPrimary }}>
            🖨️ Abrir QR para imprimir
          </a>
          <a href={exportUrl} style={s.btn}>⬇️ Exportar CSV</a>
          <a href={studioUrl} target="_blank" rel="noreferrer" style={s.btn}>🛠️ Abrir no Sanity Studio</a>
        </section>

        <section style={s.qrBox}>
          <h2 style={s.h2}>QR de check-in</h2>
          <p style={s.muted}>URL que o QR liga a:</p>
          <code style={s.code}>{checkinUrl}</code>
          <div style={{ marginTop: 16 }}>
            <img src={qrUrl} alt="QR code de check-in" style={s.qrImg} />
          </div>
          <p style={s.muted}>
            <a href={qrFullUrl} target="_blank" rel="noreferrer">Ver em alta resolução</a>
          </p>
        </section>

        <section>
          <h2 style={s.h2}>Lista de inscritos confirmados</h2>
          {reservas.length === 0 ? (
            <p style={s.muted}>Sem inscrições confirmadas ainda.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Presente</th>
                  <th style={s.th}>Nome</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Hora check-in</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r._id} style={r.checkedIn ? s.rowIn : undefined}>
                    <td style={s.td}>{r.checkedIn ? "✅" : "—"}</td>
                    <td style={s.td}>{r.nome}</td>
                    <td style={{ ...s.td, color: "#666", fontSize: 13 }}>{r.email}</td>
                    <td style={s.td}>
                      {r.checkedInAt
                        ? new Date(r.checkedInAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={s.stat}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

const s = {
  page: { minHeight: "100dvh", background: "#f4f4f4", fontFamily: "Arial, sans-serif", color: "#1a1a1a", padding: "32px 16px" },
  container: { maxWidth: 900, margin: "0 auto" },
  nav: { marginBottom: 16 },
  navLink: { color: "#666", textDecoration: "none", fontSize: 14 },
  header: { marginBottom: 24 },
  eyebrow: { textTransform: "uppercase", fontSize: 12, letterSpacing: 1, color: "#888", margin: 0 },
  h1: { fontSize: 28, margin: "6px 0 8px" },
  h2: { fontSize: 18, margin: "0 0 12px" },
  muted: { color: "#777", fontSize: 14, margin: "4px 0" },
  stats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0" },
  stat: { background: "#fff", borderRadius: 8, padding: 16, textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 700 },
  statLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, margin: "0 0 24px" },
  btn: { display: "inline-block", padding: "10px 14px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, textDecoration: "none", color: "#1a1a1a", fontSize: 14 },
  btnPrimary: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },
  qrBox: { background: "#fff", borderRadius: 8, padding: 20, marginBottom: 24, textAlign: "center" },
  code: { display: "inline-block", background: "#f0f0f0", padding: "4px 8px", borderRadius: 4, fontSize: 12, wordBreak: "break-all" },
  qrImg: { maxWidth: 240, width: "100%", height: "auto", border: "1px solid #eee", borderRadius: 4 },
  table: { width: "100%", background: "#fff", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee", fontSize: 13, color: "#666", background: "#fafafa" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  rowIn: { background: "#f3faf3" },
};
