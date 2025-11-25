import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-primary hover:text-primary/80 no-underline">
          &larr; Back to Binder
        </Link>
        
        <h1 className="text-4xl font-bold text-primary font-serif">Privacy Policy</h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <p><strong>Last Updated:</strong> 2025</p>
          <p>This Privacy Policy applies to FanFicBinder.com, published by Ellie Petal Media.</p>
          
          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">1. Data Processing</h3>
            <p>When you use the "Fetch from URL" feature, the URL is sent to our serverless function solely to retrieve the text. We do not store, log, or retain the content of the stories you download. The EPUB file generation happens locally on your device.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">2. Cookies</h3>
            <p>We use third-party services (Google Analytics, Google AdSense) that use cookies to analyze traffic and serve personalized ads. By using this site, you consent to the use of cookies.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">3. Contact</h3>
            <p>legal@fanficbinder.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
