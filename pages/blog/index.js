import Link from "next/link";
import Head from "next/head";
import ConstellationCanvas from "../../components/ConstellationCanvas";
import { getNoticias } from "../../lib/sanity";

export default function NgBlogIndex({ noticias }) {
  const featured = noticias.find((n) => n.destaque) || noticias[0];
  const rest = noticias.filter((n) => n !== featured);

  return (
    <div className="ngb-page">
      <ConstellationCanvas />
      <Head>
        <title>Blog | NeoGeneralista</title>
        <meta name="description" content="Artigos, notícias e reflexões do NeoGeneralista." />
        <link rel="canonical" href="https://neogeneralista.pt/blog" />
        <meta property="og:title" content="Blog | NeoGeneralista" />
        <meta property="og:description" content="Artigos, notícias e reflexões do NeoGeneralista." />
        <meta property="og:url" content="https://neogeneralista.pt/blog" />
      </Head>

      <header className="ngb-nav">
        <div className="ngb-nav-inner">
          <Link href="/" className="ngb-nav-brand" aria-label="NeoGeneralista">
            <img src="/neogeneralista-logo-header.png" alt="NeoGeneralista" />
          </Link>
          <Link href="/" className="ngb-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Voltar
          </Link>
        </div>
      </header>

      <section className="ngb-hero">
        <div className="ngb-hero-inner">
          <p className="ngb-eyebrow">Blog</p>
          <h1 className="ngb-title">
            Pensar, ligar,<br /><span className="ngb-title-accent">explorar</span>.
          </h1>
          <p className="ngb-subtitle">
            Artigos, notícias e reflexões sobre o futuro do trabalho, das organizações e das pessoas que nelas vivem.
          </p>
        </div>
      </section>

      <main className="ngb-main">
        {noticias.length === 0 ? (
          <div className="ngb-empty">
            <p className="ngb-empty-title">Em breve.</p>
            <p className="ngb-empty-sub">Estamos a preparar os primeiros artigos.</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/blog/${featured.slug?.current}`} className="ngb-featured">
                {featured.imagemUrl && (
                  <img src={featured.imagemUrl} alt={featured.titulo} className="ngb-featured-img" loading="eager" />
                )}
                <div className="ngb-featured-body">
                  {featured.categoria && <span className="ngb-chip">{featured.categoria}</span>}
                  <h2 className="ngb-featured-title">{featured.titulo}</h2>
                  {featured.resumo && <p className="ngb-featured-resumo">{featured.resumo}</p>}
                  <div className="ngb-meta">
                    {featured.autor && <span>{featured.autor}</span>}
                    {featured.dataPublicacao && (
                      <span>{new Date(featured.dataPublicacao).toLocaleDateString("pt-PT")}</span>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="ngb-grid">
                {rest.map((n) => (
                  <Link key={n.slug?.current} href={`/blog/${n.slug?.current}`} className="ngb-card">
                    {n.imagemUrl ? (
                      <img src={n.imagemUrl} alt={n.titulo} className="ngb-card-img" loading="lazy" />
                    ) : (
                      <div className="ngb-card-img ngb-card-img--placeholder" />
                    )}
                    <div className="ngb-card-body">
                      {n.categoria && <span className="ngb-chip ngb-chip--sm">{n.categoria}</span>}
                      <h3 className="ngb-card-title">{n.titulo}</h3>
                      {n.resumo && <p className="ngb-card-resumo">{n.resumo}</p>}
                      <div className="ngb-meta">
                        {n.autor && <span>{n.autor}</span>}
                        {n.dataPublicacao && (
                          <span>{new Date(n.dataPublicacao).toLocaleDateString("pt-PT")}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  let noticias = [];
  try { noticias = (await getNoticias("neogeneralista")) ?? []; } catch {}
  return { props: { noticias }, revalidate: 60 };
}
