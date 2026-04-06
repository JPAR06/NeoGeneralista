import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";

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

  await writeClient.create({
    _type: "reserva",
    eventoId,
    userId: session.user.id,
    nome: session.user.name,
    email: session.user.email,
    estado,
  });

  // Send confirmation email (non-blocking — don't fail the reservation if email fails)
  sendEmail({
    to: session.user.email,
    toName: session.user.name,
    subject: estado === "confirmado"
      ? `Reserva confirmada — ${evento.edicao ?? "Algoritmo Humano"}`
      : `Estás na lista de espera — ${evento.edicao ?? "Algoritmo Humano"}`,
    html: buildConfirmationEmail({ session, evento, estado }),
  }).catch((err) => console.error("[email] confirmation failed:", err));

  return res.status(200).json({ estado });
}

function buildConfirmationEmail({ session, evento, estado }) {
  const isConfirmed = estado === "confirmado";
  const statusText = isConfirmed
    ? "A tua reserva está <strong>confirmada</strong>! 🎉"
    : "Estás na <strong>lista de espera</strong>. Avisamos-te se abrir vaga.";

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${evento.edicao ?? "Algoritmo Humano"}</h2>
      <p style="margin-top:0;color:#555">${statusText}</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
      <p><strong>Olá, ${session.user.name}!</strong></p>
      <p>Recebemos a tua inscrição para o próximo evento.</p>
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
