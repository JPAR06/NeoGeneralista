import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";
import clientPromise from "../../lib/mongodb";
import { requireAdminApi } from "../../lib/admin";
import { renderEmail, renderEmailText, defaultHeaders, cleanSubject } from "../../lib/emailTemplate";
import { buildBlogTemplate } from "../../lib/emailContent";

// Pages Router config — bump timeout for sequential sends to large lists.
export const config = {
  maxDuration: 60,
};

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

// Manual blog notification endpoint.
// POST { postId } — called by the Sanity Studio "Notificar subscritores" button.
// Audience routed by post.secao:
//   neogeneralista → Sender.net group b8gqwj (newsletter)
//   algoritmohumano → MongoDB users with consentimentoEventosFuturos: true

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await requireAdminApi(req, res);
  if (!session) return;

  const { postId } = req.body || {};
  if (!postId || typeof postId !== "string") {
    return res.status(400).json({ error: "postId obrigatório" });
  }

  const post = await client.fetch(
    `*[_type == "noticia" && _id == $id][0]{
      _id, titulo, resumo, introducaoEmail, autor, categoria, slug, secao, publicado, notificacaoEnviada,
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

  let recipients = [];
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

  // Force a 2:1 banner crop via Sanity's image CDN. Without this the email
  // ships the original asset at full width — portrait covers ended up >900px
  // tall in a 600px-wide email card, pushing the title below the fold on
  // mobile and bloating the file size. The CDN serves an auto-cropped,
  // WebP-where-supported version that's ~50-150KB instead of multi-MB.
  const heroImageUrl = post.imagemUrl
    ? `${post.imagemUrl}?w=1200&h=600&fit=crop&auto=format&q=80`
    : null;

  const subject = cleanSubject(`Novo artigo: ${post.titulo}`);
  const tplOpts = buildBlogTemplate({
    post: { ...post, imagemUrl: heroImageUrl },
    postUrl,
    secao,
  });
  const html = renderEmail(tplOpts);
  const text = renderEmailText(tplOpts);
  const topic = secao === "algoritmohumano" ? "algoritmo-humano" : "newsletter";

  // Send in parallel chunks. Sender.net handles concurrent requests fine; we
  // bound the concurrency so we don't trip rate limits on large lists.
  const CONCURRENCY = 5;
  let sent = 0;
  let failed = 0;
  const failedEmails = [];

  for (let i = 0; i < recipients.length; i += CONCURRENCY) {
    const chunk = recipients.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map((r) =>
        sendEmail({
          to: r.email,
          toName: r.name || r.email,
          subject,
          html,
          text,
          headers: defaultHeaders({ topic, recipientEmail: r.email, autoSubmitted: true }),
        })
      )
    );
    for (let j = 0; j < results.length; j++) {
      if (results[j].status === "fulfilled") {
        sent++;
      } else {
        failed++;
        const email = chunk[j].email;
        failedEmails.push(email);
        console.error(`[blog-notification] send failed to ${email}:`, results[j].reason?.message || results[j].reason);
      }
    }
  }

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

