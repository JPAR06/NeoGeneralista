/**
 * Reset the password of a user in MongoDB.
 *
 * Usage:
 *   node --env-file .env.local scripts/reset-password.js <email> <new-password>
 *
 * Intended for local dev when you've forgotten the credentials-provider password.
 */
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

async function main() {
  const [, , email, newPassword] = process.argv
  if (!email || !newPassword) {
    console.error("Usage: node --env-file .env.local scripts/reset-password.js <email> <new-password>")
    process.exit(1)
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set. Did you pass --env-file .env.local?")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)
  try {
    await client.connect()
    const db = client.db()
    const users = db.collection("users")

    const existing = await users.findOne({ email: email.toLowerCase() })
    if (!existing) {
      console.error(`No user with email "${email.toLowerCase()}" — have you registered this account yet?`)
      process.exit(1)
    }

    const hash = await bcrypt.hash(newPassword, 10)
    const result = await users.updateOne(
      { _id: existing._id },
      { $set: { passwordHash: hash } }
    )
    console.log(`✅ Password reset for ${existing.email} (matched=${result.matchedCount}, modified=${result.modifiedCount})`)
    console.log(`   Now log in with:\n     email:    ${existing.email}\n     password: ${newPassword}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error("💥", err)
  process.exit(1)
})
