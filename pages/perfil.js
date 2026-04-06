import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import ConstellationCanvasAH from "../components/ConstellationCanvasAH";
import { requireAuth } from "../lib/auth";

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

export default function Perfil({ session }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          situacaoProfissional: data.situacaoProfissional || "",
          faixaEtaria: data.faixaEtaria || "",
          habilitacoes: data.habilitacoes || "",
          setorProfissional: data.setorProfissional || "",
          consentimentoEventosFuturos: data.consentimentoEventosFuturos ?? true,
          consentimentoDadosInvestigacao: data.consentimentoDadosInvestigacao ?? true,
        });
      });
  }, []);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Erro ao guardar. Tenta novamente.");
    }
  };

  const displayName = form.name || session?.user?.name || "";
  const initials = displayName
    ? displayName.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : session?.user?.email?.[0].toUpperCase() ?? "?";

  const isGoogle = !profile?.passwordHash;

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card ahv4-perfil-card">
        <div className="ahv4-perfil-header">
          <div className="ahv4-perfil-avatar-wrap">
            <div className="ahv4-perfil-avatar">{initials}</div>
          </div>
          <div className="ahv4-perfil-header-info">
            <p className="ahv4-perfil-name">{displayName || session?.user?.email?.split("@")[0] || "—"}</p>
            <p className="ahv4-perfil-email">{session?.user?.email}</p>
            <span className="ahv4-perfil-method">{isGoogle ? "Google" : "E-mail"}</span>
          </div>
        </div>

        {profile ? (
          <form className="ahv4-auth-form" onSubmit={handleSave}>
            <label className="ahv4-auth-label">
              Nome
              <input
                type="text"
                className="ahv4-auth-input"
                value={form.name}
                onChange={set("name")}
                placeholder="O teu nome"
              />
            </label>

            <label className="ahv4-auth-label">
              Situação profissional
              <select className="ahv4-auth-input ahv4-auth-select" value={form.situacaoProfissional} onChange={set("situacaoProfissional")}>
                <option value="">— Seleciona —</option>
                {SITUACAO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            <label className="ahv4-auth-label">
              Faixa etária
              <select className="ahv4-auth-input ahv4-auth-select" value={form.faixaEtaria} onChange={set("faixaEtaria")}>
                <option value="">— Seleciona —</option>
                {FAIXA_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            <label className="ahv4-auth-label">
              Habilitações literárias
              <select className="ahv4-auth-input ahv4-auth-select" value={form.habilitacoes} onChange={set("habilitacoes")}>
                <option value="">— Seleciona —</option>
                {HABILITACOES_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>

            <label className="ahv4-auth-label">
              Setor profissional
              <select className="ahv4-auth-input ahv4-auth-select" value={form.setorProfissional} onChange={set("setorProfissional")}>
                <option value="">— Seleciona —</option>
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
                />
                <span>Autorizo receber informação sobre eventos futuros.</span>
              </label>
              <label className="ahv4-auth-check-label">
                <input
                  type="checkbox"
                  className="ahv4-auth-check"
                  checked={form.consentimentoDadosInvestigacao}
                  onChange={set("consentimentoDadosInvestigacao")}
                />
                <span>Consinto a utilização dos meus dados em investigação.</span>
              </label>
            </div>

            {error && <p className="ahv4-auth-error">{error}</p>}
            {saved && <p className="ahv4-auth-success">✓ Guardado com sucesso!</p>}

            <button type="submit" className="ahv4-auth-submit" disabled={saving}>
              {saving ? "A guardar…" : "Guardar"}
            </button>
          </form>
        ) : (
          <p className="ahv4-auth-loading">A carregar…</p>
        )}

        <div className="ahv4-perfil-actions">
          <Link href="/algoritmo-humano" className="ahv4-auth-link">← Algoritmo Humano</Link>
          <button
            className="ahv4-perfil-signout"
            onClick={() => signOut({ callbackUrl: "/algoritmo-humano" })}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = requireAuth();
