import Link from "next/link";
import Head from "next/head";
import ConstellationCanvasAH from "../../../components/ConstellationCanvasAH";
import { getNoticias } from "../../../lib/sanity";

export default function AhBlogIndex({ noticias }) {
  const featured = noticias.find((n) => n.destaque) || noticias[0];
  const rest = noticias.filter((n) => n !== featured);

  return (
    <div className="ahv4-page">
      <Head>
        <title>Blog | AlgoritmoHumano</title>
        <meta name="description" content="Artigos, notícias e reflexões sobre IA e humanidade." />
        <link rel="canonical" href="https://neogeneralista.pt/algoritmo-humano/blog" />
        <meta property="og:title" content="Blog | AlgoritmoHumano" />
        <meta property="og:description" content="Artigos, notícias e reflexões sobre IA e humanidade." />
        <meta property="og:url" content="https://neogeneralista.pt/algoritmo-humano/blog" />
      </Head>
      <ConstellationCanvasAH />

      <header className="ev-nav">
        <div className="ev-nav-inner">
          <Link href="/algoritmo-humano" className="ev-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            AlgoritmoHumano
          </Link>
          <Link href="/algoritmo-humano" className="ev-nav-logo-link">
            <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ev-nav-logo" />
          </Link>
        </div>
      </header>

      <main className="ahb-main">
        <div className="ahb-container">
          <div className="ahb-header">
            <p className="ahb-eyebrow">Blog</p>
            <h1 className="ahb-title">Sobre IA, humanos, e tudo no meio.</h1>
            <p className="ahb-subtitle">Artigos das nossas conversas, ensaios dos convidados, reflexões da comunidade.</p>
          </div>

          {noticias.length === 0 ? (
            <div className="ahb-empty">
              <p className="ahb-empty-title">Em breve.</p>
              <p className="ahb-empty-sub">Os primeiros artigos chegam depois das próximas edições.</p>
            </div>
          ) : (
            <>
              {featured && (
                <Link href={`/algoritmo-humano/blog/${featured.slug?.current}`} className="ahb-featured">
                  {featured.imagemUrl && (
                    <img src={featured.imagemUrl} alt={featured.titulo} className="ahb-featured-img" loading="eager" />
                  )}
                  <div className="ahb-featured-body">
                    {featured.categoria && <span className="ahb-chip">{featured.categoria}</span>}
                    <h2 className="ahb-featured-title">{featured.titulo}</h2>
                    {featured.resumo && <p className="ahb-featured-resumo">{featured.resumo}</p>}
                    <div className="ahb-meta">
                      {featured.autor && <span>{featured.autor}</span>}
                      {featured.dataPublicacao && (
                        <span>{new Date(featured.dataPublicacao).toLocaleDateString("pt-PT")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="ahb-grid">
                  {rest.map((n) => (
                    <Link key={n.slug?.current} href={`/algoritmo-humano/blog/${n.slug?.current}`} className="ahb-card">
                      {n.imagemUrl ? (
                        <img src={n.imagemUrl} alt={n.titulo} className="ahb-card-img" loading="lazy" />
                      ) : (
                        <div className="ahb-card-img ahb-card-img--placeholder" />
                      )}
                      <div className="ahb-card-body">
                        {n.categoria && <span className="ahb-chip ahb-chip--sm">{n.categoria}</span>}
                        <h3 className="ahb-card-title">{n.titulo}</h3>
                        {n.resumo && <p className="ahb-card-resumo">{n.resumo}</p>}
                        <div className="ahb-meta">
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
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  let noticias = [];
  try { noticias = (await getNoticias("algoritmohumano")) ?? []; } catch {}
  return { props: { noticias }, revalidate: 60 };
}
