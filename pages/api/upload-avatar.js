import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import clientPromise from "../../lib/mongodb";

export const config = {
  api: { bodyParser: { sizeLimit: "2mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autenticado" });

  const { image } = req.body;
  if (!image || !image.startsWith("data:image/")) {
    return res.status(400).json({ error: "Imagem inválida" });
  }

  // Validate size (~1.5MB max after base64)
  if (image.length > 2_000_000) {
    return res.status(400).json({ error: "Imagem demasiado grande (máx. 1.5MB)" });
  }

  const mongo = await clientPromise;
  await mongo.db().collection("users").updateOne(
    { email: session.user.email },
    { $set: { avatar: image, updatedAt: new Date() } }
  );

  return res.status(200).json({ ok: true });
}
