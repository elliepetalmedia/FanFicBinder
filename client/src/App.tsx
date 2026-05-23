import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { AppProviders } from "./AppProviders";
import Home from "@/pages/Home";

const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const FAQ = lazy(() => import("@/pages/faq"));
const GuidesHub = lazy(() => import("@/pages/guides"));
const WebFictionToEpubGuide = lazy(() => import("@/pages/guides/web-fiction-to-epub"));
const FanfictionToEpubGuide = lazy(() => import("@/pages/guides/fanfiction-to-epub"));
const WebSerialToEpubGuide = lazy(() => import("@/pages/guides/web-serial-to-epub"));
const Ao3ToEpubGuide = lazy(() => import("@/pages/guides/ao3-to-epub"));
const RoyalRoadToEpubGuide = lazy(() => import("@/pages/guides/royal-road-to-epub"));
const ReaderModeHtmlGuide = lazy(() => import("@/pages/guides/reader-mode-html"));
const ReadFanfictionOfflineGuide = lazy(() => import("@/pages/guides/read-fanfiction-offline"));
const SaveWebFictionForEreaderGuide = lazy(() => import("@/pages/guides/save-web-fiction-for-ereader"));
const SendEpubToKindleGuide = lazy(() => import("@/pages/guides/send-epub-to-kindle"));
const EpubToEreaderGuide = lazy(() => import("@/pages/guides/epub-to-ereader"));
const WhenUrlFetchingFailsGuide = lazy(() => import("@/pages/guides/when-url-fetching-fails"));
const ManualEntryForBlockedSitesGuide = lazy(() => import("@/pages/guides/manual-entry-for-blocked-sites"));
const ReadablePageRequirementsGuide = lazy(() => import("@/pages/guides/readable-page-requirements"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  );
}

function Router() {
  return (
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProviders>
      <Suspense fallback={<RouteFallback />}>
        <Router />
      </Suspense>
    </AppProviders>
  );
}

export default App;
