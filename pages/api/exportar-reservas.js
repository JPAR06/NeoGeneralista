import { client } from "../../lib/sanity";

// Protected export — access via:
// /api/exportar-reservas?secret=YOUR_CRON_SECRET
// /api/exportar-reservas?secret=YOUR_CRON_SECRET&eventoId=xxx  (filter by event)
// /api/exportar-reservas?secret=YOUR_CRON_SECRET&estado=confirmado

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { eventoId, estado } = req.query;

  let query = `*[_type == "reserva"`;
  const params = {};

  if (eventoId) {
    query += ` && eventoId == $eventoId`;
    params.eventoId = eventoId;
  }
  if (estado) {
    query += ` && estado == $estado`;
    params.estado = estado;
  }

  query += `] | order(_createdAt asc) { nome, email, estado, eventoId, _createdAt }`;

  const reservas = await client.fetch(query, params);

  const rows = [
    ["Nome", "Email", "Estado", "EventoId", "Data de inscrição"],
    ...reservas.map((r) => [
      r.nome ?? "",
      r.email ?? "",
      r.estado ?? "",
      r.eventoId ?? "",
      r._createdAt ? new Date(r._createdAt).toLocaleString("pt-PT") : "",
    ]),
  ];

  const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="reservas.csv"`);
  res.status(200).send("\uFEFF" + csv); // BOM for Excel compatibility
}
