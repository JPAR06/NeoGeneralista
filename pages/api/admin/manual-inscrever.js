import { ObjectId } from "mongodb";
import { client, writeClient } from "../../../lib/sanity";
import { sendEmail } from "../../../lib/email";
import clientPromise from "../../../lib/mongodb";
import { requireAdminApi } from "../../../lib/admin";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../../lib/emailTemplate";
import { buildReservationTemplate } from "../../../lib/emailContent";

// Manually inscribe a registered user into an event from /admin.
// POST { eventoId, userId, sendEmail? }
// Auth: admin session.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return;

  const { eventoId, userId, sendEmail: shouldEmail = true } = req.body || {};

  if (!eventoId || typeof eventoId !== "string") {
    return res.status(400).json({ error: "eventoId obrigatório" });
  }
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId obrigatório" });
  }

  const mongo = await clientPromise;
  let userObjId;
  try { userObjId = new ObjectId(userId); }
  catch { return res.status(400).json({ error: "userId inválido" }); }
  const user = await mongo.db().collection("users").findOne(
    { _id: userObjId },
    { projection: { name: 1, email: 1 } }
  );
  if (!user) return res.status(404).json({ error: "Utilizador não encontrado" });

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

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

  const count = await client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );
  const estado = count < (evento.maxParticipantes ?? 9999) ? "confirmado" : "lista_espera";

  const reserva = await writeClient.create({
    _type: "reserva",
    eventoId,
    userId: user._id.toString(),
    nome: user.name,
    email: user.email,
    estado,
  });

  let emailSent = false;
  if (shouldEmail && user.email) {
    try {
      let icsUrl = null;
      if (estado === "confirmado" && evento.dataISO) {
        const host = req.headers.host || "";
        const proto = req.headers["x-forwarded-proto"]
          || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
        const base = process.env.SITE_URL || `${proto}://${host}`;
        icsUrl = `${base.replace(/\/$/, "")}/api/calendar/${reserva._id}.ics`;
      }

      const subject = cleanSubject(
        estado === "confirmado"
          ? `Inscrição confirmada — ${evento.edicao ?? "Algoritmo Humano"}`
          : `Lista de espera — ${evento.edicao ?? "Algoritmo Humano"}`
      );
      const tplOpts = buildReservationTemplate({
        name: user.name,
        evento,
        estado,
        icsUrl,
        selfSignup: false,
      });

      await sendEmail({
        to: user.email,
        toName: user.name || user.email,
        subject,
        html: renderEmail(tplOpts),
        text: renderEmailText(tplOpts),
        headers: defaultHeaders({ topic: "eventos", recipientEmail: user.email }),
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
