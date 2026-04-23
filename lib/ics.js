// Build an iCalendar (RFC 5545) string for an event, suitable for email
// attachment (Content-Type: text/calendar) or a Google Calendar URL.

function toIcsDate(isoString) {
  // YYYYMMDDTHHMMSSZ (UTC, no punctuation)
  return new Date(isoString).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(str) {
  return String(str ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

// Default duration: 2h if the event has no explicit end time.
const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000;

export function buildEventIcs({ evento, attendeeEmail, attendeeName, organizerEmail }) {
  if (!evento?.dataISO) throw new Error("evento.dataISO is required");

  const start = new Date(evento.dataISO);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);

  const summary = escapeText(
    [evento.edicao, evento.tema].filter(Boolean).join(" — ") || "AlgoritmoHumano"
  );
  const location = escapeText(
    [evento.local, evento.localUrl].filter(Boolean).join(" · ")
  );
  const description = escapeText(
    [evento.convidado && `Convidado/a: ${evento.convidado}`, evento.descricaoCurta]
      .filter(Boolean)
      .join("\n\n")
  );

  const uid = `${evento._id || "evento"}@neogeneralista.pt`;
  const now = toIcsDate(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NeoGeneralista//AlgoritmoHumano//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsDate(start.toISOString())}`,
    `DTEND:${toIcsDate(end.toISOString())}`,
    `SUMMARY:${summary}`,
    description && `DESCRIPTION:${description}`,
    location && `LOCATION:${location}`,
    evento.localUrl && `URL:${evento.localUrl}`,
    organizerEmail && `ORGANIZER;CN=NeoGeneralista:mailto:${organizerEmail}`,
    attendeeEmail &&
      `ATTENDEE;CN=${escapeText(attendeeName || attendeeEmail)};RSVP=TRUE:mailto:${attendeeEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

// Google Calendar "add event" URL — users can tap this in the email.
export function buildGoogleCalendarUrl({ evento }) {
  if (!evento?.dataISO) return null;
  const start = new Date(evento.dataISO);
  const end = new Date(start.getTime() + DEFAULT_DURATION_MS);
  const dates = `${toIcsDate(start.toISOString())}/${toIcsDate(end.toISOString())}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: [evento.edicao, evento.tema].filter(Boolean).join(" — ") || "AlgoritmoHumano",
    dates,
  });
  if (evento.local) {
    params.set("location", [evento.local, evento.localUrl].filter(Boolean).join(" · "));
  }
  if (evento.convidado || evento.descricaoCurta) {
    params.set(
      "details",
      [evento.convidado && `Convidado/a: ${evento.convidado}`, evento.descricaoCurta]
        .filter(Boolean)
        .join("\n\n")
    );
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
