import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autenticado." });

  const client = await clientPromise;
  const db = client.db();

  if (req.method === "GET") {
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ error: "Utilizador não encontrado." });
    return res.status(200).json(user);
  }

  if (req.method === "PUT") {
    const allowed = [
      "name",
      "situacaoProfissional",
      "faixaEtaria",
      "habilitacoes",
      "setorProfissional",
      "consentimentoEventosFuturos",
      "consentimentoDadosInvestigacao",
    ];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { ...update, updatedAt: new Date() } }
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
