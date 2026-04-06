import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password, consentimentoEventosFuturos, consentimentoDadosInvestigacao } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Preenche todos os campos obrigatórios." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "A palavra-passe deve ter pelo menos 8 caracteres." });
  }
  if (!consentimentoEventosFuturos || !consentimentoDadosInvestigacao) {
    return res.status(400).json({ error: "Os consentimentos são obrigatórios." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const client = await clientPromise;
    const db = client.db();

    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.collection("users").insertOne({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      consentimentoEventosFuturos: true,
      consentimentoDadosInvestigacao: true,
      createdAt: new Date(),
    });

    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Erro interno. Tenta novamente." });
  }
}
