import clientPromise from "../../lib/mongodb";
import { client } from "../../lib/sanity";
import { NEWSLETTER_GROUP } from "../../lib/sender";

// Captures one snapshot per day with all the counters the admin dashboard uses.
// Called by daily-sync (chained) and exposable directly for manual triggers.
//
// GET /api/daily-metrics?secret=CRON_SECRET
// → { ok, snapshot, action: "created"|"updated" }

const SENDER_API = "https://api.sender.net/v2";

async function fetchSenderGroupCount(groupId) {
  let count = 0;
  let page = 1;
  while (true) {
    const r = await fetch(`${SENDER_API}/groups/${groupId}/subscribers?page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
        Accept: "application/json",
      },
    });
    if (!r.ok) throw new Error(`Sender API ${r.status}`);
    const d = await r.json();
    if (!d.data || d.data.length === 0) break;
    count += d.data.length;
    if (!d.links?.next) break;
    page++;
  }
  return count;
}

export default async function handler(req, res) {
  const secret = req.query.secret || req.headers["authorization"]?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD

  const mongo = await clientPromise;
  const db = mongo.db();

  const [usersCount, newsletterCount, sanityCounts] = await Promise.all([
    db.collection("users").countDocuments(),
    fetchSenderGroupCount(NEWSLETTER_GROUP).catch((e) => {
      console.error("[daily-metrics] sender count failed:", e.message);
      return null;
    }),
    client.fetch(`{
      "eventos": count(*[_type == "eventoProximo"]),
      "reservas": count(*[_type == "reserva"]),
      "confirmados": count(*[_type == "reserva" && estado == "confirmado"]),
      "cancelados": count(*[_type == "reserva" && estado == "cancelado"]),
      "presencas": count(*[_type == "reserva" && checkedIn == true])
    }`),
  ]);

  const snapshot = {
    _id: dayKey,
    date: now,
    users: usersCount,
    newsletter: newsletterCount,
    eventos: sanityCounts.eventos,
    reservas: sanityCounts.reservas,
    confirmados: sanityCounts.confirmados,
    cancelados: sanityCounts.cancelados,
    presencas: sanityCounts.presencas,
  };

  const result = await db.collection("dailyMetrics").updateOne(
    { _id: dayKey },
    { $set: snapshot },
    { upsert: true }
  );

  return res.status(200).json({
    ok: true,
    action: result.upsertedCount ? "created" : "updated",
    snapshot,
  });
}
