import { client } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../lib/emailTemplate";
import { buildReminderTemplate } from "../../lib/emailContent";

// Called daily by Vercel Cron. Sends a reminder to everyone with a confirmed
// reservation for events happening within the next 23-25 hours.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  const eventos = await client.fetch(
    `*[_type == "eventoProximo" && dataISO > $from && dataISO <= $to]`,
    { from, to }
  );

  if (!eventos.length) {
    return res.status(200).json({ sent: 0, message: "No events in window" });
  }

  let sent = 0;

  for (const evento of eventos) {
    const reservas = await client.fetch(
      `*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"]{nome, email}`,
      { eventoId: evento._id }
    );

    for (const reserva of reservas) {
      try {
        const subject = cleanSubject(
          `Lembrete — ${evento.edicao ?? "Algoritmo Humano"} é amanhã`
        );
        const tplOpts = buildReminderTemplate({ reserva, evento, window: "24h" });
        await sendEmail({
          to: reserva.email,
          toName: reserva.nome,
          subject,
          html: renderEmail(tplOpts),
          text: renderEmailText(tplOpts),
          headers: defaultHeaders({ topic: "eventos", recipientEmail: reserva.email, autoSubmitted: true }),
        });
        sent++;
      } catch (err) {
        console.error(`[reminders] failed to email ${reserva.email}:`, err);
      }
    }
  }

  return res.status(200).json({ sent });
}
