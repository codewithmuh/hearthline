import { MarketingFooter, MarketingTopbar } from "../MarketingShell";

export const metadata = {
  title: "Hearthline · Terms of Service",
  description: "The terms governing the use of Hearthline's hosted product and services.",
};

export default function TermsPage() {
  const updated = "October 1, 2026";
  return (
    <>
      <MarketingTopbar />
      <main>
        <section className="shell legal-shell">
          <header className="legal-head">
            <p className="legal-eyebrow">Legal</p>
            <h1 className="legal-title">Terms of Service</h1>
            <p className="legal-meta">Last updated {updated}</p>
          </header>

          <article className="legal-doc">
            <p>
              These Terms of Service ("Terms") govern your access to and use of Hearthline
              ("Service"), operated by Hearthline ("we", "our", "us"). By creating an
              account or using the Service you agree to these Terms.
            </p>

            <h2>1. Account &amp; eligibility</h2>
            <p>
              You must be authorised to bind the home-service business you sign up for.
              You're responsible for keeping your credentials secure and for all activity
              that happens under your account.
            </p>

            <h2>2. Acceptable use</h2>
            <ul>
              <li>Use the Service only for lawful business communications with consenting parties.</li>
              <li>Do not use Anna for spam, robocalls, harassment, or any disallowed use under TCPA / CAN-SPAM / GDPR.</li>
              <li>Do not attempt to reverse-engineer the AI model or scrape the Service.</li>
              <li>Do not impersonate a third party or misrepresent Anna's nature when explicitly asked.</li>
            </ul>
            <p>
              We may suspend accounts that violate these rules and reserve the right to
              terminate egregious cases without refund.
            </p>

            <h2>3. Subscriptions &amp; billing</h2>
            <ul>
              <li>The Service is billed monthly in advance with per-minute call usage billed at the end of each billing cycle.</li>
              <li>Pilot accounts are free for 14 days. After the pilot, you decide whether to continue — we never auto-charge a card.</li>
              <li>Prices may be updated with at least 30 days' notice.</li>
            </ul>

            <h2>4. Customer data</h2>
            <p>
              You retain all rights to the data your customers send to you through Hearthline.
              We process that data on your behalf as your data processor under our{" "}
              <a href="/privacy">Privacy Policy</a> and any applicable Data Processing
              Agreement. You can export or delete your data at any time.
            </p>

            <h2>5. Service availability</h2>
            <p>
              We target 99.9% monthly uptime for paid plans and provide service-credit refunds
              for sustained downtime as set out in our SLA. Scheduled maintenance is announced
              at least 72 hours in advance.
            </p>

            <h2>6. AI output</h2>
            <p>
              Anna drafts quotes, books appointments, and answers questions based on your
              configured pricing rules and knowledge base. AI output can occasionally be
              wrong. You're responsible for reviewing material decisions (large quotes,
              irreversible bookings) before they go to customers, and you can configure
              human-in-the-loop thresholds in your dashboard.
            </p>

            <h2>7. Open-source code</h2>
            <p>
              The Hearthline reference implementation is published under the MIT license at{" "}
              <a href="https://github.com/codewithmuh/hearthline" target="_blank" rel="noreferrer">
                github.com/codewithmuh/hearthline
              </a>. Self-hosting is permitted; running your own deployment falls outside the
              scope of these Terms (use the MIT license).
            </p>

            <h2>8. Disclaimer of warranties</h2>
            <p>
              The Service is provided on an "as is" and "as available" basis. We disclaim all
              implied warranties to the maximum extent permitted by law.
            </p>

            <h2>9. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, our aggregate liability arising out of
              or relating to these Terms is limited to the amount you paid us in the
              preceding twelve months.
            </p>

            <h2>10. Termination</h2>
            <p>
              You can cancel anytime from the dashboard or by emailing{" "}
              <a href="mailto:billing@hearthline.example">billing@hearthline.example</a>. On
              cancellation we keep your data in cold storage for 30 days, then permanently
              delete it.
            </p>

            <h2>11. Governing law</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, USA, without
              regard to conflict-of-law rules. Disputes are resolved in the state and
              federal courts located in New Castle County, Delaware.
            </p>

            <h2>12. Changes</h2>
            <p>
              We may update these Terms occasionally. Material changes will be announced by
              email at least 30 days before they take effect.
            </p>

            <h2>13. Contact</h2>
            <p>
              Questions? Reach us at{" "}
              <a href="mailto:legal@hearthline.example">legal@hearthline.example</a>.
            </p>
          </article>
        </section>

        <MarketingFooter />
      </main>
    </>
  );
}
