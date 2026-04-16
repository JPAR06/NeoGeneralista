import { client, writeClient } from "../../lib/sanity";
import { sendEmail } from "../../lib/email";

const SENDER_API = "https://api.sender.net/v2";
const NEWSLETTER_GROUP = "b8gqwj";

export default async function handler(req, res) {
  const secret = req.query.secret
    || req.headers["authorization"]?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Find first published post that hasn't been notified yet
  const post = await client.fetch(
    `*[_type == "noticia" && publicado == true && notificacaoEnviada != true] | order(dataPublicacao desc)[0] {
      _id, titulo, resumo, autor, categoria, slug,
      "imagemUrl": imagem.asset->url
    }`
  );

  if (!post) {
    return res.status(200).json({ message: "No new posts to notify" });
  }

  // Get all subscribers from Sender.net newsletter group
  let subscribers = [];
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
    subscribers.push(...data.data);
    if (!data.links?.next) break;
    page++;
  }

  if (subscribers.length === 0) {
    return res.status(200).json({ message: "No subscribers" });
  }

  const postUrl = `https://neogeneralista.pt/noticias/${post.slug?.current}`;
  const subject = `Novo artigo: ${post.titulo}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      ${post.imagemUrl ? `<img src="${post.imagemUrl}" alt="${post.titulo}" style="width:100%;border-radius:12px;margin-bottom:16px" />` : ""}
      ${post.categoria ? `<p style="color:#F05A78;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 8px">${post.categoria}</p>` : ""}
      <h2 style="margin:0 0 12px;font-size:22px">${post.titulo}</h2>
      ${post.resumo ? `<p style="color:#555;line-height:1.6;margin:0 0 20px">${post.resumo}</p>` : ""}
      <a href="${postUrl}" style="display:inline-block;background:#F05A78;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Ler artigo</a>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0 16px"/>
      <p style="font-size:12px;color:#999">AlgoritmoHumano by NeoGeneralista</p>
    </div>
  `;

  const text = `${post.titulo}\n\n${post.resumo || ""}\n\nLer: ${postUrl}`;

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await sendEmail({
        to: sub.email,
        toName: [sub.firstname, sub.lastname].filter(Boolean).join(" ") || sub.email,
        subject,
        html,
        text,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  // Mark as notified
  await writeClient.patch(post._id).set({ notificacaoEnviada: true }).commit();

  return res.status(200).json({ post: post.titulo, sent, failed, totalSubscribers: subscribers.length });
}
