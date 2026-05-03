import { MarketingFooter, MarketingTopbar } from "../MarketingShell";

export const metadata = {
  title: "Privacy Policy",
  description: "How Hearthline collects, processes, and protects customer and call data.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Hearthline · Privacy Policy",
    description: "How Hearthline collects, processes, and protects customer and call data.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  const updated = "October 1, 2026";
  return (
    <>
      <MarketingTopbar />
      <main>
        <section className="shell legal-shell">
          <header className="legal-head">
            <p className="legal-eyebrow">Legal</p>
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-meta">Last updated {updated}</p>
          </header>

          <article className="legal-doc">
            <p>
              This Privacy Policy explains how Hearthline ("we", "our", "us") collects, uses,
              and protects information when you use our hosted product, our website, or any
              integrations we provide. We are committed to handling your data and your
              customers' data responsibly.
            </p>

            <h2>1. Information we collect</h2>
            <ul>
              <li>
                <strong>Account information.</strong> Business name, contact email,
                phone number, billing address, and the names and emails of users you
                invite to the dashboard.
              </li>
              <li>
                <strong>Customer interactions.</strong> Call audio, transcripts, SMS / chat
                messages, photos uploaded for quoting, and any structured data Anna extracts
                (name, phone, address, project description, estimated value).
              </li>
              <li>
                <strong>Usage data.</strong> Anonymous logs of how you use the dashboard
                (pages visited, actions taken) to improve the product.
              </li>
              <li>
                <strong>Integration data.</strong> When you connect a CRM, calendar, or
                payment provider we receive only the scopes you grant.
              </li>
            </ul>

            <h2>2. How we use it</h2>
            <ul>
              <li>To answer calls, qualify leads, draft quotes, and book jobs on your behalf.</li>
              <li>To sync structured data into the CRMs and tools you connect.</li>
              <li>To bill you accurately (per-minute call usage, monthly platform fee).</li>
              <li>To detect abuse, debug issues, and improve the platform.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your data. We do <strong>not</strong> use your
              customer interactions to train our underlying AI models.
            </p>

            <h2>3. Subprocessors</h2>
            <p>To deliver Hearthline, we share specific data with the following providers:</p>
            <ul>
              <li><strong>Anthropic</strong> (Claude) — transcript &rarr; structured lead extraction.</li>
              <li><strong>OpenAI</strong> — vision pipeline for photo-based quoting.</li>
              <li><strong>Vapi</strong> + <strong>Twilio</strong> — voice and SMS handling.</li>
              <li><strong>Stripe</strong> — payment processing for deposits and invoices.</li>
              <li><strong>AWS</strong> — hosting and storage (eu-west-3 / us-east-1, your choice).</li>
            </ul>
            <p>
              All subprocessors are bound by data-processing agreements consistent with GDPR
              and CCPA.
            </p>

            <h2>4. Retention</h2>
            <p>
              Call audio is retained for 30 days by default and then deleted; transcripts are
              retained for 12 months. You can request earlier deletion at any time, and you
              can configure tighter retention in your dashboard settings.
            </p>

            <h2>5. Your rights</h2>
            <p>
              You and your customers have the right to access, correct, export, or delete
              personal data we hold. Contact{" "}
              <a href="mailto:privacy@hearthline.example">privacy@hearthline.example</a> and
              we will respond within 30 days.
            </p>

            <h2>6. Security</h2>
            <ul>
              <li>TLS 1.3 in transit, AES-256 at rest.</li>
              <li>SOC 2 Type II audited annually.</li>
              <li>Single-tenant Postgres available on Enterprise plans.</li>
              <li>Quarterly third-party penetration tests.</li>
            </ul>

            <h2>7. Cookies</h2>
            <p>
              We use a minimum of strictly-necessary cookies for authentication and a single
              first-party analytics cookie to count page visits in aggregate. We do not load
              third-party advertising trackers.
            </p>

            <h2>8. Changes to this policy</h2>
            <p>
              If we make material changes we will notify all account owners by email at
              least 30 days before the change takes effect.
            </p>

            <h2>9. Contact</h2>
            <p>
              Questions? Reach the data-protection team at{" "}
              <a href="mailto:privacy@hearthline.example">privacy@hearthline.example</a>.
            </p>
          </article>
        </section>

        <MarketingFooter />
      </main>
    </>
  );
}
