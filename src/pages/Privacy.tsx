import { PublicPageLayout } from "@/components/PublicPageLayout";

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Last updated: August 14, 2026
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground font-sans">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              1. Information We Collect
            </h2>
            <p>
              Duely collects information necessary to provide invoice creation, status tracking, and automated reminder workflows. This includes your account name, email address, business profile details, client contact information entered by you, invoice metadata, line items, and payment status records.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              2. How We Use Information
            </h2>
            <p>
              We use your information exclusively to operate the Duely workspace, render live invoice previews, draft and send automated reminder communications over Email and WhatsApp on your behalf, maintain your ledger history, and ensure application reliability and security.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              3. Third-Party Services
            </h2>
            <p>
              Duely integrates with trusted infrastructure providers to deliver services safely:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong className="text-foreground">Supabase:</strong> Provides secure user authentication, database persistence, edge functions, and file storage.</li>
              <li><strong className="text-foreground">Resend:</strong> Handles transactional email delivery for invoices and payment follow-ups.</li>
              <li><strong className="text-foreground">Twilio:</strong> Powers WhatsApp reminder message delivery where configured.</li>
              <li><strong className="text-foreground">Anthropic / AI Providers:</strong> Powers AI-assisted prompt parsing and custom reminder tone generation.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              4. Data Retention
            </h2>
            <p>
              We retain account and invoice records for as long as your account remains active to provide ongoing ledger tracking, reporting, and automated chasing.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              5. User Rights
            </h2>
            <p>
              You have the right to access, export, or request the deletion of your account and invoice data at any time by contacting our support team or updating your profile settings.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              6. Cookies &amp; Local Storage
            </h2>
            <p>
              Duely uses browser local storage (`localStorage`) to remember your preferred visual theme (Light or Dark mode). We do not use third-party advertising or cross-site tracking cookies.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              7. Security
            </h2>
            <p>
              We implement industry-standard encryption, Row Level Security (RLS) policies, and HTTPS encryption to safeguard your data against unauthorized access.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect service improvements. Material changes will be communicated appropriately on our website.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              9. Contact
            </h2>
            <p>
              For privacy-related inquiries, please reach out via our contact page.
            </p>
          </section>

          {/* Subtle Legal Notice */}
          <div className="pt-6 border-t border-border/60">
            <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
              Legal notice: This Privacy Policy is a templated starting point for an early-stage product and is not formal legal advice. It should be reviewed and adapted by a qualified privacy lawyer prior to Duely's public commercial launch.
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
