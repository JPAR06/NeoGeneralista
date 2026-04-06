import clientPromise from "../../lib/mongodb";

function colorFromName(name = "") {
  const palette = [
    "#F05A78", "#7EDDB8", "#818cf8", "#fb923c",
    "#a78bfa", "#f87171", "#34d399", "#60a5fa",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initialsFromName(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db
      .collection("users")
      .find({}, { projection: { name: 1, _id: 1 } })
      .sort({ _id: 1 })
      .toArray();

    const membros = users
      .filter((u) => u.name)
      .map((u) => ({
        iniciais: initialsFromName(u.name),
        cor: colorFromName(u.name),
      }));

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ membros, total: membros.length });
  } catch (err) {
    console.error("[comunidade]", err);
    return res.status(500).json({ error: err.message, membros: [] });
  }
}
