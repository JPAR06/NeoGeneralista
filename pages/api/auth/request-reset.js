import clientPromise from "../../../lib/mongodb"
import { createPasswordResetToken } from "../../../lib/auth-tokens"
import { sendEmail } from "../../../lib/email"

// Returns the same response whether the email exists or not, to prevent
// account enumeration. Sends:
//   - reset email if account has a password
//   - activation email if account is a ghost (imported, no password yet)
//   - nothing for OAuth-only accounts (they have Google credentials already)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { email } = req.body || {}
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email obrigatório." })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Do the work inline (not in a background IIFE) — Vercel terminates the
  // serverless function as soon as the response is sent, so any deferred
  // work would never run. Wrap in try/catch so any error still returns 200,
  // preserving the "no enumeration" property (caller can't distinguish
  // existing from non-existing emails).
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
        // OAuth-only: stay silent.
      }

      if (mode) {
        const { token, expiresAt } = await createPasswordResetToken(normalizedEmail)

        const host = req.headers.host || ""
        const proto =
          req.headers["x-forwarded-proto"] ||
          (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https")
        const base = process.env.SITE_URL || `${proto}://${host}`
        const link = `${base.replace(/\/$/, "")}/auth/redefinir/${token}?mode=${mode}`

        const subject = mode === "activate"
          ? "Ativar a tua conta — NeoGeneralista"
          : "Redefinir palavra-passe — NeoGeneralista"

        await sendEmail({
          to: normalizedEmail,
          toName: user.name || "",
          subject,
          html: buildEmail({ name: user.name, link, expiresAt, mode }),
          text: buildText({ name: user.name, link, expiresAt, mode }),
        })
      }
    }
  } catch (err) {
    console.error("[request-reset] failed for", normalizedEmail, ":", err)
  }

  return res.status(200).json({ ok: true })
}

function buildEmail({ name, link, expiresAt, mode }) {
  const expiresFmt = new Date(expiresAt).toLocaleString("pt-PT", { hour: "2-digit", minute: "2-digit" })
  const isActivate = mode === "activate"
  const heading = isActivate ? "Ativar a tua conta" : "Redefinir palavra-passe"
  const intro = isActivate
    ? "A tua conta no AlgoritmoHumano já existe (foi pré-criada quando te inscreveste em eventos anteriores). Para começares a usar o site, escolhe agora a tua palavra-passe:"
    : "Recebemos um pedido para redefinir a tua palavra-passe. Clica no botão abaixo para escolheres uma nova:"
  const buttonLabel = isActivate ? "Definir palavra-passe" : "Redefinir palavra-passe"
  const ignoreNote = isActivate
    ? "Se não foste tu a pedir, podes ignorar este email — a tua conta continua sem palavra-passe definida."
    : "Se não foste tu a pedir, podes ignorar este email — a tua palavra-passe atual continua válida."

  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="padding:24px 32px;border-bottom:1px solid #e5e5e5">
      <p style="margin:0;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">NeoGeneralista</p>
      <h1 style="margin:8px 0 0;font-size:20px">${heading}</h1>
    </div>
    <div style="padding:24px 32px">
      <p>Olá, <strong>${escapeHtml(name || "")}</strong>.</p>
      <p>${intro}</p>
      <p style="margin:24px 0">
        <a href="${link}" style="display:inline-block;padding:12px 20px;background:#1a1a1a;color:#fff;border-radius:6px;text-decoration:none">
          ${buttonLabel}
        </a>
      </p>
      <p style="font-size:13px;color:#555">Ou copia este link: <a href="${link}" style="color:#555">${link}</a></p>
      <p style="font-size:13px;color:#555">O link expira às ${expiresFmt} (válido durante 1 hora).</p>
      <p style="font-size:13px;color:#555">${ignoreNote}</p>
    </div>
    <div style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #e5e5e5;font-size:12px;color:#aaa">
      <p style="margin:0">NeoGeneralista · neogeneralista.pt</p>
    </div>
  </div>
</body></html>`
}

function buildText({ name, link, expiresAt, mode }) {
  const expiresFmt = new Date(expiresAt).toLocaleString("pt-PT")
  const isActivate = mode === "activate"
  return [
    `Olá, ${name || ""}.`,
    "",
    isActivate
      ? "A tua conta já existe (foi pré-criada). Define a tua palavra-passe aqui:"
      : "Recebemos um pedido para redefinir a tua palavra-passe.",
    `Link: ${link}`,
    "",
    `Expira às ${expiresFmt} (válido durante 1 hora).`,
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
