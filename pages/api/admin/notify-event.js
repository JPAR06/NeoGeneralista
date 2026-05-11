import { client } from "../../../lib/sanity";
import { sendEmail } from "../../../lib/email";
import { requireAdminApi } from "../../../lib/admin";
import { sanitizeHtml, htmlToText } from "../../../lib/sanitizeHtml";

// Send a last-minute notification to event attendees.
// POST { eventoId, subject, message, includeWaitlist? }
// Auth: admin session.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return; // 404 already sent

  const { eventoId, subject, message, includeWaitlist } = req.body || {};

  if (!eventoId || typeof eventoId !== "string") {
    return res.status(400).json({ error: "eventoId obrigatório" });
  }
  if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
    return res.status(400).json({ error: "Subject obrigatório (mín. 3 chars)" });
  }
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Mensagem obrigatória" });
  }

  // Sanitize the rich-text message (admin-authored HTML from the editor).
  // Whitelisted tags only: b/i/u/strong/em/a/p/br/ul/ol/li.
  const safeMessageHtml = sanitizeHtml(message);
  const messagePlain = htmlToText(safeMessageHtml);
  if (messagePlain.trim().length < 5) {
    return res.status(400).json({ error: "Mensagem demasiado curta (mín. 5 chars)" });
  }

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{_id, edicao, tema, data, horario, local, dataISO}`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  const estados = includeWaitlist ? ["confirmado", "lista_espera"] : ["confirmado"];
  const reservas = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && estado in $estados]{nome, email, estado}`,
    { eventoId, estados }
  );

  if (reservas.length === 0) {
    return res.status(200).json({ ok: true, sent: 0, failed: 0, total: 0, message: "Sem destinatários" });
  }

  const eventoTitulo = evento.edicao || evento.tema || "AlgoritmoHumano";
  const html = buildHtml({ evento, eventoTitulo, messageHtml: safeMessageHtml });
  const text = buildText({ evento, eventoTitulo, message: messagePlain });

  let sent = 0, failed = 0;
  const failedEmails = [];

  for (const r of reservas) {
    try {
      await sendEmail({
        to: r.email,
        toName: r.nome || r.email,
        // Subject is written by the admin as-is (no auto-prefix); the email
        // body still shows the event context as a soft eyebrow label so the
        // recipient knows why they're getting this.
        subject: subject.trim(),
        html,
        text,
      });
      sent++;
    } catch (err) {
      console.error(`[notify-event] failed to ${r.email}:`, err?.message || err);
      failed++;
      failedEmails.push(r.email);
    }
    // Courtesy throttle
    await new Promise((r2) => setTimeout(r2, 100));
  }

  // Persist last-notified timestamp on the event so the UI can warn about
  // accidental duplicate sends.
  if (sent > 0) {
    try {
      const { writeClient } = await import("../../../lib/sanity");
      await writeClient
        .patch(evento._id)
        .set({ ultimaNotificacaoAt: new Date().toISOString(), ultimaNotificacaoSubject: subject.trim() })
        .commit();
    } catch (err) {
      console.error("[notify-event] failed to record timestamp:", err);
    }
  }

  return res.status(200).json({
    ok: true,
    sent,
    failed,
    total: reservas.length,
    ...(failedEmails.length ? { failedEmails: failedEmails.slice(0, 10) } : {}),
  });
}

function buildHtml({ evento, eventoTitulo, messageHtml }) {
  // messageHtml is already sanitized at the API boundary.
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="padding:18px 32px 14px;border-bottom:1px solid #eee">
      <p style="margin:0;color:#888;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">${eventoTitulo}</p>
    </div>
    <div style="padding:24px 32px;font-size:15px;line-height:1.6">
      <div>${messageHtml}</div>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0 16px"/>
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.06em">Detalhes do evento</p>
      <table style="font-size:13px;color:#555">
        ${evento.data ? `<tr><td style="padding:4px 12px 4px 0;color:#888">Data</td><td><strong>${evento.data}</strong></td></tr>` : ""}
        ${evento.horario ? `<tr><td style="padding:4px 12px 4px 0;color:#888">Horário</td><td><strong>${evento.horario}</strong></td></tr>` : ""}
        ${evento.local ? `<tr><td style="padding:4px 12px 4px 0;color:#888">Local</td><td><strong>${evento.local}</strong></td></tr>` : ""}
      </table>
    </div>
    <div style="padding:14px 32px;background:#f9f9f9;border-top:1px solid #e5e5e5;font-size:12px;color:#aaa">
      <p style="margin:0">AlgoritmoHumano · NeoGeneralista</p>
      <p style="margin:4px 0 0;font-size:11px">Recebes este email porque estás inscrito em ${eventoTitulo}.</p>
    </div>
  </div>
</body></html>`;
}

function buildText({ evento, eventoTitulo, message }) {
  const lines = [
    eventoTitulo,
    "—",
    "",
    message,
    "",
    "Detalhes do evento:",
  ];
  if (evento.data) lines.push(`Data: ${evento.data}`);
  if (evento.horario) lines.push(`Horário: ${evento.horario}`);
  if (evento.local) lines.push(`Local: ${evento.local}`);
  lines.push("", "AlgoritmoHumano — NeoGeneralista");
  lines.push(`Recebes este email porque estás inscrito em ${eventoTitulo}.`);
  return lines.join("\n");
}
