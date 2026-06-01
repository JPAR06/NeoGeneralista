const SENDER_API = 'https://api.sender.net/v2/message/send'

// Low-level Sender.net delivery. All transactional/marketing email in this app
// flows through here.
//
// Deliverability baseline (verified 2026-05, mail-tester 10/10):
//   - SPF:  v=spf1 include:_spf.sender.net include:_spf.google.com ~all
//   - DKIM: CNAME sender._domainkey -> dkim.sendersrv.com
//   - DMARC: v=DMARC1; p=quarantine; pct=25; rua=mailto:ana@neogeneralista.pt;
//            adkim=s; aspf=s; fo=1
//   - From: SENDER_FROM_EMAIL must be on a DKIM-signed domain
//   - Always include a plain-text alternative (`text`)
//   - Always include List-Unsubscribe via `headers` (use defaultHeaders() from
//     lib/emailTemplate.js)
export async function sendEmail({ to, toName, subject, html, text, attachments, headers }) {
  const payload = {
    from: {
      name: process.env.SENDER_FROM_NAME,
      email: process.env.SENDER_FROM_EMAIL,
    },
    to: { email: to, name: toName },
    subject,
    html,
    text: text ?? subject,
  }

  if (headers && Object.keys(headers).length > 0) {
    payload.headers = headers
  }

  // Sender.net v2 expects `attachments` as a map { filename: url }.
  // The value must be a publicly fetchable http/https URL — Sender's servers
  // pull the file and attach it server-side. Inline base64 / data URIs are
  // rejected with "invalid file URL protocol".
  // Callers pass `[{ name, url }]`; we transform to the map shape.
  if (attachments?.length) {
    payload.attachments = {}
    for (const a of attachments) {
      if (!a.url) continue
      payload.attachments[a.name] = a.url
    }
  }

  const res = await fetch(SENDER_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Sender API error ${res.status}: ${err}`)
  }

  return res.json()
}
