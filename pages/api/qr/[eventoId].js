import QRCode from "qrcode";

// Returns a high-res PNG QR code for the self check-in URL of a given event.
// Protected by ?secret=CRON_SECRET — open it in the browser, save/print.
//
// Example: /api/qr/abcd1234?secret=XXX  (add &size=1000 for custom px)

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { eventoId, size } = req.query;
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });

  const host = req.headers.host || "";
  const proto =
    req.headers["x-forwarded-proto"] ||
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = process.env.SITE_URL || `${proto}://${host}`;
  const url = `${base.replace(/\/$/, "")}/checkin/${eventoId}`;

  const width = Math.min(Math.max(parseInt(size) || 800, 200), 2000);

  const png = await QRCode.toBuffer(url, {
    width,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `inline; filename="qr-${eventoId}.png"`);
  res.status(200).send(png);
}
