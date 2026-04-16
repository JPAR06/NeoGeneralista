import AlgoritmoHumano from "../components/AlgoritmoHumano";
import {
  getEventoProximo,
  getMembrosEquipa,
  getPatrocinadores,
} from "../lib/sanity";

export default function AlgoritmoHumanoPage(props) {
  return <AlgoritmoHumano {...props} />;
}

export async function getServerSideProps({ req }) {
  try {
    const [eventos, equipa, patrocinadores] = await Promise.all([
      getEventoProximo(),
      getMembrosEquipa(),
      getPatrocinadores(),
    ]);

    return {
      props: {
        eventos: eventos ?? [],
        equipa: equipa ?? [],
        patrocinadores: patrocinadores ?? [],
      },
    };
  } catch (err) {
    console.error("[getServerSideProps]", err);
    return {
      props: { eventos: [], equipa: [], patrocinadores: [] },
    };
  }
}
