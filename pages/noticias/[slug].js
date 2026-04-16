import Link from "next/link";
import Head from "next/head";
import { PortableText } from "@portabletext/react";
import ConstellationCanvasAH from "../../components/ConstellationCanvasAH";
import { getNoticias, getNoticia } from "../../lib/sanity";

const ptComponents = {
  types: {
    image: ({ value }) => (
      <img
        src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET || "production"}/${value.asset._ref.replace("image-", "").replace(/-(\w+)$/, ".$1")}`}
        alt=""
        className="blog-content-img"
      />
    ),
  },
};

export default function NoticiaPage({ noticia }) {
  if (!noticia) {
    return (
      <div className="ahv4-page" style={{ padding: "120px 32px", textAlign: "center" }}>
        <p>Artigo não encontrado.</p>
        <Link href="/noticias">← Voltar ao blog</Link>
      </div>
    );
  }

  const pageTitle = `${noticia.titulo} | Algoritmo Humano`;
  const pageDesc = noticia.resumo || `${noticia.titulo} — artigo do blog Algoritmo Humano.`;
  const pageImage = noticia.imagemUrl || "https://neogeneralista.pt/algoritmo-humano-logo-cor.png";
  const pageUrl = `https://neogeneralista.pt/noticias/${noticia.slug?.current}`;

  return (
    <div className="ahv4-page">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={pageImage} />
        <meta property="og:url" content={pageUrl} />
        {noticia.dataPublicacao && <meta property="article:published_time" content={noticia.dataPublicacao} />}
        {noticia.autor && <meta property="article:author" content={noticia.autor} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={pageImage} />
      </Head>
      <ConstellationCanvasAH />

      {/* Nav */}
      <header className="ev-nav">
        <div className="ev-nav-inner">
          <Link href="/noticias" className="ev-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Blog
          </Link>
          <Link href="/algoritmo-humano" className="ev-nav-logo-link">
            <img src="/algoritmo-humano-logo-cor.png" alt="AlgoritmoHumano" className="ev-nav-logo" />
          </Link>
        </div>
      </header>

      <main className="blog-main">
        <article className="blog-article">
          {/* Hero */}
          {noticia.imagemUrl && (
            <div className="blog-article-hero">
              <img src={noticia.imagemUrl} alt={noticia.titulo} className="blog-article-hero-img" />
            </div>
          )}

          <div className="blog-article-container">
            <div className="blog-article-header">
              {noticia.categoria && <span className="blog-chip">{noticia.categoria}</span>}
              <h1 className="blog-article-title">{noticia.titulo}</h1>
              <div className="blog-meta blog-meta--article">
                {noticia.autor && <span>{noticia.autor}</span>}
                {noticia.dataPublicacao && (
                  <span>{new Date(noticia.dataPublicacao).toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" })}</span>
                )}
              </div>
            </div>

            {noticia.conteudo && (
              <div className="blog-article-body">
                <PortableText value={noticia.conteudo} components={ptComponents} />
              </div>
            )}

            <div className="blog-article-footer">
              <Link href="/noticias" className="blog-back-link">← Ver todos os artigos</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  let noticias = [];
  try { noticias = await getNoticias() ?? []; } catch {}
  return {
    paths: noticias.map((n) => ({ params: { slug: n.slug?.current ?? "" } })).filter((p) => p.params.slug),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  let noticia = null;
  try { noticia = await getNoticia(params.slug); } catch {}
  if (!noticia) return { notFound: true };
  return { props: { noticia }, revalidate: 60 };
}
