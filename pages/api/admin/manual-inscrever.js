import { ObjectId } from "mongodb";
import { client, writeClient } from "../../../lib/sanity";
import { sendEmail } from "../../../lib/email";
import { buildGoogleCalendarUrl } from "../../../lib/ics";
import clientPromise from "../../../lib/mongodb";
import { requireAdminApi } from "../../../lib/admin";

// Manually inscribe a registered user into an event from /admin.
// POST { eventoId, userId, sendEmail? }
// Auth: admin session.
//
// Differs from /api/reservar (self-signup):
//   - works regardless of formularioAtivo (admin override)
//   - operates on any user, not session
//   - email send is optional (toggle in UI)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return; // 404 already sent

  const { eventoId, userId, sendEmail: shouldEmail = true } = req.body || {};

  if (!eventoId || typeof eventoId !== "string") {
    return res.status(400).json({ error: "eventoId obrigatório" });
  }
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId obrigatório" });
  }

  // Look up the user in MongoDB
  const mongo = await clientPromise;
  let userObjId;
  try { userObjId = new ObjectId(userId); }
  catch { return res.status(400).json({ error: "userId inválido" }); }
  const user = await mongo.db().collection("users").findOne(
    { _id: userObjId },
    { projection: { name: 1, email: 1 } }
  );
  if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

  // Look up the event
  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  // Refuse if user already has an active reservation
  const existing = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]{_id, estado}`,
    { eventoId, userId: user._id.toString() }
  );
  if (existing) {
    return res.status(409).json({
      error: `Já tem reserva (${existing.estado})`,
      estado: existing.estado,
    });
  }

  // Decide estado based on capacity
  const count = await client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );
  const estado = count < (evento.maxParticipantes ?? 9999) ? "confirmado" : "lista_espera";

  // Create the reservation
  const reserva = await writeClient.create({
    _type: "reserva",
    eventoId,
    userId: user._id.toString(),
    nome: user.name,
    email: user.email,
    estado,
  });

  // Optionally send the same confirmation email as self-signup
  let emailSent = false;
  if (shouldEmail && user.email) {
    try {
      // Calendar download URL — Sender.net doesn't accept .ics attachments,
      // so we put it as a clickable link in the email body instead.
      let icsUrl = null;
      if (estado === "confirmado" && evento.dataISO) {
        const host = req.headers.host || "";
        const proto = req.headers["x-forwarded-proto"]
          || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
        const base = process.env.SITE_URL || `${proto}://${host}`;
        icsUrl = `${base.replace(/\/$/, "")}/api/calendar/${reserva._id}.ics`;
      }

      const subject = estado === "confirmado"
        ? `Inscricao confirmada - ${evento.edicao ?? "Algoritmo Humano"}`
        : `Lista de espera - ${evento.edicao ?? "Algoritmo Humano"}`;

      await sendEmail({
        to: user.email,
        toName: user.name || user.email,
        subject,
        html: buildConfirmationEmail({ user, evento, estado, icsUrl }),
        text: buildConfirmationText({ user, evento, estado, icsUrl }),
      });
      emailSent = true;
    } catch (err) {
      console.error("[manual-inscrever] email send failed:", err);
    }
  }

  return res.status(200).json({
    ok: true,
    estado,
    reserva: {
      _id: reserva._id,
      userId: user._id.toString(),
      nome: user.name,
      email: user.email,
      estado,
      checkedIn: false,
      checkedInAt: null,
    },
    emailSent,
  });
}

function buildConfirmationEmail({ user, evento, estado, icsUrl }) {
  const isConfirmed = estado === "confirmado";
  const statusText = isConfirmed
    ? "A tua inscricao esta <strong>confirmada</strong>."
    : "Estás na <strong>lista de espera</strong>. Avisamos-te se abrir vaga.";

  const googleUrl = isConfirmed && evento.dataISO ? buildGoogleCalendarUrl({ evento }) : null;
  const calendarBlock = isConfirmed && evento.dataISO
    ? `
      <div style="margin:20px 0;padding:16px;background:#f9f9f9;border-radius:6px">
        <p style="margin:0 0 12px;font-size:14px"><strong>Adiciona ao teu calendário</strong></p>
        ${googleUrl ? `<p style="margin:0 0 8px;font-size:13px">
          <a href="${googleUrl}" style="display:inline-block;padding:10px 16px;background:#1a1a1a;color:#fff;border-radius:6px;text-decoration:none;margin-right:6px">📅 Google Calendar</a>
        </p>` : ""}
        ${icsUrl ? `<p style="margin:0;font-size:13px">
          <a href="${icsUrl}" style="display:inline-block;padding:10px 16px;background:#fff;color:#1a1a1a;border:1px solid #ddd;border-radius:6px;text-decoration:none">🍎 Apple / Outlook (.ics)</a>
        </p>` : ""}
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5">
      <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">${evento.edicao ?? "Algoritmo Humano"}</p>
      <h1 style="margin:8px 0 0;font-size:20px">${isConfirmed ? "Inscricao confirmada" : "Lista de espera"}</h1>
    </div>
    <div style="padding:24px 32px">
      <p>Ola, <strong>${user.name || ""}</strong>.</p>
      <p>${statusText}</p>
      <p style="font-size:13px;color:#555">Esta inscrição foi feita pela equipa AlgoritmoHumano em teu nome. Se não a esperavas, responde a este email para nos dizeres.</p>
      <table style="border-collapse:collapse;width:100%;margin:20px 0;font-size:14px">
        ${evento.data ? `<tr><td style="padding:8px 0;color:#555;width:110px;border-bottom:1px solid #f0f0f0">Data</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0"><strong>${evento.data}</strong></td></tr>` : ""}
        ${evento.horario ? `<tr><td style="padding:8px 0;color:#555;border-bottom:1px solid #f0f0f0">Horario</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0"><strong>${evento.horario}</strong></td></tr>` : ""}
        ${evento.local ? `<tr><td style="padding:8px 0;color:#555;border-bottom:1px solid #f0f0f0">Local</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0"><strong>${evento.local}</strong></td></tr>` : ""}
        ${evento.convidado ? `<tr><td style="padding:8px 0;color:#555">Convidado/a</td><td style="padding:8px 0"><strong>${evento.convidado}</strong></td></tr>` : ""}
      </table>
      ${calendarBlock}
      <p style="font-size:13px;color:#555">Qualquer questao, responde a este email ou contacta-nos em <a href="mailto:ana@neogeneralista.pt" style="color:#555">ana@neogeneralista.pt</a>.</p>
    </div>
    <div style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #e5e5e5;font-size:12px;color:#aaa">
      <p style="margin:0">NeoGeneralista · <a href="https://neogeneralista.pt" style="color:#aaa;text-decoration:none">neogeneralista.pt</a></p>
    </div>
  </div>
</body>
</html>`;
}

function buildConfirmationText({ user, evento, estado, icsUrl }) {
  const isConfirmed = estado === "confirmado";
  const lines = [
    `Ola, ${user.name || ""}.`,
    "",
    isConfirmed ? "A tua inscricao esta confirmada." : "Estas na lista de espera. Avisamos-te se abrir vaga.",
    "",
    "Esta inscricao foi feita pela equipa AlgoritmoHumano em teu nome.",
    "",
  ];
  if (evento.data) lines.push(`Data: ${evento.data}`);
  if (evento.horario) lines.push(`Horario: ${evento.horario}`);
  if (evento.local) lines.push(`Local: ${evento.local}`);
  if (evento.convidado) lines.push(`Convidado/a: ${evento.convidado}`);
  if (icsUrl) {
    lines.push("");
    lines.push(`Adicionar ao calendario (Apple/Outlook): ${icsUrl}`);
  }
  lines.push("", "NeoGeneralista - neogeneralista.pt");
  return lines.join("\n");
}
