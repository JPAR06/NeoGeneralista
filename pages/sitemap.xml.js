import { getNoticias } from "../lib/sanity";

const SITE_URL = "https://neogeneralista.pt";

function generateSitemap(noticias) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/algoritmo-humano</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/noticias</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/politica-de-privacidade</loc>
    <changefreq>yearly</changefreq>
    <priority>0.2</priority>
  </url>
${noticias
  .filter((n) => n.slug?.current)
  .map(
    (n) => `  <url>
    <loc>${SITE_URL}/noticias/${n.slug.current}</loc>
    <lastmod>${n.dataPublicacao ? new Date(n.dataPublicacao).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  let noticias = [];
  try {
    noticias = (await getNoticias()) ?? [];
  } catch {}

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
  res.write(generateSitemap(noticias));
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
