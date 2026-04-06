import { client } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";

// Called daily by Vercel Cron. Sends a reminder to everyone with a confirmed
// reservation for events happening within the next 23–25 hours.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // Protect the endpoint — only Vercel Cron (or you, with the secret) can call it
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  // Find events whose ISO datetime falls in the 23–25 h window
  const eventos = await client.fetch(
    `*[_type == "eventoProximo" && dataISO > $from && dataISO <= $to]`,
    { from, to }
  );

  if (!eventos.length) {
    return res.status(200).json({ sent: 0, message: "No events in window" });
  }

  let sent = 0;

  for (const evento of eventos) {
    // Get all confirmed reservations for this event
    const reservas = await client.fetch(
      `*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"]{nome, email}`,
      { eventoId: evento._id }
    );

    for (const reserva of reservas) {
      try {
        await sendEmail({
          to: reserva.email,
          toName: reserva.nome,
          subject: `Lembrete — ${evento.edicao ?? "Algoritmo Humano"} é amanhã!`,
          html: buildReminderEmail({ reserva, evento }),
        });
        sent++
      } catch (err) {
        console.error(`[reminders] failed to email ${reserva.email}:`, err)
      }
    }
  }

  return res.status(200).json({ sent });
}

function buildReminderEmail({ reserva, evento }) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${evento.edicao ?? "Algoritmo Humano"} é amanhã!</h2>
      <p style="margin-top:0;color:#555">Lembrete da tua reserva confirmada.</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
      <p><strong>Olá, ${reserva.nome}!</strong></p>
      <p>Só a relembrar que o próximo evento é <strong>amanhã</strong>. Esperamos por ti!</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        ${evento.data ? `<tr><td style="padding:6px 0;color:#555;width:120px">Data</td><td style="padding:6px 0"><strong>${evento.data}</strong></td></tr>` : ""}
        ${evento.horario ? `<tr><td style="padding:6px 0;color:#555">Horário</td><td style="padding:6px 0"><strong>${evento.horario}</strong></td></tr>` : ""}
        ${evento.local ? `<tr><td style="padding:6px 0;color:#555">Local</td><td style="padding:6px 0"><strong>${evento.local}</strong></td></tr>` : ""}
        ${evento.convidado ? `<tr><td style="padding:6px 0;color:#555">Convidado/a</td><td style="padding:6px 0"><strong>${evento.convidado}</strong></td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
      <p style="font-size:13px;color:#888">NeoGeneralista · <a href="https://neogeneralista.pt" style="color:#888">neogeneralista.pt</a></p>
    </div>
  `;
}
