import clientPromise from "../../../lib/mongodb"
import { createPasswordResetToken } from "../../../lib/auth-tokens"
import { sendEmail } from "../../../lib/email"
import { safeCallback } from "../../../lib/callback"
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../../lib/emailTemplate"
import { buildResetTemplate } from "../../../lib/emailContent"

// Returns the same response whether the email exists or not, to prevent
// account enumeration. Sends:
//   - reset email if account has a password
//   - activation email if account is a ghost (imported, no password yet)
//   - nothing for OAuth-only accounts (they have Google credentials already)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { email, callbackUrl: rawCallback } = req.body || {}
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email obrigatório." })
  }

  const normalizedEmail = email.toLowerCase().trim()
  const callbackUrl = safeCallback(rawCallback, "")

  try {
    const mongo = await clientPromise
    const db = mongo.db()
    const user = await db.collection("users").findOne({ email: normalizedEmail })

    if (user) {
      let mode = null
      if (user.passwordHash) {
        mode = "reset"
      } else {
        const linked = await db.collection("accounts").findOne({ userId: user._id }, { projection: { _id: 1 } })
        if (!linked) mode = "activate"
      }

      if (mode) {
        const { token, expiresAt } = await createPasswordResetToken(normalizedEmail)

        const host = req.headers.host || ""
        const proto =
          req.headers["x-forwarded-proto"] ||
          (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
        const base = process.env.SITE_URL || `${proto}://${host}`
        const cbParam = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
        const link = `${base.replace(/\/$/, "")}/auth/redefinir/${token}?mode=${mode}${cbParam}`

        const subject = cleanSubject(
          mode === "activate"
            ? "Ativar a tua conta — NeoGeneralista"
            : "Redefinir palavra-passe — NeoGeneralista"
        )
        const tplOpts = buildResetTemplate({ name: user.name, link, expiresAt, mode })

        await sendEmail({
          to: normalizedEmail,
          toName: user.name || "",
          subject,
          html: renderEmail(tplOpts),
          text: renderEmailText(tplOpts),
          headers: defaultHeaders({ topic: "conta", recipientEmail: normalizedEmail }),
        })
      }
    }
  } catch (err) {
    console.error("[request-reset] failed for", normalizedEmail, ":", err)
  }

  return res.status(200).json({ ok: true })
}
