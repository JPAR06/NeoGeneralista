import crypto from "crypto"
import clientPromise from "./mongodb"

const COLLECTION = "passwordResetTokens"
const TOKEN_BYTES = 32 // 64 hex chars
const TTL_MS = 60 * 60 * 1000 // 1h

async function getCollection() {
  const client = await clientPromise
  const col = client.db().collection(COLLECTION)
  // TTL index — Mongo auto-deletes expired tokens. Idempotent.
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  await col.createIndex({ token: 1 }, { unique: true })
  return col
}

export async function createPasswordResetToken(email) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex")
  const expiresAt = new Date(Date.now() + TTL_MS)
  const col = await getCollection()
  // Invalidate any existing tokens for this email so old links die.
  await col.deleteMany({ email })
  await col.insertOne({ token, email, expiresAt, used: false, createdAt: new Date() })
  return { token, expiresAt }
}

export async function consumePasswordResetToken(token) {
  if (!token || typeof token !== "string") return null
  const col = await getCollection()
  const doc = await col.findOne({ token })
  if (!doc) return null
  if (doc.used) return null
  if (new Date(doc.expiresAt).getTime() < Date.now()) return null
  // Mark used. Caller must update the password before considering this consumed.
  const result = await col.updateOne(
    { _id: doc._id, used: false },
    { $set: { used: true, usedAt: new Date() } }
  )
  if (result.modifiedCount === 0) return null
  return { email: doc.email }
}

// Validate without consuming — used by the redefinir page to show a friendly
// error before the user submits a new password.
export async function peekPasswordResetToken(token) {
  if (!token || typeof token !== "string") return { valid: false, reason: "missing" }
  const col = await getCollection()
  const doc = await col.findOne({ token })
  if (!doc) return { valid: false, reason: "not_found" }
  if (doc.used) return { valid: false, reason: "used" }
  if (new Date(doc.expiresAt).getTime() < Date.now()) return { valid: false, reason: "expired" }
  return { valid: true, email: doc.email }
}
