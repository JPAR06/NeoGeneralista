// Test email endpoint — call via:
// GET /api/test-email?secret=YOUR_CRON_SECRET&to=your@email.com

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const to = req.query.to;
  if (!to) return res.status(400).json({ error: "Missing ?to=email" });

  const payload = {
    from: {
      name: process.env.SENDER_FROM_NAME,
      email: process.env.SENDER_FROM_EMAIL,
    },
    to: { email: to, name: "Teste" },
    subject: "Teste de email — AlgoritmoHumano",
    html: "<p>Se estás a ver isto, o email está a funcionar! ✅</p>",
  };

  try {
    const apiRes = await fetch("https://api.sender.net/v2/message/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await apiRes.text();

    return res.status(200).json({
      status: apiRes.status,
      ok: apiRes.ok,
      senderResponse: body,
      envCheck: {
        hasToken: !!process.env.SENDER_API_TOKEN,
        fromEmail: process.env.SENDER_FROM_EMAIL,
        fromName: process.env.SENDER_FROM_NAME,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
