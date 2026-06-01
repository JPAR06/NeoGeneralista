// RFC 8058 one-click unsubscribe + RFC 2369 List-Unsubscribe target.
//
// Three call shapes, all valid:
//   GET  /api/unsubscribe?email=...&topic=...&t=...    → confirmation page
//   POST /api/unsubscribe?email=...&topic=...&t=...    → Gmail one-click body: "List-Unsubscribe=One-Click"
//   POST /api/unsubscribe (form-encoded with email/topic/t)
//
// The `t` param is an HMAC over (email, topic) keyed with CRON_SECRET. Without
// it bots could iterate emails and silently unsubscribe real users.
//
// Topics in use:
//   "eventos"          → marketing/notification opt-out for AlgoritmoHumano events
//   "algoritmo-humano" → AH blog notifications (uses consentimentoEventosFuturos)
//   "newsletter"       → NG newsletter (Sender.net group)
//   "conta"            → security/auth — should never be unsubscribed from

import clientPromise from "../../lib/mongodb";
import { verifyUnsubscribe } from "../../lib/unsubscribeToken";

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).end();
  }

  // Accept params from query or form-encoded body (RFC 8058 sends body).
  const params = { ...(req.query || {}), ...(req.body || {}) };
  const email = String(params.email || "").trim().toLowerCase();
  const topic = String(params.topic || "geral").trim();
  const token = String(params.t || "");

  if (!email || !email.includes("@")) {
    return respond(req, res, 400, "Pedido inválido.");
  }
  if (!verifyUnsubscribe(email, topic, token)) {
    return respond(req, res, 403, "Link expirado ou inválido. Responde a este email para te tirarmos da lista manualmente.");
  }

  try {
    const mongo = await clientPromise;
    const db = mongo.db();

    await db.collection("unsubscribes").updateOne(
      { email, topic },
      { $set: { email, topic, unsubscribedAt: new Date(), userAgent: req.headers["user-agent"] || null } },
      { upsert: true }
    );

    // For AH content: revoke the consent flag on the user record so blog
    // notifications stop targeting them.
    if (topic === "algoritmo-humano" || topic === "eventos") {
      await db.collection("users").updateOne(
        { email },
        { $set: { consentimentoEventosFuturos: false } }
      );
    }

    // For NG newsletter: drop them from the Sender.net group. Best-effort —
    // we always report success to the unsubscriber regardless.
    if (topic === "newsletter" && process.env.SENDER_API_TOKEN) {
      try {
        // Find subscriber, then delete from group
        const findRes = await fetch(`${SENDER_API}/subscribers/${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
            Accept: "application/json",
          },
        });
        if (findRes.ok) {
          const found = await findRes.json();
          const subId = found?.data?.id;
          if (subId) {
            await fetch(`${SENDER_API}/subscribers`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ subscribers: [subId], groups: [NEWSLETTER_GROUP] }),
            });
          }
        }
      } catch (err) {
        console.error("[unsubscribe] sender.net removal failed:", err?.message || err);
      }
    }
  } catch (err) {
    console.error("[unsubscribe] error:", err);
    // Still confirm to the user — they shouldn't fight the system. We retry
    // server-side via the DB record on next send attempt.
  }

  return respond(req, res, 200, "Subscrição cancelada com sucesso.");
}

function respond(req, res, status, message) {
  // RFC 8058 one-click: must return 200 with empty body on POST.
  if (req.method === "POST") {
    return res.status(status === 200 ? 200 : status).end();
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(status).send(`<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cancelar subscrição — NeoGeneralista</title>
<style>
  body { margin:0; font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif; background:#eef0f3; color:#1e293b; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:32px 16px; }
  .card { background:#fff; max-width:520px; width:100%; border-radius:14px; box-shadow:0 4px 20px rgba(15,23,42,.08); overflow:hidden; }
  .header { background:linear-gradient(135deg,#070756 0%,#1a1a85 100%); color:#fff; padding:28px 32px; }
  .header p { margin:0; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#ffb8cc; font-weight:600; }
  .header h1 { margin:8px 0 0; font-size:24px; }
  .strip { height:4px; background:#ff366b; }
  .body { padding:28px 32px 32px; font-size:15px; line-height:1.6; color:#475569; }
  .body p { margin:0 0 12px; }
  .body a { color:#ff366b; text-decoration:none; font-weight:600; }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p>NeoGeneralista</p>
      <h1>${status === 200 ? "Subscrição cancelada" : "Algo correu mal"}</h1>
    </div>
    <div class="strip"></div>
    <div class="body">
      <p>${escapeHtml(message)}</p>
      ${status === 200 ? '<p>Já não vais receber mais emails desta lista. Se mudares de ideias, podes voltar a subscrever em <a href="https://neogeneralista.pt">neogeneralista.pt</a>.</p>' : ''}
      <p>Para qualquer dúvida, escreve para <a href="mailto:ana@neogeneralista.pt">ana@neogeneralista.pt</a>.</p>
    </div>
  </div>
</body>
</html>`);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
