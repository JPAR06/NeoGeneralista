import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import '../styles/globals.css';

const SITE_URL = "https://neogeneralista.pt";

const SEO = {
  neo: {
    title: "NeoGeneralista — Inovação, Tecnologia e Pessoas | Ana Azevedo",
    description: "O NeoGeneralista nasce do cruzamento entre inovação, tecnologia e pessoas. Consultoria, formação e reflexão sobre o futuro do trabalho e das organizações, por Ana Azevedo.",
    image: "/neogeneralista-logo-cor.png",
    favicon: "/favicon.jpg",
  },
  ah: {
    title: "Algoritmo Humano — Conversas sobre IA e Humanidade | Porto",
    description: "Evento mensal no Porto sobre a interseção entre humanos e inteligência artificial. Conversas abertas, oradores convidados e uma comunidade curiosa.",
    image: "/algoritmo-humano-logo-cor.png",
    favicon: "/algoritmo-humano-logo-cor.png",
  },
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const isAlgoritmoHumano = router.pathname.startsWith("/algoritmo-humano");
  const isBlog = router.pathname.startsWith("/noticias");
  const seo = (isAlgoritmoHumano || isBlog) ? SEO.ah : SEO.neo;
  const canonicalUrl = `${SITE_URL}${router.asPath.split("?")[0]}`;

  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href={seo.favicon} />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:image" content={`${SITE_URL}${seo.image}`} />
        <meta property="og:locale" content="pt_PT" />
        <meta property="og:site_name" content="NeoGeneralista" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={`${SITE_URL}${seo.image}`} />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
