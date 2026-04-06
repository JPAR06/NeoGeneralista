import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";

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

  // Fetch event
  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]`,
    { id: eventoId }
  );
  if (!evento) return res.status(404).json({ error: "Evento não encontrado" });

  // Current confirmed count
  let confirmedCount = await client.fetch(
    `count(*[_type == "reserva" && eventoId == $eventoId && estado == "confirmado"])`,
    { eventoId }
  );
  const maxParticipantes = evento.maxParticipantes ?? 9999;

  // Existing emails for this event (to skip duplicates)
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
        sendEmail({
          to: email,
          toName: nome,
          subject:
            estado === "confirmado"
              ? `Reserva confirmada — ${evento.edicao ?? "Algoritmo Humano"}`
              : `Estás na lista de espera — ${evento.edicao ?? "Algoritmo Humano"}`,
          html: buildEmail({ nome, evento, estado }),
        }).catch((err) => console.error(`[import-email] ${email}:`, err));
      }
    } catch (err) {
      erros.push({ email, motivo: err.message });
    }
  }

  return res.status(200).json({ importados, duplicados, listaEspera, erros });
}

function buildEmail({ nome, evento, estado }) {
  const isConfirmed = estado === "confirmado";
  const statusText = isConfirmed
    ? "A tua reserva está <strong>confirmada</strong>! 🎉"
    : "Estás na <strong>lista de espera</strong>. Avisamos-te se abrir vaga.";

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <h2 style="margin-bottom:4px">${evento.edicao ?? "Algoritmo Humano"}</h2>
      <p style="margin-top:0;color:#555">${statusText}</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
      <p><strong>Olá, ${nome}!</strong></p>
      <p>Recebemos a tua inscrição para o próximo evento.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0">
        ${evento.data ? `<tr><td style="padding:6px 0;color:#555;width:120px">Data</td><td style="padding:6px 0"><strong>${evento.data}</strong></td></tr>` : ""}
        ${evento.horario ? `<tr><td style="padding:6px 0;color:#555">Horário</td><td style="padding:6px 0"><strong>${evento.horario}</strong></td></tr>` : ""}
        ${evento.local ? `<tr><td style="padding:6px 0;color:#555">Local</td><td style="padding:6px 0"><strong>${evento.local}</strong></td></tr>` : ""}
        ${evento.convidado ? `<tr><td style="padding:6px 0;color:#555">Convidado/a</td><td style="padding:6px 0"><strong>${evento.convidado}</strong></td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>
      <p style="font-size:13px;color:#888">NeoGeneralista · <a href="https://neogeneralista.pt" style="color:#888">neogeneralista.pt</a></p>
    </div>
  `;
}
