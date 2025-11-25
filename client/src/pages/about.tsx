import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-primary hover:text-primary/80 no-underline">
          &larr; Back to Binder
        </Link>
        
        <h1 className="text-4xl font-bold text-primary font-serif">About FanFicBinder</h1>
        
        <div className="space-y-4 text-lg leading-relaxed">
          <p>
            FanFicBinder.com is a digital utility project published by <strong>Ellie Petal Media</strong>.
          </p>
          <p>
            We are readers and writers who love the fanfiction community. We built this tool because we wanted a reliable, private way to move stories from the web to our e-readers without installing sketchy software. Our tool runs primarily in your browser, using a lightweight serverless function only to fetch the text you request.
          </p>
        </div>
      </div>
    </div>
  );
}
