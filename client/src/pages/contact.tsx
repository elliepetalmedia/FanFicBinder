import { Link } from "wouter";
import { PublicPageShell, PublicSection } from "@/components/public/PublicPageShell";
import { useSEO } from "@/hooks/useSEO";
import { seoRoutes } from "@/lib/seo";

export default function Contact() {
  useSEO(seoRoutes.contact);

  return (
    <PublicPageShell
      eyebrow="Contact"
      title="Contact FanFicBinder"
      description="Contact Ellie Petal Media about FanFicBinder, legal matters, advertising, or site feedback."
    >
      <PublicSection title="Publisher">
        <p>
          FanFicBinder is published by <strong>Ellie Petal Media</strong>.
        </p>
      </PublicSection>

      <PublicSection title="Business and legal inquiries">
        <p>
          For advertising, business, or legal matters, contact <strong>legal@fanficbinder.com</strong>.
        </p>
        <p>
          Please include the page URL, the issue you are reporting, and any relevant context.
        </p>
      </PublicSection>

      <PublicSection title="Support policy">
        <p>
          FanFicBinder is provided as a free utility. We cannot provide individual troubleshooting for every e-reader, source website, or speech app, but the <Link href="/faq" className="text-primary hover:text-primary/80">FAQ</Link> and guides cover the common workflows.
        </p>
      </PublicSection>
    </PublicPageShell>
  );
}
