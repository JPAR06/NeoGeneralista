// Consolidated daily sync: runs sync-subscribers + sync-comunidade + send-blog-notification
// Single cron to stay within Vercel Hobby plan limits (max 2 crons)

export default async function handler(req, res) {
  const secret = req.query.secret
    || req.headers["authorization"]?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const baseUrl = `https://${req.headers.host}`;
  const headers = { Authorization: `Bearer ${process.env.CRON_SECRET}` };

  const results = {};

  // 1. Sync subscribers to Sender.net
  try {
    const r = await fetch(`${baseUrl}/api/sync-subscribers`, { headers });
    results.syncSubscribers = await r.json();
  } catch (e) { results.syncSubscribers = { error: e.message }; }

  // 2. Sync comunidade to Sanity
  try {
    const r = await fetch(`${baseUrl}/api/sync-comunidade`, { headers });
    results.syncComunidade = await r.json();
  } catch (e) { results.syncComunidade = { error: e.message }; }

  // 3. Send blog notification if new post
  try {
    const r = await fetch(`${baseUrl}/api/send-blog-notification`, { headers });
    results.blogNotification = await r.json();
  } catch (e) { results.blogNotification = { error: e.message }; }

  return res.status(200).json(results);
}
