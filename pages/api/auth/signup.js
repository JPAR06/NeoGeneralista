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
    // Note: we use `mongo` here because the imported `client` is the Sanity
    // client (used further down). Naming the MongoDB client `client` would
    // shadow it and cause a silent TypeError on the Sanity call → 500.
    const mongo = await clientPromise;
    const db = mongo.db();

    // Ensure unique index on email (runs once, no-op after)
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    const trimmedName = name.trim();
    const existing = await db.collection("users").findOne({ email: normalizedEmail });
    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      const linkedAccount = await db.collection("accounts").findOne(
        { userId: existing._id },
        { projection: { _id: 1 } }
      );

      if (existing.passwordHash || linkedAccount) {
        return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
      }

      const result = await db.collection("users").updateOne(
        {
          _id: existing._id,
          $or: [
            { passwordHash: { $exists: false } },
            { passwordHash: null },
            { passwordHash: "" },
          ],
        },
        {
          $set: {
            name: trimmedName,
            passwordHash,
            consentimentoEventosFuturos: true,
            consentimentoDadosInvestigacao: true,
            updatedAt: new Date(),
            credentialsActivatedAt: new Date(),
          },
        }
      );

      if (result.matchedCount === 0) {
        return res.status(409).json({ error: "Já existe uma conta com este e-mail." });
      }
    } else {
      await db.collection("users").insertOne({
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
        consentimentoEventosFuturos: true,
        consentimentoDadosInvestigacao: true,
        createdAt: new Date(),
      });
    }

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
  } catch (err) {
    console.error("[signup] failed:", err);
    return res.status(500).json({ error: "Erro interno. Tenta novamente." });
  }
}
