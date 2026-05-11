/**
 * E2E validation for manual inscription logic.
 * Mirrors the same code path as /api/admin/manual-inscrever (no HTTP — would
 * require auth setup; we exercise the underlying Mongo + Sanity logic).
 *
 * Run: node --env-file .env.local scripts/validate-manual-inscrever.js
 */
const { MongoClient, ObjectId } = require("mongodb");
const { createClient } = require("@sanity/client");

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// Mirror of the endpoint logic — kept in sync with manual-inscrever.js
async function manualInscrever(mongo, { eventoId, userId }) {
  if (!eventoId) return { http: 400, error: "eventoId obrigatório" };
  if (!userId) return { http: 400, error: "userId obrigatório" };

  let userObjId;
  try { userObjId = new ObjectId(userId); }
  catch { return { http: 400, error: "userId inválido" }; }

  const user = await mongo.db().collection("users").findOne(
    { _id: userObjId },
    { projection: { name: 1, email: 1 } }
  );
  if (!user) return { http: 404, error: "Utilizador não encontrado" };

  const evento = await sanity.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return { http: 404, error: "Evento não encontrado" };

  const existing = await sanity.fetch(
    `*[_type == "reserva" && eventoId == $eventoId && userId == $userId && estado != "cancelado"][0]{_id, estado}`,
    { eventoId, userId: user._id.toString() }
  );
  if (existing) {
    return { http: 409, error: `Já tem reserva (${existing.estado})`, estado: existing.estado };
  }

  const count = await sanity.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );
  const estado = count < (evento.maxParticipantes ?? 9999) ? "confirmado" : "lista_espera";

  const reserva = await sanity.create({
    _type: "reserva",
    eventoId,
    userId: user._id.toString(),
    nome: user.name,
    email: user.email,
    estado,
  });

  return { http: 200, ok: true, estado, reserva, user };
}

const cleanup = { sanityIds: [], mongoIds: [] };

async function main() {
  const mongo = new MongoClient(process.env.MONGODB_URI);
  await mongo.connect();

  let pass = 0, fail = 0;
  const record = (label, ok, detail = "") => {
    if (ok) { pass++; console.log(`   ✅ ${label}${detail ? " — " + detail : ""}`); }
    else { fail++; console.log(`   ❌ ${label}${detail ? " — " + detail : ""}`); }
  };

  // ── Setup: create test event + 3 test users ─────────────────────
  console.log("→ Setup");
  const evento = await sanity.create({
    _type: "eventoProximo",
    edicao: "VALIDATION TEST — manual inscrever",
    tema: "Test",
    dataISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    formularioAtivo: false, // closed; admin override should still work
    maxParticipantes: 2, // tiny so we can test waitlist
  });
  cleanup.sanityIds.push(evento._id);
  console.log("   evento _id:", evento._id, "· maxParticipantes:", evento.maxParticipantes);

  const userA = await mongo.db().collection("users").insertOne({
    name: "Test User A", email: `test-a-${Date.now()}@example.invalid`, createdAt: new Date(),
  });
  const userB = await mongo.db().collection("users").insertOne({
    name: "Test User B", email: `test-b-${Date.now()}@example.invalid`, createdAt: new Date(),
  });
  const userC = await mongo.db().collection("users").insertOne({
    name: "Test User C", email: `test-c-${Date.now()}@example.invalid`, createdAt: new Date(),
  });
  cleanup.mongoIds.push(userA.insertedId, userB.insertedId, userC.insertedId);
  console.log("   created 3 test users");

  // ── Test 1: Valid inscription → confirmado ───────────────────────
  console.log("\n→ Test 1: A inscribed (1st of 2 slots) → confirmado");
  const r1 = await manualInscrever(mongo, {
    eventoId: evento._id,
    userId: userA.insertedId.toString(),
  });
  record("HTTP 200", r1.http === 200, `got ${r1.http}`);
  record("estado=confirmado", r1.estado === "confirmado", `got ${r1.estado}`);
  if (r1.reserva) cleanup.sanityIds.push(r1.reserva._id);

  // ── Test 2: Re-inscribing same user → 409 ───────────────────────
  console.log("\n→ Test 2: A again → 409 (already inscribed)");
  const r2 = await manualInscrever(mongo, {
    eventoId: evento._id,
    userId: userA.insertedId.toString(),
  });
  record("HTTP 409", r2.http === 409, `got ${r2.http}`);
  record("error mentions reserva", /reserva/i.test(r2.error || ""), r2.error);

  // ── Test 3: Second user fills the event → confirmado ─────────────
  console.log("\n→ Test 3: B inscribed (2nd of 2 slots) → confirmado");
  const r3 = await manualInscrever(mongo, {
    eventoId: evento._id,
    userId: userB.insertedId.toString(),
  });
  record("HTTP 200", r3.http === 200);
  record("estado=confirmado", r3.estado === "confirmado", `got ${r3.estado}`);
  if (r3.reserva) cleanup.sanityIds.push(r3.reserva._id);

  // ── Test 4: Third user → over capacity → lista_espera ───────────
  console.log("\n→ Test 4: C inscribed when event is full → lista_espera");
  const r4 = await manualInscrever(mongo, {
    eventoId: evento._id,
    userId: userC.insertedId.toString(),
  });
  record("HTTP 200", r4.http === 200);
  record("estado=lista_espera", r4.estado === "lista_espera", `got ${r4.estado}`);
  if (r4.reserva) cleanup.sanityIds.push(r4.reserva._id);

  // ── Test 5: Invalid userId format → 400 ─────────────────────────
  console.log("\n→ Test 5: invalid userId 'xyz' → 400");
  const r5 = await manualInscrever(mongo, { eventoId: evento._id, userId: "xyz" });
  record("HTTP 400", r5.http === 400);

  // ── Test 6: Non-existent userId (valid format) → 404 ────────────
  console.log("\n→ Test 6: ghost userId (well-formed but unused) → 404");
  const r6 = await manualInscrever(mongo, {
    eventoId: evento._id,
    userId: new ObjectId().toString(),
  });
  record("HTTP 404", r6.http === 404);

  // ── Test 7: Missing eventoId → 400 ──────────────────────────────
  console.log("\n→ Test 7: missing eventoId → 400");
  const r7 = await manualInscrever(mongo, {
    eventoId: "",
    userId: userA.insertedId.toString(),
  });
  record("HTTP 400", r7.http === 400);

  // ── Test 8: Non-existent eventoId → 404 ─────────────────────────
  console.log("\n→ Test 8: invalid eventoId → 404");
  const r8 = await manualInscrever(mongo, {
    eventoId: "evento-ghost-xxxx",
    userId: userA.insertedId.toString(),
  });
  record("HTTP 404", r8.http === 404);

  // ── Test 9: Missing userId → 400 ────────────────────────────────
  console.log("\n→ Test 9: missing userId → 400");
  const r9 = await manualInscrever(mongo, { eventoId: evento._id, userId: "" });
  record("HTTP 400", r9.http === 400);

  // ── Test 10: After cancelling a reservation, user can re-inscribe ─
  console.log("\n→ Test 10: cancel A, re-inscribe → confirmado (well, full now → waitlist)");
  if (r1.reserva?._id) {
    await sanity.patch(r1.reserva._id).set({ estado: "cancelado" }).commit();
    const r10 = await manualInscrever(mongo, {
      eventoId: evento._id,
      userId: userA.insertedId.toString(),
    });
    record("HTTP 200 (cancelled doesn't block)", r10.http === 200, `got ${r10.http}`);
    // Capacity now: A=cancelled, B=confirmado, C=waitlist → confirmados=1, max=2 → A becomes confirmado again
    record("estado=confirmado (slot freed)", r10.estado === "confirmado", `got ${r10.estado}`);
    if (r10.reserva) cleanup.sanityIds.push(r10.reserva._id);
  }

  // ── Test 11: Capacity check is purely based on confirmed count ──
  console.log("\n→ Test 11: verify only 'confirmado' counts toward capacity");
  const counts = await sanity.fetch(
    `{
      "confirmados": count(*[_type == "reserva" && eventoId == $id && estado == "confirmado"]),
      "espera": count(*[_type == "reserva" && eventoId == $id && estado == "lista_espera"]),
      "cancelados": count(*[_type == "reserva" && eventoId == $id && estado == "cancelado"])
    }`,
    { id: evento._id }
  );
  console.log("   final counts:", counts);
  record("max 2 confirmados respected", counts.confirmados === 2);

  // ── Cleanup ─────────────────────────────────────────────────────
  console.log("\n→ Teardown");
  for (const id of cleanup.sanityIds) {
    try { await sanity.delete(id); } catch (e) { console.error("   sanity cleanup fail:", id, e.message); }
  }
  for (const id of cleanup.mongoIds) {
    try { await mongo.db().collection("users").deleteOne({ _id: id }); } catch {}
  }
  console.log(`   removed ${cleanup.sanityIds.length} sanity docs + ${cleanup.mongoIds.length} mongo users`);

  await mongo.close();
  console.log(`\n${"=".repeat(50)}\nRESULTS: ${pass} passed, ${fail} failed\n${"=".repeat(50)}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(async (e) => {
  console.error("\n💥", e);
  // Best-effort cleanup
  for (const id of cleanup.sanityIds) {
    try { await sanity.delete(id); } catch {}
  }
  process.exit(1);
});
