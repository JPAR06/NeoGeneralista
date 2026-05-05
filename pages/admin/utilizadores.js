import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { requireAdmin } from "../../lib/admin";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;
  return { props: {} };
}

export default function Utilizadores() {
  const [fonte, setFonte] = useState("geral"); // geral | site | newsletter
  const [data, setData] = useState({ total: 0, pessoas: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | with_consent | no_consent

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/exportar-utilizadores?format=json&fonte=${fonte}`, { credentials: "include" })
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d?.error || "Erro");
        setData({ total: d.total || 0, pessoas: d.pessoas || [] });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fonte]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.pessoas.filter((p) => {
      if (filter === "with_consent" && !p.consentimentoEventosFuturos) return false;
      if (filter === "no_consent" && p.consentimentoEventosFuturos) return false;
      if (!q) return true;
      return (p.nome?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    });
  }, [data.pessoas, search, filter]);

  const stats = useMemo(() => {
    const total = data.pessoas.length;
    const comConsent = data.pessoas.filter((p) => p.consentimentoEventosFuturos).length;
    const newsletter = data.pessoas.filter((p) => p.newsletter).length;
    const ambos = data.pessoas.filter((p) => p.origem === "site + newsletter").length;
    return { total, comConsent, newsletter, ambos };
  }, [data.pessoas]);

  const exportCsvUrl = `/api/exportar-utilizadores?fonte=${fonte}`;

  return (
    <div style={s.page}>
      <div style={s.container}>
        <nav style={s.nav}>
          <Link href="/admin" style={s.navLink}>← Dashboard admin</Link>
        </nav>

        <header style={s.header}>
          <p style={s.eyebrow}>Comunidade</p>
          <h1 style={s.h1}>Utilizadores</h1>
          <p style={s.muted}>Pessoas registadas no site + subscritores da newsletter.</p>
        </header>

        <section style={s.fonteSwitch}>
          {[
            { v: "geral", label: "Tudo (site + newsletter)" },
            { v: "site", label: "Só site" },
            { v: "newsletter", label: "Só newsletter" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setFonte(opt.v)}
              style={fonte === opt.v ? { ...s.pill, ...s.pillActive } : s.pill}
            >
              {opt.label}
            </button>
          ))}
        </section>

        <section style={s.stats}>
          <Stat label="Total" value={stats.total} />
          <Stat label="Newsletter" value={stats.newsletter} />
          <Stat label="Site + newsletter" value={stats.ambos} />
          <Stat label="Consent. eventos" value={stats.comConsent} />
        </section>

        <section style={s.actions}>
          <a href={exportCsvUrl} style={{ ...s.btn, ...s.btnPrimary }}>
            ⬇️ Exportar CSV ({fonte})
          </a>
          <a href="/api/exportar-utilizadores?fonte=site" style={s.btn}>⬇️ CSV só site</a>
          <a href="/api/exportar-utilizadores?fonte=newsletter" style={s.btn}>⬇️ CSV só newsletter</a>
        </section>

        <div style={s.toolbar}>
          <input
            type="search"
            placeholder="Procurar por nome ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.search}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={s.select}>
            <option value="all">Todos</option>
            <option value="with_consent">Com consent. eventos</option>
            <option value="no_consent">Sem consent. eventos</option>
          </select>
          <span style={s.muted}>
            {loading ? "A carregar…" : `${filtered.length} de ${stats.total}`}
          </span>
        </div>

        {error && <p style={s.errorBanner}>Erro: {error}</p>}

        {loading ? (
          <div style={s.empty}>A carregar utilizadores…</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>{stats.total === 0 ? "Nenhum utilizador encontrado." : `Nenhum resultado para “${search}”.`}</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nome</th>
                  <th style={s.th}>Email</th>
                  <th style={s.th}>Origem</th>
                  <th style={s.th}>Newsletter</th>
                  <th style={s.th}>Consent. eventos</th>
                  <th style={s.th}>Setor</th>
                  <th style={s.th}>Faixa etária</th>
                  <th style={s.th}>Registo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={`${p.email}-${i}`}>
                    <td style={s.td}>{p.nome || <em style={s.dim}>sem nome</em>}</td>
                    <td style={{ ...s.td, color: "#666", fontSize: 13 }}>{p.email}</td>
                    <td style={s.td}>
                      <OriginPill origem={p.origem} />
                    </td>
                    <td style={s.td}>{p.newsletter ? "✅" : "—"}</td>
                    <td style={s.td}>{p.consentimentoEventosFuturos ? "✅" : "—"}</td>
                    <td style={{ ...s.td, fontSize: 13 }}>{p.setorProfissional || "—"}</td>
                    <td style={{ ...s.td, fontSize: 13 }}>{p.faixaEtaria || "—"}</td>
                    <td style={{ ...s.td, fontSize: 13, color: "#666" }}>
                      {p.dataRegisto
                        ? new Date(p.dataRegisto).toLocaleDateString("pt-PT")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function OriginPill({ origem }) {
  const map = {
    site: { bg: "#e6f0ff", color: "#0a4a99" },
    newsletter: { bg: "#fff3e6", color: "#9a5500" },
    "site + newsletter": { bg: "#e6f6ec", color: "#1a7f37" },
  };
  const colors = map[origem] || { bg: "#f0f0f0", color: "#444" };
  return (
    <span style={{ background: colors.bg, color: colors.color, padding: "3px 9px", borderRadius: 12, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
      {origem}
    </span>
  );
}

const s = {
  page: { minHeight: "100dvh", background: "#f4f4f4", fontFamily: "Arial, sans-serif", color: "#1a1a1a", padding: "32px 16px" },
  container: { maxWidth: 1200, margin: "0 auto" },
  nav: { marginBottom: 16 },
  navLink: { color: "#666", textDecoration: "none", fontSize: 14 },
  header: { marginBottom: 24 },
  eyebrow: { textTransform: "uppercase", fontSize: 12, letterSpacing: 1, color: "#888", margin: 0 },
  h1: { fontSize: 28, margin: "6px 0 8px" },
  muted: { color: "#777", fontSize: 13 },
  fonteSwitch: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  pill: { padding: "8px 14px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#333" },
  pillActive: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 },
  stat: { background: "#fff", borderRadius: 8, padding: 16, textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 700 },
  statLabel: { fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 4 },
  actions: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  btn: { display: "inline-block", padding: "10px 14px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 6, textDecoration: "none", color: "#1a1a1a", fontSize: 14 },
  btnPrimary: { background: "#1a1a1a", color: "#fff", borderColor: "#1a1a1a" },
  toolbar: { display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  search: { flex: "1 1 240px", padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, background: "#fff", color: "#1a1a1a", outline: "none" },
  select: { padding: "10px 14px", border: "1px solid #e5e5e5", borderRadius: 6, fontSize: 14, background: "#fff", color: "#1a1a1a" },
  errorBanner: { background: "#fff1f0", border: "1px solid #ffccc7", color: "#a8071a", padding: "10px 14px", borderRadius: 6, fontSize: 14, marginBottom: 12 },
  empty: { background: "#fff", borderRadius: 8, padding: 60, textAlign: "center", color: "#777" },
  tableWrap: { background: "#fff", borderRadius: 8, overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee", fontSize: 12, color: "#666", background: "#fafafa", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 },
  td: { padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  dim: { color: "#999", fontStyle: "italic" },
};
