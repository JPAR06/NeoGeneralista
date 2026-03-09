import { useState, useEffect, useRef, useCallback } from "react";

// ─── i18n ────────────────────────────────────────────────────────────────────
const translations = {
  pt: {
    nav: { home: "Home", about: "Sobre", services: "Serviços", projects: "Projetos", blog: "Blog", contact: "Contacto" },
    hero: { line1: "Conteúdo criativo", line2a: "com toque", words: ["humano", "vibrante", "autêntico", "ousado"], cta: "Vamos Colaborar?" },
    intro: {
      title: "Olá, sou a Ana Azevedo",
      text: "Sou os olhos, mãos e cabeça à frente do NeoGeneralista. Ajudo marcas a comunicarem com estilo e clareza através de storytelling, estratégia de conteúdos e workshops de criatividade.",
      years: "anos de experiência", coffees: "cafés por dia", more: "Conhece-me melhor"
    },
    services: {
      title: "Tudo o que posso criar contigo",
      subtitle: "Das entrelinhas às grandes linhas, do detalhe à visão, da ideia no papel ao teu projeto no mundo.",
      items: [
        { name: "Tradução", desc: "Localização, transcriação e tradução que respeitam o significado, tom de voz e contexto originais." },
        { name: "Conteúdo", desc: "Da ideia ao texto final, combino escrita clara com visão estratégica para marcas com alma." },
        { name: "Criatividade", desc: "Clubes, workshops, retiros ou ideias à medida. Tudo começa com espaço para criar." }
      ]
    },
    clients: { title: "Marcas que já se renderam ao amarelo" },
    testimonial: {
      quote: "A Ana Azevedo traz sentido de humor, empatia e uma sensibilidade cultural rara a tudo o que faz. Garante que a mensagem passa — e que quem lê se sente visto.",
      author: "António Gaspar", role: "Head of Brand Operations, Visit Portugal"
    },
    projects: { title: "Projetos em Destaque", viewAll: "Ver todos" },
    blog: { title: "Do Blog", readMore: "Ler mais", viewAll: "Ver todos os artigos" },
    newsletter: { title: "Entra na Lista", desc: "Recebe uma injeção de amarelo com novidades sobre workshops, eventos e ideias criativas.", placeholder: "O teu email", btn: "Subscrever" },
    contact: { title: "Vamos conversar?", name: "Nome", email: "Email", message: "Mensagem", send: "Enviar", success: "Mensagem enviada com sucesso!" },
    footer: { privacy: "Política de Privacidade", terms: "Termos de Serviço", rights: "Todos os direitos reservados." },
    admin: { title: "Back Office", login: "Entrar", logout: "Sair", password: "Palavra-passe" }
  },
  en: {
    nav: { home: "Home", about: "About", services: "Services", projects: "Projects", blog: "Blog", contact: "Contact" },
    hero: { line1: "Creative content", line2a: "with a", words: ["human", "vibrant", "authentic", "bold"], cta: "Let's Collaborate?" },
    intro: {
      title: "Hi, I'm Ana Azevedo",
      text: "I'm the eyes, hands and mind behind NeoGeneralista. I help brands communicate with style and clarity through storytelling, content strategy and creativity workshops.",
      years: "years of experience", coffees: "coffees per day", more: "Get to know me"
    },
    services: {
      title: "Everything I can create with you",
      subtitle: "From the fine print to the big picture, from detail to vision, from the idea on paper to your project in the world.",
      items: [
        { name: "Translation", desc: "Localization, transcreation and translation that respect meaning, tone of voice and original context." },
        { name: "Content", desc: "From idea to final copy, I combine clear writing with strategic vision for brands with soul." },
        { name: "Creativity", desc: "Clubs, workshops, retreats or bespoke ideas. Everything starts with space to create." }
      ]
    },
    clients: { title: "Brands that embraced the yellow" },
    testimonial: {
      quote: "Ana Azevedo brings humor, empathy and a rare cultural sensitivity to everything she does. She ensures the message lands — and that readers feel seen.",
      author: "António Gaspar", role: "Head of Brand Operations, Visit Portugal"
    },
    projects: { title: "Featured Projects", viewAll: "View all" },
    blog: { title: "From the Blog", readMore: "Read more", viewAll: "View all posts" },
    newsletter: { title: "Join the List", desc: "Get a shot of yellow with updates on workshops, events and creative ideas.", placeholder: "Your email", btn: "Subscribe" },
    contact: { title: "Let's talk?", name: "Name", email: "Email", message: "Message", send: "Send", success: "Message sent successfully!" },
    footer: { privacy: "Privacy Policy", terms: "Terms of Service", rights: "All rights reserved." },
    admin: { title: "Back Office", login: "Login", logout: "Logout", password: "Password" }
  }
};

// ─── Default CMS Data ────────────────────────────────────────────────────────
const defaultCMSData = {
  siteTitle: "NeoGeneralista",
  heroEnabled: true,
  pages: [
    { id: "about", titlePt: "Sobre", titleEn: "About", contentPt: "Conteúdo da página Sobre...", contentEn: "About page content...", published: true },
    { id: "services", titlePt: "Serviços", titleEn: "Services", contentPt: "Conteúdo dos serviços...", contentEn: "Services content...", published: true },
  ],
  projects: [
    { id: 1, titlePt: "Campanha Visit Portugal", titleEn: "Visit Portugal Campaign", descPt: "Estratégia de conteúdos e copywriting para a campanha internacional.", descEn: "Content strategy and copywriting for the international campaign.", category: "Content", image: "🇵🇹", featured: true, published: true },
    { id: 2, titlePt: "Rebranding Luz Natural", titleEn: "Luz Natural Rebrand", descPt: "Nova identidade verbal e tom de voz para marca de cosmética natural.", descEn: "New verbal identity and tone of voice for natural cosmetics brand.", category: "Branding", image: "🌿", featured: true, published: true },
    { id: 3, titlePt: "Workshop Criativo Porto", titleEn: "Porto Creative Workshop", descPt: "Workshop imersivo de escrita criativa para equipas.", descEn: "Immersive creative writing workshop for teams.", category: "Creativity", image: "✍️", featured: true, published: true },
    { id: 4, titlePt: "Tradução Editorial Presença", titleEn: "Presença Editorial Translation", descPt: "Tradução literária de ficção contemporânea.", descEn: "Literary translation of contemporary fiction.", category: "Translation", image: "📚", featured: false, published: true },
  ],
  blogPosts: [
    { id: 1, titlePt: "Porque o storytelling importa", titleEn: "Why storytelling matters", excerptPt: "As marcas que contam boas histórias vendem mais do que produtos — vendem pertença.", excerptEn: "Brands that tell good stories sell more than products — they sell belonging.", date: "2025-05-15", published: true },
    { id: 2, titlePt: "5 erros de copywriting a evitar", titleEn: "5 copywriting mistakes to avoid", excerptPt: "Pequenos erros que custam grandes conversões. Aprende a identificá-los.", excerptEn: "Small mistakes that cost big conversions. Learn to spot them.", date: "2025-04-28", published: true },
    { id: 3, titlePt: "Criatividade é um músculo", titleEn: "Creativity is a muscle", excerptPt: "Como manter a criatividade em forma, mesmo nos dias mais cinzentos.", excerptEn: "How to keep creativity fit, even on the greyest days.", date: "2025-04-10", published: true },
  ],
  testimonials: [
    { id: 1, quotePt: "A Ana Azevedo traz sentido de humor, empatia e uma sensibilidade cultural rara a tudo o que faz.", quoteEn: "Ana Azevedo brings humor, empathy and a rare cultural sensitivity to everything she does.", author: "António Gaspar", role: "Head of Brand Operations, Visit Portugal", active: true },
  ],
  subscribers: [],
  messages: [],
  clientLogos: ["Visit Portugal", "Booking.com", "Porto.", "Wine & Soul", "Presença", "FLAD"]
};

// ─── Utility: useInView ──────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Rotating Word ───────────────────────────────────────────────────────────
function RotatingWord({ words }) {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState("in");
  useEffect(() => {
    const interval = setInterval(() => {
      setAnim("out");
      setTimeout(() => { setIdx(i => (i + 1) % words.length); setAnim("in"); }, 400);
    }, 2600);
    return () => clearInterval(interval);
  }, [words.length]);
  return (
    <span style={{
      display: "inline-block", color: "#F5C518", fontStyle: "italic", minWidth: 180,
      transition: "opacity 0.4s, transform 0.4s",
      opacity: anim === "in" ? 1 : 0,
      transform: anim === "in" ? "translateY(0)" : "translateY(-16px)"
    }}>{words[idx]}</span>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function Section({ children, id, bg = "transparent", style = {} }) {
  const [ref, visible] = useInView(0.1);
  return (
    <section id={id} ref={ref} style={{
      padding: "100px 24px", background: bg, opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: "opacity 0.8s cubic-bezier(.4,0,.2,1), transform 0.8s cubic-bezier(.4,0,.2,1)", ...style
    }}>{children}</section>
  );
}

// ─── Logo Marquee ────────────────────────────────────────────────────────────
function LogoMarquee({ logos }) {
  const doubled = [...logos, ...logos];
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "20px 0" }}>
      <div style={{
        display: "flex", gap: 60, whiteSpace: "nowrap", willChange: "transform",
        animation: "marquee 20s linear infinite"
      }}>
        {doubled.map((l, i) => (
          <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 600, color: "#999", letterSpacing: 2, textTransform: "uppercase", flexShrink: 0 }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────
function AdminPanel({ cms, setCms, lang, t, onClose }) {
  const [tab, setTab] = useState("dashboard");
  const [editingProject, setEditingProject] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "pages", icon: "📄", label: lang === "pt" ? "Páginas" : "Pages" },
    { id: "projects", icon: "🎨", label: lang === "pt" ? "Projetos" : "Projects" },
    { id: "blog", icon: "✏️", label: "Blog" },
    { id: "testimonials", icon: "💬", label: lang === "pt" ? "Testemunhos" : "Testimonials" },
    { id: "subscribers", icon: "📧", label: lang === "pt" ? "Subscritores" : "Subscribers" },
    { id: "messages", icon: "📩", label: lang === "pt" ? "Mensagens" : "Messages" },
    { id: "settings", icon: "⚙️", label: lang === "pt" ? "Definições" : "Settings" },
  ];

  const cardStyle = { background: "#1a1a1a", borderRadius: 12, padding: 24, marginBottom: 16, border: "1px solid #2a2a2a" };
  const inputStyle = { width: "100%", padding: "10px 14px", background: "#111", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box" };
  const btnStyle = { padding: "10px 20px", background: "#F5C518", color: "#111", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" };
  const btnSecondary = { ...btnStyle, background: "#333", color: "#fff" };
  const tagStyle = (active) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: active ? "#22c55e" : "#ef4444" });

  const updateProject = (id, field, value) => {
    setCms(prev => ({ ...prev, projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  };
  const deleteProject = (id) => {
    setCms(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
    setEditingProject(null);
  };
  const addProject = () => {
    const newId = Math.max(0, ...cms.projects.map(p => p.id)) + 1;
    const np = { id: newId, titlePt: "Novo Projeto", titleEn: "New Project", descPt: "", descEn: "", category: "Content", image: "📌", featured: false, published: false };
    setCms(prev => ({ ...prev, projects: [...prev.projects, np] }));
    setEditingProject(newId);
  };
  const updatePost = (id, field, value) => {
    setCms(prev => ({ ...prev, blogPosts: prev.blogPosts.map(p => p.id === id ? { ...p, [field]: value } : p) }));
  };
  const deletePost = (id) => {
    setCms(prev => ({ ...prev, blogPosts: prev.blogPosts.filter(p => p.id !== id) }));
    setEditingPost(null);
  };
  const addPost = () => {
    const newId = Math.max(0, ...cms.blogPosts.map(p => p.id)) + 1;
    const np = { id: newId, titlePt: "Novo Artigo", titleEn: "New Post", excerptPt: "", excerptEn: "", date: new Date().toISOString().split('T')[0], published: false };
    setCms(prev => ({ ...prev, blogPosts: [...prev.blogPosts, np] }));
    setEditingPost(newId);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#0d0d0d", color: "#fff", overflow: "hidden", display: "flex", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: "#111", borderRight: "1px solid #222", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #222", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🟡</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>YCS Admin</span>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => { setTab(tb.id); setEditingProject(null); setEditingPost(null); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: tab === tb.id ? "rgba(245,197,24,0.1)" : "transparent",
              border: "none", borderRadius: 8, color: tab === tb.id ? "#F5C518" : "#888", cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: "left", transition: "all 0.2s"
            }}>
              <span style={{ fontSize: 16 }}>{tb.icon}</span> {tb.label}
              {tb.id === "messages" && cms.messages.length > 0 && <span style={{ marginLeft: "auto", background: "#F5C518", color: "#111", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{cms.messages.length}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid #222" }}>
          <button onClick={onClose} style={{ ...btnSecondary, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            ← {lang === "pt" ? "Voltar ao site" : "Back to site"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
        {/* Dashboard */}
        {tab === "dashboard" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Dashboard</h2>
            <p style={{ color: "#888", marginBottom: 32 }}>{lang === "pt" ? "Visão geral do teu site" : "Your site overview"}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: lang === "pt" ? "Projetos" : "Projects", val: cms.projects.filter(p => p.published).length, icon: "🎨", color: "#F5C518" },
                { label: lang === "pt" ? "Artigos" : "Posts", val: cms.blogPosts.filter(p => p.published).length, icon: "✏️", color: "#3b82f6" },
                { label: lang === "pt" ? "Subscritores" : "Subscribers", val: cms.subscribers.length, icon: "📧", color: "#22c55e" },
                { label: lang === "pt" ? "Mensagens" : "Messages", val: cms.messages.length, icon: "📩", color: "#a855f7" },
              ].map((s, i) => (
                <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{lang === "pt" ? "Atividade Recente" : "Recent Activity"}</h3>
              {cms.messages.slice(-3).reverse().map((m, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: i < 2 ? "1px solid #222" : "none", display: "flex", justifyContent: "space-between" }}>
                  <div><strong>{m.name}</strong> <span style={{ color: "#888" }}>— {m.message?.substring(0, 50)}...</span></div>
                  <span style={{ color: "#666", fontSize: 12 }}>{m.date}</span>
                </div>
              ))}
              {cms.messages.length === 0 && <p style={{ color: "#666" }}>{lang === "pt" ? "Sem mensagens ainda" : "No messages yet"}</p>}
            </div>
          </div>
        )}

        {/* Pages */}
        {tab === "pages" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{lang === "pt" ? "Páginas" : "Pages"}</h2>
            {cms.pages.map(page => (
              <div key={page.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{lang === "pt" ? page.titlePt : page.titleEn}</h3>
                  <span style={tagStyle(page.published)}>{page.published ? (lang === "pt" ? "Publicado" : "Published") : (lang === "pt" ? "Rascunho" : "Draft")}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Título PT</label>
                    <input value={page.titlePt} onChange={e => setCms(prev => ({ ...prev, pages: prev.pages.map(p => p.id === page.id ? { ...p, titlePt: e.target.value } : p) }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Title EN</label>
                    <input value={page.titleEn} onChange={e => setCms(prev => ({ ...prev, pages: prev.pages.map(p => p.id === page.id ? { ...p, titleEn: e.target.value } : p) }))} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Conteúdo PT</label>
                    <textarea value={page.contentPt} onChange={e => setCms(prev => ({ ...prev, pages: prev.pages.map(p => p.id === page.id ? { ...p, contentPt: e.target.value } : p) }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Content EN</label>
                    <textarea value={page.contentEn} onChange={e => setCms(prev => ({ ...prev, pages: prev.pages.map(p => p.id === page.id ? { ...p, contentEn: e.target.value } : p) }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {tab === "projects" && !editingProject && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>{lang === "pt" ? "Projetos" : "Projects"}</h2>
              <button onClick={addProject} style={btnStyle}>+ {lang === "pt" ? "Novo Projeto" : "New Project"}</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {cms.projects.map(p => (
                <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, marginBottom: 0, cursor: "pointer", transition: "border-color 0.2s" }} onClick={() => setEditingProject(p.id)}>
                  <span style={{ fontSize: 32, width: 48, textAlign: "center" }}>{p.image}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{lang === "pt" ? p.titlePt : p.titleEn}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>{p.category}</div>
                  </div>
                  <span style={tagStyle(p.published)}>{p.published ? "Live" : "Draft"}</span>
                  {p.featured && <span style={{ fontSize: 11, background: "rgba(245,197,24,0.15)", color: "#F5C518", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>★ Featured</span>}
                  <span style={{ color: "#666", fontSize: 18 }}>→</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "projects" && editingProject && (() => {
          const p = cms.projects.find(pr => pr.id === editingProject);
          if (!p) return null;
          return (
            <div>
              <button onClick={() => setEditingProject(null)} style={{ ...btnSecondary, marginBottom: 24, fontSize: 13 }}>← {lang === "pt" ? "Voltar" : "Back"}</button>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{lang === "pt" ? "Editar Projeto" : "Edit Project"}</h2>
              <div style={cardStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Título</label><input value={p.titlePt} onChange={e => updateProject(p.id, "titlePt", e.target.value)} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Title</label><input value={p.titleEn} onChange={e => updateProject(p.id, "titleEn", e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Descrição</label><textarea value={p.descPt} onChange={e => updateProject(p.id, "descPt", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Description</label><textarea value={p.descEn} onChange={e => updateProject(p.id, "descEn", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Category</label><input value={p.category} onChange={e => updateProject(p.id, "category", e.target.value)} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Emoji Icon</label><input value={p.image} onChange={e => updateProject(p.id, "image", e.target.value)} style={inputStyle} /></div>
                  <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                      <input type="checkbox" checked={p.featured} onChange={e => updateProject(p.id, "featured", e.target.checked)} /> Featured
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 14 }}>
                      <input type="checkbox" checked={p.published} onChange={e => updateProject(p.id, "published", e.target.checked)} /> Published
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={() => setEditingProject(null)} style={btnStyle}>{lang === "pt" ? "Guardar" : "Save"}</button>
                  <button onClick={() => deleteProject(p.id)} style={{ ...btnSecondary, color: "#ef4444" }}>{lang === "pt" ? "Eliminar" : "Delete"}</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Blog */}
        {tab === "blog" && !editingPost && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800 }}>Blog</h2>
              <button onClick={addPost} style={btnStyle}>+ {lang === "pt" ? "Novo Artigo" : "New Post"}</button>
            </div>
            {cms.blogPosts.map(p => (
              <div key={p.id} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setEditingPost(p.id)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{lang === "pt" ? p.titlePt : p.titleEn}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{p.date}</div>
                </div>
                <span style={tagStyle(p.published)}>{p.published ? "Live" : "Draft"}</span>
                <span style={{ color: "#666" }}>→</span>
              </div>
            ))}
          </div>
        )}
        {tab === "blog" && editingPost && (() => {
          const p = cms.blogPosts.find(bp => bp.id === editingPost);
          if (!p) return null;
          return (
            <div>
              <button onClick={() => setEditingPost(null)} style={{ ...btnSecondary, marginBottom: 24, fontSize: 13 }}>← {lang === "pt" ? "Voltar" : "Back"}</button>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{lang === "pt" ? "Editar Artigo" : "Edit Post"}</h2>
              <div style={cardStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Título</label><input value={p.titlePt} onChange={e => updatePost(p.id, "titlePt", e.target.value)} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Title</label><input value={p.titleEn} onChange={e => updatePost(p.id, "titleEn", e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Excerto</label><textarea value={p.excerptPt} onChange={e => updatePost(p.id, "excerptPt", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Excerpt</label><textarea value={p.excerptEn} onChange={e => updatePost(p.id, "excerptEn", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Date</label><input type="date" value={p.date} onChange={e => updatePost(p.id, "date", e.target.value)} style={inputStyle} /></div>
                  <div style={{ display: "flex", alignItems: "end" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><input type="checkbox" checked={p.published} onChange={e => updatePost(p.id, "published", e.target.checked)} /> Published</label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={() => setEditingPost(null)} style={btnStyle}>{lang === "pt" ? "Guardar" : "Save"}</button>
                  <button onClick={() => deletePost(p.id)} style={{ ...btnSecondary, color: "#ef4444" }}>{lang === "pt" ? "Eliminar" : "Delete"}</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Testimonials */}
        {tab === "testimonials" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{lang === "pt" ? "Testemunhos" : "Testimonials"}</h2>
            {cms.testimonials.map((t, i) => (
              <div key={t.id} style={cardStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇵🇹 Citação</label><textarea value={t.quotePt} onChange={e => setCms(prev => ({ ...prev, testimonials: prev.testimonials.map((tt, ii) => ii === i ? { ...tt, quotePt: e.target.value } : tt) }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>🇬🇧 Quote</label><textarea value={t.quoteEn} onChange={e => setCms(prev => ({ ...prev, testimonials: prev.testimonials.map((tt, ii) => ii === i ? { ...tt, quoteEn: e.target.value } : tt) }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Author</label><input value={t.author} onChange={e => setCms(prev => ({ ...prev, testimonials: prev.testimonials.map((tt, ii) => ii === i ? { ...tt, author: e.target.value } : tt) }))} style={inputStyle} /></div>
                  <div><label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Role</label><input value={t.role} onChange={e => setCms(prev => ({ ...prev, testimonials: prev.testimonials.map((tt, ii) => ii === i ? { ...tt, role: e.target.value } : tt) }))} style={inputStyle} /></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribers */}
        {tab === "subscribers" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{lang === "pt" ? "Subscritores" : "Subscribers"} ({cms.subscribers.length})</h2>
            {cms.subscribers.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: "#888" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                {lang === "pt" ? "Ainda sem subscritores. Eles vão chegar!" : "No subscribers yet. They'll come!"}
              </div>
            ) : (
              <div style={cardStyle}>
                {cms.subscribers.map((s, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: i < cms.subscribers.length - 1 ? "1px solid #222" : "none", display: "flex", justifyContent: "space-between" }}>
                    <span>{s.email}</span>
                    <span style={{ color: "#888", fontSize: 12 }}>{s.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        {tab === "messages" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{lang === "pt" ? "Mensagens" : "Messages"} ({cms.messages.length})</h2>
            {cms.messages.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: "center", padding: 48, color: "#888" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                {lang === "pt" ? "Nenhuma mensagem recebida." : "No messages received."}
              </div>
            ) : (
              cms.messages.map((m, i) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div><strong>{m.name}</strong> <span style={{ color: "#888" }}>({m.email})</span></div>
                    <span style={{ color: "#888", fontSize: 12 }}>{m.date}</span>
                  </div>
                  <p style={{ color: "#ccc", lineHeight: 1.6, margin: 0 }}>{m.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>{lang === "pt" ? "Definições" : "Settings"}</h2>
            <div style={cardStyle}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>{lang === "pt" ? "Nome do Site" : "Site Title"}</label>
                <input value={cms.siteTitle} onChange={e => setCms(prev => ({ ...prev, siteTitle: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Client Logos ({lang === "pt" ? "separados por vírgula" : "comma separated"})</label>
                <input value={cms.clientLogos.join(", ")} onChange={e => setCms(prev => ({ ...prev, clientLogos: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} style={inputStyle} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={cms.heroEnabled} onChange={e => setCms(prev => ({ ...prev, heroEnabled: e.target.checked }))} />
                <span>{lang === "pt" ? "Secção Hero ativa" : "Hero section enabled"}</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("pt");
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [cms, setCms] = useState(defaultCMSData);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [nlSuccess, setNlSuccess] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const t = translations[lang];

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleAdminLogin = () => {
    if (adminPw === "yellow2025") { setAdminAuth(true); setShowAdmin(true); }
  };

  const handleContact = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const msg = { name: fd.get("name"), email: fd.get("email"), message: fd.get("message"), date: new Date().toLocaleDateString() };
    setCms(prev => ({ ...prev, messages: [...prev.messages, msg] }));
    setContactSuccess(true);
    e.target.reset();
    setTimeout(() => setContactSuccess(false), 3000);
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email");
    if (email) {
      setCms(prev => ({ ...prev, subscribers: [...prev.subscribers, { email, date: new Date().toLocaleDateString() }] }));
      setNlSuccess(true);
      e.target.reset();
      setTimeout(() => setNlSuccess(false), 3000);
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  if (showAdmin && adminAuth) {
    return <AdminPanel cms={cms} setCms={setCms} lang={lang} t={t} onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0d0d0d", color: "#f5f5f0", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #F5C518; color: #111; }
        html { scroll-behavior: smooth; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        a { color: #F5C518; text-decoration: none; transition: opacity 0.2s; }
        a:hover { opacity: 0.8; }
        input:focus, textarea:focus { border-color: #F5C518 !important; outline: none; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "16px 40px",
        background: scrollY > 60 ? "rgba(13,13,13,0.95)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(20px)" : "none",
        borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.4s", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("hero")}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#F5C518" }}>●</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>{cms.siteTitle}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {Object.entries(t.nav).map(([key, label]) => (
            <span key={key} onClick={() => scrollTo(key)} style={{ cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#ccc", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#F5C518"} onMouseLeave={e => e.target.style.color = "#ccc"}>{label}</span>
          ))}
          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            {["pt", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "4px 10px", borderRadius: 6, border: "1px solid", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif",
                background: lang === l ? "#F5C518" : "transparent", color: lang === l ? "#111" : "#888", borderColor: lang === l ? "#F5C518" : "#333"
              }}>{l}</button>
            ))}
          </div>
          <button onClick={() => { if (adminAuth) { setShowAdmin(true); } else { setShowAdmin(!showAdmin); } }} style={{
            padding: "6px 14px", background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 8, color: "#F5C518", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif"
          }}>⚙ Admin</button>
        </div>
      </nav>

      {/* Admin Login Modal */}
      {showAdmin && !adminAuth && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowAdmin(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a1a", borderRadius: 16, padding: 40, width: 360, border: "1px solid #2a2a2a" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 40 }}>🔐</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>{t.admin.title}</h3>
              <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Password: yellow2025</p>
            </div>
            <input type="password" value={adminPw} onChange={e => setAdminPw(e.target.value)} placeholder={t.admin.password}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              style={{ width: "100%", padding: "12px 16px", background: "#111", border: "1px solid #333", borderRadius: 10, color: "#fff", fontSize: 15, marginBottom: 16, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }} />
            <button onClick={handleAdminLogin} style={{ width: "100%", padding: "12px", background: "#F5C518", color: "#111", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{t.admin.login}</button>
          </div>
        </div>
      )}

      {/* HERO */}
      {cms.heroEnabled && (
        <section id="hero" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)", top: "20%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />
          <div style={{ animation: "fadeInUp 1s cubic-bezier(.4,0,.2,1)" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 8, letterSpacing: -2 }}>
              {t.hero.line1}
            </h1>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(48px, 8vw, 96px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
              {t.hero.line2a} <RotatingWord words={t.hero.words} />
            </h1>
          </div>
          <div style={{ marginTop: 48, animation: "fadeInUp 1s 0.3s both cubic-bezier(.4,0,.2,1)" }}>
            <button onClick={() => scrollTo("contact")} style={{
              padding: "16px 40px", background: "#F5C518", color: "#0d0d0d", border: "none", borderRadius: 50, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "transform 0.3s, box-shadow 0.3s", boxShadow: "0 0 0 0 rgba(245,197,24,0)"
            }} onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 0 40px rgba(245,197,24,0.3)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 0 0 0 rgba(245,197,24,0)"; }}>
              {t.hero.cta}
            </button>
          </div>
          <div style={{ position: "absolute", bottom: 40, animation: "pulse 2s infinite" }}>
            <span style={{ fontSize: 24, color: "#666" }}>↓</span>
          </div>
        </section>
      )}

      {/* ABOUT / INTRO */}
      <Section id="about">
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ width: 280, height: 340, borderRadius: 24, background: "linear-gradient(135deg, #F5C518 0%, #e6a800 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, position: "relative", overflow: "hidden" }}>
              <span style={{ position: "relative", zIndex: 1 }}>👩‍💼</span>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)" }} />
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, marginBottom: 20, letterSpacing: -1 }}>{t.intro.title}</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#bbb", marginBottom: 32 }}>{t.intro.text}</p>
            <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
              <div><span style={{ fontSize: 40, fontWeight: 800, color: "#F5C518", fontFamily: "'Playfair Display', serif" }}>+18</span><br /><span style={{ fontSize: 13, color: "#888" }}>{t.intro.years}</span></div>
              <div><span style={{ fontSize: 40, fontWeight: 800, color: "#F5C518", fontFamily: "'Playfair Display', serif" }}>5</span><br /><span style={{ fontSize: 13, color: "#888" }}>{t.intro.coffees}</span></div>
            </div>
            <a href="#" onClick={e => { e.preventDefault(); scrollTo("about"); }} style={{ fontWeight: 600, fontSize: 14, borderBottom: "2px solid #F5C518", paddingBottom: 2 }}>{t.intro.more} →</a>
          </div>
        </div>
      </Section>

      {/* SERVICES */}
      <Section id="services" bg="#111">
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 800, marginBottom: 12, letterSpacing: -1 }}>{t.services.title}</h2>
          <p style={{ color: "#888", fontSize: 17, marginBottom: 60, maxWidth: 600, margin: "0 auto 60px" }}>{t.services.subtitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {t.services.items.map((svc, i) => (
              <div key={i} style={{
                background: "#1a1a1a", borderRadius: 20, padding: 40, border: "1px solid #2a2a2a",
                transition: "transform 0.3s, border-color 0.3s", cursor: "pointer", textAlign: "left"
              }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = "#F5C518"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a2a"; }}>
                <div style={{ fontSize: 14, color: "#F5C518", fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 2 }}>0{i + 1}</div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{svc.name}</h3>
                <p style={{ color: "#999", lineHeight: 1.7, fontSize: 15 }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CLIENTS */}
      <Section id="home" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 3, color: "#666", marginBottom: 30, fontWeight: 600 }}>{t.clients.title}</h3>
          <LogoMarquee logos={cms.clientLogos} />
        </div>
      </Section>

      {/* TESTIMONIAL */}
      <Section bg="linear-gradient(135deg, #F5C518 0%, #e6a800 100%)" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 48, opacity: 0.3 }}>"</span>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, fontStyle: "italic", lineHeight: 1.6, color: "#111", marginBottom: 24 }}>
            {cms.testimonials[0] ? (lang === "pt" ? cms.testimonials[0].quotePt : cms.testimonials[0].quoteEn) : t.testimonial.quote}
          </p>
          <p style={{ fontWeight: 700, color: "#111", fontSize: 15 }}>{cms.testimonials[0]?.author || t.testimonial.author}</p>
          <p style={{ color: "rgba(0,0,0,0.5)", fontSize: 13 }}>{cms.testimonials[0]?.role || t.testimonial.role}</p>
        </div>
      </Section>

      {/* PROJECTS */}
      <Section id="projects" bg="#0d0d0d">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>{t.projects.title}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {cms.projects.filter(p => p.published && p.featured).map((proj, i) => (
              <div key={proj.id} style={{
                borderRadius: 20, overflow: "hidden", background: "#1a1a1a", border: "1px solid #2a2a2a",
                transition: "transform 0.3s, border-color 0.3s", cursor: "pointer"
              }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "#F5C518"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a2a"; }}>
                <div style={{ height: 180, background: `linear-gradient(135deg, hsl(${i * 40 + 45}, 70%, 50%) 0%, hsl(${i * 40 + 75}, 80%, 40%) 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                  {proj.image}
                </div>
                <div style={{ padding: 24 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#F5C518", fontWeight: 600 }}>{proj.category}</span>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginTop: 8, marginBottom: 10 }}>{lang === "pt" ? proj.titlePt : proj.titleEn}</h3>
                  <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6 }}>{lang === "pt" ? proj.descPt : proj.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* BLOG */}
      <Section id="blog" bg="#111">
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, fontWeight: 800, marginBottom: 48, letterSpacing: -1 }}>{t.blog.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {cms.blogPosts.filter(p => p.published).map((post, i) => (
              <div key={post.id} style={{
                borderRadius: 20, padding: 32, background: "#1a1a1a", border: "1px solid #2a2a2a",
                transition: "transform 0.3s, border-color 0.3s", cursor: "pointer", display: "flex", flexDirection: "column"
              }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = "#F5C518"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#2a2a2a"; }}>
                <span style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{post.date}</span>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 12, flex: 1 }}>{lang === "pt" ? post.titlePt : post.titleEn}</h3>
                <p style={{ color: "#888", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{lang === "pt" ? post.excerptPt : post.excerptEn}</p>
                <span style={{ color: "#F5C518", fontWeight: 600, fontSize: 14 }}>{t.blog.readMore} →</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* NEWSLETTER */}
      <Section bg="#0d0d0d" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>{t.newsletter.title}</h3>
          <p style={{ color: "#888", marginBottom: 24, fontSize: 15 }}>{t.newsletter.desc}</p>
          <form onSubmit={handleNewsletter} style={{ display: "flex", gap: 12 }}>
            <input name="email" type="email" required placeholder={t.newsletter.placeholder} style={{
              flex: 1, padding: "14px 18px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none"
            }} />
            <button type="submit" style={{ padding: "14px 28px", background: "#F5C518", color: "#111", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{t.newsletter.btn}</button>
          </form>
          {nlSuccess && <p style={{ color: "#22c55e", marginTop: 12, fontSize: 14 }}>✓ {lang === "pt" ? "Subscrito com sucesso!" : "Subscribed successfully!"}</p>}
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact" bg="#111">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 800, marginBottom: 40, textAlign: "center", letterSpacing: -1 }}>{t.contact.title}</h2>
          <form onSubmit={handleContact} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input name="name" required placeholder={t.contact.name} style={{
              padding: "16px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none"
            }} />
            <input name="email" type="email" required placeholder={t.contact.email} style={{
              padding: "16px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none"
            }} />
            <textarea name="message" required placeholder={t.contact.message} rows={5} style={{
              padding: "16px 18px", background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 12, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none"
            }} />
            <button type="submit" style={{
              padding: "16px", background: "#F5C518", color: "#0d0d0d", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "transform 0.2s"
            }} onMouseEnter={e => e.target.style.transform = "scale(1.02)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>{t.contact.send}</button>
          </form>
          {contactSuccess && <p style={{ color: "#22c55e", textAlign: "center", marginTop: 16 }}>✓ {t.contact.success}</p>}
        </div>
      </Section>

      {/* FOOTER */}
      <footer style={{ padding: "40px 24px", borderTop: "1px solid #1a1a1a", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, fontSize: 14 }}>
          <a href="#">{t.footer.privacy}</a>
          <a href="#">{t.footer.terms}</a>
        </div>
        <p style={{ color: "#666", fontSize: 13 }}>© 2025 {cms.siteTitle}. {t.footer.rights}</p>
      </footer>
    </div>
  );
}
