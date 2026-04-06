import AlgoritmoHumano from "../components/AlgoritmoHumano";
import {
  getEventoProximo,
  getConversas,
  getMembrosEquipa,
  getPatrocinadores,
} from "../lib/sanity";

export default function AlgoritmoHumanoPage(props) {
  return <AlgoritmoHumano {...props} />;
}

export async function getServerSideProps({ req }) {
  try {
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const [eventos, conversas, equipa, patrocinadores, comunidadeRes] = await Promise.all([
      getEventoProximo(),
      getConversas(),
      getMembrosEquipa(),
      getPatrocinadores(),
      fetch(`${baseUrl}/api/comunidade`).then((r) => r.json()).catch(() => ({ membros: [] })),
    ]);

    return {
      props: {
        eventos: eventos ?? [],
        conversas: conversas ?? [],
        equipa: equipa ?? [],
        membros: comunidadeRes.membros ?? [],
        patrocinadores: patrocinadores ?? [],
      },
    };
  } catch (err) {
    console.error("[getServerSideProps]", err);
    return {
      props: { eventos: [], conversas: [], equipa: [], membros: [], patrocinadores: [] },
    };
  }
}
