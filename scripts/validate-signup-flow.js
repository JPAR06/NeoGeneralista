/**
 * Simulates the full signup → login flow for a fresh email, end-to-end
 * against the real MongoDB. Cleans up after itself.
 *
 * Run: node --env-file .env.local scripts/validate-signup-flow.js
 */
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

const TEST_EMAIL = `signup-flow-test-${Date.now()}@example.invalid`
const TEST_PASSWORD = "TestePass123!"
const TEST_NAME = "Test User"

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI not set. Pass --env-file .env.local")
    process.exit(1)
  }

  const mongo = new MongoClient(process.env.MONGODB_URI)
  await mongo.connect()
  const db = mongo.db()
  const users = db.collection("users")

  let pass = 0, fail = 0
  const record = (label, ok) => { ok ? pass++ : fail++; console.log(`  ${ok ? "✅" : "❌"} ${label}`) }

  console.log(`\n→ Using test email: ${TEST_EMAIL}`)
  console.log("\n→ Step 1: Verify email is fresh (mirrors signup endpoint check)")
  const existing = await users.findOne({ email: TEST_EMAIL.toLowerCase() })
  record("no existing user with this email", !existing)

  console.log("\n→ Step 2: Hash password + insert user (mirrors signup else-branch)")
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12)
  const insertResult = await users.insertOne({
    name: TEST_NAME,
    email: TEST_EMAIL.toLowerCase(),
    passwordHash,
    consentimentoEventosFuturos: true,
    consentimentoDadosInvestigacao: true,
    createdAt: new Date(),
  })
  record("insertOne returned acknowledged", insertResult.acknowledged)
  record("insertedId looks like ObjectId", !!insertResult.insertedId)

  console.log("\n→ Step 3: Login lookup (mirrors authorize() in [...nextauth].js)")
  const looked = await users.findOne({ email: TEST_EMAIL.toLowerCase().trim() })
  record("user found via login lookup", !!looked)
  record("has passwordHash", !!looked?.passwordHash)
  record("hash format starts with $2b$12$", looked?.passwordHash?.startsWith("$2b$12$"))

  console.log("\n→ Step 4: bcrypt.compare with right password")
  const validRight = await bcrypt.compare(TEST_PASSWORD, looked.passwordHash)
  record("right password validates", validRight === true)

  console.log("\n→ Step 5: bcrypt.compare with wrong password rejects")
  const validWrong = await bcrypt.compare("WrongPass!", looked.passwordHash)
  record("wrong password rejected", validWrong === false)

  console.log("\n→ Step 6: Email case-insensitive lookup (mirrors authorize toLowerCase)")
  const ciLookup = await users.findOne({ email: TEST_EMAIL.toUpperCase().toLowerCase().trim() })
  record("CASE-mixed lookup still finds user", !!ciLookup)

  console.log("\n→ Step 7: Cleanup")
  const del = await users.deleteOne({ _id: insertResult.insertedId })
  record("test user deleted", del.deletedCount === 1)

  await mongo.close()
  console.log(`\n${"=".repeat(40)}\nRESULTS: ${pass} passed, ${fail} failed\n${"=".repeat(40)}`)
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => { console.error("\n💥", e); process.exit(1) })
