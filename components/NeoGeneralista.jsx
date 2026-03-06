import { useEffect, useState } from "react";

const rotatingWords = ["humano", "vibrante", "autentico"];

const services = [
  {
    title: "Traducao",
    description:
      "Localizacao, transcriacao e traducao que respeitam significado, tom de voz e contexto.",
    image:
      "https://yellowcreativestudio.net/wp-content/uploads/2025/09/RitaSantanaPhotography-Branding-RafaMotaLemos-0106-scaled.jpg",
    href: "https://yellowcreativestudio.net/traducao/",
  },
  {
    title: "Conteudo",
    description: "Da ideia ao texto final, combinando escrita clara com visao estrategica.",
    image:
      "https://yellowcreativestudio.net/wp-content/uploads/2025/09/RitaSantanaPhotography-Branding-RafaMotaLemos-0234-scaled.jpg",
    href: "https://yellowcreativestudio.net/conteudo/",
  },
  {
    title: "Criatividade",
    description:
      "Clubes, workshops, retiros ou ideias a medida. Tudo com espaco para criar.",
    image:
      "https://yellowcreativestudio.net/wp-content/uploads/2025/09/RitaSantanaPhotography-Branding-RafaelaMotaLemos-ClubedoLivro-0005-scaled-e1758820078101.jpg",
    href: "https://yellowcreativestudio.net/criatividade/",
  },
];

const logos = [
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/Grayscaleimage07654.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/gray_bumble.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/logo-tumblr.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/logo-dentsu.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/logo-creativemornings.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/Gray-UN-Bela.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/gray-booking.png",
  "https://yellowcreativestudio.net/wp-content/uploads/2025/05/gray_visit_portugal.png",
];

export default function NeoGeneralista() {
  const [wordIndex, setWordIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleNewsletter = (event) => {
    event.preventDefault();
    if (!email || !name) return;
    setSubscribed(true);
    setEmail("");
    setName("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <div className="ycs-page">
      <header className="ycs-header">
        <div className="ycs-container ycs-header-row">
          <a className="ycs-logo" href="#">
            NeoGeneralista
          </a>
          <nav className="ycs-nav" aria-label="Main navigation">
            <a href="#about">Sobre</a>
            <a href="/algoritmo-humano">AlgoritmoHumano</a>
            <a href="#contact">Contacto</a>
          </nav>
          <a className="ycs-lang" href="https://yellowcreativestudio.net/en/" target="_blank" rel="noreferrer">
            EN
          </a>
        </div>
      </header>

      <section className="ycs-hero">
        <div className="ycs-container ycs-hero-inner">
          <h1>Conteudo criativo</h1>
          <p>
            com toque <span>{rotatingWords[wordIndex]}</span>
          </p>
          <img
            src="https://yellowcreativestudio.net/wp-content/uploads/2025/04/Home-Yellow-Creative-Studio.png"
            alt="NeoGeneralista hero"
          />
        </div>
      </section>

      <section className="ycs-intro">
        <div className="ycs-container ycs-intro-inner">
          <h2>
            NeoGeneralista e um estudio boutique onde ideias criativas e curiosidade
            estrategica se entrelacam para dar forca a marcas que se atrevem.
          </h2>
          <p>
            Uma boa comunicacao nao tem de ser seria, mas deve ser levada a serio. Se a tua
            marca precisa de criatividade, presenca e graca, estas no lugar certo.
          </p>
          <a href="#contact">Vamos colaborar?</a>
        </div>
      </section>

      <section className="ycs-about" id="about">
        <div className="ycs-container ycs-about-grid">
          <div>
            <h2>
              Ola, sou a <em>Ana Azevedo</em>
            </h2>
            <p>
              Sou os olhos, maos e cabeca a frente do NeoGeneralista. Ajudo marcas a
              comunicarem com estilo e clareza atraves de storytelling, estrategia de conteudos e
              workshops de criatividade.
            </p>
            <div className="ycs-stats">
              <div>
                <strong>+18</strong>
                <span>anos de experiencia</span>
              </div>
              <div>
                <strong>5</strong>
                <span>cafes por dia</span>
              </div>
            </div>
          </div>
          <img
            src="https://yellowcreativestudio.net/wp-content/uploads/2025/09/RitaSantanaPhotography-Branding-RafaMotaLemos-0097-scaled.jpg"
            alt="Ana Azevedo"
          />
        </div>
      </section>

      <section className="ycs-services" id="services">
        <div className="ycs-container">
          <h2>
            Tudo o que <em>posso criar contigo</em>
          </h2>
          <p>
            Das entrelinhas as grandes linhas, do detalhe a visao, da ideia no papel ao teu projeto
            no mundo.
          </p>
          <div className="ycs-service-grid">
            {services.map((service) => (
              <a key={service.title} className="ycs-service-card" href={service.href} target="_blank" rel="noreferrer">
                <img src={service.image} alt={service.title} />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="ycs-logos">
        <div className="ycs-container">
          <h2>
            Marcas que ja se renderam ao <em>amarelo</em>
          </h2>
          <div className="ycs-logo-grid">
            {logos.map((logo) => (
              <img key={logo} src={logo} alt="Client logo" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      <section className="ycs-testimonial">
        <div className="ycs-container ycs-testimonial-grid">
          <img
            src="https://yellowcreativestudio.net/wp-content/uploads/2025/05/Antonio_Gaspar_URBAN_SKETCHERS_VISIT_PORTUGAL.jpeg"
            alt="Antonio Gaspar"
          />
          <div>
            <h2>Clientes Felizes</h2>
            <blockquote>
              A Ana Azevedo traz sentido de humor, empatia e uma sensibilidade cultural rara a tudo o
              que faz. Garante que a mensagem passa e que quem le se sente visto.
            </blockquote>
            <p>Antonio Gaspar, Head of Brand Operations, Visit Portugal</p>
            <a href="#contact">Tambem queres ser um cliente feliz?</a>
          </div>
        </div>
      </section>

      <footer className="ycs-footer" id="contact">
        <div className="ycs-container ycs-footer-grid">
          <div>
            <h3>
              O NeoGeneralista combina conteudos, estrategia e criatividade a medida de
              marcas e pessoas com historias para contar.
            </h3>
            <a href="https://yellowcreativestudio.net/contacto/" target="_blank" rel="noreferrer">
              Vamos colaborar?
            </a>
          </div>
          <div>
            <h4>Entra na Lista</h4>
            <p>
              Subscreve e recebe uma injecao de amarelo com novidades sobre workshops, eventos e
              outras ideias criativas.
            </p>
            <form className="ycs-newsletter" onSubmit={handleNewsletter}>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="O teu nome"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="O teu e-mail"
                required
              />
              <button type="submit">Quero assinar a newsletter!</button>
            </form>
            {subscribed && <p className="ycs-feedback">Subscricao enviada com sucesso.</p>}
          </div>
        </div>

        <div className="ycs-container ycs-footer-bottom">
          <p>
            <a href="https://yellowcreativestudio.net/politica-de-privacidade/" target="_blank" rel="noreferrer">
              Politica de Privacidade
            </a>{" "}
            <a href="https://yellowcreativestudio.net/termos-de-servico/" target="_blank" rel="noreferrer">
              Termos de Servico
            </a>
          </p>
          <p>Copyright 2025 NeoGeneralista. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
