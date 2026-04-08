import { addSubscriber } from "../../lib/sender";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email obrigatório" });

  try {
    await addSubscriber({ email, name });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[subscribe]", err);
    return res.status(500).json({ error: "Erro ao subscrever. Tenta novamente." });
  }
}
