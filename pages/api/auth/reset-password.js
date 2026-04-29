import bcrypt from "bcryptjs"
import clientPromise from "../../../lib/mongodb"
import { consumePasswordResetToken } from "../../../lib/auth-tokens"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { token, password } = req.body || {}
  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token inválido." })
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "A palavra-passe deve ter pelo menos 8 caracteres." })
  }

  const consumed = await consumePasswordResetToken(token)
  if (!consumed) {
    return res.status(400).json({ error: "Link inválido ou expirado. Pede um novo." })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const client = await clientPromise
  const db = client.db()
  const result = await db.collection("users").updateOne(
    { email: consumed.email },
    { $set: { passwordHash, updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) {
    // User got deleted between token issue and consume — extremely rare.
    return res.status(400).json({ error: "Conta não encontrada." })
  }

  // Best-effort: kill any existing sessions for this user so old logins
  // don't keep working with the rotated credentials.
  try {
    const user = await db.collection("users").findOne({ email: consumed.email }, { projection: { _id: 1 } })
    if (user) {
      await db.collection("sessions").deleteMany({ userId: user._id })
    }
  } catch (err) {
    console.error("[reset-password] failed to drop sessions:", err)
  }

  return res.status(200).json({ ok: true })
}
