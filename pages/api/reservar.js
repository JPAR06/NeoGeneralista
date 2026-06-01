import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../lib/emailTemplate";
import { buildReservationTemplate } from "../../lib/emailContent";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const { eventoId } = req.body;
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });
  if (!evento.formularioAtivo)
    return res.status(400).json({ error: "Inscrições fechadas" });

  const existing = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]`,
    { eventoId, userId: session.user.id }
  );
  if (existing)
    return res.status(400).json({ error: "Já tens uma reserva para este evento", estado: existing.estado });

  const count = await client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );

  const estado =
    count < (evento.maxParticipantes ?? 9999) ? "confirmado" : "lista_espera";

  const created = await writeClient.create({
    _type: "reserva",
    eventoId,
    userId: session.user.id,
    nome: session.user.name,
    email: session.user.email,
    estado,
  });

  const host = req.headers.host || "";
  const proto = req.headers["x-forwarded-proto"]
    || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = process.env.SITE_URL || `${proto}://${host}`;
  const icsUrl = (estado === "confirmado" && evento.dataISO)
    ? `${base.replace(/\/$/, "")}/api/calendar/${created._id}.ics`
    : null;

  const subject = cleanSubject(
    estado === "confirmado"
      ? `Inscrição confirmada — ${evento.edicao ?? "Algoritmo Humano"}`
      : `Lista de espera — ${evento.edicao ?? "Algoritmo Humano"}`
  );
  const tplOpts = buildReservationTemplate({
    name: session.user.name,
    evento,
    estado,
    icsUrl,
    selfSignup: true,
  });

  sendEmail({
    to: session.user.email,
    toName: session.user.name,
    subject,
    html: renderEmail(tplOpts),
    text: renderEmailText(tplOpts),
    headers: defaultHeaders({ topic: "eventos", recipientEmail: session.user.email }),
  }).catch((err) => console.error("[email] confirmation failed:", err));

  return res.status(200).json({ estado });
}
