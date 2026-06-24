import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../lib/emailTemplate";
import { buildReservationTemplate } from "../../lib/emailContent";

// Import a mailing list into reservations.
//
// POST /api/importar-reservas
// Headers: Content-Type: application/json
// Body:
//   {
//     "secret": "<CRON_SECRET>",
//     "eventoId": "<sanity event _id>",
//     "participantes": [{ "nome": "João Silva", "email": "joao@email.com" }, ...],
//     "enviarEmail": true    // optional — default false
//   }
//
// Returns:
//   { importados: N, duplicados: N, listaEspera: N, erros: [...] }

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { secret, eventoId, participantes, enviarEmail = false } = req.body ?? {};

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!eventoId) return res.status(400).json({ error: "eventoId obrigatório" });
  if (!Array.isArray(participantes) || participantes.length === 0) {
    return res.status(400).json({ error: "participantes deve ser um array não vazio" });
  }

  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  let confirmedCount = await client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );
  const maxParticipantes = evento.maxParticipantes ?? 9999;

  const existingEmails = new Set(
    await client.fetch(
      `*[_type == "reserva" && eventoId == $eventoId && estado != "cancelado"].email`,
      { eventoId }
    )
  );

  let importados = 0;
  let duplicados = 0;
  let listaEspera = 0;
  const erros = [];

  for (const p of participantes) {
    const email = (p.email ?? "").trim().toLowerCase();
    const nome = (p.nome ?? "").trim() || email;

    if (!email || !email.includes("@")) {
      erros.push({ email, motivo: "email inválido" });
      continue;
    }

    if (existingEmails.has(email)) {
      duplicados++;
      continue;
    }

    const estado = confirmedCount < maxParticipantes ? "confirmado" : "lista_espera";
    if (estado === "confirmado") confirmedCount++;
    if (estado === "lista_espera") listaEspera++;

    try {
      await writeClient.create({
        _type: "reserva",
        eventoId,
        userId: `import:${email}`,
        nome,
        email,
        estado,
      });

      existingEmails.add(email);
      importados++;

      if (enviarEmail) {
        const subject = cleanSubject(
          estado === "confirmado"
            ? `Inscrição confirmada — ${evento.edicao ?? "Algoritmo Humano"}`
            : `Lista de espera — ${evento.edicao ?? "Algoritmo Humano"}`
        );
        const tplOpts = buildReservationTemplate({
          name: nome,
          evento,
          estado,
          icsUrl: null,
          selfSignup: false,
          headerVariant: "reserva",
        });
        sendEmail({
          to: email,
          toName: nome,
          subject,
          html: renderEmail(tplOpts),
          text: renderEmailText(tplOpts),
          headers: defaultHeaders({ topic: "eventos", recipientEmail: email }),
        }).catch((err) => console.error(`[import-email] ${email}:`, err));
      }
    } catch (err) {
      erros.push({ email, motivo: err.message });
    }
  }

  return res.status(200).json({ importados, duplicados, listaEspera, erros });
}
