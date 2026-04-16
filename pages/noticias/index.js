import Link from "next/link";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";
import { getNoticias } from "../../lib/sanity";

export default function NoticiasPage({ noticias }) {
  const featured = noticias.find((n) => n.destaque) || noticias[0];
  const rest = noticias.filter((n) => n !== featured);

  return (
    <div className="ahv4-page">
      <ConstellationCanvasAH />

      {/* Nav */}
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

      <main className="blog-main">
        <div className="blog-container">
          <div className="blog-header">
            <h1 className="blog-title">Blog</h1>
            <p className="blog-subtitle">Artigos, notícias e reflexões sobre IA e humanidade.</p>
          </div>

          {noticias.length === 0 ? (
            <div className="ahv4-empty-state">
              <p className="ahv4-empty-title">Em breve</p>
              <p className="ahv4-empty-sub">Estamos a preparar os primeiros artigos.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link href={`/noticias/${featured.slug?.current}`} className="blog-featured">
                  {featured.imagemUrl && (
                    <img src={featured.imagemUrl} alt={featured.titulo} className="blog-featured-img" />
                  )}
                  <div className="blog-featured-body">
                    {featured.categoria && <span className="blog-chip">{featured.categoria}</span>}
                    <h2 className="blog-featured-title">{featured.titulo}</h2>
                    {featured.resumo && <p className="blog-featured-resumo">{featured.resumo}</p>}
                    <div className="blog-meta">
                      {featured.autor && <span>{featured.autor}</span>}
                      {featured.dataPublicacao && (
                        <span>{new Date(featured.dataPublicacao).toLocaleDateString("pt-PT")}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="blog-grid">
                  {rest.map((n) => (
                    <Link key={n.slug?.current} href={`/noticias/${n.slug?.current}`} className="blog-card">
                      {n.imagemUrl ? (
                        <img src={n.imagemUrl} alt={n.titulo} className="blog-card-img" />
                      ) : (
                        <div className="blog-card-img blog-card-img--placeholder" />
                      )}
                      <div className="blog-card-body">
                        {n.categoria && <span className="blog-chip blog-chip--sm">{n.categoria}</span>}
                        <h3 className="blog-card-title">{n.titulo}</h3>
                        {n.resumo && <p className="blog-card-resumo">{n.resumo}</p>}
                        <div className="blog-meta">
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
  try { noticias = await getNoticias() ?? []; } catch {}
  return { props: { noticias }, revalidate: 60 };
}
