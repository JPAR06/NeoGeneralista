// Content builders for each transactional email. Each function returns the
// options object expected by lib/emailTemplate.js → renderEmail / renderEmailText.
// Keeping them in a plain module (no Next.js / mongo imports) lets API handlers
// and the preview endpoint share them without pulling in handler-only deps.

import { buildGoogleCalendarUrl } from "./ics.js";

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

export function buildReservationTemplate({ name, evento, estado, icsUrl, selfSignup }) {
  const isConfirmed = estado === "confirmado";
  const edicao = evento.edicao ?? "Algoritmo Humano";
  const googleUrl = isConfirmed && evento.dataISO ? buildGoogleCalendarUrl({ evento }) : null;

  const heading = isConfirmed ? "Inscrição confirmada" : "Estás em lista de espera";
  const subheading = isConfirmed
    ? "Reservámos o teu lugar."
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

  const actions = [];
  if (googleUrl) actions.push({ label: "Adicionar ao Google Calendar", url: googleUrl, variant: "primary" });
  if (icsUrl) actions.push({ label: "Apple / Outlook (.ics)", url: icsUrl, variant: "secondary" });

  return {
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
  const heading = is5h ? "É hoje. Até já." : "É amanhã.";
  const subheading = is5h
    ? "Começamos daqui a poucas horas."
    : "Esperamos por ti.";
  const introHtml = is5h
    ? `O <strong style="color:#1e293b">${escapeText(edicao)}</strong> arranca <strong style="color:#ff366b">hoje</strong>. Aqui ficam os detalhes finais para teres à mão.`
    : `Só a relembrar que o próximo encontro do <strong style="color:#1e293b">${escapeText(edicao)}</strong> é <strong style="color:#ff366b">amanhã</strong>. Aqui ficam os detalhes para teres à mão.`;

  return {
    eyebrow: edicao,
    heading,
    subheading,
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

  // Email body prefers the editorial-tuned introducaoEmail when available, and
  // falls back to the site resumo. The intro is rendered as a pull-quote
  // (italic, larger, accent border) to feel like a teaser — not a duplicate
  // of the site card. A second smaller "continue reading" line nudges the
  // click without becoming pushy.
  const introText = post.introducaoEmail || post.resumo;
  const accent = isAH ? "#F05A78" : "#ff366b";
  const textColor = isAH ? "#0c0c10" : "#1e293b";
  const paragraphs = [];
  if (introText) {
    paragraphs.push(
      `<span style="display:block;padding:6px 0 6px 18px;border-left:3px solid ${accent};font-size:18px;line-height:1.55;color:${textColor};font-style:italic;font-weight:500">${escapeText(introText)}</span>`
    );
  }
  paragraphs.push(
    isAH
      ? "<span style=\"font-size:14px;color:#52525b\">Uma leitura para quem cruza disciplinas. Continua no site.</span>"
      : "<span style=\"font-size:14px;color:#64748b\">Continua a ler no site para o texto completo.</span>"
  );

  return {
    theme: isAH ? "ah" : "ng",
    eyebrow,
    heading: post.titulo,
    subheading,
    heroImage: post.imagemUrl || undefined,
    heroAlt: post.titulo,
    paragraphs,
    cta: { label: "Ler artigo completo", url: postUrl },
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
    eyebrow: "NeoGeneralista",
    heading,
    subheading: isActivate ? "Falta um passo para entrares." : "Vamos repor o teu acesso.",
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
  const html = {
    eyebrow: eventoTitulo,
    heading: "Aviso da equipa",
    subheading: cleanedSubject,
    paragraphs: [messageHtml],
    details: sharedDetails,
    note: "Em caso de dúvida, responde a este email para falar diretamente com a equipa.",
    footerReason: `Recebes este aviso porque tens reserva no ${eventoTitulo}.`,
  };
  const text = { ...html, paragraphs: [messagePlain] };
  return { html, text };
}
