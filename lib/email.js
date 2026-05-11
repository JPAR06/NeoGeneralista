const SENDER_API = 'https://api.sender.net/v2/message/send'

export async function sendEmail({ to, toName, subject, html, text, attachments }) {
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
