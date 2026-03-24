import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { id: "manifesto", label: "Manifesto" },
  { id: "proximo", label: "Proximo encontro" },
  { id: "areas", label: "Areas" },
  { id: "ritmo", label: "Ritmo mensal" },
  { id: "arquivo", label: "Arquivo" },
];

const AREAS = [
  {
    title: "Trabalho e lideranca",
    description:
      "Como a IA muda decisoes, autoridade, aprendizagem e a maneira como colaboramos.",
  },
  {
    title: "Arte e criatividade",
    description:
      "Onde acaba a ferramenta e onde comeca a voz humana quando criamos com sistemas inteligentes.",
  },
  {
    title: "Educacao e pensamento",
    description:
      "Novas perguntas sobre criterio, curiosidade, profundidade e autonomia intelectual.",
  },
  {
    title: "Cidades e comunidade",
    description:
      "A tecnologia como infraestrutura social: acesso, convivencia, cuidado e participacao.",
  },
];

const CONVERSAS = [
  {
    numero: "07",
    tema: "Criatividade",
    titulo: "O que continua humano quando a maquina tambem cria?",
    meta: "Abril 2026 · Porto",
  },
  {
    numero: "06",
    tema: "Educacao",
    titulo: "Aprender melhor num mundo onde tudo responde depressa",
    meta: "Marco 2026 · Porto",
  },
  {
    numero: "05",
    tema: "Trabalho",
    titulo: "Delegar a um sistema nao e o mesmo que deixar de pensar",
    meta: "Fevereiro 2026 · Porto",
  },
];

const RITUAL = [
  "Um tema por mes, sempre visto de um angulo humano e interdisciplinar.",
  "Uma conversa aberta, sem jargao e com espaco real para desacordo e descoberta.",
  "Uma comunidade curiosa que cruza areas, geracoes e formas de pensar.",
];

export default function AlgoritmoHumanoV3() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSubscribe = (event) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <div className="ahv3-page">
      <header className="ahv3-header">
        <div className="ahv3-shell ahv3-header-inner">
          <Link href="/" className="ahv3-brand" aria-label="NeoGeneralista">
            NeoGeneralista
          </Link>
          <nav className="ahv3-nav" aria-label="Navegacao Algoritmo Humano">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} className="ahv3-nav-link" onClick={() => scrollTo(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <button className="ahv3-header-cta" onClick={() => scrollTo("proximo")}>
            Reservar lugar
          </button>
        </div>
      </header>

      <main>
        <section className="ahv3-hero">
          <div className="ahv3-orbit ahv3-orbit--one" aria-hidden="true" />
          <div className="ahv3-orbit ahv3-orbit--two" aria-hidden="true" />
          <div className="ahv3-shell ahv3-hero-grid">
            <div className="ahv3-hero-copy">
              <div className="ahv3-eyebrow">
                <span>Evento mensal</span>
                <span>Porto</span>
                <span>IA + Humanos</span>
              </div>
              <h1 className="ahv3-title">
                Conversas mensais para pensar a intersecao entre inteligencia
                artificial e experiencia humana.
              </h1>
              <p className="ahv3-lead">
                O Algoritmo Humano e um ponto de encontro para quem quer discutir
                tecnologia sem perder nuance, sensibilidade nem contexto.
              </p>
              <div className="ahv3-actions">
                <button className="ahv3-btn ahv3-btn--primary" onClick={() => scrollTo("proximo")}>
                  Quero saber do proximo
                </button>
                <button className="ahv3-btn ahv3-btn--ghost" onClick={() => scrollTo("arquivo")}>
                  Ver edicoes
                </button>
              </div>
              <div className="ahv3-stats">
                <div>
                  <strong>Mensal</strong>
                  <span>cadencia</span>
                </div>
                <div>
                  <strong>Interdisciplinar</strong>
                  <span>formatos e areas</span>
                </div>
                <div>
                  <strong>Humano</strong>
                  <span>criterio acima do hype</span>
                </div>
              </div>
            </div>

            <div className="ahv3-hero-art">
              <div className="ahv3-logo-card">
                <img
                  src="/algoritmo-humano-logo-cor.png"
                  alt="Logo Algoritmo Humano"
                  className="ahv3-logo"
                />
                <p className="ahv3-logo-caption">
                  Um sistema de ligacoes, intuicao e presenca.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="ahv3-manifesto" id="manifesto">
          <div className="ahv3-shell ahv3-manifesto-grid">
            <div>
              <p className="ahv3-section-kicker">Manifesto</p>
              <h2>
                Nem tecnofilia cega, nem nostalgia defensiva.
              </h2>
            </div>
            <p className="ahv3-manifesto-copy">
              Queremos conversas onde a IA nao aparece como destino inevitavel,
              mas como materia para pensar poder, criacao, relacoes, trabalho e
              futuro. O ponto nao e escolher entre humano ou maquina. E aprender
              a desenhar melhores relacoes entre ambos.
            </p>
          </div>
        </section>

        <section className="ahv3-section" id="proximo">
          <div className="ahv3-shell ahv3-next-grid">
            <div className="ahv3-next-card">
              <p className="ahv3-section-kicker">Proximo encontro</p>
              <h2>A anunciar brevemente</h2>
              <p>
                Uma nova edicao, um novo tema, a mesma vontade de reunir pessoas
                curiosas para pensar o que esta a mudar nas nossas vidas.
              </p>
              <div className="ahv3-meta-list">
                <span>Porto, Portugal</span>
                <span>Entrada gratuita com inscricao</span>
                <span>Conversa + comunidade + tempo para ficar</span>
              </div>
            </div>

            <form className="ahv3-signup" onSubmit={handleSubscribe}>
              <p className="ahv3-signup-title">Recebe o convite do proximo mes</p>
              <p className="ahv3-signup-copy">
                Entramos em contacto quando o tema e a data forem revelados.
              </p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="O teu e-mail"
                className="ahv3-input"
                required
              />
              <button type="submit" className="ahv3-btn ahv3-btn--primary ahv3-btn--full">
                Quero receber
              </button>
              {subscribed && <p className="ahv3-feedback">Inscricao registada com sucesso.</p>}
            </form>
          </div>
        </section>

        <section className="ahv3-section ahv3-section--soft" id="areas">
          <div className="ahv3-shell">
            <p className="ahv3-section-kicker">Temas</p>
            <div className="ahv3-section-head">
              <h2>Um mesmo evento, muitos campos de tensao criativa.</h2>
              <p>
                Cada mes pode partir de uma area diferente, mas a pergunta de
                fundo e sempre a mesma: como permanecemos humanos no meio da
                aceleracao tecnologica?
              </p>
            </div>
            <div className="ahv3-areas-grid">
              {AREAS.map((area) => (
                <article key={area.title} className="ahv3-area-card">
                  <span className="ahv3-area-dot" aria-hidden="true" />
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ahv3-section" id="ritmo">
          <div className="ahv3-shell ahv3-ritual-grid">
            <div>
              <p className="ahv3-section-kicker">Ritmo mensal</p>
              <h2>Mais perto de um salao contemporaneo do que de uma conferencia.</h2>
            </div>
            <div className="ahv3-ritual-list">
              {RITUAL.map((item) => (
                <div key={item} className="ahv3-ritual-item">
                  <span className="ahv3-ritual-number" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ahv3-section ahv3-section--warm" id="arquivo">
          <div className="ahv3-shell">
            <div className="ahv3-section-head">
              <div>
                <p className="ahv3-section-kicker">Arquivo vivo</p>
                <h2>Algumas conversas que ja abriram caminho.</h2>
              </div>
              <p>
                O objetivo nao e chegar a respostas finais. E sair com melhores
                perguntas, mais criterio e novas ligacoes entre pessoas.
              </p>
            </div>
            <div className="ahv3-conversas-grid">
              {CONVERSAS.map((conversa) => (
                <article key={conversa.numero} className="ahv3-conversa-card">
                  <div className="ahv3-conversa-top">
                    <span className="ahv3-conversa-number">#{conversa.numero}</span>
                    <span className="ahv3-conversa-theme">{conversa.tema}</span>
                  </div>
                  <h3>{conversa.titulo}</h3>
                  <p>{conversa.meta}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ahv3-footer-cta">
          <div className="ahv3-shell ahv3-footer-cta-inner">
            <div>
              <p className="ahv3-section-kicker">Comunidade</p>
              <h2>Para quem prefere conversas densas a respostas automaticas.</h2>
            </div>
            <a href="mailto:ana@neogeneralista.pt" className="ahv3-btn ahv3-btn--dark">
              Falar com a organizacao
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
