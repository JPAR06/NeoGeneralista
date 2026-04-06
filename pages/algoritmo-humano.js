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
    const [evento, conversas, equipa, comunidade, patrocinadores] = await Promise.all([
      getEventoProximo(),
      getConversas(),
      getMembrosEquipa(),
      getMemorosComunidade(),
      getPatrocinadores(),
    ]);
    return {
      props: {
        evento: evento ?? {
          edicao: "AlgoritmoHumano",
          tema: "IA & Psicologia",
          data: "3.ª feira - 7 de abril de 2026",
          horario: "18h30 – 20h30",
          local: "UPTEC Asprela",
          convidado: "Andreia Silva Santos",
          descricaoCurta: "Bem-vindo/a a este ciclo mensal de conversas dedicado a explorar de que forma a Inteligência Artificial está a transformar a sociedade em diferentes dimensões da vida humana.\n\nCada sessão conta com um/a convidado/a especialista e o público para uma conversa aberta e reflexiva sobre as oportunidades, desafios e questões que emergem na era das máquinas inteligentes.",
          descricaoLonga: "Nesta sessão iremos explorar a relação entre Inteligência Artificial e Psicologia, refletindo sobre como as novas tecnologias estão a influenciar a forma como pensamos, sentimos e nos relacionamos. Da utilização de sistemas inteligentes no apoio psicológico às implicações da interação com máquinas no comportamento humano, esta conversa propõe-se discutir os desafios, possibilidades e questões éticas que emergem neste encontro entre mente humana e tecnologia.",
          maxParticipantes: 50,
          formularioAtivo: false,
        },
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
        evento: null,
        conversas: [],
        equipa: [],
        comunidade: [],
        patrocinadores: [],
      },
      revalidate: 60,
    };
  }
}
