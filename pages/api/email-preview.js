import { requireAdminApi } from "../../lib/admin";
import { renderEmail, renderEmailText } from "../../lib/emailTemplate";
import {
  buildReservationTemplate,
  buildReminderTemplate,
  buildBlogTemplate,
  buildResetTemplate,
  buildEventNoticeTemplate,
} from "../../lib/emailContent";

// Admin-only preview for every transactional email template.
// GET /api/email-preview                 → catalog (HTML index)
// GET /api/email-preview?type=X          → rendered HTML
// GET /api/email-preview?type=X&fmt=txt  → rendered plain-text

const MOCK_EVENTO = {
  _id: "evento-demo",
  edicao: "Algoritmo Humano #3",
  tema: "Comunidade e propósito",
  data: "3.ª feira — 2 de junho de 2026",
  dataISO: "2026-06-02T17:30:00.000Z",
  horario: "18h30 – 20h30",
  local: "UPTEC Asprela",
  localUrl: "https://maps.app.goo.gl/example",
  convidado: "Marta Pinto",
  descricaoCurta: "Uma conversa sobre comunidades de aprendizagem e o papel do propósito.",
};

const MOCK_POST = {
  titulo: "Como a comunidade muda a aprendizagem",
  resumo: "Uma reflexão sobre o que separa formação de transformação — e onde entra a comunidade nesse processo.",
  autor: "Ana Sousa",
  categoria: "Reflexão",
  slug: { current: "comunidade-aprendizagem" },
  imagemUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
};

const TYPES = {
  "confirmacao-self": () => buildReservationTemplate({
    name: "João Silva",
    evento: MOCK_EVENTO,
    estado: "confirmado",
    icsUrl: "https://neogeneralista.pt/api/calendar/reserva-demo.ics",
    selfSignup: true,
  }),
  "confirmacao-admin": () => buildReservationTemplate({
    name: "João Silva",
    evento: MOCK_EVENTO,
    estado: "confirmado",
    icsUrl: "https://neogeneralista.pt/api/calendar/reserva-demo.ics",
    selfSignup: false,
  }),
  "lista-espera": () => buildReservationTemplate({
    name: "João Silva",
    evento: MOCK_EVENTO,
    estado: "lista_espera",
    icsUrl: null,
    selfSignup: true,
  }),
  "reminder-24h": () => buildReminderTemplate({
    reserva: { nome: "João Silva" },
    evento: MOCK_EVENTO,
    window: "24h",
  }),
  "reminder-5h": () => buildReminderTemplate({
    reserva: { nome: "João Silva" },
    evento: MOCK_EVENTO,
    window: "5h",
  }),
  "notify-event": () => buildEventNoticeTemplate({
    evento: MOCK_EVENTO,
    eventoTitulo: MOCK_EVENTO.edicao,
    messageHtml: "<p>Olá! Pequena nota antes do encontro de amanhã.</p><p>O <strong>parque de estacionamento</strong> da UPTEC vai estar mais cheio do que o habitual — aconselhamos chegares com 10 min de margem.</p>",
    messagePlain: "Olá! Pequena nota antes do encontro de amanhã.\n\nO parque de estacionamento da UPTEC vai estar mais cheio do que o habitual — aconselhamos chegares com 10 min de margem.",
    cleanedSubject: "Atualização sobre o local",
  }).html,
  "reset-password": () => buildResetTemplate({
    name: "João Silva",
    link: "https://neogeneralista.pt/auth/redefinir/exemplo",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    mode: "reset",
  }),
  "activate-account": () => buildResetTemplate({
    name: "João Silva",
    link: "https://neogeneralista.pt/auth/redefinir/exemplo",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    mode: "activate",
  }),
  "blog-ng": () => buildBlogTemplate({
    post: MOCK_POST,
    postUrl: `https://neogeneralista.pt/blog/${MOCK_POST.slug.current}`,
    secao: "neogeneralista",
  }),
  "blog-ah": () => buildBlogTemplate({
    post: MOCK_POST,
    postUrl: `https://neogeneralista.pt/algoritmo-humano/blog/${MOCK_POST.slug.current}`,
    secao: "algoritmohumano",
  }),
};

const TYPE_META = {
  "confirmacao-self": { title: "Inscrição confirmada (auto-inscrição)", origin: "pages/api/reservar.js" },
  "confirmacao-admin": { title: "Inscrição confirmada (pela equipa)", origin: "pages/api/admin/manual-inscrever.js" },
  "lista-espera": { title: "Lista de espera", origin: "pages/api/reservar.js" },
  "reminder-24h": { title: "Lembrete 24h antes", origin: "pages/api/send-reminders.js" },
  "reminder-5h": { title: "Lembrete poucas horas antes", origin: "pages/api/send-reminders-5h.js" },
  "notify-event": { title: "Aviso da equipa (notify-event)", origin: "pages/api/admin/notify-event.js" },
  "reset-password": { title: "Redefinir palavra-passe", origin: "pages/api/auth/request-reset.js" },
  "activate-account": { title: "Ativar conta", origin: "pages/api/auth/request-reset.js" },
  "blog-ng": { title: "Novo artigo (Newsletter NeoGeneralista)", origin: "pages/api/send-blog-notification.js" },
  "blog-ah": { title: "Novo artigo (Algoritmo Humano)", origin: "pages/api/send-blog-notification.js" },
};

export default async function handler(req, res) {
  const session = await requireAdminApi(req, res);
  if (!session) return;

  const { type, fmt } = req.query;

  if (!type) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(renderIndex(req));
  }

  const builder = TYPES[type];
  if (!builder) return res.status(404).json({ error: "Tipo desconhecido" });

  const opts = builder();
  if (fmt === "txt") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(renderEmailText(opts));
  }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(renderEmail(opts));
}

function renderIndex() {
  const items = Object.keys(TYPES)
    .map((key) => {
      const meta = TYPE_META[key] || { title: key, origin: "" };
      return `
        <article style="background:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 1px 3px rgba(15,23,42,.05);border:1px solid #e5e7eb">
          <h3 style="margin:0 0 4px;font-size:15px;color:#0f172a">${meta.title}</h3>
          <p style="margin:0 0 12px;font-size:12px;color:#64748b">${meta.origin}</p>
          <p style="margin:0;display:flex;gap:8px;flex-wrap:wrap">
            <a href="/api/email-preview?type=${key}" target="_blank" style="display:inline-block;background:#070756;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:6px">Ver HTML</a>
            <a href="/api/email-preview?type=${key}&fmt=txt" target="_blank" style="display:inline-block;background:#fff;color:#070756;text-decoration:none;font-size:13px;font-weight:600;padding:8px 14px;border-radius:6px;border:1px solid #cbd5e1">Plain-text</a>
          </p>
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preview de emails — NeoGeneralista</title>
<style>
  body { margin: 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; background: #f8fafc; color: #0f172a; }
  header { background: linear-gradient(135deg,#070756 0%,#1a1a85 100%); color:#fff; padding: 28px 32px; }
  header h1 { margin: 0; font-size: 22px; }
  header p { margin: 6px 0 0; opacity: .85; font-size: 14px; }
  main { max-width: 1100px; margin: 0 auto; padding: 28px 24px 64px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
</style>
</head><body>
<header>
  <h1>Catálogo de emails transacionais</h1>
  <p>Todos os emails partilham o mesmo template base (lib/emailTemplate.js).</p>
</header>
<main>
  <div class="grid">${items}</div>
</main>
</body></html>`;
}
