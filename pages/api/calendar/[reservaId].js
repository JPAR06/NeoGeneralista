import { client } from "../../../lib/sanity";
import { buildEventIcs } from "../../../lib/ics";

// Returns an iCalendar file for a specific reserva.
// Public endpoint (no auth) because Sender.net fetches this URL when sending
// the confirmation email — it needs to be reachable without credentials.
//
// The URL relies on the reservaId being unguessable (~22 random chars from
// Sanity). The risk if someone scrapes it: they get the event title, date,
// and location — all of which are public on the event page anyway. Low risk.

export default async function handler(req, res) {
  const raw = req.query.reservaId;
  if (!raw || typeof raw !== "string") return res.status(400).end();

  // Allow the URL to end in `.ics` for nicer filename hints in email clients.
  const reservaId = raw.replace(/\.ics$/, "");

  const reserva = await client.fetch(
    `*[_type == "reserva" && _id == $id][0]{
      _id, nome, email, eventoId,
      "evento": *[_type == "eventoProximo" && _id == ^.eventoId][0]{
        _id, edicao, tema, dataISO, local, localUrl, convidado, descricaoCurta
      }
    }`,
    { id: reservaId }
  );

  if (!reserva || !reserva.evento || !reserva.evento.dataISO) {
    return res.status(404).end();
  }

  let ics;
  try {
    ics = buildEventIcs({
      evento: reserva.evento,
      attendeeEmail: reserva.email,
      attendeeName: reserva.nome,
      organizerEmail: process.env.SENDER_FROM_EMAIL,
    });
  } catch (err) {
    console.error("[calendar] failed to build ics:", err);
    return res.status(500).end();
  }

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="evento.ics"`);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.status(200).send(ics);
}
