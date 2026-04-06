import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";

const SITUACAO_OPTIONS = ["Estudante", "Trabalhador/a", "Desempregado/a", "Reformado/a", "Outro"];
const FAIXA_OPTIONS = ["Menos de 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const HABILITACOES_OPTIONS = [
  "Ensino básico",
  "Ensino secundário",
  "Licenciatura",
  "Mestrado",
  "Doutoramento",
  "Outro",
];
const SETOR_OPTIONS = [
  "Tecnologia",
  "Educação",
  "Saúde",
  "Finanças",
  "Comunicação & Media",
  "Arte & Cultura",
  "Direito",
  "Administração pública",
  "Investigação",
  "Outro",
];

export default function CompletarPerfil() {
  const router = useRouter();
  const [form, setForm] = useState({
    situacaoProfissional: "",
    faixaEtaria: "",
    habilitacoes: "",
    setorProfissional: "",
    consentimentoEventosFuturos: false,
    consentimentoDadosInvestigacao: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.consentimentoEventosFuturos || !form.consentimentoDadosInvestigacao) {
      return setError("Os consentimentos são obrigatórios.");
    }

    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);

    if (res.ok) {
      router.push("/algoritmo-humano");
    } else {
      setError("Erro ao guardar. Tenta novamente.");
    }
  };

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card ahv4-perfil-card">
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
        <h1 className="ahv4-auth-title">Bem-vindo/a!</h1>
        <p className="ahv4-auth-switch" style={{ marginTop: 0, marginBottom: 24 }}>
          Antes de continuar, precisamos de alguns dados.
        </p>

        <form className="ahv4-auth-form" onSubmit={handleSubmit}>
          <label className="ahv4-auth-label">
            Situação profissional
            <select className="ahv4-auth-input ahv4-auth-select" value={form.situacaoProfissional} onChange={set("situacaoProfissional")}>
              <option value="">— Seleciona (opcional) —</option>
              {SITUACAO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="ahv4-auth-label">
            Faixa etária
            <select className="ahv4-auth-input ahv4-auth-select" value={form.faixaEtaria} onChange={set("faixaEtaria")}>
              <option value="">— Seleciona (opcional) —</option>
              {FAIXA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="ahv4-auth-label">
            Habilitações literárias
            <select className="ahv4-auth-input ahv4-auth-select" value={form.habilitacoes} onChange={set("habilitacoes")}>
              <option value="">— Seleciona (opcional) —</option>
              {HABILITACOES_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <label className="ahv4-auth-label">
            Setor profissional
            <select className="ahv4-auth-input ahv4-auth-select" value={form.setorProfissional} onChange={set("setorProfissional")}>
              <option value="">— Seleciona (opcional) —</option>
              {SETOR_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>

          <div className="ahv4-auth-consents">
            <label className="ahv4-auth-check-label">
              <input
                type="checkbox"
                className="ahv4-auth-check"
                checked={form.consentimentoEventosFuturos}
                onChange={set("consentimentoEventosFuturos")}
                required
              />
              <span>
                Autorizo receber informação sobre eventos futuros do AlgoritmoHumano.
                <span className="ahv4-auth-required"> *</span>
              </span>
            </label>
            <label className="ahv4-auth-check-label">
              <input
                type="checkbox"
                className="ahv4-auth-check"
                checked={form.consentimentoDadosInvestigacao}
                onChange={set("consentimentoDadosInvestigacao")}
                required
              />
              <span>
                Consinto a utilização dos meus dados em investigação académica de forma anonimizada.
                <span className="ahv4-auth-required"> *</span>
              </span>
            </label>
          </div>

          {error && <p className="ahv4-auth-error">{error}</p>}

          <button type="submit" className="ahv4-auth-submit" disabled={loading}>
            {loading ? "A guardar…" : "Continuar →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: "/auth/entrar", permanent: false } };
  }

  // Check if user already completed consents — if so skip this page
  try {
    const clientPromise = (await import("../../lib/mongodb")).default;
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });
    if (user?.consentimentoEventosFuturos && user?.consentimentoDadosInvestigacao) {
      return { redirect: { destination: "/algoritmo-humano", permanent: false } };
    }
  } catch {
    // If DB check fails, still show the page
  }

  return { props: {} };
}
