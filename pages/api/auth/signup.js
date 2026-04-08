import bcrypt from "bcryptjs";
import clientPromise from "../../../lib/mongodb";
import { client, writeClient } from "../../../lib/sanity";
import { addSubscriber } from "../../../lib/sender";

function colorFromName(name = "") {
  const palette = ["#F05A78","#7EDDB8","#818cf8","#fb923c","#a78bfa","#f87171","#34d399","#60a5fa"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initialsFromName(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

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

    // Ensure unique index on email (runs once, no-op after)
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const trimmedName = name.trim();

    await db.collection("users").insertOne({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
      consentimentoEventosFuturos: true,
      consentimentoDadosInvestigacao: true,
      createdAt: new Date(),
    });

    // Create Sanity community member if not already there (non-blocking)
    client.fetch(`count(*[_type == "membroComunidade" && email == $email])`, { email: normalizedEmail })
      .then((count) => {
        if (count === 0) {
          return writeClient.create({
            _type: "membroComunidade",
            nome: trimmedName,
            email: normalizedEmail,
            iniciais: initialsFromName(trimmedName),
            cor: colorFromName(trimmedName),
          });
        }
      })
      .catch((err) => console.error("[sanity] membroComunidade create failed:", err));

    // Add to Sender.net newsletter (non-blocking)
    addSubscriber({ email: normalizedEmail, name: trimmedName })
      .catch((err) => console.error("[sender] subscriber add failed:", err));

    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Erro interno. Tenta novamente." });
  }
}
