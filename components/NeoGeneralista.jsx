import { useEffect, useState } from "react";

const phrases = [
  "fazer perguntas",
  "explorar fronteiras",
  "seguir a curiosidade",
  "dar contexto",
  "ligar pontos",
  "misturar conhecimentos",
  "pensar devagar",
  "ver padrões",
  "cruzar ideias",
  "juntar peças",
  "cruzar disciplinas",
  "abrir caminhos",
  "ganhar perspetiva",
  "pensar sistemas",
  "mapear complexidade",
  "orientar decisões",
  "traduzir linguagens",
  "humanizar tecnologia",
  "integrar mundos",
  "aumentar a consciência",
  "pensar o futuro",
];

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
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 150);
      return () => clearTimeout(t);
    }

    if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }

    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      return () => clearTimeout(t);
    }

    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }
  }, [displayed, deleting, phraseIndex]);

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
            <a href="/algoritmo-humano-v2">AlgoritmoHumano V2</a>
            <a href="#contact">Contacto</a>
          </nav>
          <a className="ycs-lang" href="https://yellowcreativestudio.net/en/" target="_blank" rel="noreferrer">
            EN
          </a>
        </div>
      </header>

      <section className="ycs-hero">
        <div className="ycs-container ycs-hero-inner">
          <h1>Ser NeoGeneralista é...</h1>
          <p>
            <span className="ycs-typewriter">{displayed}<span className="ycs-cursor">|</span></span>
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
            NeoGeneralista nasce do cruzamento entre <em>inovação, tecnologia e pessoas.</em>
          </h2>
          <p>
            Num mundo onde os desafios deixaram de caber em silos, ajudamos pessoas e organizações
            a pensar desafios complexos com mais clareza, ligando perspetivas que raramente aparecem
            na mesma sala.
          </p>
          <p>
            Se procuras novas respostas, talvez precisemos primeiro de fazer melhores perguntas.
          </p>
          <a href="#contact">Vamos Conversar?</a>
        </div>
      </section>

      <section className="ycs-about" id="about">
        <div className="ycs-container ycs-about-grid">
          <div>
            <h2>Lorem ipsum <em>dolor sit amet.</em></h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
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

      <footer className="ycs-footer" id="contact">
        <div className="ycs-container ycs-footer-grid">
          <div>
            <h3>A tua ideia é demasiado importante para um trabalho… genérico.</h3>
            <p>
              Não percas tempo com briefings vagos ou agências que não entendem a tua voz.
              Se procuras uma parceira que combina visão estratégica, escrita afiada e um toque
              de irreverência, estás no lugar certo.
            </p>
            <p>
              Conta-me tudo sobre o teu desafio — seja uma tradução que exige sensibilidade
              cultural, uma estratégia de conteúdo para dominar o mercado, ou um workshop para
              desbloquear a tua cabeça, ou a tua equipa.
            </p>
            <div className="ycs-social-links">
              <a href="https://www.linkedin.com/in/aiazevedo" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/aiazevedo" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              <a href="mailto:ana@neogeneralista.pt" aria-label="E-mail">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
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
            <a href="/politica-de-privacidade">
              Política de Privacidade
            </a>
          </p>
          <p>Copyright 2025 NeoGeneralista. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
