import { Link } from "wouter";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function FAQ() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <a className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                Back
              </a>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-serif text-foreground">
            Frequently Asked Questions
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          {/* How It Works */}
          <section className="space-y-3">
            <h2 className="text-2xl font-bold font-serif text-foreground">How does FanFicBinder work?</h2>
            <p className="text-foreground/90 leading-relaxed">
              FanFicBinder lets you create EPUB files (e-book format) from web content. Everything happens locally in your browser—your content never gets uploaded anywhere. You can add chapters by fetching from URLs or manually pasting text, customize your book with a title, author, and cover image, then download the finished EPUB to read on any e-reader.
            </p>
          </section>

          {/* Fetching URLs */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">How do I fetch chapters?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                1. <strong>Single Chapter:</strong> Paste the URL and click "Fetch Chapter".
              </p>
              <p>
                2. <strong>Multiple Chapters (Sequence):</strong> Check the "Try to fetch following chapters automatically" box. We'll grab the first chapter, look for a "Next" link, and keep going until we hit a limit or the end.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Note: Sequence fetching adds a polite 1.5-second delay between requests to respect the source site's servers. It works best on AO3 and RoyalRoad.
              </p>
            </div>
          </section>

          {/* Formatting */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">Can I change the font or layout?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                Yes! Click the "Formatting Options" accordion to reveal settings for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Font:</strong> Choose Serif (Merriweather), Sans-Serif, or Dyslexic-Friendly.</li>
                <li><strong>Spacing:</strong> Adjust line height for comfortable reading.</li>
                <li><strong>Drop Caps:</strong> Add a stylish large letter to the start of each chapter.</li>
              </ul>
              <p>
                These settings are baked into the EPUB css, so they should work on most e-readers.
              </p>
            </div>
          </section>

          {/* Audiobook */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">What is Audiobook Mode?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                Instead of an EPUB, you can download a single HTML file designed for listening.
              </p>
              <p>
                Open this file in any browser (Safari on iPhone or Chrome on Android recommended). It uses your device's built-in "Premium" text-to-speech voices to read the story to you.
              </p>
              <p>
                It features auto-scrolling, speed control, and it remembers your progress even if you close the browser.
              </p>
            </div>
          </section>

          {/* Manual Entry */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">How do I add a chapter manually?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                1. Click the "Manual" tab in the "Add Content" section.
              </p>
              <p>
                2. Click "Add Custom Chapter".
              </p>
              <p>
                3. Enter a chapter title (e.g., "Chapter 1: The Beginning").
              </p>
              <p>
                4. Paste or type the chapter content in the text area.
              </p>
              <p>
                5. Click "Save Chapter" to add it to your binder.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Manual Entry is perfect for sites that block fetching or when you want to paste content from anywhere.
              </p>
            </div>
          </section>

          {/* Adding Metadata */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">How do I customize my book?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                <strong>Book Title:</strong> Enter your book's title (e.g., "My Favorite Fanfic"). This appears on the cover and in e-reader info.
              </p>
              <p>
                <strong>Author:</strong> Enter the author name (e.g., "Jane Doe" or "Various Authors" for compilations).
              </p>
              <p>
                <strong>Cover Image:</strong> Upload a cover image by clicking the "Upload Cover" area. It will display on your e-reader. Supported formats: JPG, PNG, etc.
              </p>
              <p className="text-sm text-muted-foreground italic">
                All customization is optional. If you don't set these, defaults will be used.
              </p>
            </div>
          </section>

          {/* Publishing */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">How do I download and publish my EPUB?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                1. Add all your chapters using either the URL Fetcher or Manual Entry.
              </p>
              <p>
                2. Customize the book metadata (title, author, cover) if desired.
              </p>
              <p>
                3. Click the "Download EPUB" button at the bottom right of the Binder Queue (or the sticky button on mobile).
              </p>
              <p>
                4. Your EPUB file will download to your device.
              </p>
              <p>
                5. Transfer the file to your e-reader via USB, email, or your e-reader's companion app (Kindle, Apple Books, Kobo, etc.).
              </p>
              <p className="text-sm text-muted-foreground italic">
                The entire process is client-side, so your EPUB is created directly on your device—no upload required.
              </p>
            </div>
          </section>

          {/* Troubleshooting */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">What if URL fetching fails?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                <strong>First, try again:</strong> Network hiccups happen. Retry the fetch—it often works on the second or third attempt.
              </p>
              <p>
                <strong>Some sites block fetching:</strong> Sites like Wattpad actively block automated tools. For these, manually copy the text and use the Manual Entry method.
              </p>
              <p>
                <strong>Use Manual Entry as a fallback:</strong> If fetching doesn't work after a few tries, open the page in your browser, select and copy the text, then paste it using Manual Entry.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Manual Entry always works since you're providing the content directly.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-foreground">Is my content private and secure?</h3>
            <div className="space-y-2 text-foreground/90">
              <p>
                Yes. Everything happens 100% on your device. Your content is never uploaded to any server, shared with anyone, or stored anywhere. Only you have access to your EPUB files. For more details, see our <Link href="/privacy"><a className="text-primary hover:text-primary/80">Privacy Policy</a></Link>.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Ellie Petal Media. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
