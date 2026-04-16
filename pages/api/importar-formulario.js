import clientPromise from "../../lib/mongodb";
import { client, writeClient } from "../../lib/sanity";
import { addSubscriber } from "../../lib/sender";

// One-time import from Google Forms TSV data.
// POST /api/importar-formulario
// Body: { "secret": "...", "eventoId": "...", "participantes": [...] }
//
// Each participante: { email, nome, faixaEtaria, habilitacoes, setorProfissional, situacaoProfissional }
//
// For each person:
//   1. Create MongoDB user if not exists
//   2. Create Sanity membroComunidade if not exists
//   3. Create Sanity reserva if not exists
//   4. Add to Sender.net newsletter (upsert)

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

  const { secret, eventoId, participantes } = req.body ?? {};
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!eventoId || !Array.isArray(participantes)) return res.status(400).json({ error: "eventoId and participantes required" });

  const mongo = await clientPromise;
  const db = mongo.db();

  // Get existing data to avoid duplicates
  const existingUsers = new Set(
    (await db.collection("users").find({}, { projection: { email: 1 } }).toArray()).map((u) => u.email)
  );
  const existingComunidade = new Set(
    await client.fetch(`*[_type == "membroComunidade"].email`)
  );
  const existingReservas = new Set(
    await client.fetch(`*[_type == "reserva" && eventoId == $eventoId && estado != "cancelado"].email`, { eventoId })
  );

  const results = { users: 0, comunidade: 0, reservas: 0, sender: 0, skipped: 0, errors: [] };

  for (const p of participantes) {
    const email = (p.email ?? "").trim().toLowerCase();
    const nome = (p.nome ?? "").trim();
    if (!email || !email.includes("@")) { results.errors.push({ email, reason: "invalid" }); continue; }

    // 1. MongoDB user
    if (!existingUsers.has(email)) {
      try {
        await db.collection("users").insertOne({
          name: nome,
          email,
          situacaoProfissional: p.situacaoProfissional || "",
          faixaEtaria: p.faixaEtaria || "",
          habilitacoes: p.habilitacoes || "",
          setorProfissional: p.setorProfissional || "",
          consentimentoEventosFuturos: true,
          consentimentoDadosInvestigacao: true,
          createdAt: new Date(),
        });
        existingUsers.add(email);
        results.users++;
      } catch { /* duplicate index */ }
    }

    // 2. Sanity membroComunidade
    if (!existingComunidade.has(email)) {
      try {
        await writeClient.create({
          _type: "membroComunidade",
          nome,
          email,
          iniciais: initialsFromName(nome),
          cor: colorFromName(nome),
        });
        existingComunidade.add(email);
        results.comunidade++;
      } catch (e) { results.errors.push({ email, reason: "sanity: " + e.message }); }
    }

    // 3. Sanity reserva
    if (!existingReservas.has(email)) {
      try {
        await writeClient.create({
          _type: "reserva",
          eventoId,
          userId: `import:${email}`,
          nome,
          email,
          estado: "confirmado",
        });
        existingReservas.add(email);
        results.reservas++;
      } catch (e) { results.errors.push({ email, reason: "reserva: " + e.message }); }
    }

    // 4. Sender.net (upsert — no duplicates)
    try {
      await addSubscriber({ email, name: nome });
      results.sender++;
    } catch { /* already exists */ }
  }

  results.skipped = participantes.length - results.reservas - results.errors.length;
  return res.status(200).json(results);
}
