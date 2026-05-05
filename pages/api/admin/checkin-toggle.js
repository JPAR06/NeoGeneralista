import { writeClient, client } from "../../../lib/sanity";
import { requireAdminApi } from "../../../lib/admin";

// Manual override of a reservation's checkedIn flag — used by the
// admin presencas page to mark/unmark people from the door.
// Bypasses the time window the self check-in enforces.
//
// POST { reservaId: string, checkedIn: boolean }
//   → { ok: true, checkedIn, checkedInAt }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return; // 404 already sent

  const { reservaId, checkedIn } = req.body || {};
  if (!reservaId || typeof reservaId !== "string") {
    return res.status(400).json({ error: "reservaId obrigatório" });
  }
  if (typeof checkedIn !== "boolean") {
    return res.status(400).json({ error: "checkedIn deve ser boolean" });
  }

  // Make sure the document exists and is a reserva (avoid mutating other types).
  const reserva = await client.fetch(
    `*[_type == "reserva" && _id == $id][0]{_id, estado}`,
    { id: reservaId }
  );
  if (!reserva) return res.status(404).json({ error: "Reserva não encontrada" });

  const checkedInAt = checkedIn ? new Date().toISOString() : null;

  try {
    if (checkedIn) {
      await writeClient.patch(reservaId).set({ checkedIn: true, checkedInAt }).commit();
    } else {
      await writeClient.patch(reservaId).set({ checkedIn: false }).unset(["checkedInAt"]).commit();
    }
  } catch (err) {
    console.error("[checkin-toggle] sanity patch failed:", err);
    return res.status(500).json({ error: "Erro ao gravar" });
  }

  return res.status(200).json({ ok: true, checkedIn, checkedInAt });
}
