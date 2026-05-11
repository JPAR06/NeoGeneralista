import { useState, useMemo } from "react";
import Link from "next/link";
import { client } from "../../../../lib/sanity";
import { requireAdmin } from "../../../../lib/admin";
import clientPromise from "../../../../lib/mongodb";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const { eventoId } = ctx.params;
  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{_id, edicao, tema, data, horario, local, dataISO, ultimaNotificacaoAt, ultimaNotificacaoSubject}`,
    { id: eventoId }
  );
  if (!evento) return { notFound: true };

  const reservas = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"] | order(checkedIn desc, checkedInAt asc, nome asc){_id, nome, email, checkedIn, checkedInAt}`,
    { eventoId }
  );

  // Users already in this event (any active state) — used to exclude from the
  // manual-inscribe picker.
  const activeReservas = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && estado != "cancelado"]{userId}`,
    { eventoId }
  );
  const usedUserIds = new Set(activeReservas.map((r) => r.userId).filter(Boolean));

  // All registered users in MongoDB, projected for the picker.
  const mongo = await clientPromise;
  const allUsers = await mongo.db().collection("users")
    .find({ email: { $exists: true } }, { projection: { name: 1, email: 1 } })
    .sort({ name: 1 })
    .toArray();
  const eligibleUsers = allUsers
    .filter((u) => !usedUserIds.has(u._id.toString()))
    .map((u) => ({
      id: u._id.toString(),
      name: u.name || "",
      email: u.email,
    }));

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
      eligibleUsers,
      qrUrl: `/api/qr/${eventoId}?size=400`,
      qrFullUrl: `/api/qr/${eventoId}?size=1400`,
      printUrl: `/admin/evento/${eventoId}/qr`,
      inscritosExportUrl: `/api/exportar-reservas?eventoId=${eventoId}&tipo=inscritos`,
      participantesExportUrl: `/api/exportar-reservas?eventoId=${eventoId}&tipo=participantes`,
      studioUrl: `/studio/structure/eventoProximo;${eventoId}`,
      checkinUrl,
      projectId,
    },
  };
}

export default function Presencas({
  evento,
  reservas: initialReservas,
  eligibleUsers: initialEligible,
  qrUrl,
  qrFullUrl,
  printUrl,
  inscritosExportUrl,
  participantesExportUrl,
  studioUrl,
  checkinUrl,
}) {
  const [reservas, setReservas] = useState(initialReservas);
  const [eligible, setEligible] = useState(initialEligible || []);
  const [pending, setPending] = useState({});  // { reservaId: boolean }
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reservas;
    return reservas.filter(
      (r) => r.nome?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
    );
  }, [reservas, search]);

  const total = reservas.length;
  const presentes = reservas.filter((r) => r.checkedIn).length;
  const taxa = total ? Math.round((presentes / total) * 100) : 0;

  async function toggle(reserva) {
    const next = !reserva.checkedIn;
    // Optimistic update
    const prev = reservas;
    setReservas((rs) =>
      rs.map((r) =>
        r._id === reserva._id
          ? { ...r, checkedIn: next, checkedInAt: next ? new Date().toISOString() : null }
          : r
      )
    );
    setPending((p) => ({ ...p, [reserva._id]: true }));
    setError(null);
    try {
      const res = await fetch("/api/admin/checkin-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reservaId: reserva._id, checkedIn: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    } catch (e) {
      // Revert
      setReservas(prev);
      setError(`Erro ao actualizar ${reserva.nome}: ${e.message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setPending((p) => {
        const { [reserva._id]: _, ...rest } = p;
        return rest;
      });
    }
  }

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
          <a href={inscritosExportUrl} style={s.btn}>⬇️ Exportar inscritos</a>
          <a href={participantesExportUrl} style={s.btn}>⬇️ Exportar participantes</a>
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

        <ManualInscreverBlock
          eventoId={evento._id}
          users={eligible}
          onInscrito={(novaReserva) => {
            // Only add to the visible list (which shows estado=confirmado)
            if (novaReserva.estado === "confirmado") {
              setReservas((prev) => [...prev, novaReserva]);
            }
            setEligible((prev) => prev.filter((u) => u.id !== novaReserva.userId));
          }}
        />

        <NotifyBlock evento={evento} confirmadosCount={total} />


        <section>
          <div style={s.listHeader}>
            <h2 style={s.h2}>Lista de inscritos confirmados</h2>
            <p style={s.muted}>
              Clica nas caixas para marcar/desmarcar manualmente (override do QR).
            </p>
          </div>

          {reservas.length > 0 && (
            <div style={s.searchWrap}>
              <input
                type="search"
                placeholder="Procurar por nome ou email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={s.search}
              />
              {search && (
                <span style={s.searchCount}>
                  {filtered.length} de {total}
                </span>
              )}
            </div>
          )}

          {error && <p style={s.errorBanner}>{error}</p>}

          {reservas.length === 0 ? (
            <p style={s.muted}>Sem inscrições confirmadas ainda.</p>
          ) : filtered.length === 0 ? (
            <p style={s.muted}>Nenhum resultado para “{search}”.</p>
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
                {filtered.map((r) => {
                  const isPending = !!pending[r._id];
                  return (
                    <tr key={r._id} style={r.checkedIn ? s.rowIn : undefined}>
                      <td style={s.tdCheckbox}>
                        <label style={{ ...s.checkboxLabel, opacity: isPending ? 0.5 : 1 }}>
                          <input
                            type="checkbox"
                            checked={!!r.checkedIn}
                            disabled={isPending}
                            onChange={() => toggle(r)}
                            style={s.checkbox}
                            aria-label={`Marcar ${r.nome} como presente`}
                          />
                        </label>
                      </td>
                      <td style={s.td}>{r.nome}</td>
                      <td style={{ ...s.td, color: "#666", fontSize: 13 }}>{r.email}</td>
                      <td style={s.td}>
                        {r.checkedInAt
                          ? new Date(r.checkedInAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </td>
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

function Stat({ label, value }) {
  return (
    <div style={s.stat}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function ManualInscreverBlock({ eventoId, users, onInscrito }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type, text }

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users.slice(0, 8);
    return users
      .filter((u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [users, search]);

  async function inscrever(user) {
    if (!confirm(`Inscrever ${user.name || user.email} neste evento?${sendEmail ? " (será enviado email)" : ""}`)) {
      return;
    }
    setPendingId(user.id);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/manual-inscrever", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventoId, userId: user.id, sendEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const estadoTxt = data.estado === "confirmado" ? "confirmado" : "lista de espera";
      const emailTxt = sendEmail
        ? data.emailSent ? " · email enviado" : " · email FALHOU"
        : "";
      setFeedback({
        type: data.estado === "confirmado" ? "success" : "info",
        text: `${user.name || user.email} inscrito como ${estadoTxt}${emailTxt}`,
      });
      // Notify parent: the parent updates `reservas` (only if confirmado, since
      // the visible list filters confirmados) and removes from eligible list.
      if (onInscrito && data.estado === "confirmado") {
        onInscrito({ ...data.reserva, userId: user.id });
      } else if (onInscrito) {
        // Even if waitlist, remove from eligible (they have a reservation now)
        onInscrito({ ...data.reserva, userId: user.id, _waitlistOnly: true });
      }
      setSearch("");
    } catch (e) {
      setFeedback({ type: "error", text: `Erro: ${e.message}` });
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section style={s.notifyBox}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={s.notifyToggle}>
        <span>➕ Inscrever pessoa manualmente</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={s.notifyBody}>
          <p style={s.muted}>
            Apenas utilizadores que <strong>já têm conta no site</strong> aparecem aqui.
            Se a pessoa não tem conta, peça-lhe para criar em <code>/auth/registar</code>.
          </p>

          <input
            type="search"
            placeholder="Procurar por nome ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.notifyInput}
            autoFocus
          />

          <label style={s.notifyCheckLabel}>
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
            />
            <span>Enviar email de confirmação ao inscrever</span>
          </label>

          {feedback && (
            <p style={feedback.type === "error" ? s.errorBanner : feedback.type === "success" ? s.notifySuccess : s.notifyWarn}>
              {feedback.text}
            </p>
          )}

          {users.length === 0 ? (
            <p style={s.muted}>Não há utilizadores elegíveis (todos os registados já estão inscritos).</p>
          ) : matches.length === 0 ? (
            <p style={s.muted}>Nenhum resultado para “{search}”.</p>
          ) : (
            <div style={s.userList}>
              {matches.map((u) => (
                <div key={u.id} style={s.userRow}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.userName}>{u.name || <em style={s.dim}>sem nome</em>}</div>
                    <div style={s.userEmail}>{u.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => inscrever(u)}
                    disabled={pendingId === u.id}
                    style={{ ...s.btn, ...s.btnPrimary, opacity: pendingId === u.id ? 0.5 : 1, padding: "6px 12px", fontSize: 13 }}
                  >
                    {pendingId === u.id ? "A inscrever…" : "Inscrever"}
                  </button>
                </div>
              ))}
              {!search && users.length > matches.length && (
                <p style={{ ...s.muted, textAlign: "center", padding: "8px 0" }}>
                  …mais {users.length - matches.length} utilizadores. Escreve para filtrar.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const NOTIFY_TEMPLATES = [
  {
    id: "atraso",
    label: "Atraso",
    subject: "Atraso no início",
    message: "Olá! Devido a um imprevisto, o evento começará com algum atraso. Avisaremos quando estivermos prontos. Obrigado pela compreensão!",
  },
  {
    id: "local",
    label: "Mudança de local",
    subject: "Mudança de local",
    message: "Olá! Importante: o local do evento mudou. Nova morada: [INDICAR AQUI]. Pedimos desculpa pelo inconveniente.",
  },
  {
    id: "cancel",
    label: "Cancelamento",
    subject: "Evento cancelado",
    message: "Olá! Lamentamos informar que o evento de hoje foi cancelado. Estamos a remarcar e damos mais informações em breve. Obrigado pela compreensão.",
  },
];

function NotifyBlock({ evento, confirmadosCount }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeWaitlist, setIncludeWaitlist] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // { ok, sent, failed, total } | { error }

  const lastSent = evento.ultimaNotificacaoAt
    ? new Date(evento.ultimaNotificacaoAt)
    : null;
  const lastSentMinutes = lastSent ? Math.floor((Date.now() - lastSent.getTime()) / 60000) : null;
  const recentlySent = lastSentMinutes !== null && lastSentMinutes < 30;

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setMessage(t.message);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setResult({ error: "Preenche assunto e mensagem." });
      return;
    }
    if (!confirm(`Enviar notificação para ${confirmadosCount}${includeWaitlist ? " (+ lista espera)" : ""} inscritos?`)) {
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notify-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ eventoId: evento._id, subject, message, includeWaitlist }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
      if (data.sent > 0) {
        setSubject("");
        setMessage("");
      }
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={s.notifyBox}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={s.notifyToggle}>
        <span>📨 Notificar inscritos por email</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={s.notifyBody}>
          {recentlySent && (
            <p style={s.notifyWarn}>
              ⚠️ Última notificação enviada há {lastSentMinutes} min
              {evento.ultimaNotificacaoSubject ? ` ("${evento.ultimaNotificacaoSubject}")` : ""}.
              Confirma que não estás a duplicar.
            </p>
          )}

          <p style={s.muted}>Templates rápidos:</p>
          <div style={s.notifyTemplates}>
            {NOTIFY_TEMPLATES.map((t) => (
              <button key={t.id} type="button" onClick={() => applyTemplate(t)} style={s.notifyChip}>
                {t.label}
              </button>
            ))}
          </div>

          <label style={s.notifyLabel}>
            Assunto
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Atraso no início"
              style={s.notifyInput}
              maxLength={120}
              disabled={sending}
            />
          </label>

          <label style={s.notifyLabel}>
            Mensagem
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="O texto que aparece no corpo do email…"
              rows={5}
              style={{ ...s.notifyInput, fontFamily: "inherit", resize: "vertical" }}
              disabled={sending}
            />
          </label>

          <label style={s.notifyCheckLabel}>
            <input
              type="checkbox"
              checked={includeWaitlist}
              onChange={(e) => setIncludeWaitlist(e.target.checked)}
              disabled={sending}
            />
            <span>Incluir lista de espera</span>
          </label>

          <div style={s.notifyActions}>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              style={{ ...s.btn, ...s.btnPrimary, opacity: sending ? 0.5 : 1 }}
            >
              {sending
                ? "A enviar…"
                : `Enviar a ${confirmadosCount}${includeWaitlist ? " + lista" : ""} inscritos`}
            </button>
          </div>

          {result?.error && <p style={s.errorBanner}>Erro: {result.error}</p>}
          {result?.ok && (
            <p style={s.notifySuccess}>
              ✅ {result.sent} email(s) enviados de {result.total}.
              {result.failed > 0 ? ` ${result.failed} falharam.` : ""}
            </p>
          )}
        </div>
      )}
    </section>
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
  h2: { fontSize: 18, margin: "0 0 6px" },
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
  listHeader: { marginBottom: 12 },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "0 0 12px",
  },
  search: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    fontSize: 14,
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
  },
  searchCount: { color: "#888", fontSize: 13 },
  errorBanner: {
    background: "#fff1f0",
    border: "1px solid #ffccc7",
    color: "#a8071a",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 14,
    margin: "0 0 12px",
  },
  table: { width: "100%", background: "#fff", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" },
  th: { textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #eee", fontSize: 13, color: "#666", background: "#fafafa" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f5f5f5", fontSize: 14 },
  tdCheckbox: { padding: "10px 12px", borderBottom: "1px solid #f5f5f5", textAlign: "center", width: 80 },
  checkboxLabel: { display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 4 },
  checkbox: { width: 18, height: 18, accentColor: "#1a7f37", cursor: "pointer" },
  rowIn: { background: "#f3faf3" },
  notifyBox: {
    background: "#fff",
    borderRadius: 8,
    marginBottom: 24,
    overflow: "hidden",
    border: "1px solid #e5e5e5",
  },
  notifyToggle: {
    width: "100%",
    padding: "14px 18px",
    background: "#fff",
    border: 0,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "inherit",
  },
  notifyBody: {
    padding: "8px 18px 18px",
    borderTop: "1px solid #f0f0f0",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  notifyWarn: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 13,
    margin: 0,
  },
  notifyTemplates: { display: "flex", flexWrap: "wrap", gap: 6 },
  notifyChip: {
    padding: "6px 12px",
    background: "#f4f4f4",
    border: "1px solid #e5e5e5",
    borderRadius: 16,
    fontSize: 13,
    cursor: "pointer",
    color: "#444",
    fontFamily: "inherit",
  },
  notifyLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    fontSize: 13,
    color: "#555",
    fontWeight: 500,
  },
  notifyInput: {
    padding: "10px 12px",
    border: "1px solid #e5e5e5",
    borderRadius: 6,
    fontSize: 14,
    background: "#fff",
    color: "#1a1a1a",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  notifyCheckLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#444",
    cursor: "pointer",
  },
  notifyActions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 },
  notifySuccess: {
    background: "#e6f6ec",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: 6,
    fontSize: 14,
    margin: 0,
  },
  userList: {
    border: "1px solid #eee",
    borderRadius: 8,
    overflow: "auto",
    maxHeight: 400,
    background: "#fafafa",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fff",
  },
  userName: { fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: 13, color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  dim: { color: "#999", fontStyle: "italic" },
};
