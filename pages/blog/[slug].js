import Link from "next/link";
import Head from "next/head";
import { PortableText } from "@portabletext/react";
import ConstellationCanvas from "../../components/ConstellationCanvas";
import { getNoticias, getNoticia } from "../../lib/sanity";
import { makePtComponents } from "../../lib/portableText";

const ptComponents = makePtComponents("ngb-content-img");

export default function NgPostPage({ noticia }) {
  if (!noticia) {
    return (
      <div className="ngb-page" style={{ padding: "120px 32px", textAlign: "center" }}>
        <p>Artigo não encontrado.</p>
        <Link href="/blog" className="ngb-back-link">← Voltar ao blog</Link>
      </div>
    );
  }

  const pageTitle = `${noticia.titulo} | NeoGeneralista`;
  const pageDesc = noticia.resumo || `${noticia.titulo} — artigo do blog NeoGeneralista.`;
  const pageImage = noticia.imagemUrl || "https://neogeneralista.pt/neogeneralista-logo-cor.png";
  const pageUrl = `https://neogeneralista.pt/blog/${noticia.slug?.current}`;

  return (
    <div className="ngb-page">
      <ConstellationCanvas />
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

      <header className="ngb-nav">
        <div className="ngb-nav-inner">
          <Link href="/" className="ngb-nav-brand" aria-label="NeoGeneralista">
            <img src="/neogeneralista-logo-header.png" alt="NeoGeneralista" />
          </Link>
          <Link href="/blog" className="ngb-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Blog
          </Link>
        </div>
      </header>

      <main className="ngb-main">
        <article className="ngb-article">
          {noticia.imagemUrl && (
            <div className="ngb-article-hero">
              <img src={noticia.imagemUrl} alt={noticia.titulo} className="ngb-article-hero-img" />
            </div>
          )}

          <div className="ngb-article-container">
            <div className="ngb-article-header">
              {noticia.categoria && <span className="ngb-chip">{noticia.categoria}</span>}
              <h1 className="ngb-article-title">{noticia.titulo}</h1>
              <div className="ngb-meta ngb-meta--article">
                {noticia.autor && <span>{noticia.autor}</span>}
                {noticia.dataPublicacao && (
                  <span>{new Date(noticia.dataPublicacao).toLocaleDateString("pt-PT", { year: "numeric", month: "long", day: "numeric" })}</span>
                )}
              </div>
            </div>

            {noticia.conteudo && (
              <div className="ngb-article-body">
                <PortableText value={noticia.conteudo} components={ptComponents} />
              </div>
            )}

            <div className="ngb-article-footer">
              <Link href="/blog" className="ngb-back-link">← Ver todos os artigos</Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  let noticias = [];
  try { noticias = (await getNoticias("neogeneralista")) ?? []; } catch {}
  return {
    paths: noticias.map((n) => ({ params: { slug: n.slug?.current ?? "" } })).filter((p) => p.params.slug),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  let noticia = null;
  try { noticia = await getNoticia(params.slug, "neogeneralista"); } catch {}
  if (!noticia) return { notFound: true };
  return { props: { noticia }, revalidate: 60 };
}
