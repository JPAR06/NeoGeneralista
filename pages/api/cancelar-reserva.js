import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { client, writeClient } from "../../lib/sanity";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const { eventoId } = req.body;
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });

  const reserva = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]`,
    { eventoId, userId: session.user.id }
  );
  if (!reserva) return res.status(404).json({ error: "Reserva não encontrada" });

  await writeClient.patch(reserva._id).set({ estado: "cancelado" }).commit();

  // If they had a confirmed spot, promote the next person on the waiting list
  if (reserva.estado === "confirmado") {
    const nextInLine = await client.fetch(
      `*[_type == "reserva" && eventoId == $eventoId && estado == "lista_espera"] | order(_createdAt asc)[0]`,
      { eventoId }
    );
    if (nextInLine) {
      await writeClient.patch(nextInLine._id).set({ estado: "confirmado" }).commit();
    }
  }

  return res.status(200).json({ success: true });
}
