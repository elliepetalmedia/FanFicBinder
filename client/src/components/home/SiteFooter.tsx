import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
        <p>&copy; 2025 Ellie Petal Media. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/guides/web-fiction-to-epub" className="hover:text-primary transition-colors">Guides</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
      </div>
    </footer>
  );
}
