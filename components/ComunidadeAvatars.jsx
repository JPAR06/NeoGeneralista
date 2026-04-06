import { useState, useEffect } from "react";

export default function ComunidadeAvatars() {
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    fetch("/api/comunidade")
      .then((r) => r.json())
      .then((data) => setMembros(data.membros ?? []))
      .catch(console.error);
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
