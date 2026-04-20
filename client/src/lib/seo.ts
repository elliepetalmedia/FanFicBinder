export const SITE_URL = "https://fanficbinder.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

type JsonLd = Record<string, unknown>;

export interface SeoRoute {
  id:
    | "home"
    | "about"
    | "faq"
    | "contact"
    | "privacy"
    | "webFictionToEpub"
    | "readerModeHtml"
    | "epubToEreader";
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

function articleJsonLd(path: string, headline: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: `${SITE_URL}${path}`,
    publisher: organizationJsonLd,
  };
}

function howToJsonLd(
  path: string,
  name: string,
  description: string,
  steps: string[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    mainEntityOfPage: `${SITE_URL}${path}`,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}

const faqItems = [
  {
    question: "How does FanFicBinder work?",
    answer: "FanFicBinder creates EPUB files and Reader Mode HTML from web fiction, fanfiction, and articles. You can fetch readable pages or paste chapters manually, then export an offline file for an e-reader or text-to-speech app.",
  },
  {
    question: "How do I fetch chapters?",
    answer: "Paste a full HTTP or HTTPS URL into the URL Fetcher, choose single chapter or sequence fetching, and review the binder queue as chapters are added.",
  },
  {
    question: "What is Reader Mode?",
    answer: "Reader Mode generates a clean single-file HTML version of your binder for text-to-speech tools such as Edge Read Aloud, Safari Listen to Page, Speechify, and Voice Dream Reader.",
  },
  {
    question: "What if URL fetching fails?",
    answer: "Some sites block automated fetching. If a URL cannot be read, copy the chapter text from your browser and add it with Manual Entry.",
  },
  {
    question: "Can I change the font or layout?",
    answer: "Yes. Formatting options let you choose a font style, line spacing, and optional drop caps for the EPUB export.",
  },
  {
    question: "How do I move the EPUB to an e-reader?",
    answer: "Download the EPUB, then transfer it through the method your device supports, such as Send to Kindle, USB transfer, Apple Books, Files, AirDrop, or a reading app import flow.",
  },
  {
    question: "Is my content private and secure?",
    answer: "EPUB and Reader Mode HTML generation happens on your device. The proxy is used only to fetch URLs you request and the app does not store your binder content.",
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
  webFictionToEpub: {
    id: "webFictionToEpub",
    path: "/guides/web-fiction-to-epub",
    title: "How to Turn Web Fiction into EPUB Files - FanFicBinder",
    description: "Learn how to convert web fiction, fanfiction, and readable articles into EPUB files for offline reading and e-readers.",
    changefreq: "monthly",
    priority: "0.7",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/web-fiction-to-epub",
        "How to Turn Web Fiction into EPUB Files",
        "A practical workflow for saving long stories, fanfiction, and readable articles as clean EPUB files.",
      ),
      howToJsonLd(
        "/guides/web-fiction-to-epub",
        "Turn web fiction into an EPUB",
        "Build a clean EPUB from readable web fiction or manually pasted chapters.",
        [
          "Open the chapter or article in your browser and confirm the text is readable.",
          "Fetch the URL in FanFicBinder or paste the text with Manual Entry.",
          "Add chapters in reading order and set book metadata.",
          "Choose EPUB and download the finished file.",
        ],
      ),
    ],
  },
  readerModeHtml: {
    id: "readerModeHtml",
    path: "/guides/reader-mode-html",
    title: "Reader Mode HTML for Text-to-Speech - FanFicBinder",
    description: "Use Reader Mode HTML for browser read-aloud tools, screen readers, speech apps, and offline listening workflows.",
    changefreq: "monthly",
    priority: "0.7",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/reader-mode-html",
        "Reader Mode HTML for Text-to-Speech",
        "A guide to exporting clean HTML for read-aloud tools, speech apps, and offline listening.",
      ),
      howToJsonLd(
        "/guides/reader-mode-html",
        "Create Reader Mode HTML for text-to-speech",
        "Export a clean HTML file from your binder for browser read-aloud tools and speech apps.",
        [
          "Add chapters with URL Fetcher or Manual Entry.",
          "Choose Reader Mode as the output format.",
          "Download the HTML file.",
          "Open the file in a browser or import it into a speech app.",
        ],
      ),
    ],
  },
  epubToEreader: {
    id: "epubToEreader",
    path: "/guides/epub-to-ereader",
    title: "How to Move an EPUB to an E-reader - FanFicBinder",
    description: "Move exported EPUB files to Kindle, Kobo, Apple Books, Nook, and other e-reader apps or devices.",
    changefreq: "monthly",
    priority: "0.7",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/epub-to-ereader",
        "How to Move an EPUB to an E-reader",
        "Transfer exported EPUB files to Kindle, Kobo, Apple Books, Nook, and other reading apps.",
      ),
      howToJsonLd(
        "/guides/epub-to-ereader",
        "Move an EPUB to an e-reader",
        "Transfer a downloaded EPUB file to the reading device or app you use.",
        [
          "Download the EPUB from FanFicBinder.",
          "Choose the transfer method for your device, such as Send to Kindle, USB, Files, or AirDrop.",
          "Open the file in your e-reader library or reading app.",
          "Regenerate with simpler formatting if your reader has display issues.",
        ],
      ),
    ],
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
