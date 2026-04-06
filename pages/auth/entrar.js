import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou palavra-passe incorretos.");
    } else {
      window.location.href = "/algoritmo-humano";
    }
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/auth/completar" });
  };

  return (
    <div className="ahv4-auth-page">
      <ConstellationCanvasAH />
      <div className="ahv4-auth-card">
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ahv4-auth-logo" />
        <h1 className="ahv4-auth-title">Entrar</h1>

        <button className="ahv4-auth-google-btn" onClick={handleGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.2 0 6.1 1.2 8.4 3.1l6-6C34.6 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
            <path d="M6.3 14.7l7 5.1C15.1 16.4 19.2 13.5 24 13.5c3.2 0 6.1 1.2 8.4 3.1l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
            <path d="M24 43c5.5 0 10.5-2 14.3-5.4l-6.6-5.6C29.6 33.9 26.9 35 24 35c-6.1 0-11.2-4.1-13-9.7l-7 5.4C7.4 38.7 15.1 43 24 43z" fill="#4CAF50"/>
            <path d="M44.5 20H24v8.5h11.8c-1 3-3.4 5.5-6.3 7l6.6 5.6C40.9 37.4 44.5 30.8 44.5 23c0-1-.1-2-.5-3z" fill="#1976D2"/>
          </svg>
          Continuar com Google
        </button>

        <div className="ahv4-auth-divider"><span>ou</span></div>

        <form className="ahv4-auth-form" onSubmit={handleSubmit}>
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
            />
          </label>
          <label className="ahv4-auth-label">
            Palavra-passe
            <input
              type="password"
              className="ahv4-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="ahv4-auth-error">{error}</p>}
          <button type="submit" className="ahv4-auth-submit" disabled={loading}>
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <p className="ahv4-auth-switch">
          Ainda não tens conta?{" "}
          <Link href="/auth/registar" className="ahv4-auth-link">Cria aqui.</Link>
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    return { redirect: { destination: "/algoritmo-humano", permanent: false } };
  }
  return { props: {} };
}
