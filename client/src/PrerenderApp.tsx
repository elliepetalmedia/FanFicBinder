import { Router as WouterRouter, Switch, Route } from "wouter";
import { AppProviders } from "./AppProviders";
import Home from "@/pages/Home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import GuidesHub from "@/pages/guides";
import WebFictionToEpubGuide from "@/pages/guides/web-fiction-to-epub";
import FanfictionToEpubGuide from "@/pages/guides/fanfiction-to-epub";
import WebSerialToEpubGuide from "@/pages/guides/web-serial-to-epub";
import Ao3ToEpubGuide from "@/pages/guides/ao3-to-epub";
import RoyalRoadToEpubGuide from "@/pages/guides/royal-road-to-epub";
import ReaderModeHtmlGuide from "@/pages/guides/reader-mode-html";
import ReadFanfictionOfflineGuide from "@/pages/guides/read-fanfiction-offline";
import SaveWebFictionForEreaderGuide from "@/pages/guides/save-web-fiction-for-ereader";
import SendEpubToKindleGuide from "@/pages/guides/send-epub-to-kindle";
import EpubToEreaderGuide from "@/pages/guides/epub-to-ereader";
import WhenUrlFetchingFailsGuide from "@/pages/guides/when-url-fetching-fails";
import ManualEntryForBlockedSitesGuide from "@/pages/guides/manual-entry-for-blocked-sites";
import ReadablePageRequirementsGuide from "@/pages/guides/readable-page-requirements";

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
          <Route path="/guides" component={GuidesHub} />
          <Route path="/guides/web-fiction-to-epub" component={WebFictionToEpubGuide} />
          <Route path="/guides/fanfiction-to-epub" component={FanfictionToEpubGuide} />
          <Route path="/guides/web-serial-to-epub" component={WebSerialToEpubGuide} />
          <Route path="/guides/ao3-to-epub" component={Ao3ToEpubGuide} />
          <Route path="/guides/royal-road-to-epub" component={RoyalRoadToEpubGuide} />
          <Route path="/guides/reader-mode-html" component={ReaderModeHtmlGuide} />
          <Route path="/guides/read-fanfiction-offline" component={ReadFanfictionOfflineGuide} />
          <Route path="/guides/save-web-fiction-for-ereader" component={SaveWebFictionForEreaderGuide} />
          <Route path="/guides/send-epub-to-kindle" component={SendEpubToKindleGuide} />
          <Route path="/guides/epub-to-ereader" component={EpubToEreaderGuide} />
          <Route path="/guides/when-url-fetching-fails" component={WhenUrlFetchingFailsGuide} />
          <Route path="/guides/manual-entry-for-blocked-sites" component={ManualEntryForBlockedSitesGuide} />
          <Route path="/guides/readable-page-requirements" component={ReadablePageRequirementsGuide} />
        </Switch>
      </WouterRouter>
    </AppProviders>
  );
}
