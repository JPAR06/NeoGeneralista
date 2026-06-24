// Content builders for each transactional email. Each function returns the
// options object expected by lib/emailTemplate.js → renderEmail / renderEmailText.
// Keeping them in a plain module (no Next.js / mongo imports) lets API handlers
// and the preview endpoint share them without pulling in handler-only deps.

import { buildGoogleCalendarUrl } from "./ics.js";
import { HEADERS, FOOTER } from "./emailTemplate.js";

function escapeText(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function locationValue(evento) {
  if (!evento?.local) return null;
  if (evento.localUrl) {
    return `${escapeText(evento.local)} · <a href="${evento.localUrl}" style="color:#ff366b;text-decoration:none">Ver mapa</a>`;
  }
  return escapeText(evento.local);
}

/**
 * @param {Object} args
 * @param {'inscricao'|'reserva'} [args.headerVariant='inscricao']
 *        Picks between the two AH confirmation banners:
 *        - 'inscricao': "INSCRIÇÃO CONFIRMADA" — self/admin signup flow
 *        - 'reserva': "A TUA RESERVA ESTÁ CONFIRMADA!" — bulk-imported list
 */
export function buildReservationTemplate({ name, evento, estado, icsUrl, selfSignup, headerVariant = "inscricao" }) {
  const isConfirmed = estado === "confirmado";
  const edicao = evento.edicao ?? "Algoritmo Humano";
  const googleUrl = isConfirmed && evento.dataISO ? buildGoogleCalendarUrl({ evento }) : null;

  // For confirmed reservations we use the designer banner with the title baked
  // in (no h1 below). Waitlist has no dedicated banner — fall back to the
  // generic AH header and surface the heading as h1 below it.
  const headerImage = isConfirmed
    ? headerVariant === "reserva"
      ? HEADERS.ahReservaConfirmada
      : HEADERS.ahInscricaoConfirmada
    : HEADERS.ahGenerico;

  const heading = isConfirmed
    ? headerVariant === "reserva"
      ? "A tua reserva está confirmada"
      : "Inscrição confirmada"
    : "Estás em lista de espera";
  const subheading = isConfirmed
    ? null
    : "Avisamos-te assim que abrir vaga.";

  const introConfirmed = selfSignup
    ? "Recebemos a tua inscrição e está tudo certo. Aqui ficam os detalhes do encontro."
    : "A equipa Algoritmo Humano inscreveu-te neste evento. Aqui ficam os detalhes do encontro.";
  const introWaitlist =
    "O evento está com lotação esgotada e ficaste em lista de espera. Se libertar um lugar, avisamos-te de imediato.";

  const paragraphs = [isConfirmed ? introConfirmed : introWaitlist];
  if (!selfSignup) {
    paragraphs.push("Se não esperavas esta inscrição, responde a este email para nos dizeres.");
  }

  // Both calendar buttons share the brand-blue treatment per design (#2e2ed1,
  // no leading icons).
  const actions = [];
  if (googleUrl) actions.push({ label: "Adicionar ao Google Calendar", url: googleUrl, variant: "calendar" });
  if (icsUrl) actions.push({ label: "Apple / Outlook (.ics)", url: icsUrl, variant: "calendar" });

  return {
    theme: "ng",
    headerImage,
    footerImage: FOOTER,
    eyebrow: edicao,
    heading,
    subheading,
    greeting: `Olá, <strong>${escapeText(name || "")}</strong>.`,
    paragraphs,
    details: [
      { label: "Data", value: evento.data },
      { label: "Horário", value: evento.horario },
      { label: "Local", value: locationValue(evento) },
      { label: "Convidado/a", value: evento.convidado ? escapeText(evento.convidado) : null },
    ],
    cta: { label: "Ver detalhes do evento", url: "https://neogeneralista.pt/algoritmo-humano/evento" },
    actions,
    note: isConfirmed
      ? "Não vais poder ir? Cancela a tua reserva diretamente na plataforma para libertares o lugar."
      : null,
    footerReason: `Recebeste este email porque te inscreveste no ${edicao}.`,
  };
}

export function buildReminderTemplate({ reserva, evento, window }) {
  const edicao = evento.edicao ?? "Algoritmo Humano";
  const is5h = window === "5h";
  // Designer banners include both the headline ("É AMANHÃ!" / "É HOJE!") and
  // the supporting subheading ("Esperamos por ti" / "Até já"), so we suppress
  // both text fields to avoid duplication.
  const headerImage = is5h ? HEADERS.ahReminderHoje : HEADERS.ahReminderAmanha;

  const introHtml = is5h
    ? `O <strong style="color:#2e2ed1">${escapeText(edicao)}</strong> arranca <strong style="color:#2e2ed1">hoje</strong>. Aqui ficam os detalhes finais para teres à mão.`
    : `Só a relembrar que o próximo encontro do <strong style="color:#2e2ed1">${escapeText(edicao)}</strong> é <strong style="color:#2e2ed1">amanhã</strong>. Aqui ficam os detalhes para teres à mão.`;

  return {
    theme: "ng",
    headerImage,
    footerImage: FOOTER,
    eyebrow: edicao,
    heading: is5h ? "É hoje. Até já." : "É amanhã.",
    // No subheading: the image already says "Esperamos por ti" / "Até já".
    greeting: `Olá, <strong>${escapeText(reserva.nome || "")}</strong>.`,
    paragraphs: [introHtml],
    details: [
      { label: "Data", value: evento.data },
      { label: "Horário", value: evento.horario },
      { label: "Local", value: locationValue(evento) },
      { label: "Convidado/a", value: evento.convidado ? escapeText(evento.convidado) : null },
    ],
    cta: { label: "Ver detalhes do evento", url: "https://neogeneralista.pt/algoritmo-humano/evento" },
    note: "Não vais poder ir? Cancela a tua reserva diretamente na plataforma para libertares o lugar.",
    footerReason: `Recebeste este email porque tens uma reserva confirmada no ${edicao}.`,
  };
}

export function buildBlogTemplate({ post, postUrl, secao }) {
  const isAH = secao === "algoritmohumano";
  const eyebrow = post.categoria || (isAH ? "Algoritmo Humano" : "NeoGeneralista");
  const subheading = post.autor ? `Por ${post.autor}` : null;

  const introText = post.introducaoEmail || post.resumo;
  const accent = isAH ? "#F05A78" : "#ff366b";
  const textColor = isAH ? "#0c0c10" : "#1e293b";
  const paragraphs = [];
  if (introText) {
    paragraphs.push(
      `<span style="display:block;padding:6px 0 6px 18px;border-left:3px solid ${accent};font-size:18px;line-height:1.55;color:${textColor};font-style:italic;font-weight:500">${escapeText(introText)}</span>`
    );
  }

  // The "continue reading" nudge sits BELOW the CTA per designer feedback —
  // having it twice (before and after the button) felt redundant.
  const belowCta = isAH
    ? "Uma leitura para quem cruza disciplinas. Continua no site."
    : "Continua a ler no site para o texto completo.";

  return {
    theme: isAH ? "ah" : "ng",
    headerImage: isAH ? HEADERS.ahGenerico : HEADERS.ngGeral,
    footerImage: FOOTER,
    eyebrow,
    heading: post.titulo,
    subheading,
    heroImage: post.imagemUrl || undefined,
    heroAlt: post.titulo,
    paragraphs,
    cta: { label: "Ler artigo completo", url: postUrl },
    belowCta,
    brandLine: isAH ? "Algoritmo Humano · NeoGeneralista" : "NeoGeneralista",
    footerReason: isAH
      ? "Recebeste este email porque deste consentimento para te avisarmos sobre conteúdos do Algoritmo Humano."
      : "Recebeste este email porque estás subscrito à newsletter da NeoGeneralista.",
  };
}

export function buildResetTemplate({ name, link, expiresAt, mode }) {
  const expiresFmt = new Date(expiresAt).toLocaleString("pt-PT", { hour: "2-digit", minute: "2-digit" });
  const isActivate = mode === "activate";
  const heading = isActivate ? "Ativar a tua conta" : "Redefinir palavra-passe";
  const intro = isActivate
    ? "A tua conta na NeoGeneralista já existe — foi pré-criada quando te inscreveste em eventos anteriores. Para começares a usar o site, escolhe agora a tua palavra-passe."
    : "Recebemos um pedido para redefinir a tua palavra-passe. Clica no botão abaixo para escolheres uma nova.";
  const buttonLabel = isActivate ? "Definir palavra-passe" : "Redefinir palavra-passe";
  const ignoreNote = isActivate
    ? "Se não foste tu a pedir, podes ignorar este email — a tua conta continua sem palavra-passe definida."
    : "Se não foste tu a pedir, podes ignorar este email — a tua palavra-passe atual continua válida.";

  return {
    theme: "ng",
    // ng-password.png has "REDEFINIR PALAVRA-PASSE" baked in — perfect match for
    // reset. For activation we use the generic NG banner and surface the
    // heading textually below it.
    headerImage: isActivate ? HEADERS.ngGeral : HEADERS.ngPassword,
    footerImage: FOOTER,
    eyebrow: "NeoGeneralista",
    heading,
    subheading: isActivate ? "Falta um passo para entrares." : null,
    greeting: name ? `Olá, <strong>${escapeText(name)}</strong>.` : "Olá.",
    paragraphs: [
      intro,
      `O link expira às <strong>${escapeText(expiresFmt)}</strong> (válido durante 1 hora).`,
    ],
    cta: { label: buttonLabel, url: link },
    note: ignoreNote,
    footerReason: isActivate
      ? "Recebeste este email porque foi pedida a ativação desta conta."
      : "Recebeste este email porque foi pedida uma alteração da palavra-passe associada a esta conta.",
    transactional: true,
  };
}

export function buildEventNoticeTemplate({ evento, eventoTitulo, messageHtml, messagePlain, cleanedSubject }) {
  const sharedDetails = [
    { label: "Data", value: evento.data },
    { label: "Horário", value: evento.horario },
    { label: "Local", value: locationValue(evento) },
  ];
  const sharedBase = {
    theme: "ng",
    // Ad-hoc notifications use the generic AH banner — the heading "Aviso da
    // equipa" + custom admin subject render textually below it.
    headerImage: HEADERS.ahGenerico,
    footerImage: FOOTER,
    eyebrow: eventoTitulo,
    heading: "Aviso da equipa",
    subheading: cleanedSubject,
    details: sharedDetails,
    note: "Em caso de dúvida, responde a este email para falar diretamente com a equipa.",
    footerReason: `Recebes este aviso porque tens reserva no ${eventoTitulo}.`,
  };
  return {
    html: { ...sharedBase, paragraphs: [messageHtml] },
    text: { ...sharedBase, paragraphs: [messagePlain] },
  };
}
