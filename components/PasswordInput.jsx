import { useState } from "react";

// Password input with show/hide toggle. Drop-in replacement for the
// auth pages' password fields — keeps the existing class names so the
// styling stays consistent.

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  required = true,
  ariaLabel = "Palavra-passe",
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="ahv4-auth-pw-wrap">
      <input
        type={shown ? "text" : "password"}
        className="ahv4-auth-input ahv4-auth-pw-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="ahv4-auth-pw-toggle"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? `Esconder ${ariaLabel.toLowerCase()}` : `Mostrar ${ariaLabel.toLowerCase()}`}
        title={shown ? "Esconder" : "Mostrar"}
      >
        {shown ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
