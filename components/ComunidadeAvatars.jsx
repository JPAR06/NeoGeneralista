import { useState, useEffect } from "react";

export default function ComunidadeAvatars() {
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    console.log("[comunidade] fetching...");
    fetch("/api/comunidade")
      .then((r) => { console.log("[comunidade] status:", r.status); return r.json(); })
      .then((data) => { console.log("[comunidade] data:", data); setMembros(data.membros ?? []); })
      .catch((err) => console.error("[comunidade] fetch error:", err));
  }, []);

  if (membros.length === 0) {
    return <p className="ahv4-com-empty">Sê dos primeiros a juntar-te.</p>;
  }

  const visible = membros.slice(0, 20);
  const extra = membros.length > 20 ? membros.length - 20 : null;

  return (
    <div className="ahv4-av-mosaic">
      {visible.map((m, i) => (
        <div key={i} className="ahv4-av" style={{ background: m.cor }}>
          {m.iniciais}
        </div>
      ))}
      {extra !== null && (
        <div className="ahv4-av ahv4-av--more">+{extra}</div>
      )}
    </div>
  );
}
