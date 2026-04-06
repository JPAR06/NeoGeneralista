import AlgoritmoHumano from "../components/AlgoritmoHumano";
import {
  getEventoProximo,
  getConversas,
  getMembrosEquipa,
  getPatrocinadores,
} from "../lib/sanity";
import clientPromise from "../lib/mongodb";

function colorFromName(name = "") {
  const palette = ["#F05A78","#7EDDB8","#818cf8","#fb923c","#a78bfa","#f87171","#34d399","#60a5fa"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function initialsFromName(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export default function AlgoritmoHumanoPage(props) {
  return <AlgoritmoHumano {...props} />;
}

export async function getServerSideProps() {
  try {
    const [eventos, conversas, equipa, patrocinadores, mongoClient] = await Promise.all([
      getEventoProximo(),
      getConversas(),
      getMembrosEquipa(),
      getPatrocinadores(),
      clientPromise,
    ]);

    const db = mongoClient.db();
    const users = await db
      .collection("users")
      .find({}, { projection: { name: 1, _id: 1 } })
      .sort({ _id: 1 })
      .toArray();

    const membros = users
      .filter((u) => u.name)
      .map((u) => ({ iniciais: initialsFromName(u.name), cor: colorFromName(u.name) }));

    return {
      props: {
        eventos: eventos ?? [],
        conversas: conversas ?? [],
        equipa: equipa ?? [],
        membros,
        patrocinadores: patrocinadores ?? [],
      },
    };
  } catch (err) {
    console.error("[getServerSideProps]", err);
    return {
      props: {
        eventos: [],
        conversas: [],
        equipa: [],
        membros: [],
        patrocinadores: [],
      },
    };
  }
}
