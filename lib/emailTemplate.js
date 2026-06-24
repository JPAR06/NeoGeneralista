// Single source of truth for transactional emails.
// All outgoing mail uses renderEmail() / renderEmailText() so design and
// deliverability hygiene stay consistent across the codebase.

export const BRAND = {
  name: "NeoGeneralista",
  site: "https://neogeneralista.pt",
  contactEmail: "ana@neogeneralista.pt",
  // Brand mint from the AH palette (bg #0c0c10 · coral #F05A78 · mint #7EDDB8).
  // Used by the calendar action buttons. Light enough that we pair it with
  // dark text for accessible contrast.
  brandMint: "#7EDDB8",
  brandMintInk: "#0c0c10",
  // Kept for reference / future use — the "azul da paleta" the first design
  // round used before the green swap.
  brandBlue: "#2e2ed1",
};

// Designer-provided header/footer banners. URLs are absolute because email
// clients cannot resolve relative paths. Each header is 1250×521 — displayed
// at 600px width inside the email card (≈250px tall). Footer is 1250×146.
//
// `hasTitle: true` means the image already contains the email's headline
// (e.g. "INSCRIÇÃO CONFIRMADA") so we suppress the textual h1 to avoid a
// duplicate. `hasTitle: false` is for generic banners (logo only, no copy);
// the textual h1 then renders below the image so the headline still appears.
const HEADERS = {
  ahInscricaoConfirmada: { url: `${BRAND.site}/email-assets/ah-inscricao-confirmada.png`, alt: "Inscrição confirmada — Algoritmo Humano", hasTitle: true },
  ahReservaConfirmada:   { url: `${BRAND.site}/email-assets/ah-reserva-confirmada.png`,   alt: "A tua reserva está confirmada — Algoritmo Humano", hasTitle: true },
  ahReminderAmanha:      { url: `${BRAND.site}/email-assets/ah-reminder-amanha.png`,      alt: "É amanhã! Esperamos por ti — Algoritmo Humano", hasTitle: true },
  ahReminderHoje:        { url: `${BRAND.site}/email-assets/ah-reminder-hoje.png`,        alt: "É hoje! Até já — Algoritmo Humano", hasTitle: true },
  ahGenerico:            { url: `${BRAND.site}/email-assets/ah-generico.png`,             alt: "Algoritmo Humano", hasTitle: false },
  ngGeral:               { url: `${BRAND.site}/email-assets/ng-geral.png`,                alt: "NeoGeneralista", hasTitle: false },
  ngPassword:            { url: `${BRAND.site}/email-assets/ng-password.png`,             alt: "Redefinir palavra-passe — NeoGeneralista", hasTitle: true },
};
export { HEADERS };

const FOOTER = {
  url: `${BRAND.site}/email-assets/footer.png`,
  alt: "NeoGeneralista · neogeneralista.pt",
};
export { FOOTER };

// Two visual themes, matching each site's identity. The default ("ng") is what
// the rest of the platform (reservations, reminders, auth) uses. Use "ah"
// for blog posts in the Algoritmo Humano section so subscribers feel the brand
// continuity from the website's dark/coral look.
// Logos served from the public site. Absolute URLs are required — email
// clients cannot resolve relative paths. The PNGs have transparent backgrounds
// so they render cleanly over the dark header gradient.
const LOGOS = {
  ng: {
    url: "https://neogeneralista.pt/neogeneralista-logo-cor.png",
    alt: "NeoGeneralista",
    height: 56,
  },
  ah: {
    url: "https://neogeneralista.pt/algoritmo-humano-logo-cor.png",
    alt: "Algoritmo Humano",
    height: 60,
  },
};

const THEMES = {
  ng: {
    headerFrom: "#070756", headerTo: "#1a1a85",
    eyebrowColor: "#ffb8cc",
    accentStrip: "#ff366b",
    ctaBg: "#ff366b",
    ctaColor: "#ffffff",
    bodyBg: "#eef0f3",
    cardBg: "#ffffff",
    cardShadow: "0 4px 20px rgba(15,23,42,.08)",
    text: "#1e293b",
    textMuted: "#475569",
    textSoft: "#64748b",
    textFaint: "#94a3b8",
    detailsBg: "#FFF8F6",
    detailsBorder: "#ffe1d8",
    rowBorder: "#f3e0d8",
    linkAccent: "#ff366b",
    footerBg: "#FFF8F6",
    footerBorder: "#f0ece8",
    footerText: "#94a3b8",
    footerBrand: "#1e293b",
    footerLink: "#94a3b8",
    secondaryBtnBg: "#ffffff",
    secondaryBtnText: "#1e293b",
    secondaryBtnBorder: "#e5e7eb",
  },
  ah: {
    headerFrom: "#0c0c10", headerTo: "#1a0a14",
    eyebrowColor: "#7EDDB8",
    accentStrip: "#7EDDB8",
    ctaBg: "#F05A78",
    ctaColor: "#ffffff",
    bodyBg: "#f5f4f0",
    cardBg: "#ffffff",
    cardShadow: "0 8px 28px rgba(12,12,16,.18)",
    text: "#0c0c10",
    textMuted: "#3f3f46",
    textSoft: "#52525b",
    textFaint: "#a1a1aa",
    detailsBg: "#fafaf7",
    detailsBorder: "#e5e5dd",
    rowBorder: "#e5e5dd",
    linkAccent: "#F05A78",
    footerBg: "#0c0c10",
    footerBorder: "#0c0c10",
    footerText: "#a1a1aa",
    footerBrand: "#ffffff",
    footerLink: "#7EDDB8",
    secondaryBtnBg: "#ffffff",
    secondaryBtnText: "#0c0c10",
    secondaryBtnBorder: "#d4d4d4",
  },
};

export function getTheme(name) {
  return THEMES[name] || THEMES.ng;
}

// Headers tuned for Gmail / Outlook deliverability.
//
// Sender.net has a tight whitelist on custom headers (422 "is not allowed"
// for Reply-To, Feedback-ID, etc.) so we ship only the two that demonstrably
// pass and are also the ones with the biggest spam-scoring impact:
//
//   - List-Unsubscribe (HTTPS URL + mailto fallback)
//   - List-Unsubscribe-Post: One-Click  (RFC 8058 — Gmail bulk-sender req.)
//
// For Reply-To, Feedback-ID etc., set them in the Sender.net account
// dashboard so they ship automatically without API validation.
//
// `autoSubmitted` and `topic` are kept in the signature for callsite clarity
// and so we can re-enable headers if Sender.net ever loosens validation.
export function defaultHeaders({ topic = "geral", recipientEmail, autoSubmitted } = {}) {
  void autoSubmitted;

  if (recipientEmail) {
    // Lazy import — avoids loading node:crypto when not signing.
    const { signUnsubscribe } = require("./unsubscribeToken");
    const enc = encodeURIComponent(recipientEmail.toLowerCase());
    const token = signUnsubscribe(recipientEmail, topic);
    const httpsUrl = `${BRAND.site}/api/unsubscribe?email=${enc}&topic=${encodeURIComponent(topic)}&t=${token}`;
    return {
      "List-Unsubscribe": `<${httpsUrl}>, <mailto:${BRAND.contactEmail}?subject=unsubscribe-${topic}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
  }

  return {
    "List-Unsubscribe": `<mailto:${BRAND.contactEmail}?subject=unsubscribe-${topic}>`,
  };
}

// Strip emoji and other glyphs that bump spam score. Keep PT accents.
export function cleanSubject(s) {
  return String(s ?? "")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label, value, theme) {
  if (!value) return "";
  return `<tr>
    <td style="padding:10px 0;color:${theme.textFaint};width:120px;border-bottom:1px solid ${theme.rowBorder};text-transform:uppercase;font-size:11px;letter-spacing:1px;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${theme.rowBorder};color:${theme.text}"><strong>${value}</strong></td>
  </tr>`;
}

/**
 * Render the canonical transactional email HTML.
 *
 * @param {Object} opts
 * @param {'ng'|'ah'} [opts.theme='ng']
 * @param {{url: string, alt: string, hasTitle?: boolean}} [opts.headerImage]
 *        Designer-provided banner. Replaces the gradient/logo/eyebrow/title
 *        block. If `hasTitle` is true (default), `heading` is suppressed
 *        because the image already contains it. If false (generic banner),
 *        the heading is rendered as h1 below the image so the title still
 *        appears in image-blocked clients.
 * @param {{url: string, alt: string}} [opts.footerImage]
 *        Designer-provided footer banner. Renders below the textual footer.
 * @param {string} [opts.eyebrow]    Small uppercase label above the heading (text mode)
 * @param {string} opts.heading      Main heading (also email title; alt fallback)
 * @param {string} [opts.subheading] Supporting line below heading (text mode)
 * @param {string} [opts.greeting]   "Olá, Nome." — HTML allowed
 * @param {string|string[]} [opts.paragraphs]  Body paragraphs (HTML allowed)
 * @param {string} [opts.heroImage]  Optional inline article banner (blog posts)
 * @param {string} [opts.heroAlt]    Alt text for hero image
 * @param {Array<{label: string, value: string}>} [opts.details] Key-value rows
 * @param {{label: string, url: string}} [opts.cta] Primary CTA button
 * @param {Array<{label: string, url: string, variant?: 'primary'|'secondary'|'calendar'}>} [opts.actions]
 *        Secondary buttons. `calendar` uses brand blue (#2e2ed1) per design.
 * @param {string} [opts.note]       Small grey note paragraph below CTA
 * @param {string} [opts.belowCta]   HTML inserted below the CTA (e.g. blog teaser nudge)
 * @param {string} [opts.footerReason] "Recebeste este email porque…" line — sits above footer image
 * @param {boolean} [opts.transactional=false] Hide the visual unsubscribe link for
 *        security/auth emails (password reset, activation). The List-Unsubscribe
 *        header still ships for inbox reputation.
 */
export function renderEmail(opts) {
  const {
    theme: themeName = "ng",
    headerImage,
    footerImage,
    eyebrow,
    heading,
    subheading,
    greeting,
    paragraphs,
    heroImage,
    heroAlt,
    details,
    cta,
    actions,
    note,
    belowCta,
    footerReason,
    transactional,
    brandLine,
  } = opts;
  const t = getTheme(themeName);
  const isAh = themeName === "ah";
  const logo = LOGOS[themeName] || LOGOS.ng;

  const paras = Array.isArray(paragraphs) ? paragraphs : paragraphs ? [paragraphs] : [];
  const detailsRows = (details || [])
    .filter((d) => d && d.value)
    .map((d) => row(d.label, d.value, t))
    .join("");
  const actionsHtml = (actions || [])
    .map((a) => {
      const variant = a.variant || "primary";
      let bg, color, border;
      if (variant === "calendar") {
        // Designer's note: calendar buttons take the brand mint (the green
        // from the site's palette) without any leading icon. Both Google
        // Calendar and Apple/Outlook share this treatment so the pair reads
        // as a unit. Mint is light so we use dark ink for contrast.
        bg = BRAND.brandMint;
        color = BRAND.brandMintInk;
        border = "none";
      } else if (variant === "secondary") {
        bg = t.secondaryBtnBg;
        color = t.secondaryBtnText;
        border = `1px solid ${t.secondaryBtnBorder}`;
      } else {
        bg = t.ctaBg;
        color = t.ctaColor;
        border = "none";
      }
      return `<a href="${a.url}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:8px;border:${border};margin:4px 6px 4px 0">${escapeHtml(a.label)}</a>`;
    })
    .join("");

  // AH theme uses a coral pill eyebrow (chip), NG uses uppercase coral text.
  const eyebrowHtml = eyebrow
    ? isAh
      ? `<span style="display:inline-block;background:${t.ctaBg};color:#ffffff;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:999px">${escapeHtml(eyebrow)}</span>`
      : `<p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${t.eyebrowColor};font-weight:600">${escapeHtml(eyebrow)}</p>`
    : "";

  // Header block: either designer banner image OR text-only fallback.
  const headerHtml = headerImage
    ? `<tr><td style="padding:0;background:#0a0a40;line-height:0;font-size:0">
<img src="${headerImage.url}" alt="${escapeHtml(headerImage.alt || heading)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none" />
</td></tr>`
    : `<tr><td style="background:linear-gradient(135deg,${t.headerFrom} 0%,${t.headerTo} 100%);padding:28px 36px;color:#ffffff">
<img src="${logo.url}" alt="${escapeHtml(logo.alt)}" height="${logo.height}" style="display:block;height:${logo.height}px;width:auto;border:0;outline:none;margin:0 0 18px" />
${eyebrowHtml}
<h1 style="margin:${eyebrow ? "12px 0 0" : "0"};font-size:${isAh ? "30px" : "28px"};line-height:1.2;font-weight:700;color:#ffffff;letter-spacing:${isAh ? "-0.01em" : "normal"}">${escapeHtml(heading)}</h1>
${subheading ? `<p style="margin:8px 0 0;font-size:15px;color:${isAh ? "#a1a1aa" : "#cfd0e8"}">${escapeHtml(subheading)}</p>` : ""}
</td></tr>`;

  // When the header image is generic (no title baked in), surface the heading
  // textually below the image so subscribers know what the email is about.
  const showTextTitle = headerImage && headerImage.hasTitle === false && heading;
  const titleBelowImageHtml = showTextTitle
    ? `<tr><td style="padding:28px 36px 0">
<h1 style="margin:0;font-size:${isAh ? "26px" : "24px"};line-height:1.25;font-weight:700;color:${t.text};letter-spacing:-0.01em">${escapeHtml(heading)}</h1>
${subheading ? `<p style="margin:8px 0 0;font-size:15px;color:${t.textMuted};line-height:1.5">${escapeHtml(subheading)}</p>` : ""}
</td></tr>`
    : "";

  // Accent strip only renders for the text-mode header — when there's a
  // designer banner the image carries its own treatment.
  const accentStripHtml = headerImage
    ? ""
    : `<tr><td style="height:4px;background:${t.accentStrip};line-height:4px;font-size:0">&nbsp;</td></tr>`;

  // Top padding of the body changes based on what came above it.
  const bodyTopPad = heroImage
    ? "28px 36px 8px"
    : showTextTitle
      ? "20px 36px 8px"
      : "32px 36px 8px";

  // Footer text (always rendered) + designer footer image when provided.
  const footerTextHtml = `<tr><td style="background:${t.footerBg};border-top:1px solid ${t.footerBorder};padding:18px 36px 14px">
<p style="margin:0;font-size:12px;color:${t.footerText};line-height:1.6;text-align:center">
${footerReason ? escapeHtml(footerReason) : ""}${!transactional ? `${footerReason ? "<br/>" : ""}<a href="mailto:${BRAND.contactEmail}?subject=unsubscribe" style="color:${t.footerLink};text-decoration:underline">Cancelar subscrição</a>` : ""}
</p>
</td></tr>`;

  const footerImageHtml = footerImage
    ? `<tr><td style="padding:0;line-height:0;font-size:0">
<img src="${footerImage.url}" alt="${escapeHtml(footerImage.alt || BRAND.name)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none" />
</td></tr>`
    : "";

  // When there is no footer image, fall back to the legacy text-only footer
  // that names the brand + site link inline.
  const brandLabel = brandLine || (isAh ? "Algoritmo Humano · NeoGeneralista" : BRAND.name);
  const legacyFooterHtml = footerImage
    ? ""
    : `<tr><td style="background:${t.footerBg};border-top:1px solid ${t.footerBorder};padding:20px 36px">
<p style="margin:0;font-size:12px;color:${t.footerText};line-height:1.6">
<strong style="color:${t.footerBrand}">${escapeHtml(brandLabel)}</strong> &middot; <a href="${BRAND.site}" style="color:${t.footerLink};text-decoration:none">neogeneralista.pt</a>${footerReason ? `<br/>${escapeHtml(footerReason)}` : ""}${!transactional ? `<br/><a href="mailto:${BRAND.contactEmail}?subject=unsubscribe" style="color:${t.footerLink};text-decoration:underline">Cancelar subscrição</a>` : ""}
</p>
</td></tr>`;

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${t.bodyBg};font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${t.bodyBg}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:${t.cardBg};border-radius:14px;overflow:hidden;box-shadow:${t.cardShadow};font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:${t.text}">

${headerHtml}
${accentStripHtml}
${titleBelowImageHtml}

${heroImage ? `<tr><td style="padding:0;background:${t.headerFrom}">
<img src="${heroImage}" alt="${escapeHtml(heroAlt || heading)}" width="600" style="display:block;width:100%;max-width:600px;max-height:320px;height:auto;border:0;outline:none;text-decoration:none;object-fit:cover;object-position:center" />
</td></tr>` : ""}

<tr><td style="padding:${bodyTopPad}">
${greeting ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${t.text}">${greeting}</p>` : ""}
${paras.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:${t.textMuted}">${p}</p>`).join("")}
</td></tr>

${detailsRows ? `<tr><td style="padding:8px 36px 8px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${t.detailsBg};border:1px solid ${t.detailsBorder};border-radius:10px">
<tr><td style="padding:20px 22px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-size:14px">
${detailsRows}
</table>
</td></tr>
</table>
</td></tr>` : ""}

${cta ? `<tr><td align="center" style="padding:28px 36px 8px">
<a href="${cta.url}" style="display:inline-block;background:${t.ctaBg};color:${t.ctaColor};text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px;letter-spacing:.2px">${escapeHtml(cta.label)}</a>
</td></tr>` : ""}

${belowCta ? `<tr><td align="center" style="padding:4px 36px 12px"><p style="margin:0;font-size:13px;line-height:1.55;color:${t.textSoft}">${belowCta}</p></td></tr>` : ""}

${actionsHtml ? `<tr><td align="center" style="padding:8px 36px 16px">${actionsHtml}</td></tr>` : ""}

${note ? `<tr><td style="padding:8px 36px 32px">
<p style="margin:0;font-size:13px;line-height:1.6;color:${t.textSoft};text-align:center">${note}</p>
</td></tr>` : `<tr><td style="height:24px;font-size:0;line-height:0">&nbsp;</td></tr>`}

${footerImage ? footerTextHtml + footerImageHtml : legacyFooterHtml}

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Render the canonical plain-text version. Always include this — spam filters
 * penalize HTML-only mail and clients without HTML rendering fall back to it.
 */
export function renderEmailText(opts) {
  const { eyebrow, heading, subheading, greeting, paragraphs, details, cta, belowCta, actions, note, footerReason, transactional } = opts;
  const lines = [];
  if (eyebrow) lines.push(eyebrow.toUpperCase());
  if (heading) lines.push(heading);
  if (subheading) lines.push(subheading);
  if (eyebrow || heading) lines.push("");
  if (greeting) {
    lines.push(stripHtml(greeting));
    lines.push("");
  }
  const paras = Array.isArray(paragraphs) ? paragraphs : paragraphs ? [paragraphs] : [];
  for (const p of paras) {
    lines.push(stripHtml(p));
    lines.push("");
  }
  let hasDetails = false;
  for (const d of details || []) {
    if (d && d.value) {
      lines.push(`${d.label}: ${stripHtml(d.value)}`);
      hasDetails = true;
    }
  }
  if (hasDetails) lines.push("");
  if (cta) lines.push(`${cta.label}: ${cta.url}`);
  if (belowCta) {
    lines.push(stripHtml(belowCta));
  }
  for (const a of actions || []) {
    lines.push(`${a.label}: ${a.url}`);
  }
  if (cta || (actions || []).length) lines.push("");
  if (note) {
    lines.push(stripHtml(note));
    lines.push("");
  }
  lines.push(`— ${BRAND.name}`);
  lines.push("neogeneralista.pt");
  if (footerReason) {
    lines.push("");
    lines.push(footerReason);
  }
  if (!transactional) {
    lines.push("");
    lines.push(`Cancelar subscrição: mailto:${BRAND.contactEmail}?subject=unsubscribe`);
  }
  return lines.join("\n");
}

function stripHtml(s) {
  return String(s ?? "")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}
