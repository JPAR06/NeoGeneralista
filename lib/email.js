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

  if (attachments?.length) {
    payload.attachments = attachments.map((a) => ({
      name: a.name,
      type: a.type ?? 'application/octet-stream',
      content: Buffer.from(a.content, 'utf8').toString('base64'),
    }))
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
