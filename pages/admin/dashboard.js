import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Calendar, Users, Mail, UserCheck, UserX, UserMinus,
  RotateCcw, TrendingUp, PieChart as PieIcon, ArrowLeft, ChevronRight,
  MapPin,
} from "lucide-react";
import { client } from "../../lib/sanity";
import { requireAdmin } from "../../lib/admin";
import clientPromise from "../../lib/mongodb";

// Recharts is client-only (uses ResizeObserver). Avoid SSR hydration mismatch.
const Charts = dynamic(() => import("../../components/admin/DashboardCharts"), { ssr: false });

const COLORS = {
  navy: "#070756",
  coral: "#ff366b",
  mint: "#7EDDB8",
  red: "#b91c1c",
  amber: "#d97706",
  blue: "#2563eb",
  bg: "#f4f4f4",
  card: "#ffffff",
  cream: "#FFF8F6",
  border: "#eee",
  text: "#1e293b",
  muted: "#64748b",
  faint: "#94a3b8",
};

const DONUT_PALETTE = [
  "#ff366b", "#070756", "#7EDDB8", "#d97706", "#2563eb",
  "#a855f7", "#0ea5e9", "#84cc16", "#f97316", "#64748b",
];

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const mongo = await clientPromise;
  const db = mongo.db();

  const oneYearAgo = new Date();
  oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);

  const [sanityData, usersTotal, profileUsers, timeSeries] = await Promise.all([
    client.fetch(`{
      "totalEventos": count(*[_type == "eventoProximo"]),
      "totalInscritos": count(*[_type == "reserva"]),
      "totalConfirmados": count(*[_type == "reserva" && estado == "confirmado" && checkedIn == true]),
      "totalCancelados": count(*[_type == "reserva" && estado == "cancelado"]),
      "totalEspera": count(*[_type == "reserva" && estado == "lista_espera"]),
      "totalFaltaram": count(*[_type == "reserva" && estado == "confirmado" && checkedIn != true && eventoId in *[_type == "eventoProximo" && dataISO < now()]._id]),
      "checkInsAll": *[_type == "reserva" && checkedIn == true]{userId, email, eventoId},
      "eventos": *[_type == "eventoProximo"] | order(coalesce(dataISO, _createdAt) desc){
        _id, edicao, tema, data, dataISO,
        "inscritos": count(*[_type == "reserva" && eventoId == ^._id]),
        "confirmados": count(*[_type == "reserva" && eventoId == ^._id && estado == "confirmado" && checkedIn == true]),
        "cancelados": count(*[_type == "reserva" && eventoId == ^._id && estado == "cancelado"]),
        "faltaram": count(*[_type == "reserva" && eventoId == ^._id && estado == "confirmado" && checkedIn != true])
      }
    }`),
    db.collection("users").countDocuments(),
    db.collection("users")
      .find({}, { projection: { faixaEtaria: 1, setorProfissional: 1, habilitacoes: 1, situacaoProfissional: 1, _id: 0 } })
      .toArray(),
    db.collection("dailyMetrics")
      .find({ date: { $gte: oneYearAgo } })
      .sort({ _id: 1 })
      .toArray(),
  ]);

  // % retorno: of users who attended any event, what % attended ≥2 events.
  const byUser = new Map();
  for (const r of sanityData.checkInsAll || []) {
    const key = r.userId || r.email?.toLowerCase();
    if (!key) continue;
    if (!byUser.has(key)) byUser.set(key, new Set());
    byUser.get(key).add(r.eventoId);
  }
  const totalParticipantesUnicos = byUser.size;
  const voltaram = [...byUser.values()].filter((s) => s.size >= 2).length;
  const pctRetorno = totalParticipantesUnicos
    ? Math.round((voltaram / totalParticipantesUnicos) * 100)
    : 0;

  // Newsletter latest from time series, fallback 0
  const newsletterLatest = timeSeries.length
    ? timeSeries[timeSeries.length - 1].newsletter || 0
    : 0;

  // Profile distributions
  const distribute = (field, topN = 8) => {
    const counts = {};
    for (const u of profileUsers) {
      const raw = (u[field] || "").toString().trim();
      const v = raw || "Não respondeu";
      counts[v] = (counts[v] || 0) + 1;
    }
    const sorted = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    if (sorted.length <= topN) return sorted;
    const head = sorted.slice(0, topN);
    const tail = sorted.slice(topN);
    const others = tail.reduce((sum, x) => sum + x.value, 0);
    return [...head, { name: "Outros", value: others }];
  };

  const distributions = {
    faixaEtaria: distribute("faixaEtaria"),
    setorProfissional: distribute("setorProfissional"),
    habilitacoes: distribute("habilitacoes"),
    situacaoProfissional: distribute("situacaoProfissional"),
  };

  // Trim time-series for chart (last 90 days default, rest available via filter)
  const series = timeSeries.map((d) => ({
    date: d._id,
    users: d.users || 0,
    newsletter: d.newsletter || 0,
  }));

  const { checkInsAll: _omit, ...sanityRest } = sanityData;

  return {
    props: {
      data: {
        ...sanityRest,
        usersTotal,
        newsletterLatest,
        voltaram,
        totalParticipantesUnicos,
        pctRetorno,
      },
      distributions,
      series,
      user: { email: guard.session.user?.email || "" },
    },
  };
}

function fmtAvg(total, divisor) {
  if (!divisor) return "—";
  const v = total / divisor;
  return v.toFixed(1).replace(".", ",");
}

export default function Dashboard({ data, distributions, series, user }) {
  const {
    totalEventos, totalInscritos, totalConfirmados, totalCancelados,
    totalEspera, totalFaltaram, usersTotal, newsletterLatest,
    voltaram, totalParticipantesUnicos, pctRetorno, eventos,
  } = data;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <nav style={s.nav}>
          <Link href="/admin" style={s.navLink}>
            <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: "-2px" }} />
            Eventos
          </Link>
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

        {/* ROW 1: 6 mini cards (clicáveis para drill-down) */}
        <section style={s.grid6}>
          <MetricCard icon={Calendar} label="Eventos" value={totalEventos} accent={COLORS.navy} href="/admin" />
          <MetricCard icon={Users} label="Comunidade" value={usersTotal} sub="utilizadores no site" accent={COLORS.coral} href="/admin/utilizadores?fonte=site" />
          <MetricCard icon={Mail} label="Newsletter" value={newsletterLatest} sub="subscritores ativos" accent={COLORS.blue} href="/admin/utilizadores?fonte=newsletter" />
          <MetricCard icon={UserCheck} label="Compareceram" value={totalConfirmados} sub={`média ${fmtAvg(totalConfirmados, totalEventos)}/evento`} accent={COLORS.mint} darkText href="#eventos" />
          <MetricCard icon={UserX} label="Cancelados" value={totalCancelados} sub={`média ${fmtAvg(totalCancelados, totalEventos)}/evento`} accent={COLORS.red} href="#eventos" />
          <MetricCard icon={UserMinus} label="Faltaram" value={totalFaltaram} sub="não-shows em eventos passados" accent={COLORS.amber} href="#eventos" />
        </section>

        {/* ROW 2: KPI retorno */}
        <section style={s.kpiBig}>
          <div style={s.kpiIcon}><RotateCcw size={28} color={COLORS.coral} /></div>
          <div style={{ flex: 1 }}>
            <p style={s.kpiLabel}>Retorno de participantes</p>
            <p style={s.kpiValue}>
              <span style={{ color: COLORS.coral }}>{pctRetorno}%</span>
              <span style={s.kpiContext}> dos participantes voltam após o primeiro evento</span>
            </p>
            <p style={s.kpiSub}>
              {voltaram} de {totalParticipantesUnicos} pessoas únicas com check-in em ≥1 evento.
            </p>
          </div>
        </section>

        {/* ROW 3: Time-series chart */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <TrendingUp size={18} color={COLORS.navy} />
            <h2 style={s.h2}>Evolução da comunidade</h2>
          </div>
          {series.length === 0 ? (
            <p style={s.muted}>
              A recolher dados — verifica daqui a 24h (o cron diário regista os snapshots).
            </p>
          ) : (
            <div style={s.chartBox}>
              <Charts type="area" data={series} colors={{ users: COLORS.coral, newsletter: COLORS.blue }} />
            </div>
          )}
        </section>

        {/* ROW 4: 4 donuts */}
        <section style={s.section}>
          <div style={s.sectionHead}>
            <PieIcon size={18} color={COLORS.navy} />
            <h2 style={s.h2}>Distribuição da comunidade</h2>
          </div>
          <div style={s.grid4}>
            <DonutCard title="Faixa etária" data={distributions.faixaEtaria} />
            <DonutCard title="Setor profissional" data={distributions.setorProfissional} />
            <DonutCard title="Habilitações" data={distributions.habilitacoes} />
            <DonutCard title="Situação profissional" data={distributions.situacaoProfissional} />
          </div>
        </section>

        {/* ROW 5: Detail por evento — card grid */}
        <section id="eventos" style={s.section}>
          <div style={s.sectionHead}>
            <Calendar size={18} color={COLORS.navy} />
            <h2 style={s.h2}>Detalhe por evento</h2>
          </div>
          {eventos.length === 0 ? (
            <p style={s.muted}>Sem eventos.</p>
          ) : (
            <div style={s.eventGrid}>
              {eventos.map((e) => {
                const isPast = e.dataISO ? new Date(e.dataISO) < new Date() : false;
                const pctCanc = e.inscritos ? Math.round((e.cancelados / e.inscritos) * 100) : 0;
                const dataFmt = e.dataISO
                  ? new Date(e.dataISO).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
                  : (e.data || "—");
                return (
                  <Link key={e._id} href={`/admin/evento/${e._id}/presencas`} style={s.eventCard}>
                    <div style={s.eventCardHead}>
                      <span style={{ ...s.eyebrow, color: COLORS.coral }}>{e.edicao || "Evento"}</span>
                      <span style={isPast ? s.badgePast : s.badgeUpcoming}>
                        {isPast ? "Passado" : "Próximo"}
                      </span>
                    </div>
                    <h3 style={s.eventCardTitle}>{e.tema || "A Anunciar"}</h3>
                    <p style={s.eventCardMeta}>
                      <Calendar size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                      {dataFmt}
                    </p>
                    <div style={s.eventCardStats}>
                      <MiniStat label="Inscritos" value={e.inscritos} color={COLORS.navy} />
                      <MiniStat label="Compareceram" value={e.confirmados} color="#16a34a" />
                      <MiniStat label="Cancelados" value={e.cancelados} color={COLORS.red} />
                      {isPast && <MiniStat label="Faltaram" value={e.faltaram} color={COLORS.amber} />}
                    </div>
                    {e.inscritos > 0 && (
                      <div style={s.eventCardBar} title={`${pctCanc}% cancelaram`}>
                        <div style={{ ...s.barSeg, background: "#16a34a", width: `${(e.confirmados / e.inscritos) * 100}%` }} />
                        <div style={{ ...s.barSeg, background: COLORS.amber, width: `${(e.faltaram / e.inscritos) * 100}%` }} />
                        <div style={{ ...s.barSeg, background: COLORS.red, width: `${(e.cancelados / e.inscritos) * 100}%` }} />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <p style={s.footnote}>
          Lista de espera atual em todos os eventos: <strong>{totalEspera}</strong>.
          “Compareceram” conta reservas com check-in (QR ou marcação manual).
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, accent, darkText, href }) {
  const body = (
    <>
      <div style={{ ...s.cardIconWrap, background: `${accent}15`, color: accent }}>
        <Icon size={18} />
      </div>
      <div style={s.cardLabel}>{label}</div>
      <div style={{ ...s.cardValue, color: darkText ? "#0c0c10" : accent }}>{value}</div>
      {sub && <div style={s.cardSub}>{sub}</div>}
      {href && (
        <div style={s.cardArrow}>
          <ChevronRight size={14} />
        </div>
      )}
    </>
  );
  const baseStyle = { ...s.card, borderTop: `3px solid ${accent}` };
  if (href) {
    return (
      <Link href={href} style={{ ...baseStyle, ...s.cardLink }}>
        {body}
      </Link>
    );
  }
  return <div style={baseStyle}>{body}</div>;
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
}

function DonutCard({ title, data }) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);
  return (
    <div style={s.donutCard}>
      <h3 style={s.donutTitle}>{title}</h3>
      {!hasData ? (
        <p style={s.muted}>Sem dados ainda.</p>
      ) : (
        <Charts type="donut" data={data} palette={DONUT_PALETTE} />
      )}
    </div>
  );
}

const s = {
  page: { minHeight: "100dvh", background: COLORS.bg, fontFamily: "-apple-system, Segoe UI, Roboto, Arial, sans-serif", color: COLORS.text, padding: "32px 16px" },
  container: { maxWidth: 1200, margin: "0 auto" },
  nav: { marginBottom: 16 },
  navLink: { color: COLORS.muted, textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  eyebrow: { textTransform: "uppercase", fontSize: 11, letterSpacing: 1.2, color: COLORS.faint, margin: 0, fontWeight: 600 },
  h1: { fontSize: 32, margin: "6px 0 0", color: "#0c0c10", letterSpacing: -0.5 },
  h2: { fontSize: 16, margin: 0, color: "#0c0c10", fontWeight: 600 },
  muted: { color: COLORS.muted, fontSize: 14, margin: "8px 0 0" },
  mutedSm: { color: COLORS.faint, fontSize: 13 },
  userBox: { textAlign: "right" },
  grid6: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 },
  card: { background: COLORS.card, borderRadius: 12, padding: "16px 18px 18px", border: "1px solid #eef0f3", boxShadow: "0 1px 3px rgba(15,23,42,.04)", position: "relative" },
  cardLink: { display: "block", textDecoration: "none", color: "inherit", cursor: "pointer", transition: "transform .12s ease, box-shadow .12s ease" },
  cardArrow: { position: "absolute", top: 16, right: 14, color: "#cbd5e1" },
  cardIconWrap: { width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardLabel: { fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6, fontWeight: 600 },
  cardValue: { fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  cardSub: { fontSize: 12, color: COLORS.faint, marginTop: 6 },
  kpiBig: { background: `linear-gradient(135deg, ${COLORS.cream} 0%, #fff 100%)`, borderRadius: 14, padding: "22px 24px", marginBottom: 28, border: `1px solid #ffe1d8`, display: "flex", alignItems: "center", gap: 18 },
  kpiIcon: { width: 56, height: 56, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(255,54,107,.15)" },
  kpiLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.muted, margin: 0, fontWeight: 600 },
  kpiValue: { fontSize: 24, fontWeight: 700, margin: "6px 0 4px", color: "#0c0c10" },
  kpiContext: { fontSize: 15, fontWeight: 500, color: "#0c0c10" },
  kpiSub: { fontSize: 13, color: COLORS.muted, margin: 0 },
  section: { background: COLORS.card, borderRadius: 14, padding: "20px 22px", marginBottom: 20, border: "1px solid #eef0f3" },
  sectionHead: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
  chartBox: { height: 280, width: "100%" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  donutCard: { background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #f4f4f4" },
  donutTitle: { fontSize: 13, color: "#0c0c10", margin: "0 0 10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  eventGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 },
  eventCard: { display: "block", background: "#fff", border: "1px solid #eef0f3", borderRadius: 12, padding: 16, textDecoration: "none", color: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,.03)", transition: "transform .12s ease, box-shadow .12s ease" },
  eventCardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  eventCardTitle: { fontSize: 17, margin: "2px 0 6px", color: "#0c0c10", fontWeight: 700, lineHeight: 1.25 },
  eventCardMeta: { fontSize: 12, color: COLORS.muted, margin: "0 0 12px", display: "flex", alignItems: "center" },
  eventCardStats: { display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid #f0f0f0" },
  eventCardBar: { display: "flex", height: 6, marginTop: 14, borderRadius: 999, overflow: "hidden", background: "#f0f0f0" },
  barSeg: { height: "100%" },
  badgePast: { background: "#f3f4f6", color: "#6b7280", fontSize: 10.5, padding: "2px 8px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  badgeUpcoming: { background: "#fff0f3", color: COLORS.coral, fontSize: 10.5, padding: "2px 8px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  footnote: { fontSize: 12, color: COLORS.faint, margin: "16px 4px 0" },
};
