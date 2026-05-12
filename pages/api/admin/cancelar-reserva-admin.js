import { client, writeClient } from "../../../lib/sanity";
import { requireAdminApi } from "../../../lib/admin";

// Admin-side cancellation. Marks a reserva as cancelado and, if it was
// confirmado, promotes the next person on the waitlist (same logic as
// /api/cancelar-reserva.js but driven by an admin instead of the user).
//
// POST { reservaId: string }
//   → { ok: true, promoted: { _id, nome, email } | null }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return; // 404 already sent

  const { reservaId } = req.body || {};
  if (!reservaId || typeof reservaId !== "string") {
    return res.status(400).json({ error: "reservaId obrigatório" });
  }

  const reserva = await client.fetch(
    `*[_type == "reserva" && _id == $id][0]{_id, eventoId, estado, nome, email}`,
    { id: reservaId }
  );
  if (!reserva) return res.status(404).json({ error: "Reserva não encontrada" });
  if (reserva.estado === "cancelado") {
    return res.status(400).json({ error: "Reserva já estava cancelada" });
  }

  try {
    await writeClient.patch(reservaId).set({ estado: "cancelado" }).commit();
  } catch (err) {
    console.error("[cancelar-reserva-admin] patch failed:", err);
    return res.status(500).json({ error: "Erro ao cancelar" });
  }

  let promoted = null;
  if (reserva.estado === "confirmado") {
    const nextInLine = await client.fetch(
      `*[_type == "reserva" && eventoId == $eventoId && estado == "lista_espera"] | order(_createdAt asc)[0]{_id, nome, email}`,
      { eventoId: reserva.eventoId }
    );
    if (nextInLine) {
      try {
        await writeClient.patch(nextInLine._id).set({ estado: "confirmado" }).commit();
        promoted = nextInLine;
      } catch (err) {
        console.error("[cancelar-reserva-admin] promotion failed:", err);
      }
    }
  }

  return res.status(200).json({ ok: true, promoted });
}
