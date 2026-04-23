import { useEffect } from "react";
import { client } from "../../../../lib/sanity";
import { requireAdmin } from "../../../../lib/admin";

export async function getServerSideProps(ctx) {
  const guard = await requireAdmin(ctx);
  if (!guard.session) return guard;

  const { eventoId } = ctx.params;
  const evento = await client.fetch(
    `*[_type == "eventoProximo" && _id == $id][0]{edicao, tema, data, horario, local}`,
    { id: eventoId }
  );
  if (!evento) return { notFound: true };

  return {
    props: {
      eventoId,
      evento,
      qrUrl: `/api/qr/${eventoId}?size=1400`,
    },
  };
}

export default function QrPrint({ eventoId, evento, qrUrl }) {
  useEffect(() => {
    document.title = `QR · ${evento.edicao || "Evento"}`;
  }, [evento.edicao]);

  return (
    <div style={s.page}>
      <div style={s.controls} className="no-print">
        <button onClick={() => window.print()} style={s.btn}>🖨️ Imprimir</button>
        <a href={qrUrl} download={`qr-${eventoId}.png`} style={s.btnLight}>⬇️ Transferir PNG</a>
      </div>

      <div style={s.poster}>
        <div style={s.posterHeader}>
          <p style={s.eyebrow}>{evento.edicao}</p>
          <h1 style={s.h1}>{evento.tema || "Algoritmo Humano"}</h1>
          <p style={s.meta}>
            {[evento.data, evento.horario, evento.local].filter(Boolean).join(" · ")}
          </p>
        </div>

        <img src={qrUrl} alt="QR code de check-in" style={s.qr} />

        <div style={s.posterFooter}>
          <p style={s.instruction}>
            Aponta a câmara do telemóvel para fazer <strong>check-in</strong>
          </p>
          <p style={s.brand}>neogeneralista.pt</p>
        </div>
      </div>

      <style jsx global>{`
        @page { size: A4; margin: 20mm; }
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: "100dvh", background: "#f4f4f4", fontFamily: "Arial, sans-serif", color: "#1a1a1a", padding: 24 },
  controls: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 },
  btn: { padding: "10px 18px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  btnLight: { padding: "10px 18px", background: "#fff", color: "#1a1a1a", border: "1px solid #ddd", borderRadius: 6, textDecoration: "none", fontSize: 14 },
  poster: {
    background: "#fff",
    maxWidth: 600,
    margin: "0 auto",
    padding: "48px 32px",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,.06)",
  },
  posterHeader: { marginBottom: 24 },
  eyebrow: { textTransform: "uppercase", fontSize: 13, letterSpacing: 2, color: "#888", margin: 0 },
  h1: { fontSize: 32, margin: "10px 0 12px", fontWeight: 700 },
  meta: { fontSize: 15, color: "#555", margin: 0 },
  qr: { width: "100%", maxWidth: 420, height: "auto", margin: "16px auto", display: "block" },
  posterFooter: { marginTop: 24 },
  instruction: { fontSize: 18, margin: "0 0 8px" },
  brand: { fontSize: 12, color: "#888", letterSpacing: 2, textTransform: "uppercase", margin: 0 },
};
