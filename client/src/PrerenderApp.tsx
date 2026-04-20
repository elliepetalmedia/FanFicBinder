import { Router as WouterRouter, Switch, Route } from "wouter";
import { AppProviders } from "./AppProviders";
import Home from "@/pages/Home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import WebFictionToEpubGuide from "@/pages/guides/web-fiction-to-epub";
import ReaderModeHtmlGuide from "@/pages/guides/reader-mode-html";
import EpubToEreaderGuide from "@/pages/guides/epub-to-ereader";

export function PrerenderApp({ path }: { path: string }) {
  return (
    <AppProviders>
      <WouterRouter ssrPath={path}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/faq" component={FAQ} />
          <Route path="/guides/web-fiction-to-epub" component={WebFictionToEpubGuide} />
          <Route path="/guides/reader-mode-html" component={ReaderModeHtmlGuide} />
          <Route path="/guides/epub-to-ereader" component={EpubToEreaderGuide} />
        </Switch>
      </WouterRouter>
    </AppProviders>
  );
}
