import clientPromise from "../../lib/mongodb";

// Protected export — access via:
// /api/exportar-utilizadores?secret=YOUR_CRON_SECRET
// /api/exportar-utilizadores?secret=YOUR_CRON_SECRET&format=json  (JSON instead of CSV)

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const mongo = await clientPromise;
  const users = await mongo.db()
    .collection("users")
    .find({}, { projection: { name: 1, email: 1, createdAt: 1, _id: 0 } })
    .sort({ _id: 1 })
    .toArray();

  if (req.query.format === "json") {
    return res.status(200).json({ total: users.length, users });
  }

  const rows = [
    ["Nome", "Email", "Data de registo"],
    ...users.map((u) => [
      u.name ?? "",
      u.email ?? "",
      u.createdAt ? new Date(u.createdAt).toLocaleString("pt-PT") : "",
    ]),
  ];

  const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="utilizadores.csv"`);
  res.status(200).send("\uFEFF" + csv);
}
