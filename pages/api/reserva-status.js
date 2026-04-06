import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { client } from "../../lib/sanity";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { eventoId } = req.query;
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });

  const session = await getServerSession(req, res, authOptions);

  const [contagem, reserva] = await Promise.all([
    client.fetch(
      `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
      { eventoId }
    ),
    session
      ? client.fetch(
          `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]`,
          { eventoId, userId: session.user.id }
        )
      : Promise.resolve(null),
  ]);

  return res.status(200).json({ contagem, reserva: reserva ?? null });
}
