import { PublicPageLayout } from "@/components/PublicPageLayout";

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <div className="space-y-6 text-left">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-foreground">
            Terms of Use
          </h1>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Last updated: August 14, 2026
          </p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-muted-foreground font-sans">
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Duely application, website, and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, you must discontinue your use of Duely immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              2. Description of Service
            </h2>
            <p>
              Duely provides tools for independent professionals, freelancers, and businesses to create, manage, and send invoices, track payment statuses, automate payment reminders via Email and WhatsApp, and generate downloadable PDF invoices.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              3. User Responsibilities
            </h2>
            <p>
              You are responsible for maintaining accurate business and client information, reviewing all invoice details prior to issuance, ensuring your invoicing practices comply with local laws and tax obligations, and ensuring that all automated reminder communications sent on your behalf are respectful and lawful.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              4. Accounts &amp; Data
            </h2>
            <p>
              You are responsible for keeping your account credentials secure. Duely stores invoice, client, and business profile data to provide the service as described in our Privacy Policy.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              5. Payment &amp; Reminder Disclaimer
            </h2>
            <p>
              Duely automates invoice follow-up communication on your behalf. Duely does not guarantee that a client will respond, settle an invoice, or make a payment by any specific date. You remain solely responsible for the accuracy of invoice amounts and debt collection outcomes.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Duely and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service or client payment disputes.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              7. Changes to These Terms
            </h2>
            <p>
              We reserve the right to update or modify these Terms of Use at any time. Continued use of Duely after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-bold text-foreground font-sans">
              8. Contact
            </h2>
            <p>
              If you have questions regarding these terms, please contact us through our dedicated contact page.
            </p>
          </section>

          {/* Subtle Legal Notice */}
          <div className="pt-6 border-t border-border/60">
            <p className="text-[11px] text-muted-foreground/70 italic leading-relaxed">
              Legal notice: These Terms of Use are a templated starting point for an early-stage product and do not constitute formal legal advice. They should be reviewed and adapted by a qualified lawyer prior to Duely's public commercial launch.
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
