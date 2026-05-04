import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import ConstellationCanvasAH from "../../../components/ConstellationCanvasAH"
import PasswordInput from "../../../components/PasswordInput"
import { peekPasswordResetToken } from "../../../lib/auth-tokens"

export async function getServerSideProps(ctx) {
  const { token } = ctx.params
  const mode = ctx.query.mode === "activate" ? "activate" : "reset"
  const status = await peekPasswordResetToken(token)
  return {
    props: {
      token,
      mode,
      tokenValid: status.valid,
      tokenReason: status.valid ? null : status.reason,
      email: status.email || null,
    },
  }
}

export default function Redefinir({ token, mode, tokenValid, tokenReason, email }) {
  const isActivate = mode === "activate"
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("As palavras-passe não coincidem.")
    if (password.length < 8) return setError("A palavra-passe deve ter pelo menos 8 caracteres.")

    setLoading(true)
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setLoading(false)
      return setError(data.error || "Erro ao redefinir.")
    }

    // Auto-login with the new credentials
    if (email) {
      const signInRes = await signIn("credentials", { email, password, redirect: false })
      setLoading(false)
      if (!signInRes?.error) {
        window.location.href = "/algoritmo-humano"
        return
      }
    }
    setLoading(false)
    setDone(true)
  }

  if (!tokenValid) {
    return (
      <div className="ahv4-auth-page">
        <ConstellationCanvasAH />
        <div className="ahv4-auth-card">
          <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
          <h1 className="ahv4-auth-title">Link inválido</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
            {tokenReason === "expired"
              ? "Este link expirou. Pede um novo abaixo."
              : tokenReason === "used"
              ? "Este link já foi utilizado. Se ainda precisas de redefinir, pede um novo."
              : "Este link não existe ou é inválido."}
          </p>
          <p className="ahv4-auth-switch">
            <Link href="/auth/recuperar" className="ahv4-auth-link">Pedir novo link</Link>
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="ahv4-auth-page">
        <ConstellationCanvasAH />
        <div className="ahv4-auth-card">
          <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
          <h1 className="ahv4-auth-title">{isActivate ? "Conta ativada" : "Palavra-passe redefinida"}</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
            Já podes entrar com a {isActivate ? "tua nova" : "nova"} palavra-passe.
          </p>
          <p className="ahv4-auth-switch">
            <Link href="/auth/entrar" className="ahv4-auth-link">Ir para o login</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card">
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
        <h1 className="ahv4-auth-title">{isActivate ? "Definir palavra-passe" : "Nova palavra-passe"}</h1>

        <form className="ahv4-auth-form" onSubmit={handleSubmit}>
          {isActivate && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              A tua conta já existe. Escolhe uma palavra-passe para começares a usá-la.
            </p>
          )}
          {email && (
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>
              Conta: <strong style={{ color: "rgba(255,255,255,0.9)" }}>{email}</strong>
            </p>
          )}
          <label className="ahv4-auth-label">
            {isActivate ? "Palavra-passe" : "Nova palavra-passe"}
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </label>
          <label className="ahv4-auth-label">
            {isActivate ? "Confirmar palavra-passe" : "Confirmar nova palavra-passe"}
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repete a palavra-passe"
              autoComplete="new-password"
              ariaLabel="Confirmação da palavra-passe"
            />
          </label>
          {error && <p className="ahv4-auth-error">{error}</p>}
          <button type="submit" className="ahv4-auth-submit" disabled={loading}>
            {loading ? "A guardar…" : (isActivate ? "Ativar conta" : "Definir palavra-passe")}
          </button>
        </form>
      </div>
    </div>
  )
}
