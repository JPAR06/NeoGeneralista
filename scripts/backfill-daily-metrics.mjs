// Reconstrói a coleção MongoDB `dailyMetrics` para `users` e `newsletter`
// a partir das datas reais de createdAt (Mongo) e created (Sender).
//
// Os campos `eventos / reservas / confirmados / cancelados / presencas` não
// são preenchidos retroactivamente (Sanity não tem audit log granular do
// estado); ficam null e começam a ser registados pelo cron diário.
//
// Run: node --env-file=.env.local scripts/backfill-daily-metrics.mjs
import { MongoClient } from "mongodb";

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

async function fetchSenderSubscribersWithDates(groupId) {
  const subs = [];
  let page = 1;
  while (true) {
    const r = await fetch(`${SENDER_API}/groups/${groupId}/subscribers?page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
        Accept: "application/json",
      },
    });
    if (!r.ok) throw new Error(`Sender API ${r.status}: ${await r.text()}`);
    const d = await r.json();
    if (!d.data || d.data.length === 0) break;
    for (const s of d.data) subs.push({ email: s.email, created: s.created || s.created_at });
    if (!d.links?.next) break;
    page++;
  }
  return subs;
}

function toDayKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function* dayRange(start, end) {
  const cur = new Date(start);
  cur.setUTCHours(0, 0, 0, 0);
  const last = new Date(end);
  last.setUTCHours(0, 0, 0, 0);
  while (cur <= last) {
    yield new Date(cur);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
}

(async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
  if (!process.env.SENDER_API_TOKEN) throw new Error("SENDER_API_TOKEN missing");

  console.log("A puxar users do Mongo...");
  const cli = await MongoClient.connect(process.env.MONGODB_URI);
  const db = cli.db();
  const users = await db.collection("users")
    .find({}, { projection: { createdAt: 1 } })
    .toArray();
  const usersBaseline = users.filter(u => !u.createdAt).length; // legacy users without createdAt
  console.log(`Users: ${users.length} (baseline sem createdAt: ${usersBaseline})`);

  console.log("A puxar subscritores do Sender (NG group)...");
  const subs = await fetchSenderSubscribersWithDates(NEWSLETTER_GROUP);
  console.log(`Subscritores: ${subs.length}`);

  // Distribute counts per day using cumulative buckets
  const userDays = users.map(u => toDayKey(u.createdAt)).filter(Boolean).sort();
  const subDays = subs.map(s => toDayKey(s.created)).filter(Boolean).sort();

  if (userDays.length === 0 && subDays.length === 0) {
    console.log("Sem dados para backfill.");
    await cli.close();
    return;
  }

  const startDay = [userDays[0], subDays[0]].filter(Boolean).sort()[0];
  const today = toDayKey(new Date());

  console.log(`Backfill: ${startDay} → ${today}`);

  // Build cumulative counts indexed by day
  function cumulative(daysList) {
    const counts = new Map();
    let running = 0;
    let i = 0;
    const sorted = [...daysList].sort();
    for (const day of dayRange(new Date(startDay), new Date(today))) {
      const key = toDayKey(day);
      while (i < sorted.length && sorted[i] <= key) {
        running++;
        i++;
      }
      counts.set(key, running);
    }
    return counts;
  }

  const usersByDay = cumulative(userDays);
  const subsByDay = cumulative(subDays);

  // Upsert per day. Don't overwrite the new fields (eventos/reservas/etc)
  // if they already exist for that day — only set users/newsletter.
  const coll = db.collection("dailyMetrics");
  let upserts = 0;
  for (const day of dayRange(new Date(startDay), new Date(today))) {
    const key = toDayKey(day);
    const u = (usersByDay.get(key) ?? 0) + usersBaseline;
    const n = subsByDay.get(key) ?? 0;
    await coll.updateOne(
      { _id: key },
      { $set: { date: new Date(key + "T00:00:00Z"), users: u, newsletter: n } },
      { upsert: true }
    );
    upserts++;
  }
  console.log(`Upserts: ${upserts}`);

  // Print sample (last 5 days)
  const sample = await coll.find().sort({ _id: -1 }).limit(5).toArray();
  console.log("Últimos 5 dias:");
  for (const s of sample) console.log(`  ${s._id}: users=${s.users} newsletter=${s.newsletter}`);

  await cli.close();
})();
