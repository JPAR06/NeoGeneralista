// Smoke test endpoint — verifies that Sender.net auth + DKIM/SPF/DMARC are
// working end-to-end. Sends a real email using the unified template so any
// rendering bug shows up here too.
// GET /api/test-email?secret=YOUR_CRON_SECRET&to=your@email.com

import { sendEmail } from "../../lib/email";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../lib/emailTemplate";

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const to = req.query.to;
  if (!to) return res.status(400).json({ error: "Missing ?to=email" });

  const tplOpts = {
    eyebrow: "Smoke test",
    heading: "Tudo a funcionar.",
    subheading: "Este é um envio de teste do template unificado.",
    greeting: "Olá.",
    paragraphs: [
      "Se estás a ver este email com o cabeçalho azul-marinho, a faixa coral e o rodapé creme, a integração com a Sender.net está OK.",
      "Esta mensagem usa <strong>lib/emailTemplate.js</strong> e inclui <strong>List-Unsubscribe</strong>, conteúdo em <strong>plain-text</strong> e DKIM via <em>sender._domainkey</em>.",
    ],
    cta: { label: "Visitar o site", url: "https://neogeneralista.pt" },
    note: "Recebeste isto porque o endpoint /api/test-email foi chamado com o teu email.",
    footerReason: "Email de teste enviado manualmente — não estás subscrito a nada.",
    transactional: true,
  };

  try {
    const result = await sendEmail({
      to,
      toName: "Teste",
      subject: cleanSubject("Teste de email — NeoGeneralista"),
      html: renderEmail(tplOpts),
      text: renderEmailText(tplOpts),
      headers: defaultHeaders({ topic: "teste", recipientEmail: to }),
    });
    return res.status(200).json({
      ok: true,
      sent: true,
      sender: result,
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
