import { useState } from "react"
import Link from "next/link"
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH"

export default function Recuperar() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Always show the same confirmation regardless of network errors —
      // we don't want to leak whether the email exists.
    }
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card">
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
        <h1 className="ahv4-auth-title">Recuperar palavra-passe</h1>

        {sent ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginBottom: 8 }}>
              Se existir uma conta com esse e-mail, vais receber instruções nos próximos minutos.
            </p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 0 }}>
              Verifica também a pasta de spam. O link é válido por 1 hora.
            </p>
            <p className="ahv4-auth-switch">
              <Link href="/auth/entrar" className="ahv4-auth-link">Voltar ao login</Link>
            </p>
          </>
        ) : (
          <form className="ahv4-auth-form" onSubmit={handleSubmit}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.5, margin: "0 0 8px" }}>
              Indica o e-mail da tua conta. Vamos enviar-te um link para definires/redefinires a palavra-passe.
              Também funciona para contas importadas que ainda não têm palavra-passe.
            </p>
            <label className="ahv4-auth-label">
              E-mail
              <input
                type="email"
                className="ahv4-auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="o.teu@email.pt"
                required
                autoComplete="email"
                autoFocus
              />
            </label>
            <button type="submit" className="ahv4-auth-submit" disabled={loading}>
              {loading ? "A enviar…" : "Enviar link de recuperação"}
            </button>
            <p className="ahv4-auth-switch">
              <Link href="/auth/entrar" className="ahv4-auth-link">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
