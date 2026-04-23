/**
 * End-to-end validation of the check-in backend logic.
 *
 * Run:  node --env-file .env.local scripts/validate-checkin.js
 *
 * Creates a fresh test event + 4 reservas, exercises every branch of the
 * /api/checkin logic, asserts outputs, then deletes everything.
 */

const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

// Mirror of the logic in pages/api/checkin.js — keep in sync.
const WINDOW_BEFORE_MS = 1 * 60 * 60 * 1000
const WINDOW_AFTER_MS = 2 * 60 * 60 * 1000

async function runCheckin({ evento, userId }) {
  const reserva = await client.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId][0]{_id, estado, checkedIn, checkedInAt, nome}`,
    { eventoId: evento._id, userId }
  )

  if (!reserva) return { status: "not_found" }
  if (reserva.estado === "cancelado") return { status: "cancelled" }
  if (reserva.estado === "lista_espera") return { status: "waitlist" }
  if (reserva.checkedIn) return { status: "already", reserva }

  if (evento.dataISO) {
    const now = Date.now()
    const start = new Date(evento.dataISO).getTime()
    if (now < start - WINDOW_BEFORE_MS) return { status: "too_early" }
    if (now > start + WINDOW_AFTER_MS) return { status: "too_late" }
  }

  const checkedInAt = new Date().toISOString()
  await client.patch(reserva._id).set({ checkedIn: true, checkedInAt }).commit()
  return { status: "ok", reserva: { ...reserva, checkedInAt } }
}

const created = []

async function setup() {
  const now = new Date().toISOString()
  const evento = await client.create({
    _type: "eventoProximo",
    edicao: "VALIDATION TEST — delete me",
    tema: "Script auto",
    dataISO: now,
    formularioAtivo: false,
    maxParticipantes: 100,
  })
  created.push(evento._id)

  const users = {
    confirmado: "validate-user-confirmado",
    already: "validate-user-already",
    waitlist: "validate-user-waitlist",
    cancelado: "validate-user-cancelado",
  }

  const make = async (userId, estado, extra = {}) => {
    const r = await client.create({
      _type: "reserva",
      eventoId: evento._id,
      userId,
      nome: `Test ${userId}`,
      email: `${userId}@test.local`,
      estado,
      ...extra,
    })
    created.push(r._id)
    return r
  }

  await make(users.confirmado, "confirmado")
  await make(users.already, "confirmado", { checkedIn: true, checkedInAt: new Date(Date.now() - 60000).toISOString() })
  await make(users.waitlist, "lista_espera")
  await make(users.cancelado, "cancelado")

  return { evento, users }
}

async function teardown() {
  for (const id of created) {
    try { await client.delete(id) } catch (e) { console.error(`   cleanup fail ${id}:`, e.message) }
  }
}

function assertEq(label, got, expected) {
  if (got === expected) {
    console.log(`   ✅ ${label}: ${got}`)
    return true
  }
  console.log(`   ❌ ${label}: expected "${expected}", got "${got}"`)
  return false
}

async function main() {
  console.log("→ Setup: creating test evento + reservas…")
  const { evento, users } = await setup()
  console.log(`   evento _id: ${evento._id}`)

  let pass = 0
  let fail = 0
  const record = (ok) => { ok ? pass++ : fail++ }

  console.log("\n→ Test 1: confirmed reservation inside window → ok")
  record(assertEq("status", (await runCheckin({ evento, userId: users.confirmado })).status, "ok"))

  console.log("\n→ Test 2: confirmed + already checked in → already")
  record(assertEq("status", (await runCheckin({ evento, userId: users.already })).status, "already"))

  console.log("\n→ Test 3: confirmed (after test 1, now already checked in) → already")
  record(assertEq("status", (await runCheckin({ evento, userId: users.confirmado })).status, "already"))

  console.log("\n→ Test 4: waitlist reservation → waitlist")
  record(assertEq("status", (await runCheckin({ evento, userId: users.waitlist })).status, "waitlist"))

  console.log("\n→ Test 5: cancelled reservation → cancelled")
  record(assertEq("status", (await runCheckin({ evento, userId: users.cancelado })).status, "cancelled"))

  console.log("\n→ Test 6: user with no reservation → not_found")
  record(assertEq("status", (await runCheckin({ evento, userId: "ghost-user-xyz" })).status, "not_found"))

  console.log("\n→ Test 7: event 5h in the future → too_early")
  const futureEvento = { ...evento, dataISO: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() }
  // Need a fresh unchecked reserva for this
  const r7 = await client.create({
    _type: "reserva",
    eventoId: evento._id,
    userId: "validate-user-future",
    nome: "Test future",
    email: "future@test.local",
    estado: "confirmado",
  })
  created.push(r7._id)
  record(assertEq("status", (await runCheckin({ evento: futureEvento, userId: "validate-user-future" })).status, "too_early"))

  console.log("\n→ Test 8: event 5h in the past → too_late")
  const pastEvento = { ...evento, dataISO: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() }
  const r8 = await client.create({
    _type: "reserva",
    eventoId: evento._id,
    userId: "validate-user-past",
    nome: "Test past",
    email: "past@test.local",
    estado: "confirmado",
  })
  created.push(r8._id)
  record(assertEq("status", (await runCheckin({ evento: pastEvento, userId: "validate-user-past" })).status, "too_late"))

  console.log("\n→ Verifying Sanity persisted the check-in from Test 1…")
  const persisted = await client.fetch(
    `*[_type == "reserva" && userId == $u][0]{checkedIn, checkedInAt}`,
    { u: users.confirmado }
  )
  record(assertEq("checkedIn", persisted?.checkedIn, true))
  record(assertEq("checkedInAt has value", typeof persisted?.checkedInAt === "string" && persisted.checkedInAt.length > 0, true))

  console.log(`\n${"=".repeat(40)}`)
  console.log(`RESULTS: ${pass} passed, ${fail} failed`)
  console.log("=".repeat(40))

  console.log("\n→ Teardown: removing test docs…")
  await teardown()
  console.log(`   removed ${created.length} documents`)

  process.exit(fail > 0 ? 1 : 0)
}

main().catch(async (err) => {
  console.error("\n💥 Script crashed:", err)
  await teardown()
  process.exit(1)
})
