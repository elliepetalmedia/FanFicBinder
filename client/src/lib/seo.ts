export const SITE_URL = "https://fanficbinder.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

type JsonLd = Record<string, unknown>;

export interface SeoRoute {
  id: "home" | "about" | "faq" | "contact" | "privacy";
  path: string;
  title: string;
  description: string;
  changefreq: "weekly" | "monthly" | "yearly";
  priority: string;
  ogType: "website" | "article";
  twitterCard: "summary" | "summary_large_image";
  jsonLd?: JsonLd | JsonLd[];
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ellie Petal Media",
  url: SITE_URL,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FanFicBinder",
  url: SITE_URL,
};

const faqItems = [
  {
    question: "How does FanFicBinder work?",
    answer: "FanFicBinder creates EPUB files and reader mode HTML from web fiction, fanfiction, and articles. You can fetch readable pages or paste chapters manually, then export an offline file for an e-reader or text-to-speech app.",
  },
  {
    question: "What is Reader Mode?",
    answer: "Reader Mode generates a clean single-file HTML version of your binder for text-to-speech tools such as browser read-aloud features and speech apps.",
  },
  {
    question: "What if URL fetching fails?",
    answer: "Some sites block automated fetching. If a URL cannot be read, copy the chapter text from your browser and add it with Manual Entry.",
  },
  {
    question: "Is my content private and secure?",
    answer: "EPUB and reader mode generation happens on your device. The proxy is used only to fetch URLs you request and the app does not store your binder content.",
  },
];

export const seoRoutes = {
  home: {
    id: "home",
    path: "/",
    title: "FanFicBinder - Web Fiction to EPUB Converter",
    description: "Convert web fiction, fanfiction, and articles into EPUB or reader mode HTML for offline reading, e-readers, and text-to-speech.",
    changefreq: "weekly",
    priority: "1.0",
    ogType: "website",
    twitterCard: "summary_large_image",
    jsonLd: [
      websiteJsonLd,
      organizationJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "FanFicBinder",
        url: SITE_URL,
        description: "A privacy-minded browser tool for converting web fiction, fanfiction, and articles into EPUB or reader mode HTML files.",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "FanFicBinder",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        description: "Create EPUB files and reader mode HTML for offline reading, e-readers, and text-to-speech workflows.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  },
  about: {
    id: "about",
    path: "/about",
    title: "About FanFicBinder - Offline Reading Tool",
    description: "Learn about FanFicBinder, a privacy-minded web fiction to EPUB and reader mode HTML utility from Ellie Petal Media.",
    changefreq: "monthly",
    priority: "0.8",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [websiteJsonLd, organizationJsonLd],
  },
  faq: {
    id: "faq",
    path: "/faq",
    title: "FanFicBinder FAQ - EPUB, Reader Mode, and Offline Reading",
    description: "Answers about converting web fiction to EPUB, using reader mode HTML, manual entry, privacy, and e-reader workflows.",
    changefreq: "monthly",
    priority: "0.8",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  },
  contact: {
    id: "contact",
    path: "/contact",
    title: "Contact FanFicBinder",
    description: "Contact Ellie Petal Media about FanFicBinder, business inquiries, advertising, or legal matters.",
    changefreq: "yearly",
    priority: "0.5",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: organizationJsonLd,
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    title: "Privacy Policy - FanFicBinder",
    description: "Read how FanFicBinder handles URL fetching, local EPUB generation, analytics, ads, cookies, and user content privacy.",
    changefreq: "yearly",
    priority: "0.5",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: organizationJsonLd,
  },
} satisfies Record<string, SeoRoute>;

export const seoRouteList = Object.values(seoRoutes);

export function getCanonicalUrl(route: SeoRoute): string {
  return route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
}

export function getSeoJsonLd(route: SeoRoute): JsonLd[] {
  if (!route.jsonLd) return [];
  return Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd];
}

export function buildSitemapXml(): string {
  const urls = seoRouteList.map((route) => `  <url>
    <loc>${getCanonicalUrl(route)}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
