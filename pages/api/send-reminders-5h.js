import { client } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";

// Called hourly by GitHub Actions. Sends a reminder to everyone with a
// confirmed reservation for events happening within the next 4-6 hours.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const from = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();

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
        await sendEmail({
          to: reserva.email,
          toName: reserva.nome,
          subject: `Hoje — ${evento.edicao ?? "Algoritmo Humano"} começa em poucas horas`,
          html: buildReminderEmail({ reserva, evento }),
          text: buildReminderText({ reserva, evento }),
          headers: {
            "List-Unsubscribe": "<mailto:ana@neogeneralista.pt?subject=unsubscribe-eventos>",
          },
        });
        sent++;
      } catch (err) {
        console.error(`[reminders-5h] failed to email ${reserva.email}:`, err);
      }
    }
  }

  return res.status(200).json({ sent });
}

function buildReminderText({ reserva, evento }) {
  const edicao = evento.edicao ?? "Algoritmo Humano";
  const lines = [
    `Olá, ${reserva.nome},`,
    "",
    `O ${edicao} é hoje e começa daqui a poucas horas. Detalhes finais:`,
    "",
  ];
  if (evento.data) lines.push(`Data: ${evento.data}`);
  if (evento.horario) lines.push(`Horário: ${evento.horario}`);
  if (evento.local) {
    lines.push(
      evento.localUrl ? `Local: ${evento.local} (mapa: ${evento.localUrl})` : `Local: ${evento.local}`
    );
  }
  if (evento.convidado) lines.push(`Convidado: ${evento.convidado}`);
  lines.push(
    "",
    "Ver detalhes: https://neogeneralista.pt/algoritmo-humano/evento",
    "",
    "Não vais poder ir? Cancela a tua reserva diretamente na plataforma para libertares o lugar.",
    "",
    "— NeoGeneralista",
    "neogeneralista.pt"
  );
  return lines.join("\n");
}

function buildReminderEmail({ reserva, evento }) {
  const edicao = evento.edicao ?? "Algoritmo Humano";
  const localValue = evento.local
    ? `${evento.local}${evento.localUrl ? ` · <a href="${evento.localUrl}" style="color:#ff366b;text-decoration:none">Ver mapa</a>` : ""}`
    : null;
  const row = (label, value) => value
    ? `<tr>
         <td style="padding:10px 0;color:#94a3b8;width:120px;border-bottom:1px solid #f3e0d8;text-transform:uppercase;font-size:11px;letter-spacing:1px">${label}</td>
         <td style="padding:10px 0;border-bottom:1px solid #f3e0d8;color:#1e293b"><strong>${value}</strong></td>
       </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef0f3">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#eef0f3">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,.08);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1e293b">

        <tr><td style="background:linear-gradient(135deg,#070756 0%,#1a1a85 100%);padding:32px 36px 28px;color:#ffffff">
          <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#ffb8cc;font-weight:600">${edicao}</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;font-weight:700;color:#ffffff">É hoje. Até já.</h1>
          <p style="margin:8px 0 0;font-size:15px;color:#cfd0e8">Começamos daqui a poucas horas.</p>
        </td></tr>

        <tr><td style="height:4px;background:#ff366b;line-height:4px;font-size:0">&nbsp;</td></tr>

        <tr><td style="padding:32px 36px 8px">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Olá, <strong>${reserva.nome}</strong>,</p>
          <p style="margin:0;font-size:15px;line-height:1.65;color:#475569">
            O <strong style="color:#1e293b">${edicao}</strong> arranca <strong style="color:#ff366b">hoje</strong>. Aqui ficam os detalhes finais para teres à mão.
          </p>
        </td></tr>

        <tr><td style="padding:20px 36px 8px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFF8F6;border:1px solid #ffe1d8;border-radius:10px">
            <tr><td style="padding:20px 22px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px">
                ${row("Data", evento.data)}
                ${row("Horário", evento.horario)}
                ${row("Local", localValue)}
                ${row("Convidado", evento.convidado)}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding:28px 36px 8px">
          <a href="https://neogeneralista.pt/algoritmo-humano/evento" style="display:inline-block;background:#ff366b;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;letter-spacing:.2px">Ver detalhes do evento</a>
        </td></tr>

        <tr><td style="padding:16px 36px 32px">
          <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center">
            Não vais poder ir? Cancela a tua reserva diretamente na <a href="https://neogeneralista.pt/algoritmo-humano/evento" style="color:#ff366b;text-decoration:none;font-weight:600">plataforma</a> para libertares o lugar.
          </p>
        </td></tr>

        <tr><td style="background:#FFF8F6;border-top:1px solid #f0ece8;padding:20px 36px">
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
            <strong style="color:#1e293b">NeoGeneralista</strong> · <a href="https://neogeneralista.pt" style="color:#94a3b8;text-decoration:none">neogeneralista.pt</a><br/>
            Recebeste este email porque tens uma reserva confirmada no ${edicao}.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
