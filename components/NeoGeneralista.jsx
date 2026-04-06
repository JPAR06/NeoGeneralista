import { useEffect, useState } from "react";
import ConstellationCanvas from "./ConstellationCanvas";

/*
 * LOGO_STYLE — change this value to preview the three header logo options:
 *   'a'  →  small mark icon  +  "NeoGeneralista" text in serif
 *   'b'  →  logo image (Simbolo_Completo.png)  +  "NeoGeneralista" text side by side
 *   'c'  →  text only: "NeoGeneralista" + "por Ana Azevedo" tagline
 */
const LOGO_STYLE = "b";

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
    title: "Pensar",
    description:
      "O mundo do trabalho deixou de caber em silos. Liderança, tecnologia, cultura, emoções, inteligência artificial — tudo se mistura nas organizações. Pensar estes temas de forma isolada já não chega.",
    image:
      "https://images.pexels.com/photos/27086270/pexels-photo-27086270.jpeg?auto=compress&cs=tinysrgb&w=1600",
    href: "#contact",
  },
  {
    title: "Ligar",
    description:
      "As ideias mais interessantes vivem nas interseções. Entre ciência e prática. Entre humano e tecnológico. Entre estratégia e comportamento. Ser NeoGeneralista é olhar para problemas complexos com várias lentes ao mesmo tempo.",
    image:
      "https://images.pexels.com/photos/29521529/pexels-photo-29521529.jpeg?auto=compress&cs=tinysrgb&w=1600",
    href: "#contact",
  },
  {
    title: "Explorar",
    description:
      "Algumas perguntas merecem ser pensadas devagar. Este espaço existe para explorar o futuro do trabalho, das organizações e das pessoas que nelas vivem. Sempre com curiosidade, rigor e vontade de compreender melhor o que está a mudar.",
    image:
      "https://images.pexels.com/photos/7654396/pexels-photo-7654396.jpeg?auto=compress&cs=tinysrgb&w=1600",
    href: "#contact",
  },
];

const organisations = [
  { slug: "municipio-oeiras", name: "Município de Oeiras" },
  { slug: "universidade-coimbra", name: "Universidade de Coimbra" },
  { slug: "zoomarine", name: "Zoomarine" },
  { slug: "oceanario-lisboa", name: "Oceanário de Lisboa" },
  { slug: "trendalert", name: "TrendAlert" },
  { slug: "paperjam", name: "Paperjam" },
  { slug: "sogrape", name: "Sogrape" },
  { slug: "acisat", name: "ACISAT" },
  { slug: "isq", name: "Instituto de Soldadura e Qualidade" },
  { slug: "le-cool-lisboa", name: "Le Cool Lisboa" },
  { slug: "gerador", name: "Gerador" },
  { slug: "jeronimo-martins", name: "Jerónimo Martins" },
  { slug: "ese", name: "Escola Superior de Enfermagem" },
  { slug: "farfetch", name: "Farfetch" },
  { slug: "universidade-porto", name: "Universidade do Porto" },
  { slug: "creativemornings", name: "CreativeMornings" },
  { slug: "nova-sbe", name: "Nova SBE" },
  { slug: "tera", name: "TERA" },
  { slug: "unilinkr", name: "Unilinkr" },
  { slug: "geek-girls", name: "Geek Girls" },
  { slug: "chaperone", name: "Chaperone" },
  { slug: "porto-business-school", name: "Porto Business School" },
  { slug: "ipo-porto", name: "IPO Porto" },
  { slug: "mota-engil", name: "Mota-Engil" },
  { slug: "lactogal", name: "Lactogal" },
  { slug: "curya", name: "Curya" },
];

export default function NeoGeneralista() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Typewriter
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

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleNewsletter = (event) => {
    event.preventDefault();
    if (!email || !name) return;
    setSubscribed(true);
    setEmail("");
    setName("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  const handleContact = (event) => {
    event.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSent(true);
    setContactName("");
    setContactEmail("");
    setContactMessage("");
    setTimeout(() => setContactSent(false), 4000);
  };

  return (
    <div className="ycs-page">
      <ConstellationCanvas />

      <header className="ycs-header">
        <div className="ycs-container ycs-header-row">

          {/* ── Logo option A: mark icon + text ── */}
          {LOGO_STYLE === "a" && (
            <a className="ycs-logo ycs-logo--a" href="#">
              <img src="/neogeneralista-mark.png" alt="" aria-hidden="true" />
              <span>NeoGeneralista</span>
            </a>
          )}

          {/* ── Logo option B: composed logo (mark + text, designer file) ── */}
          {LOGO_STYLE === "b" && (
            <a className="ycs-logo ycs-logo--b" href="/" aria-label="NeoGeneralista">
              <img className="ycs-logo--b-img" src="/neogeneralista-logo-header.png" alt="NeoGeneralista" />
            </a>
          )}

          {/* ── Logo option C: text + tagline ── */}
          {LOGO_STYLE === "c" && (
            <a className="ycs-logo ycs-logo--c" href="#">
              <strong>NeoGeneralista</strong>
              <small>por Ana Azevedo</small>
            </a>
          )}

          <nav className="ycs-nav" aria-label="Main navigation">
            <a href="#about">Sobre</a>
            <a href="#percurso">Percurso</a>
            <a href="#services">Serviços</a>
            <a href="#manifesto">Manifesto</a>
            <a href="#logos">Organizações</a>
            <a href="#contact">Contacto</a>
          </nav>

          <button
            className="ycs-hamburger"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="ycs-hb-line" />
            <span className="ycs-hb-line" />
            <span className="ycs-hb-line" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="ycs-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="ycs-mobile-menu">
            <a href="#about"     onClick={() => setMenuOpen(false)}>Sobre</a>
            <a href="#percurso"  onClick={() => setMenuOpen(false)}>Percurso</a>
            <a href="#services"  onClick={() => setMenuOpen(false)}>Serviços</a>
            <a href="#manifesto" onClick={() => setMenuOpen(false)}>Manifesto</a>
            <a href="#logos"     onClick={() => setMenuOpen(false)}>Organizações</a>
            <a href="#contact"   onClick={() => setMenuOpen(false)}>Contacto</a>
          </div>
        </>
      )}

      <section className="ycs-hero">
        <div className="ycs-container ycs-hero-inner">
          <h1>Ser NeoGeneralista é...</h1>
          <p>
            <span className="ycs-typewriter">{displayed}<span className="ycs-cursor">|</span></span>
          </p>
        </div>
      </section>

      <section className="ycs-intro">
        <div className="ycs-container ycs-intro-inner" data-reveal>
          <h2>
            O NeoGeneralista nasce do cruzamento entre <em>inovação, tecnologia e pessoas.</em>
          </h2>
          <p>
            Nem todos os problemas precisam de respostas rápidas.
          </p>
          <p>
            Alguns precisam de melhores perguntas.
          </p>
          <p>
            E algumas perguntas merecem ser pensadas devagar.
          </p>
          <p>O NeoGeneralista existe para isso.</p>
          <div className="ycs-hero-ctas">
            <a href="#about" className="ycs-btn-secondary">Saber mais</a>
          </div>
        </div>
      </section>

      {/* ── Sobre ── */}
      <section className="ycs-about" id="about">
        <div className="ycs-container ycs-about-grid" data-reveal>
          <div>
            <h2>
              Olá, sou a Ana e sou <em>NeoGeneralista</em>
            </h2>
            <p>
              A primeira coisa que tens de saber sobre mim é que não trabalho bem dentro de caixas.
              E desconfio de tudo o que promete explicar organizações como se fossem simples.
            </p>
            <p>
              Sou daquelas pessoas que têm sempre demasiadas ideias em vários campos ao mesmo tempo.
              Sou professora universitária, consultora, formadora e perita europeia. E, quando não
              estou a pensar sobre trabalho e organizações, provavelmente estou a dançar.
            </p>
            <p>
              Aquilo que faço, na prática, é ajudar pessoas e organizações a pensar melhor sobre
              aquilo que já não cabe em silos ou em formatos pré-definidos. A ligar ideias que
              parecem não ter relação. A dar linguagem a desafios que ainda estão a acontecer.
            </p>
            <p>
              É por isso que o NeoGeneralista existe: porque algumas pessoas simplesmente pensam
              melhor quando deixam de escolher apenas um mundo ou uma caixa.
            </p>
            <blockquote className="ycs-about-quote">
              "Saímos com perguntas melhores — que é normalmente onde as mudanças começam."
            </blockquote>
          </div>
          <img
            src="/images/ana-azevedo.jpeg"
            alt="Ana Azevedo"
          />
        </div>
      </section>

      {/* ── Percurso ── */}
      <section className="ycs-percurso" id="percurso">
        <div className="ycs-container ycs-percurso-inner" data-reveal>
          <h2>O meu caminho</h2>
          <p>
            Há quase vinte anos que me movo entre os mundos das pessoas, do trabalho, da academia
            e das organizações. Comecei na função pública a trabalhar com competências, passei para
            o mundo corporativo a gerir projectos, e acabei na academia, entre teoria e investigação.
            Ao longo do caminho, fui cruzando diferentes áreas — da estratégia à cultura, da liderança
            à tecnologia.
          </p>
          <p>
            Hoje, trabalho sobretudo em transformação digital: não apenas como mudança tecnológica,
            mas como aquilo que ela realmente é — uma transformação de pessoas, decisões, linguagem
            e formas de pensar.
          </p>
          <ul className="ycs-about-list">
            <li>Estou constantemente a tentar perceber o que está a mudar, nas organizações, na tecnologia e com as pessoas.</li>
            <li>Divido o meu tempo entre ensinar na universidade, trabalhar com organizações e explorar ideias que me façam feliz.</li>
            <li>E, sempre que preciso de mudar de linguagem, volto à dança e ao trabalho com o corpo.</li>
          </ul>
          <a className="ycs-btn-primary" href="https://calendly.com/anisabelsousa/30min" target="_blank" rel="noreferrer">
            Vamos conversar &rarr;
          </a>
        </div>
      </section>

      <section className="ycs-services" id="services">
        <div className="ycs-container">
          <h2>
            Onde posso <em>cruzar caminhos contigo</em>
          </h2>
          <p>Entre reflexão e prática, trabalho sobretudo em três dimensões:</p>
          <div className="ycs-service-grid">
            {services.map((service, i) => (
              <a key={service.title} className="ycs-service-card" href={service.href} data-reveal style={{ transitionDelay: `${i * 0.12}s` }}>
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

      <section className="ycs-manifesto" id="manifesto">
        <div className="ycs-container ycs-manifesto-inner" data-reveal>
          <h2 className="ycs-manifesto-title">Manifesto</h2>
          <p>O trabalho deixou de ser linear.</p>
          <p>A tecnologia não é, nem nunca foi, neutra.</p>
          <p>E as organizações nunca foram simples.</p>
          <p className="ycs-manifesto-gap">Continuamos, no entanto, a tentar explicar tudo como se fosse.</p>
          <p>Dividimos o que está ligado.</p>
          <p>Simplificamos o que é complexo.</p>
          <p>E procuramos respostas rápidas para perguntas que ainda não sabemos fazer bem.</p>
          <p className="ycs-manifesto-gap ycs-manifesto-bold">O NeoGeneralista nasce para contrariar essa tendência.</p>
          <p className="ycs-manifesto-closing">Não para simplificar. Mas para compreender melhor.</p>
          <p className="ycs-manifesto-closing">Não para dar respostas fáceis, mas para tornar as perguntas mais interessantes.</p>
        </div>
      </section>

      <section className="ycs-logos" id="logos" data-reveal>
        <div className="ycs-container">
          <h2>Algumas organizações com quem já cruzei caminhos</h2>
          <p className="ycs-logos-sub">
            Ao longo dos anos, tive a oportunidade de trabalhar com organizações de diferentes
            setores, contextos e geografias. Todas com desafios interessantes o suficiente para
            merecerem ser bem pensados.
          </p>
          <div className="ycs-org-grid">
            {organisations.map((org) => (
              <div key={org.slug} className="ycs-org-item">
                <img
                  src={`/logos/${org.slug}.png`}
                  alt={org.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.querySelector(".ycs-org-fallback").style.display = "flex"; }}
                />
                <span className="ycs-org-fallback">{org.name}</span>
                <span className="ycs-org-name">{org.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="ycs-footer" id="contact">
        <div className="ycs-container ycs-footer-grid">

          {/* Left: contact */}
          <div data-reveal>
            <h3>Vamos falar dos teus desafios?</h3>
            <p>Às vezes basta começar por pensar melhor juntos.</p>

            <form className="ycs-contact-form" onSubmit={handleContact}>
              <div className="ycs-contact-row">
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="O teu nome"
                  required
                />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="O teu e-mail"
                  required
                />
              </div>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Conta-me o que te anda a inquietar…"
                rows={4}
                required
              />
              <button type="submit">Enviar mensagem</button>
            </form>
            {contactSent && <p className="ycs-feedback">Mensagem enviada. Até já!</p>}
          </div>

          {/* Right: newsletter + social */}
          <div data-reveal style={{ transitionDelay: "0.15s" }}>
            <h4>Newsletter</h4>
            <p>Uma vez por mês. Sem spam. Só ideias que valham a pena.</p>
            <form className="ycs-newsletter" onSubmit={handleNewsletter}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O teu e-mail"
                required
              />
              <button type="submit">Quero subscrever</button>
            </form>
            {subscribed && <p className="ycs-feedback">Subscrição enviada com sucesso.</p>}

            <a href="mailto:ana@neogeneralista.pt" className="ycs-footer-email-link">
              ana@neogeneralista.pt
            </a>
            <p className="ycs-footer-also">Encontra-me aqui</p>
            <div className="ycs-social-links">
              <a href="https://www.linkedin.com/in/aiazevedo" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/aiazevedo" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              <a href="mailto:ana@neogeneralista.pt" aria-label="E-mail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="ycs-container ycs-footer-bottom">
          <p>
            <a href="/politica-de-privacidade">Política de Privacidade</a>
            {" · "}
            <a href="/termos-de-servico">Termos de Serviço</a>
          </p>
          <p>© 2026 NeoGeneralista. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}




