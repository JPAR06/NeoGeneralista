import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";
import clientPromise from "../../lib/mongodb";
import { requireAdminApi } from "../../lib/admin";

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

// Manual blog notification endpoint.
// POST { postId } — called by the Sanity Studio "Notificar subscritores" button.
// Audience routed by post.secao:
//   neogeneralista → Sender.net group b8gqwj (newsletter)
//   algoritmohumano → MongoDB users with consentimentoEventosFuturos: true
// Idempotent: if notificacaoEnviada is already true, returns alreadySent: true.

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return; // 404 already sent

  const { postId } = req.body || {};
  if (!postId || typeof postId !== "string") {
    return res.status(400).json({ error: "postId obrigatório" });
  }

  const post = await client.fetch(
    `*[_type == "noticia" && _id == $id][0]{
      _id, titulo, resumo, autor, categoria, slug, secao, publicado, notificacaoEnviada,
      "imagemUrl": imagem.asset->url
    }`,
    { id: postId }
  );

  if (!post) return res.status(404).json({ error: "Post não encontrado" });
  if (!post.publicado) return res.status(400).json({ error: "Post não está publicado" });
  if (post.notificacaoEnviada) {
    return res.status(200).json({ alreadySent: true, post: post.titulo });
  }

  const secao = post.secao || "neogeneralista";
  const slug = post.slug?.current || "";
  const postUrl = secao === "algoritmohumano"
    ? `https://neogeneralista.pt/algoritmo-humano/blog/${slug}`
    : `https://neogeneralista.pt/blog/${slug}`;

  // Build recipient list per section
  let recipients = []; // [{ email, name }]
  try {
    if (secao === "algoritmohumano") {
      const mongo = await clientPromise;
      const users = await mongo.db().collection("users")
        .find(
          { consentimentoEventosFuturos: true, email: { $exists: true, $ne: "" } },
          { projection: { email: 1, name: 1, _id: 0 } }
        )
        .toArray();
      recipients = users.map((u) => ({ email: u.email, name: u.name || "" }));
    } else {
      // Sender.net newsletter group, paginated
      let page = 1;
      while (true) {
        const r = await fetch(`${SENDER_API}/groups/${NEWSLETTER_GROUP}/subscribers?page=${page}`, {
          headers: {
            Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
            Accept: "application/json",
          },
        });
        const data = await r.json();
        if (!data.data || data.data.length === 0) break;
        for (const s of data.data) {
          recipients.push({
            email: s.email,
            name: [s.firstname, s.lastname].filter(Boolean).join(" "),
          });
        }
        if (!data.links?.next) break;
        page++;
      }
    }
  } catch (err) {
    console.error("[blog-notification] failed to load recipients:", err);
    return res.status(500).json({ error: "Erro a carregar destinatários" });
  }

  if (recipients.length === 0) {
    return res.status(200).json({
      ok: true, post: post.titulo, secao, sent: 0, failed: 0, total: 0,
      message: "Sem destinatários",
    });
  }

  const subject = `Novo artigo: ${post.titulo}`;
  const html = buildHtml({ post, postUrl, secao });
  const text = `${post.titulo}\n\n${post.resumo || ""}\n\nLer: ${postUrl}`;

  let sent = 0, failed = 0;
  const failedEmails = [];

  for (const r of recipients) {
    try {
      await sendEmail({ to: r.email, toName: r.name || r.email, subject, html, text });
      sent++;
    } catch (err) {
      console.error(`[blog-notification] send failed to ${r.email}:`, err?.message || err);
      failed++;
      failedEmails.push(r.email);
    }
    // Courtesy throttle to avoid Sender.net rate limits
    await new Promise((res) => setTimeout(res, 100));
  }

  // Only mark sent if at least one delivered — otherwise allow retry
  if (sent > 0) {
    try {
      await writeClient.patch(post._id).set({ notificacaoEnviada: true }).commit();
    } catch (err) {
      console.error("[blog-notification] failed to mark notified:", err);
    }
  }

  return res.status(200).json({
    ok: true,
    post: post.titulo,
    secao,
    sent,
    failed,
    total: recipients.length,
    ...(failedEmails.length ? { failedEmails: failedEmails.slice(0, 10) } : {}),
  });
}

function buildHtml({ post, postUrl, secao }) {
  const isAH = secao === "algoritmohumano";
  const accent = "#F05A78";
  const footerLabel = isAH ? "AlgoritmoHumano" : "NeoGeneralista";
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${post.imagemUrl ? `<img src="${post.imagemUrl}" alt="${escapeHtml(post.titulo)}" style="width:100%;border-radius:12px;margin-bottom:16px" />` : ""}
      ${post.categoria ? `<p style="color:${accent};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px">${escapeHtml(post.categoria)}</p>` : ""}
      <h2 style="margin:0 0 12px;font-size:22px">${escapeHtml(post.titulo)}</h2>
      ${post.resumo ? `<p style="color:#555;line-height:1.6;margin:0 0 20px">${escapeHtml(post.resumo)}</p>` : ""}
      <a href="${postUrl}" style="display:inline-block;background:${accent};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Ler artigo</a>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 16px"/>
      <p style="font-size:12px;color:#999">${footerLabel} · neogeneralista.pt</p>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
