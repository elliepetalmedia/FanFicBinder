import { Link } from "wouter";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-primary hover:text-primary/80 no-underline">
          &larr; Back to Binder
        </Link>
        
        <h1 className="text-4xl font-bold text-primary font-serif">Contact Us</h1>
        
        <div className="space-y-6 text-lg leading-relaxed">
          <div>
            <p className="font-bold">Publisher:</p>
            <p>Ellie Petal Media</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Support Policy</h3>
            <p>This tool is provided as-is. We cannot provide technical support for specific e-reader compatibility issues.</p>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2 text-foreground">Business Inquiries</h3>
            <p>For advertising and legal matters, please contact: <strong>legal@fanficbinder.com</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
