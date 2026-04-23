import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { client, writeClient } from "../../lib/sanity";

// Self check-in endpoint. Called from /checkin/[eventoId] on page load.
// Returns a status string the page translates into UI feedback.
//
//   ok         -> check-in just recorded
//   already    -> user had already checked in previously
//   too_early  -> outside the allowed window (before)
//   too_late   -> outside the allowed window (after)
//   not_found  -> no confirmed reservation for this user + event
//   waitlist   -> reservation exists but on the waiting list
//   cancelled  -> reservation was cancelled

const WINDOW_BEFORE_MS = 1 * 60 * 60 * 1000; // 1h before
const WINDOW_AFTER_MS = 2 * 60 * 60 * 1000;  // 2h after

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const { eventoId } = req.body;
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{_id, edicao, tema, dataISO, data, horario, local}`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  const reserva = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId][0]{_id, estado, checkedIn, checkedInAt, nome}`,
    { eventoId, userId: session.user.id }
  );

  if (!reserva) {
    return res.status(200).json({ status: "not_found", evento });
  }
  if (reserva.estado === "cancelado") {
    return res.status(200).json({ status: "cancelled", evento });
  }
  if (reserva.estado === "lista_espera") {
    return res.status(200).json({ status: "waitlist", evento });
  }

  if (reserva.checkedIn) {
    return res.status(200).json({
      status: "already",
      evento,
      reserva: { nome: reserva.nome, checkedInAt: reserva.checkedInAt },
    });
  }

  // Time window check
  if (evento.dataISO) {
    const now = Date.now();
    const start = new Date(evento.dataISO).getTime();
    if (now < start - WINDOW_BEFORE_MS) {
      return res.status(200).json({ status: "too_early", evento });
    }
    if (now > start + WINDOW_AFTER_MS) {
      return res.status(200).json({ status: "too_late", evento });
    }
  }

  const checkedInAt = new Date().toISOString();
  await writeClient
    .patch(reserva._id)
    .set({ checkedIn: true, checkedInAt })
    .commit();

  return res.status(200).json({
    status: "ok",
    evento,
    reserva: { nome: reserva.nome, checkedInAt },
  });
}
