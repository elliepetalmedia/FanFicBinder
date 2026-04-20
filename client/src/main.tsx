import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const root = document.getElementById("root")!;

async function preloadCurrentRoute(pathname: string) {
  switch (pathname) {
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
