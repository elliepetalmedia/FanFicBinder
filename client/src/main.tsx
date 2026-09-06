import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;

async function preloadCurrentRoute(pathname: string) {
  // Normalize so "/guides/" matches "/guides". Query strings never reach here.
  const path = pathname.replace(/\/+$/, "") || "/";
  switch (path) {
    case "/about":
      await import("@/pages/about");
      break;
    case "/contact":
      await import("@/pages/contact");
      break;
    case "/privacy":
      await import("@/pages/privacy");
      break;
    case "/faq":
      await import("@/pages/faq");
      break;
    case "/guides":
      await import("@/pages/guides");
      break;
    case "/guides/web-fiction-to-epub":
      await import("@/pages/guides/web-fiction-to-epub");
      break;
    case "/guides/fanfiction-to-epub":
      await import("@/pages/guides/fanfiction-to-epub");
      break;
    case "/guides/web-serial-to-epub":
      await import("@/pages/guides/web-serial-to-epub");
      break;
    case "/guides/ao3-to-epub":
      await import("@/pages/guides/ao3-to-epub");
      break;
    case "/guides/royal-road-to-epub":
      await import("@/pages/guides/royal-road-to-epub");
      break;
    case "/guides/reader-mode-html":
      await import("@/pages/guides/reader-mode-html");
      break;
    case "/guides/read-fanfiction-offline":
      await import("@/pages/guides/read-fanfiction-offline");
      break;
    case "/guides/save-web-fiction-for-ereader":
      await import("@/pages/guides/save-web-fiction-for-ereader");
      break;
    case "/guides/send-epub-to-kindle":
      await import("@/pages/guides/send-epub-to-kindle");
      break;
    case "/guides/epub-to-ereader":
      await import("@/pages/guides/epub-to-ereader");
      break;
    case "/guides/when-url-fetching-fails":
      await import("@/pages/guides/when-url-fetching-fails");
      break;
    case "/guides/manual-entry-for-blocked-sites":
      await import("@/pages/guides/manual-entry-for-blocked-sites");
      break;
    case "/guides/readable-page-requirements":
      await import("@/pages/guides/readable-page-requirements");
      break;
  }
}

if (!root.hasChildNodes()) {
  createRoot(root).render(<App />);
} else {
  preloadCurrentRoute(window.location.pathname)
    .finally(() => {
      hydrateRoot(root, <App />);
    });
}
