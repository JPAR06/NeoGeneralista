import clientPromise from "../../lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { isAdminEmail } from "../../lib/admin";
import { NEWSLETTER_GROUP } from "../../lib/sender";

// Protected export — access via:
// /api/exportar-utilizadores                 (admin session)
// /api/exportar-utilizadores?fonte=newsletter (Sender newsletter subscribers)
// /api/exportar-utilizadores?secret=YOUR_CRON_SECRET&format=json  (JSON instead of CSV)

const SENDER_API = "https://api.sender.net/v2";

export default async function handler(req, res) {
  const bySecret = req.query.secret && req.query.secret === process.env.CRON_SECRET;
  let bySession = false;
  if (!bySecret) {
    const session = await getServerSession(req, res, authOptions);
    bySession = !!session && isAdminEmail(session.user?.email);
  }
  if (!bySecret && !bySession) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const fonte = ["site", "newsletter"].includes(req.query.fonte) ? req.query.fonte : "geral";

  const mongo = await clientPromise;
  const users = await mongo.db()
    .collection("users")
    .find({}, {
      projection: {
        name: 1,
        email: 1,
        createdAt: 1,
        consentimentoEventosFuturos: 1,
        consentimentoDadosInvestigacao: 1,
        situacaoProfissional: 1,
        faixaEtaria: 1,
        habilitacoes: 1,
        setorProfissional: 1,
        _id: 0,
      },
    })
    .sort({ _id: 1 })
    .toArray();
  const siteUsers = users.map((u) => ({
    nome: u.name ?? "",
    email: u.email ?? "",
    dataRegisto: u.createdAt,
    origem: "site",
    newsletter: false,
    consentimentoEventosFuturos: !!u.consentimentoEventosFuturos,
    consentimentoDadosInvestigacao: !!u.consentimentoDadosInvestigacao,
    situacaoProfissional: u.situacaoProfissional ?? "",
    faixaEtaria: u.faixaEtaria ?? "",
    habilitacoes: u.habilitacoes ?? "",
    setorProfissional: u.setorProfissional ?? "",
  }));
  const newsletterUsers = fonte !== "site" ? await fetchNewsletterSubscribers() : [];

  const byEmail = new Map();
  if (fonte !== "newsletter") {
    for (const u of siteUsers) {
      if (u.email) byEmail.set(u.email.toLowerCase(), u);
    }
  }
  if (fonte !== "site") {
    for (const sub of newsletterUsers) {
      const key = sub.email.toLowerCase();
      const existing = byEmail.get(key);
      byEmail.set(key, existing ? { ...existing, newsletter: true, origem: "site + newsletter" } : sub);
    }
  }

  const pessoas = [...byEmail.values()].sort((a, b) => a.email.localeCompare(b.email));

  if (req.query.format === "json") {
    return res.status(200).json({ total: pessoas.length, pessoas });
  }

  const rows = [
    ["Nome", "Email", "Origem", "Newsletter", "Data de registo", "Consentimento eventos futuros", "Consentimento investigação", "Situação Profissional", "Faixa Etária", "Habilitações", "Setor Profissional"],
    ...pessoas.map((u) => [
      u.nome ?? "",
      u.email ?? "",
      u.origem ?? "",
      u.newsletter ? "Sim" : "Não",
      u.dataRegisto ? new Date(u.dataRegisto).toLocaleString("pt-PT") : "",
      u.consentimentoEventosFuturos ? "Sim" : "Não",
      u.consentimentoDadosInvestigacao ? "Sim" : "Não",
      u.situacaoProfissional ?? "",
      u.faixaEtaria ?? "",
      u.habilitacoes ?? "",
      u.setorProfissional ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="utilizadores-${fonte}.csv"`);
  res.status(200).send("\uFEFF" + csv);
}

async function fetchNewsletterSubscribers() {
  if (!process.env.SENDER_API_TOKEN) return [];

  const subscribers = [];
  let page = 1;
  while (true) {
    const response = await fetch(`${SENDER_API}/groups/${NEWSLETTER_GROUP}/subscribers?page=${page}`, {
      headers: {
        Authorization: `Bearer ${process.env.SENDER_API_TOKEN}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Sender API ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.data || data.data.length === 0) break;
    subscribers.push(...data.data);
    if (!data.links?.next) break;
    page++;
  }

  return subscribers
    .filter((sub) => sub.email)
    .map((sub) => ({
      nome: [sub.firstname, sub.lastname].filter(Boolean).join(" ") || sub.email,
      email: sub.email,
      dataRegisto: sub.created_at || sub.created || sub.subscribed_at || "",
      origem: "newsletter",
      newsletter: true,
      consentimentoEventosFuturos: false,
      consentimentoDadosInvestigacao: false,
      situacaoProfissional: "",
      faixaEtaria: "",
      habilitacoes: "",
      setorProfissional: "",
    }));
}
