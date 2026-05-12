import Link from "next/link";
import { client } from "../../lib/sanity";
import { requireAdmin } from "../../lib/admin";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const data = await client.fetch(
    `{
      "totalEventos": count(*[_type == "eventoProximo"]),
      "totalInscritos": count(*[_type == "reserva"]),
      "totalConfirmados": count(*[_type == "reserva" && estado == "confirmado" && checkedIn == true]),
      "totalCancelados": count(*[_type == "reserva" && estado == "cancelado"]),
      "totalEspera": count(*[_type == "reserva" && estado == "lista_espera"]),
      "eventos": *[_type == "eventoProximo"] | order(coalesce(dataISO, _createdAt) desc){
        _id, edicao, tema, data, dataISO,
        "inscritos": count(*[_type == "reserva" && eventoId == ^._id]),
        "confirmados": count(*[_type == "reserva" && eventoId == ^._id && estado == "confirmado" && checkedIn == true]),
        "cancelados": count(*[_type == "reserva" && eventoId == ^._id && estado == "cancelado"])
      }
    }`
  );

  return {
    props: {
      data,
      user: { email: guard.session.user?.email || "" },
    },
  };
}

function fmtAvg(total, divisor) {
  if (!divisor) return "—";
  const v = total / divisor;
  return v.toFixed(1).replace(".", ",");
}

export default function Dashboard({ data, user }) {
  const { totalEventos, totalInscritos, totalConfirmados, totalCancelados, totalEspera, eventos } = data;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <nav style={s.nav}>
          <Link href="/admin" style={s.navLink}>← Eventos</Link>
        </nav>

        <header style={s.header}>
          <div>
            <p style={s.eyebrow}>Admin · Dashboard</p>
            <h1 style={s.h1}>Métricas</h1>
            <p style={s.muted}>
              {totalEventos} {totalEventos === 1 ? "evento" : "eventos"} · {totalInscritos} reservas (todas as edições)
            </p>
          </div>
          <div style={s.userBox}>
            <span style={s.mutedSm}>Sessão: {user.email}</span>
          </div>
        </header>

        <section style={s.grid}>
          <MetricCard label="Inscritos" value={totalInscritos} sub={`média ${fmtAvg(totalInscritos, totalEventos)} por evento`} />
          <MetricCard label="Confirmados" value={totalConfirmados} sub={`compareceram (check-in feito) · média ${fmtAvg(totalConfirmados, totalEventos)} por evento`} accent="#16a34a" />
          <MetricCard label="Cancelados" value={totalCancelados} sub={`média ${fmtAvg(totalCancelados, totalEventos)} por evento`} accent="#b91c1c" />
        </section>

        <p style={s.note}>
          Lista de espera atual em todos os eventos: <strong>{totalEspera}</strong>.
          Médias incluem o evento em curso.
        </p>

        <section style={s.detailSection}>
          <h2 style={s.h2}>Detalhe por evento</h2>
          {eventos.length === 0 ? (
            <p style={s.muted}>Sem eventos.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Edição</th>
                  <th style={s.th}>Data</th>
                  <th style={s.thNum}>Inscritos</th>
                  <th style={s.thNum}>Confirmados</th>
                  <th style={s.thNum}>Cancelados</th>
                  <th style={s.thNum}>% canc.</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((e) => {
                  const pctCanc = e.inscritos ? Math.round((e.cancelados / e.inscritos) * 100) : 0;
                  const dataFmt = e.dataISO
                    ? new Date(e.dataISO).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
                    : (e.data || "—");
                  return (
                    <tr key={e._id}>
                      <td style={s.td}>
                        <Link href={`/admin/evento/${e._id}/presencas`} style={s.rowLink}>
                          <strong>{e.edicao || "Evento"}</strong>
                          {e.tema ? <span style={s.tema}> · {e.tema}</span> : null}
                        </Link>
                      </td>
                      <td style={{ ...s.td, color: "#666" }}>{dataFmt}</td>
                      <td style={s.tdNum}>{e.inscritos}</td>
                      <td style={s.tdNum}>{e.confirmados}</td>
                      <td style={s.tdNum}>{e.cancelados}</td>
                      <td style={{ ...s.tdNum, color: pctCanc > 30 ? "#b91c1c" : "#666" }}>{pctCanc}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={s.card}>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValue, color: accent || "#1a1a1a" }}>{value}</div>
      <div style={s.cardSub}>{sub}</div>
    </div>
  );
}

const s = {
  page: { minHeight: "100dvh", background: "#f4f4f4", fontFamily: "Arial, sans-serif", color: "#1a1a1a", padding: "32px 16px" },
  container: { maxWidth: 1100, margin: "0 auto" },
  nav: { marginBottom: 16 },
  navLink: { color: "#666", textDecoration: "none", fontSize: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 },
  eyebrow: { textTransform: "uppercase", fontSize: 11, letterSpacing: 1, color: "#888", margin: 0 },
  h1: { fontSize: 32, margin: "6px 0 0" },
  h2: { fontSize: 18, margin: "0 0 16px" },
  muted: { color: "#777", fontSize: 14, margin: "8px 0 0" },
  mutedSm: { color: "#888", fontSize: 13 },
  userBox: { textAlign: "right" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 16 },
  card: { background: "#fff", borderRadius: 10, padding: 20, border: "1px solid #eee", boxShadow: "0 1px 2px rgba(0,0,0,.04)" },
  cardLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  cardValue: { fontSize: 36, fontWeight: 700, lineHeight: 1 },
  cardSub: { fontSize: 13, color: "#777", marginTop: 8 },
  note: { fontSize: 13, color: "#666", margin: "0 4px 32px" },
  detailSection: { marginTop: 16 },
  table: { width: "100%", background: "#fff", borderCollapse: "collapse", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,.04)" },
  th: { textAlign: "left", padding: "12px 14px", borderBottom: "1px solid #eee", fontSize: 13, color: "#666", background: "#fafafa", fontWeight: 600 },
  thNum: { textAlign: "right", padding: "12px 14px", borderBottom: "1px solid #eee", fontSize: 13, color: "#666", background: "#fafafa", fontWeight: 600 },
  td: { padding: "12px 14px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  tdNum: { padding: "12px 14px", borderBottom: "1px solid #f5f5f5", fontSize: 14, textAlign: "right", fontVariantNumeric: "tabular-nums" },
  rowLink: { color: "#1a1a1a", textDecoration: "none" },
  tema: { color: "#888", fontWeight: 400, fontSize: 13 },
};
