import { client } from "../../lib/sanity";
import clientPromise from "../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { isAdminEmail } from "../../lib/admin";

// Protected export — either a logged-in admin (ADMIN_EMAILS) OR ?secret=CRON_SECRET.
//   /api/exportar-reservas                 (admin session)
//   /api/exportar-reservas?eventoId=xxx    (filter by event)
//   /api/exportar-reservas?secret=YOUR_CRON_SECRET   (scripted / cron)

export default async function handler(req, res) {
  const bySecret = req.query.secret && req.query.secret === process.env.CRON_SECRET;
  let bySession = false;
  if (!bySecret) {
    const session = await getServerSession(req, res, authOptions);
    bySession = !!session && isAdminEmail(session.user?.email);
  }
  if (!bySecret && !bySession) {
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

  // Enrich with MongoDB profile data
  const emails = [...new Set(reservas.map((r) => r.email).filter(Boolean))];
  const mongo = await clientPromise;
  const users = await mongo.db()
    .collection("users")
    .find({ email: { $in: emails } }, {
      projection: { email: 1, situacaoProfissional: 1, faixaEtaria: 1, habilitacoes: 1, setorProfissional: 1, _id: 0 },
    })
    .toArray();

  const profileMap = new Map(users.map((u) => [u.email, u]));

  const rows = [
    ["Nome", "Email", "Estado", "EventoId", "Data de inscrição", "Situação Profissional", "Faixa Etária", "Habilitações", "Setor Profissional"],
    ...reservas.map((r) => {
      const p = profileMap.get(r.email) ?? {};
      return [
        r.nome ?? "",
        r.email ?? "",
        r.estado ?? "",
        r.eventoId ?? "",
        r._createdAt ? new Date(r._createdAt).toLocaleString("pt-PT") : "",
        p.situacaoProfissional ?? "",
        p.faixaEtaria ?? "",
        p.habilitacoes ?? "",
        p.setorProfissional ?? "",
      ];
    }),
  ];

  const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="reservas.csv"`);
  res.status(200).send("\uFEFF" + csv); // BOM for Excel compatibility
}
