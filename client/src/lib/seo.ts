export const SITE_URL = "https://fanficbinder.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph.jpg`;
export const SUPPORT_EMAIL = "legal@fanficbinder.com";

type JsonLd = Record<string, unknown>;

export interface SeoRoute {
  id: string;
  path: string;
  navLabel: string;
  breadcrumbLabel: string;
  title: string;
  description: string;
  llmSummary: string;
  changefreq: "weekly" | "monthly" | "yearly";
  lastModified: string;
  priority: string;
  ogType: "website" | "article";
  twitterCard: "summary" | "summary_large_image";
  jsonLd?: JsonLd | JsonLd[];
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Ellie Petal Media",
  url: SITE_URL,
  email: SUPPORT_EMAIL,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "FanFicBinder",
  url: SITE_URL,
  description: "Convert web fiction, fanfiction, and readable articles into EPUB or Reader Mode HTML files for offline reading.",
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/guides?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FanFicBinder",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  url: SITE_URL,
  description: "Create EPUB files and Reader Mode HTML for offline reading, e-readers, and text-to-speech workflows.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  featureList: [
    "Fetch readable web fiction chapters by URL",
    "Manual chapter entry for blocked or unsupported sites",
    "EPUB export for offline reading and e-readers",
    "Reader Mode HTML export for text-to-speech workflows",
    "Sequence fetching for chapter-by-chapter navigation",
  ],
};

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "FanFicBinder",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "All",
  url: SITE_URL,
  description: "A privacy-minded browser tool for converting web fiction, fanfiction, and articles into EPUB or Reader Mode HTML files.",
  browserRequirements: "Requires a modern browser with JavaScript enabled.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
};

function articleJsonLd(path: string, headline: string, description: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    mainEntityOfPage: `${SITE_URL}${path}`,
    author: {
      "@id": `${SITE_URL}/#organization`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
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
    navLabel: "Home",
    breadcrumbLabel: "Home",
    title: "FanFicBinder - Web Fiction, Fanfiction, and Article to EPUB Converter",
    description: "Convert web fiction, fanfiction, and readable articles into EPUB or Reader Mode HTML for offline reading, e-readers, and text-to-speech.",
    llmSummary: "Homepage and primary tool for turning readable web pages or pasted chapters into EPUB or Reader Mode HTML files.",
    changefreq: "weekly",
    lastModified: "2026-05-22",
    priority: "1.0",
    ogType: "website",
    twitterCard: "summary_large_image",
    jsonLd: [websiteJsonLd, webApplicationJsonLd, softwareApplicationJsonLd],
  },
  guidesHub: {
    id: "guidesHub",
    path: "/guides",
    navLabel: "Guides",
    breadcrumbLabel: "Guides",
    title: "FanFicBinder Guides - EPUB, Reader Mode, Offline Reading, and Troubleshooting",
    description: "Browse FanFicBinder guides for fanfiction to EPUB, web serial workflows, Reader Mode HTML, offline reading, e-reader transfers, and blocked fetch troubleshooting.",
    llmSummary: "Guide hub covering conversion workflows, device transfer steps, and troubleshooting for blocked or unsupported source pages.",
    changefreq: "weekly",
    lastModified: "2026-05-22",
    priority: "0.95",
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  about: {
    id: "about",
    path: "/about",
    navLabel: "About",
    breadcrumbLabel: "About",
    title: "About FanFicBinder - Offline Reading Tool",
    description: "Learn about FanFicBinder, a privacy-minded web fiction to EPUB and Reader Mode HTML utility from Ellie Petal Media.",
    llmSummary: "Background page describing what FanFicBinder is for, who publishes it, and how the browser-based workflow handles user content.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.8",
    ogType: "article",
    twitterCard: "summary_large_image",
  },
  faq: {
    id: "faq",
    path: "/faq",
    navLabel: "FAQ",
    breadcrumbLabel: "FAQ",
    title: "FanFicBinder FAQ - EPUB, Reader Mode, URL Fetching, and Offline Reading",
    description: "Answers about converting web fiction to EPUB, using Reader Mode HTML, manual entry, privacy, and e-reader workflows.",
    llmSummary: "FAQ page answering common questions about conversion, privacy, manual entry, device transfer, and supported workflows.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.85",
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
    navLabel: "Contact",
    breadcrumbLabel: "Contact",
    title: "Contact FanFicBinder",
    description: "Contact Ellie Petal Media about FanFicBinder, business inquiries, advertising, or legal matters.",
    llmSummary: "Publisher contact information for business, legal, and site feedback inquiries.",
    changefreq: "yearly",
    lastModified: "2026-05-22",
    priority: "0.5",
    ogType: "article",
    twitterCard: "summary_large_image",
  },
  privacy: {
    id: "privacy",
    path: "/privacy",
    navLabel: "Privacy",
    breadcrumbLabel: "Privacy",
    title: "Privacy Policy - FanFicBinder",
    description: "Read how FanFicBinder handles URL fetching, local EPUB generation, analytics, ads, cookies, and user content privacy.",
    llmSummary: "Privacy page describing local generation, URL fetching behavior, and analytics or advertising disclosures.",
    changefreq: "yearly",
    lastModified: "2026-05-22",
    priority: "0.5",
    ogType: "article",
    twitterCard: "summary_large_image",
  },
  webFictionToEpub: {
    id: "webFictionToEpub",
    path: "/guides/web-fiction-to-epub",
    navLabel: "Web Fiction to EPUB",
    breadcrumbLabel: "Web Fiction to EPUB",
    title: "How to Turn Web Fiction into EPUB Files - FanFicBinder",
    description: "Learn how to convert web fiction, fanfiction, and readable articles into EPUB files for offline reading and e-readers.",
    llmSummary: "Step-by-step guide for building an EPUB from readable web fiction pages or manually pasted chapters.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.8",
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
  fanfictionToEpub: {
    id: "fanfictionToEpub",
    path: "/guides/fanfiction-to-epub",
    navLabel: "Fanfiction to EPUB",
    breadcrumbLabel: "Fanfiction to EPUB",
    title: "How to Convert Fanfiction to EPUB - FanFicBinder",
    description: "Convert fanfiction into EPUB files for Kindle, Kobo, Apple Books, and offline reading, with manual-entry fallback when a site blocks fetching.",
    llmSummary: "Answer page for fanfiction to EPUB workflows, including URL fetching, manual entry fallback, and device transfer.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.82",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/fanfiction-to-epub",
        "How to Convert Fanfiction to EPUB",
        "A practical guide for turning fanfiction chapters into EPUB files for offline reading and e-readers.",
      ),
      howToJsonLd(
        "/guides/fanfiction-to-epub",
        "Convert fanfiction to EPUB",
        "Use FanFicBinder to create an EPUB from readable fanfiction pages or manually copied chapters.",
        [
          "Open a readable fanfiction chapter in your browser.",
          "Fetch the URL in FanFicBinder or paste the text manually.",
          "Repeat for each chapter in order.",
          "Choose EPUB and download the file for your reading app or device.",
        ],
      ),
    ],
  },
  webSerialToEpub: {
    id: "webSerialToEpub",
    path: "/guides/web-serial-to-epub",
    navLabel: "Web Serial to EPUB",
    breadcrumbLabel: "Web Serial to EPUB",
    title: "How to Convert a Web Serial to EPUB - FanFicBinder",
    description: "Save a web serial as EPUB by fetching readable chapters in order, using sequence detection when it works, and switching to manual entry when it does not.",
    llmSummary: "Guide focused on chapter-by-chapter web serial workflows, sequence fetching, and predictable EPUB assembly.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.8",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/web-serial-to-epub",
        "How to Convert a Web Serial to EPUB",
        "Save long-running web serial chapters into one EPUB without relying on a source-specific integration.",
      ),
      howToJsonLd(
        "/guides/web-serial-to-epub",
        "Convert a web serial to EPUB",
        "Collect web serial chapters in reading order and export them as an EPUB.",
        [
          "Start from a readable chapter page.",
          "Use URL Fetcher and enable sequence fetching if the site exposes next-chapter links.",
          "Stop and switch to manual entry if the next page fails or the site rate-limits.",
          "Export the finished binder as EPUB.",
        ],
      ),
    ],
  },
  ao3ToEpub: {
    id: "ao3ToEpub",
    path: "/guides/ao3-to-epub",
    navLabel: "AO3 to EPUB",
    breadcrumbLabel: "AO3 to EPUB",
    title: "AO3 to EPUB Workflow - FanFicBinder",
    description: "Import a public AO3 work with chapter preview into FanFicBinder, then export it as an EPUB for offline reading and e-readers.",
    llmSummary: "AO3-specific guidance for whole-work import with chapter preview, chapter ordering, and EPUB export for public works.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.78",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/ao3-to-epub",
        "AO3 to EPUB Workflow",
        "Import a public AO3 work with chapter preview and export it as EPUB for offline reading.",
      ),
      howToJsonLd(
        "/guides/ao3-to-epub",
        "Create an EPUB from an AO3 work",
        "Import a public AO3 work into FanFicBinder and export it as EPUB.",
        [
          "Open a public AO3 work or chapter page in your browser.",
          "Paste the work or chapter URL into FanFicBinder.",
          "Preview the detected title, author, and chapter list, then import all chapters in order.",
          "Export the binder as EPUB when the chapter list is complete.",
        ],
      ),
    ],
  },
  royalRoadToEpub: {
    id: "royalRoadToEpub",
    path: "/guides/royal-road-to-epub",
    navLabel: "Royal Road to EPUB",
    breadcrumbLabel: "Royal Road to EPUB",
    title: "Royal Road to EPUB Workflow - FanFicBinder",
    description: "Create an EPUB from readable Royal Road chapters with FanFicBinder, using sequence fetching when chapter navigation is exposed cleanly.",
    llmSummary: "Royal Road-specific guidance for sequence-friendly chapter fetching and EPUB export.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.78",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/royal-road-to-epub",
        "Royal Road to EPUB Workflow",
        "Export Royal Road chapters into a single EPUB when readable chapter pages and navigation are available.",
      ),
      howToJsonLd(
        "/guides/royal-road-to-epub",
        "Create an EPUB from Royal Road pages",
        "Fetch Royal Road chapters in order and export them as a single EPUB.",
        [
          "Open a readable Royal Road chapter in your browser.",
          "Paste the chapter URL into FanFicBinder.",
          "Use sequence fetching if the next chapter link is detected cleanly.",
          "Export the binder as EPUB and transfer it to your reading app or device.",
        ],
      ),
    ],
  },
  readerModeHtml: {
    id: "readerModeHtml",
    path: "/guides/reader-mode-html",
    navLabel: "Reader Mode HTML",
    breadcrumbLabel: "Reader Mode HTML",
    title: "Reader Mode HTML for Text-to-Speech - FanFicBinder",
    description: "Use Reader Mode HTML for browser read-aloud tools, screen readers, speech apps, and offline listening workflows.",
    llmSummary: "Guide explaining when Reader Mode HTML is better than EPUB for browser read-aloud tools and speech apps.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.8",
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
  readFanfictionOffline: {
    id: "readFanfictionOffline",
    path: "/guides/read-fanfiction-offline",
    navLabel: "Read Fanfiction Offline",
    breadcrumbLabel: "Read Fanfiction Offline",
    title: "How to Read Fanfiction Offline - FanFicBinder",
    description: "Turn fanfiction chapters into EPUB or Reader Mode HTML so you can read or listen offline on Kindle, Kobo, Apple Books, or a browser.",
    llmSummary: "Answer page for offline fanfiction reading, covering EPUB and Reader Mode export choices.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.76",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/read-fanfiction-offline",
        "How to Read Fanfiction Offline",
        "Save fanfiction into portable files so you can read or listen without staying inside a browser tab.",
      ),
      howToJsonLd(
        "/guides/read-fanfiction-offline",
        "Read fanfiction offline",
        "Create an offline file from fanfiction chapters and open it in your preferred reading app or device.",
        [
          "Add the chapters you want to keep in order.",
          "Choose EPUB for e-readers or Reader Mode HTML for browser read-aloud tools.",
          "Download the file.",
          "Transfer the file to the device or app you use for reading or listening.",
        ],
      ),
    ],
  },
  saveWebFictionForEreader: {
    id: "saveWebFictionForEreader",
    path: "/guides/save-web-fiction-for-ereader",
    navLabel: "Save Web Fiction for E-reader",
    breadcrumbLabel: "Save Web Fiction for E-reader",
    title: "Best Way to Save Web Fiction for an E-reader - FanFicBinder",
    description: "Save web fiction for Kindle, Kobo, Apple Books, or another e-reader by building a clean EPUB with readable chapter text and predictable metadata.",
    llmSummary: "Guide focused on choosing EPUB settings and transfer workflows that work well on dedicated e-readers.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.76",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/save-web-fiction-for-ereader",
        "Best Way to Save Web Fiction for an E-reader",
        "Build an EPUB that works well on dedicated e-readers instead of relying on open browser tabs.",
      ),
      howToJsonLd(
        "/guides/save-web-fiction-for-ereader",
        "Save web fiction for an e-reader",
        "Create an EPUB from readable web fiction chapters and transfer it to your reading device.",
        [
          "Collect readable chapters in FanFicBinder.",
          "Set a clear title, author, and optional cover image.",
          "Download the EPUB.",
          "Transfer the EPUB to your e-reader using the method your device supports.",
        ],
      ),
    ],
  },
  sendEpubToKindle: {
    id: "sendEpubToKindle",
    path: "/guides/send-epub-to-kindle",
    navLabel: "Send EPUB to Kindle",
    breadcrumbLabel: "Send EPUB to Kindle",
    title: "How to Send an EPUB to Kindle - FanFicBinder",
    description: "After exporting from FanFicBinder, send an EPUB to Kindle with Amazon's approved Send to Kindle workflows.",
    llmSummary: "Kindle transfer guide focused on Send to Kindle delivery after EPUB export.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.75",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/send-epub-to-kindle",
        "How to Send an EPUB to Kindle",
        "Use Amazon's approved Send to Kindle flow after exporting an EPUB from FanFicBinder.",
      ),
      howToJsonLd(
        "/guides/send-epub-to-kindle",
        "Send an EPUB to Kindle",
        "Export an EPUB and deliver it with Amazon's Send to Kindle workflow.",
        [
          "Download the EPUB from FanFicBinder.",
          "Open Amazon's Send to Kindle app, web uploader, or approved email workflow.",
          "Upload the EPUB and wait for Amazon to convert it.",
          "Open the delivered book from your Kindle library.",
        ],
      ),
    ],
  },
  epubToEreader: {
    id: "epubToEreader",
    path: "/guides/epub-to-ereader",
    navLabel: "EPUB to E-reader",
    breadcrumbLabel: "EPUB to E-reader",
    title: "How to Move an EPUB to an E-reader - FanFicBinder",
    description: "Move exported EPUB files to Kindle, Kobo, Apple Books, Nook, and other e-reader apps or devices.",
    llmSummary: "Device-transfer guide covering Kindle, Kobo, Apple Books, and other EPUB reading workflows.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.78",
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
  fetchBlocked: {
    id: "fetchBlocked",
    path: "/guides/when-url-fetching-fails",
    navLabel: "When URL Fetching Fails",
    breadcrumbLabel: "When URL Fetching Fails",
    title: "What to Do When URL Fetching Fails - FanFicBinder",
    description: "Troubleshoot blocked or failed chapter fetching by checking readability, switching to manual entry, and avoiding unsupported or rate-limited pages.",
    llmSummary: "Troubleshooting page for blocked fetches, unsupported source pages, rate limits, and manual fallback guidance.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.77",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/when-url-fetching-fails",
        "What to Do When URL Fetching Fails",
        "Troubleshoot failed URL fetching and switch to predictable fallbacks when a source blocks automation.",
      ),
      howToJsonLd(
        "/guides/when-url-fetching-fails",
        "Recover when URL fetching fails",
        "Check the source page, then switch to the least fragile fallback if the fetch does not work.",
        [
          "Confirm the page is a readable public HTML page.",
          "Retry from a single chapter instead of a long sequence.",
          "Stop if the source rate-limits or blocks automated fetching.",
          "Use Manual Entry for the blocked chapter text.",
        ],
      ),
    ],
  },
  manualEntry: {
    id: "manualEntry",
    path: "/guides/manual-entry-for-blocked-sites",
    navLabel: "Manual Entry Workflow",
    breadcrumbLabel: "Manual Entry Workflow",
    title: "Manual Entry Workflow for Blocked Sites - FanFicBinder",
    description: "Use Manual Entry when a source website blocks automated fetching or when a chapter page does not expose clean readable HTML.",
    llmSummary: "Fallback workflow for blocked sites that still lets users build EPUB or Reader Mode files from copied chapter text.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.75",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/manual-entry-for-blocked-sites",
        "Manual Entry Workflow for Blocked Sites",
        "Use copied chapter text to keep building your binder when a website blocks automated fetching.",
      ),
      howToJsonLd(
        "/guides/manual-entry-for-blocked-sites",
        "Use manual entry for blocked sites",
        "Copy chapter text into FanFicBinder and continue your binder even when a website blocks fetch automation.",
        [
          "Open the chapter in your browser.",
          "Copy the readable story text.",
          "Paste the text into FanFicBinder Manual Entry with a clear chapter title.",
          "Repeat for the next chapters and export when finished.",
        ],
      ),
    ],
  },
  readablePageRequirements: {
    id: "readablePageRequirements",
    path: "/guides/readable-page-requirements",
    navLabel: "Readable Page Requirements",
    breadcrumbLabel: "Readable Page Requirements",
    title: "What Makes a Page Readable for FanFicBinder - FanFicBinder",
    description: "Learn which kinds of chapter pages work best with FanFicBinder and why app shells, login walls, and non-HTML responses often fail.",
    llmSummary: "Explains the characteristics of pages that the tool can extract reliably and why some sources fail.",
    changefreq: "monthly",
    lastModified: "2026-05-22",
    priority: "0.74",
    ogType: "article",
    twitterCard: "summary_large_image",
    jsonLd: [
      articleJsonLd(
        "/guides/readable-page-requirements",
        "What Makes a Page Readable for FanFicBinder",
        "Understand which source pages are easiest to extract cleanly and when manual entry is the better workflow.",
      ),
      howToJsonLd(
        "/guides/readable-page-requirements",
        "Check whether a page is readable",
        "Use a quick checklist to decide whether a source page is likely to work with URL fetching.",
        [
          "Open the page in a normal browser tab.",
          "Confirm the chapter text is visible without a private login wall or app shell.",
          "Check that the page is standard HTML rather than a download, API response, or image gallery.",
          "Use manual entry if the story text is not exposed cleanly.",
        ],
      ),
    ],
  },
} satisfies Record<string, SeoRoute>;

export const seoRouteList = Object.values(seoRoutes);
export const guideRouteList = seoRouteList.filter((route) => route.path.startsWith("/guides/"));
export const publicGuideRouteList = [
  seoRoutes.webFictionToEpub,
  seoRoutes.fanfictionToEpub,
  seoRoutes.webSerialToEpub,
  seoRoutes.ao3ToEpub,
  seoRoutes.royalRoadToEpub,
  seoRoutes.readerModeHtml,
  seoRoutes.readFanfictionOffline,
  seoRoutes.saveWebFictionForEreader,
  seoRoutes.sendEpubToKindle,
  seoRoutes.epubToEreader,
  seoRoutes.fetchBlocked,
  seoRoutes.manualEntry,
  seoRoutes.readablePageRequirements,
];

export function getCanonicalUrl(route: SeoRoute): string {
  return route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
}

function buildBreadcrumbJsonLd(route: SeoRoute): JsonLd | null {
  if (route.path === "/") {
    return null;
  }

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: seoRoutes.home.breadcrumbLabel,
      item: getCanonicalUrl(seoRoutes.home),
    },
  ];

  if (route.path.startsWith("/guides/")) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: seoRoutes.guidesHub.breadcrumbLabel,
      item: getCanonicalUrl(seoRoutes.guidesHub),
    });
    items.push({
      "@type": "ListItem",
      position: 3,
      name: route.breadcrumbLabel,
      item: getCanonicalUrl(route),
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: route.breadcrumbLabel,
      item: getCanonicalUrl(route),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function buildWebPageJsonLd(route: SeoRoute): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": route.id === seoRoutes.guidesHub.id ? "CollectionPage" : "WebPage",
    name: route.navLabel,
    url: getCanonicalUrl(route),
    description: route.description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    dateModified: route.lastModified,
  };
}

function buildGuidesHubJsonLd(): JsonLd[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: publicGuideRouteList.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(route),
        name: route.navLabel,
      })),
    },
  ];
}

export function getSeoJsonLd(route: SeoRoute): JsonLd[] {
  const normalized = route.jsonLd
    ? (Array.isArray(route.jsonLd) ? route.jsonLd : [route.jsonLd])
    : [];
  const derived = [buildWebPageJsonLd(route), organizationJsonLd];
  const breadcrumb = buildBreadcrumbJsonLd(route);

  if (breadcrumb) {
    derived.push(breadcrumb);
  }

  if (route.id === seoRoutes.guidesHub.id) {
    derived.push(...buildGuidesHubJsonLd());
  }

  return [...derived, ...normalized];
}

export function buildSitemapXml(): string {
  const urls = seoRouteList
    .map((route) => `  <url>
    <loc>${getCanonicalUrl(route)}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobotsTxt(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
LLM-Guide: ${SITE_URL}/llms.txt
LLM-Guide-Full: ${SITE_URL}/llms-full.txt
`;
}

export function buildLlmsTxt(): string {
  const featuredRoutes = [
    seoRoutes.home,
    seoRoutes.guidesHub,
    seoRoutes.faq,
    seoRoutes.webFictionToEpub,
    seoRoutes.readerModeHtml,
    seoRoutes.epubToEreader,
    seoRoutes.fetchBlocked,
  ];

  return [
    "# FanFicBinder",
    "",
    `Site: ${SITE_URL}`,
    "Purpose: Browser-based tool for turning readable web fiction, fanfiction, and article pages into EPUB or Reader Mode HTML files.",
    "",
    "Core capabilities:",
    "- Fetch readable public HTML chapter pages by URL.",
    "- Fall back to Manual Entry when a source blocks automated fetching.",
    "- Export EPUB for offline reading and e-readers.",
    "- Export Reader Mode HTML for browser read-aloud tools and speech apps.",
    "",
    "Important constraints:",
    "- The tool works best on readable public HTML pages.",
    "- Some sites block automated fetching or rate-limit sequences.",
    "- Private, internal, unsupported, non-HTML, or oversized responses are rejected.",
    "",
    "Preferred citation pages:",
    ...featuredRoutes.map((route) => `- ${route.navLabel}: ${getCanonicalUrl(route)} - ${route.llmSummary}`),
    "",
  ].join("\n");
}

export function buildLlmsFullTxt(): string {
  const routeLines = seoRouteList.map((route) => `- ${route.navLabel}: ${getCanonicalUrl(route)} - ${route.llmSummary}`);
  const faqLines = faqItems.map((item) => `- ${item.question} ${item.answer}`);

  return [
    "# FanFicBinder Full Guide",
    "",
    `Canonical site: ${SITE_URL}`,
    "Publisher: Ellie Petal Media",
    `Contact: ${SUPPORT_EMAIL}`,
    "",
    "Summary:",
    "FanFicBinder is a browser-based utility for collecting readable web fiction, fanfiction, and article chapters into EPUB or Reader Mode HTML files. It is designed for offline reading, e-readers, and text-to-speech workflows. Manual Entry is the fallback when a source blocks automated fetching.",
    "",
    "Capabilities:",
    "- URL Fetcher for readable public chapter pages.",
    "- Sequence fetching when a source exposes a clear next-chapter link.",
    "- Manual Entry for copied chapter text.",
    "- EPUB export with title, author, cover, font, spacing, and drop-cap options.",
    "- Reader Mode HTML export for Edge Read Aloud, Safari Listen to Page, Speechify, and similar tools.",
    "",
    "Constraints:",
    "- Works best on public readable HTML pages.",
    "- Does not promise support for every source website or app shell.",
    "- When automated fetching fails, the recommended fallback is Manual Entry rather than a brittle workaround.",
    "",
    "Indexable routes:",
    ...routeLines,
    "",
    "FAQ highlights:",
    ...faqLines,
    "",
    "Most useful pages for citation:",
    `- Tool overview: ${getCanonicalUrl(seoRoutes.home)}`,
    `- Guide hub: ${getCanonicalUrl(seoRoutes.guidesHub)}`,
    `- EPUB workflow: ${getCanonicalUrl(seoRoutes.webFictionToEpub)}`,
    `- Reader Mode workflow: ${getCanonicalUrl(seoRoutes.readerModeHtml)}`,
    `- Troubleshooting fetch failures: ${getCanonicalUrl(seoRoutes.fetchBlocked)}`,
    "",
  ].join("\n");
}
