import { useState } from "react";
import { useRouter } from "next/router";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";
import PasswordInput from "../../components/PasswordInput";
import { safeCallback } from "../../lib/callback";

export default function Entrar() {
  const router = useRouter();
  const callbackUrl = safeCallback(router.query.callbackUrl);
  const recoverHref = `/auth/recuperar?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  const registerHref = `/auth/registar?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // { msg, link?: { href, label } }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      // NextAuth surfaces our authorize() Error("CODE") strings here.
      if (res.error === "ACCOUNT_NEEDS_REGISTRATION") {
        setError({
          msg: "Esta conta foi importada mas ainda não tem palavra-passe. Pede um link de ativação por email:",
          link: { href: recoverHref, label: "Receber link" },
        });
      } else if (res.error === "USE_GOOGLE") {
        setError({ msg: "Esta conta foi criada com Google. Usa o botão acima." });
      } else {
        setError({
          msg: "E-mail ou palavra-passe incorretos.",
          link: { href: recoverHref, label: "Esqueci-me da palavra-passe" },
        });
      }
    } else {
      window.location.href = callbackUrl;
    }
  };

  const handleGoogle = () => {
    // Google needs the completar step on first login; afterwards goes to callback.
    signIn("google", { callbackUrl: `/auth/completar?callbackUrl=${encodeURIComponent(callbackUrl)}` });
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
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="ahv4-auth-error">
              {error.msg}
              {error.link && (
                <>
                  {" "}
                  <Link href={error.link.href} className="ahv4-auth-link">{error.link.label}.</Link>
                </>
              )}
            </p>
          )}
          <button type="submit" className="ahv4-auth-submit" disabled={loading}>
            {loading ? "A entrar…" : "Entrar"}
          </button>
        </form>

        <p className="ahv4-auth-switch">
          <Link href={recoverHref} className="ahv4-auth-link">Esqueci-me da palavra-passe</Link>
        </p>
        <p className="ahv4-auth-switch">
          Ainda não tens conta?{" "}
          <Link href={registerHref} className="ahv4-auth-link">Cria aqui.</Link>
        </p>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (session) {
    const dest = (typeof context.query.callbackUrl === "string" && context.query.callbackUrl.startsWith("/") && !context.query.callbackUrl.startsWith("//"))
      ? context.query.callbackUrl
      : "/algoritmo-humano";
    return { redirect: { destination: dest, permanent: false } };
  }
  return { props: {} };
}
