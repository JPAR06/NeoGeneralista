import Link from "next/link";
import { getConversas, getConversa } from "../../lib/sanity";

const SAMPLE_CONVERSAS = [
  { numero: 6, tema: "Criatividade", orador: "Ana Azevedo", titulo: "Quando a máquina imita e o humano cria", coracoes: 34, cor: "linear-gradient(135deg, #1a0a10 0%, #6b1a2e 100%)", data: "15 Mar 2025", duracao: "24 min", descricao: "Uma exploração profunda sobre o que distingue a criatividade humana da geração automática de conteúdo. Quando os algoritmos produzem arte, música e texto — o que fica reservado ao humano?", pontos: ["A criatividade como acto intencional e contextual", "O papel da emoção e da experiência vivida na criação", "IA generativa como ferramenta vs. substituto criativo", "O futuro da autoria num mundo de co-criação"], oradorBio: "Ana Azevedo é fundadora do NeoGeneralista e organizadora do AlgoritmoHumano. Investigadora e consultora na interseção entre tecnologia, pessoas e organizações." },
  { numero: 5, tema: "Memória", orador: "Rui Ferreira", titulo: "O que os algoritmos lembram de nós", coracoes: 21, cor: "linear-gradient(135deg, #0a1a10 0%, #1a4a30 100%)", data: "15 Fev 2025", duracao: "19 min", descricao: "Os sistemas de IA constroem perfis persistentes sobre cada utilizador. Esta conversa explora as implicações éticas, psicológicas e sociais de sermos 'lembrados' por máquinas.", pontos: ["Memória algorítmica vs. memória humana", "Como os dados moldam a nossa identidade digital", "O direito ao esquecimento na era da IA", "Personalização como conforto ou como prisão"], oradorBio: "Rui Ferreira é investigador em ética da inteligência artificial e privacidade digital." },
  { numero: 4, tema: "Linguagem", orador: "Sofia Mota", titulo: "Falar com máquinas, ouvir-nos a nós", coracoes: 28, cor: "linear-gradient(135deg, #0a0a1a 0%, #1a1a4a 100%)", data: "15 Jan 2025", duracao: "22 min", descricao: "A linguagem é o que nos torna humanos. Mas os modelos de linguagem aprenderam a falar como nós. O que acontece quando a linha entre comunicação humana e artificial se esbate?", pontos: ["LLMs e a simulação da compreensão", "Linguagem como poder e como identidade", "O impacto dos chatbots nas relações humanas", "Literacia linguística na era da IA"], oradorBio: "Sofia Mota é linguista computacional e investigadora em interfaces humano-máquina." },
  { numero: 3, tema: "Identidade", orador: "Miguel Santos", titulo: "Quem somos quando ninguém está a ver", coracoes: 31, cor: "linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 100%)", data: "15 Dez 2024", duracao: "18 min", descricao: "A vigilância algorítmica mudou o modo como nos comportamos online — e offline. Esta conversa explora como a consciência de sermos observados transforma quem somos.", pontos: ["O efeito Panótico nos comportamentos digitais", "Autenticidade vs. performance nas redes sociais", "Como os algoritmos de recomendação moldam opiniões", "Identidade fragmentada na era da personalização"], oradorBio: "Miguel Santos é sociólogo especializado em comportamento digital e cultura de rede." },
  { numero: 2, tema: "Confiança", orador: "Inês Monteiro", titulo: "A pergunta que a IA ainda não sabe fazer", coracoes: 27, cor: "linear-gradient(135deg, #1a1a0a 0%, #3a3a0a 100%)", data: "15 Nov 2024", duracao: "20 min", descricao: "Confiamos em sistemas que não compreendemos completamente. Esta conversa questiona os fundamentos da confiança em sistemas de IA e o que acontece quando falham.", pontos: ["A opacidade dos sistemas de decisão algorítmica", "Confiança institucional vs. confiança em sistemas", "Responsabilidade quando a IA erra", "Como comunicar incerteza de forma honesta"], oradorBio: "Inês Monteiro é consultora em transformação digital e gestão de risco tecnológico." },
];

export default function ConversaPage({ conversa }) {
  if (!conversa) return (
    <div style={{ padding: "100px 32px", textAlign: "center", fontFamily: "sans-serif" }}>
      <p>Conversa não encontrada.</p>
      <Link href="/algoritmo-humano-v4">← Voltar</Link>
    </div>
  );

  const pontos = conversa.pontos || [];

  return (
    <div className="cv-page">
      {/* Back nav */}
      <div className="cv-topbar">
        <Link href="/algoritmo-humano-v4" className="cv-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          AlgoritmoHumano
        </Link>
        <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="cv-topbar-logo" />
      </div>

      {/* Hero */}
      <section className="cv-hero" style={{ background: conversa.cor || "linear-gradient(135deg, #1a0a10, #0c0c10)" }}>
        <div className="cv-hero-overlay">
          <div className="cv-container">
            <div className="cv-hero-meta">
              <span className="cv-tema-chip">{conversa.tema}</span>
              <span className="cv-edition">#{conversa.numero}</span>
            </div>
            <h1 className="cv-hero-title">"{conversa.titulo}"</h1>
            <div className="cv-hero-byline">
              <span className="cv-orador">{conversa.orador}</span>
              <span className="cv-dot">·</span>
              <span className="cv-date">{conversa.data}</span>
              <span className="cv-dot">·</span>
              <span className="cv-duration">{conversa.duracao}</span>
              <span className="cv-dot">·</span>
              <span className="cv-hearts">♥ {conversa.coracoes}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="cv-body">
        <div className="cv-container cv-layout">

          {/* Main content */}
          <main className="cv-main">
            {conversa.videoUrl && (
              <div className="cv-video-wrap">
                <iframe
                  src={conversa.videoUrl}
                  title={conversa.titulo}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {conversa.descricao && (
              <div className="cv-section">
                <h2 className="cv-section-title">Sobre esta conversa</h2>
                <p className="cv-description">{conversa.descricao}</p>
              </div>
            )}

            {pontos.length > 0 && (
              <div className="cv-section">
                <h2 className="cv-section-title">Pontos-chave</h2>
                <ul className="cv-pontos">
                  {pontos.map((p, i) => (
                    <li key={i} className="cv-ponto">
                      <span className="cv-ponto-num">{String(i + 1).padStart(2, "0")}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="cv-sidebar">
            <div className="cv-sidebar-card">
              <p className="cv-sidebar-label">Orador</p>
              <div className="cv-speaker-avatar">{conversa.orador?.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
              <p className="cv-speaker-name">{conversa.orador}</p>
              {conversa.oradorBio && <p className="cv-speaker-bio">{conversa.oradorBio}</p>}
            </div>

            <div className="cv-sidebar-card">
              <p className="cv-sidebar-label">Detalhes</p>
              <div className="cv-detail-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span>{conversa.data}</span>
              </div>
              <div className="cv-detail-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{conversa.duracao}</span>
              </div>
              <div className="cv-detail-row">
                <span style={{ color: "#F05A78" }}>♥</span>
                <span>{conversa.coracoes} pessoas gostaram</span>
              </div>
            </div>

            <Link href="/algoritmo-humano-v4#conversas" className="cv-cta">
              Ver todas as conversas →
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  let conversas = [];
  try { conversas = await getConversas() ?? []; } catch {}

  // Always include sample paths so page works without Sanity data
  const sampleNums = SAMPLE_CONVERSAS.map(c => c.numero);
  const sanityNums = conversas.map(c => c.numero);
  const allNums = [...new Set([...sampleNums, ...sanityNums])];

  return {
    paths: allNums.map(n => ({ params: { numero: String(n) } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const num = Number(params.numero);
  let conversa = null;
  try { conversa = await getConversa(num); } catch {}

  // Fall back to sample data if Sanity is empty
  if (!conversa) conversa = SAMPLE_CONVERSAS.find(c => c.numero === num) ?? null;

  return {
    props: { conversa: conversa ?? null },
    revalidate: 60,
  };
}
