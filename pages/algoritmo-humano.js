import AlgoritmoHumano from "../components/AlgoritmoHumano";
import {
  getEventoProximo,
  getConversas,
  getMembrosEquipa,
  getMemorosComunidade,
  getPatrocinadores,
} from "../lib/sanity";

export default function AlgoritmoHumanoPage(props) {
  return <AlgoritmoHumano {...props} />;
}

export async function getStaticProps() {
  try {
    const [eventos, conversas, equipa, comunidade, patrocinadores] = await Promise.all([
      getEventoProximo(),
      getConversas(),
      getMembrosEquipa(),
      getMemorosComunidade(),
      getPatrocinadores(),
    ]);
    return {
      props: {
        eventos: eventos ?? [],
        conversas: conversas ?? [],
        equipa: equipa ?? [],
        comunidade: comunidade ?? [],
        patrocinadores: patrocinadores ?? [],
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        eventos: [],
        conversas: [],
        equipa: [],
        comunidade: [],
        patrocinadores: [],
      },
      revalidate: 60,
    };
  }
}
