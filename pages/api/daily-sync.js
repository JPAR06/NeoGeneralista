// Consolidated daily sync: sync-subscribers + sync-comunidade.
// Blog notifications are now manual (Studio button) — see send-blog-notification.

export default async function handler(req, res) {
  const secret = req.query.secret
    || req.headers["authorization"]?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const baseUrl = `https://${req.headers.host}`;
  const headers = { Authorization: `Bearer ${process.env.CRON_SECRET}` };

  const results = {};

  try {
    const r = await fetch(`${baseUrl}/api/sync-subscribers`, { headers });
    results.syncSubscribers = await r.json();
  } catch (e) { results.syncSubscribers = { error: e.message }; }

  try {
    const r = await fetch(`${baseUrl}/api/sync-comunidade`, { headers });
    results.syncComunidade = await r.json();
  } catch (e) { results.syncComunidade = { error: e.message }; }

  try {
    const r = await fetch(`${baseUrl}/api/daily-metrics`, { headers });
    results.dailyMetrics = await r.json();
  } catch (e) { results.dailyMetrics = { error: e.message }; }

  return res.status(200).json(results);
}
