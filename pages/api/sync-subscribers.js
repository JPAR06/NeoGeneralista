import clientPromise from "../../lib/mongodb";
import { addSubscriber } from "../../lib/sender";

// Syncs all MongoDB users to Sender.net newsletter group.
// GET /api/sync-subscribers?secret=YOUR_CRON_SECRET
// Can also be called via Vercel cron for daily sync.

export default async function handler(req, res) {
  const secret = req.query.secret
    || req.headers["authorization"]?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const mongo = await clientPromise;
  const users = await mongo.db()
    .collection("users")
    .find({}, { projection: { name: 1, email: 1, _id: 0 } })
    .toArray();

  let synced = 0;
  let failed = 0;

  for (const u of users) {
    if (!u.email) continue;
    try {
      await addSubscriber({ email: u.email, name: u.name ?? "" });
      synced++;
    } catch {
      failed++;
    }
  }

  return res.status(200).json({ total: users.length, synced, failed });
}
