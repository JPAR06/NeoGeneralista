import AlgoritmoHumanoV4 from "../components/AlgoritmoHumanoV4";
import {
  getEventoProximo,
  getConversas,
  getMembrosEquipa,
  getMemorosComunidade,
  getPatrocinadores,
} from "../lib/sanity";

export default function AlgoritmoHumanoV4Page(props) {
  return <AlgoritmoHumanoV4 {...props} />;
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
          edicao: "AlgoritmoHumano #7",
          tema: "Inteligência Artificial e Criatividade Humana",
          data: "15 Abr 2025",
          local: "Porto, Portugal",
        },
        conversas: conversas?.length > 0 ? conversas : [
          { numero: 6, tema: "Criatividade", orador: "Ana Azevedo", titulo: "Quando a máquina imita e o humano cria", coracoes: 34, cor: "linear-gradient(135deg, #1a0a10 0%, #6b1a2e 100%)", data: "15 Mar 2025", duracao: "24 min" },
          { numero: 5, tema: "Memória", orador: "Rui Ferreira", titulo: "O que os algoritmos lembram de nós", coracoes: 21, cor: "linear-gradient(135deg, #0a1a10 0%, #1a4a30 100%)", data: "15 Fev 2025", duracao: "19 min" },
          { numero: 4, tema: "Linguagem", orador: "Sofia Mota", titulo: "Falar com máquinas, ouvir-nos a nós", coracoes: 28, cor: "linear-gradient(135deg, #0a0a1a 0%, #1a1a4a 100%)", data: "15 Jan 2025", duracao: "22 min" },
          { numero: 3, tema: "Identidade", orador: "Miguel Santos", titulo: "Quem somos quando ninguém está a ver", coracoes: 31, cor: "linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 100%)", data: "15 Dez 2024", duracao: "18 min" },
          { numero: 2, tema: "Confiança", orador: "Inês Monteiro", titulo: "A pergunta que a IA ainda não sabe fazer", coracoes: 27, cor: "linear-gradient(135deg, #1a1a0a 0%, #3a3a0a 100%)", data: "15 Nov 2024", duracao: "20 min" },
        ],
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
