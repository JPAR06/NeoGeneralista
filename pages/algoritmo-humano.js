import AlgoritmoHumano from "../components/AlgoritmoHumano";
import {
  getEventosAH,
  getMembrosEquipa,
  getPatrocinadores,
} from "../lib/sanity";

export default function AlgoritmoHumanoPage(props) {
  return <AlgoritmoHumano {...props} />;
}

export async function getServerSideProps() {
  try {
    const [todos, equipa, patrocinadores] = await Promise.all([
      getEventosAH(),
      getMembrosEquipa(),
      getPatrocinadores(),
    ]);

    const now = Date.now();
    const isUpcoming = (e) => !e.dataISO || new Date(e.dataISO).getTime() > now;
    // todos comes ordered desc by dataISO; for upcoming we want asc, take 2.
    const proximos = todos
      .filter(isUpcoming)
      .sort((a, b) => {
        const ax = a.dataISO ? new Date(a.dataISO).getTime() : Infinity;
        const bx = b.dataISO ? new Date(b.dataISO).getTime() : Infinity;
        return ax - bx;
      })
      .slice(0, 2);
    const passados = todos.filter((e) => !isUpcoming(e));

    return {
      props: {
        eventos: proximos,
        passados,
        equipa: equipa ?? [],
        patrocinadores: patrocinadores ?? [],
      },
    };
  } catch (err) {
    console.error("[getServerSideProps]", err);
    return {
      props: { eventos: [], passados: [], equipa: [], patrocinadores: [] },
    };
  }
}
