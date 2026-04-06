import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") return null;

  if (!session) {
    return (
      <Link href="/auth/entrar" className="ahv4-auth-btn-entrar">
        Entrar
      </Link>
    );
  }

  const initials = session.user?.name
    ? session.user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : session.user?.email?.[0].toUpperCase() ?? "?";

  return (
    <div className="ahv4-auth-avatar-wrap" ref={ref}>
      <button
        className="ahv4-auth-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do utilizador"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && (
        <div className="ahv4-auth-dropdown">
          <p className="ahv4-auth-dropdown-name">{session.user?.name || session.user?.email}</p>
          <Link href="/perfil" className="ahv4-auth-dropdown-item" onClick={() => setOpen(false)}>
            Perfil
          </Link>
          <button
            className="ahv4-auth-dropdown-item ahv4-auth-dropdown-item--signout"
            onClick={() => signOut({ callbackUrl: "/algoritmo-humano" })}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
