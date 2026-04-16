import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt">
      <Head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://neogeneralista.pt/#organization",
                  name: "NeoGeneralista",
                  url: "https://neogeneralista.pt",
                  logo: "https://neogeneralista.pt/neogeneralista-logo-cor.png",
                  description: "Inovação, tecnologia e pessoas. Consultoria, formação e reflexão sobre o futuro do trabalho e das organizações.",
                  founder: {
                    "@type": "Person",
                    name: "Ana Azevedo",
                    jobTitle: "Consultora, Formadora e Professora Universitária",
                    url: "https://www.linkedin.com/in/aiazevedo",
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "ana@neogeneralista.pt",
                    contactType: "general",
                  },
                  sameAs: [
                    "https://www.linkedin.com/in/aiazevedo",
                    "https://www.instagram.com/aiazevedo",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://neogeneralista.pt/#website",
                  url: "https://neogeneralista.pt",
                  name: "NeoGeneralista",
                  publisher: { "@id": "https://neogeneralista.pt/#organization" },
                  inLanguage: "pt-PT",
                },
                {
                  "@type": "Event",
                  name: "Algoritmo Humano",
                  description: "Conversas mensais sobre a interseção entre humanos e inteligência artificial.",
                  url: "https://neogeneralista.pt/algoritmo-humano",
                  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                  location: { "@type": "Place", name: "Porto, Portugal" },
                  organizer: { "@id": "https://neogeneralista.pt/#organization" },
                  eventSchedule: {
                    "@type": "Schedule",
                    repeatFrequency: "P1M",
                  },
                },
              ],
            }),
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
