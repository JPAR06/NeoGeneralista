import clientPromise from "../../lib/mongodb";
import { client, writeClient } from "../../lib/sanity";

// One-time backfill: syncs all MongoDB users to Sanity membroComunidade.
// GET /api/sync-comunidade?secret=YOUR_CRON_SECRET

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
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get all MongoDB users
  const mongo = await clientPromise;
  const users = await mongo.db()
    .collection("users")
    .find({}, { projection: { name: 1, email: 1 } })
    .toArray();

  // Get existing Sanity emails to avoid duplicates
  const existing = await client.fetch(
    `*[_type == "membroComunidade"].email`
  );
  const existingSet = new Set(existing.filter(Boolean));

  let created = 0;
  let skipped = 0;

  for (const u of users) {
    if (!u.name || !u.email) { skipped++; continue; }
    if (existingSet.has(u.email)) { skipped++; continue; }

    await writeClient.create({
      _type: "membroComunidade",
      nome: u.name,
      email: u.email,
      iniciais: initialsFromName(u.name),
      cor: colorFromName(u.name),
    });
    created++;
  }

  return res.status(200).json({ created, skipped });
}
