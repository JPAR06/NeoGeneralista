import clientPromise from "../../../lib/mongodb"
import { createPasswordResetToken } from "../../../lib/auth-tokens"
import { sendEmail } from "../../../lib/email"

// Returns the same response whether the email exists or not, to prevent
// account enumeration. If it does exist, sends a reset email in the background.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { email } = req.body || {}
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email obrigatório." })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Always respond 200 — don't leak whether the email exists.
  // We still do the work async so the user gets the email if applicable.
  ;(async () => {
    try {
      const client = await clientPromise
      const db = client.db()
      const user = await db.collection("users").findOne({ email: normalizedEmail })
      if (!user) return // silent no-op

      // For OAuth-only accounts (no passwordHash), don't send a reset link —
      // they have no credentials to reset. Telling them to use Google would
      // leak account existence; staying silent is the safer policy.
      if (!user.passwordHash) {
        const linked = await db.collection("accounts").findOne({ userId: user._id }, { projection: { _id: 1 } })
        if (linked) return
        // Imported ghost account: also skip — they should go through registration.
        return
      }

      const { token, expiresAt } = await createPasswordResetToken(normalizedEmail)

      const host = req.headers.host || ""
      const proto =
        req.headers["x-forwarded-proto"] ||
        (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
      const base = process.env.SITE_URL || `${proto}://${host}`
      const link = `${base.replace(/\/$/, "")}/auth/redefinir/${token}`

      await sendEmail({
        to: normalizedEmail,
        toName: user.name || "",
        subject: "Redefinir palavra-passe — NeoGeneralista",
        html: buildResetEmail({ name: user.name, link, expiresAt }),
        text: buildResetText({ name: user.name, link, expiresAt }),
      })
    } catch (err) {
      console.error("[request-reset] background failure:", err)
    }
  })()

  return res.status(200).json({ ok: true })
}

function buildResetEmail({ name, link, expiresAt }) {
  const expiresFmt = new Date(expiresAt).toLocaleString("pt-PT", { hour: "2-digit", minute: "2-digit" })
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5">
      <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">NeoGeneralista</p>
      <h1 style="margin:8px 0 0;font-size:20px">Redefinir palavra-passe</h1>
    </div>
    <div style="padding:24px 32px">
      <p>Olá, <strong>${escapeHtml(name || "")}</strong>.</p>
      <p>Recebemos um pedido para redefinir a tua palavra-passe. Clica no botão abaixo para escolheres uma nova:</p>
      <p style="margin:24px 0">
        <a href="${link}" style="display:inline-block;padding:12px 20px;background:#1a1a1a;color:#fff;border-radius:6px;text-decoration:none">
          Redefinir palavra-passe
        </a>
      </p>
      <p style="font-size:13px;color:#555">Ou copia este link: <a href="${link}" style="color:#555">${link}</a></p>
      <p style="font-size:13px;color:#555">O link expira às ${expiresFmt} (válido durante 1 hora).</p>
      <p style="font-size:13px;color:#555">Se não foste tu a pedir, podes ignorar este email — a tua palavra-passe atual continua válida.</p>
    </div>
    <div style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #e5e5e5;font-size:12px;color:#aaa">
      <p style="margin:0">NeoGeneralista · neogeneralista.pt</p>
    </div>
  </div>
</body></html>`
}

function buildResetText({ name, link, expiresAt }) {
  const expiresFmt = new Date(expiresAt).toLocaleString("pt-PT")
  return [
    `Olá, ${name || ""}.`,
    "",
    "Recebemos um pedido para redefinir a tua palavra-passe.",
    `Abre este link: ${link}`,
    "",
    `O link expira às ${expiresFmt} (válido durante 1 hora).`,
    "",
    "Se não foste tu a pedir, ignora este email.",
    "",
    "NeoGeneralista — neogeneralista.pt",
  ].join("\n")
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
