import { client } from "../../../lib/sanity";
import { sendEmail } from "../../../lib/email";
import { requireAdminApi } from "../../../lib/admin";
import { sanitizeHtml, htmlToText } from "../../../lib/sanitizeHtml";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../../lib/emailTemplate";
import { buildEventNoticeTemplate } from "../../../lib/emailContent";

// Send a last-minute notification to event attendees.
// POST { eventoId, subject, message, includeWaitlist? }
// Auth: admin session.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return;

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

  const safeMessageHtml = sanitizeHtml(message);
  const messagePlain = htmlToText(safeMessageHtml);
  if (messagePlain.trim().length < 5) {
    return res.status(400).json({ error: "Mensagem demasiado curta (mín. 5 chars)" });
  }

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{_id, edicao, tema, data, horario, local, localUrl, dataISO}`,
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

  const eventoTitulo = evento.edicao || evento.tema || "Algoritmo Humano";
  const cleanedSubject = cleanSubject(subject);
  const { html: htmlOpts, text: textOpts } = buildEventNoticeTemplate({
    evento,
    eventoTitulo,
    messageHtml: safeMessageHtml,
    messagePlain,
    cleanedSubject,
  });

  const html = renderEmail(htmlOpts);
  const text = renderEmailText(textOpts);

  let sent = 0, failed = 0;
  const failedEmails = [];

  for (const r of reservas) {
    try {
      await sendEmail({
        to: r.email,
        toName: r.nome || r.email,
        subject: cleanedSubject,
        html,
        text,
        headers: defaultHeaders({ topic: "eventos", recipientEmail: r.email }),
      });
      sent++;
    } catch (err) {
      console.error(`[notify-event] failed to ${r.email}:`, err?.message || err);
      failed++;
      failedEmails.push(r.email);
    }
    await new Promise((r2) => setTimeout(r2, 100));
  }

  if (sent > 0) {
    try {
      const { writeClient } = await import("../../../lib/sanity");
      await writeClient
        .patch(evento._id)
        .set({ ultimaNotificacaoAt: new Date().toISOString(), ultimaNotificacaoSubject: cleanedSubject })
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
