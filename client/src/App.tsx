import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { AppProviders } from "./AppProviders";
import Home from "@/pages/Home";

const NotFound = lazy(() => import("@/pages/not-found"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const FAQ = lazy(() => import("@/pages/faq"));

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
