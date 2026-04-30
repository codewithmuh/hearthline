import { MarketingFooter, MarketingTopbar } from "../MarketingShell";

export const metadata = {
  title: "Hearthline · FAQ",
  description: "Common questions about Hearthline — pricing, setup, integrations, security, and more.",
};

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "How long does setup take?",
    a: <>About 30 minutes. We need your business hours, service area, pricing rules, and a phone number you'd like Anna to answer. Most teams are live by lunchtime.</>,
  },
  {
    q: "Does Anna sound like a robot?",
    a: <>No — we use the latest neural voices from ElevenLabs, fine-tuned to match your brand. Customers regularly assume Anna is a real person on the team.</>,
  },
  {
    q: "What languages does Anna support?",
    a: <>English, French, Spanish, German, Italian, Dutch, and Portuguese out of the box. Custom languages on request.</>,
  },
  {
    q: "Can I keep my existing phone number?",
    a: <>Yes. We forward your existing line to Hearthline, or you can publish a new dedicated number. SMS / WhatsApp routing works the same way.</>,
  },
  {
    q: "Which CRMs do you sync with?",
    a: <>HubSpot, Pipedrive, Salesforce, Zoho, and ServiceTitan. Anything else can be added through Zapier or our REST API.</>,
  },
  {
    q: "What happens if Anna can't answer something?",
    a: <>She politely takes a detailed message, files it as a hot lead in your CRM, and escalates to whoever's on call. No customer is ever left hanging.</>,
  },
  {
    q: "Is my data secure?",
    a: <>Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We're SOC 2 Type II audited and GDPR compliant. We do not train on your customer data.</>,
  },
  {
    q: "How is pricing structured?",
    a: <>A flat monthly platform fee plus per-minute call usage. No per-seat pricing. Most home-service teams pay between $390 – $890 / month all-in. Book a demo for an exact quote.</>,
  },
  {
    q: "Can I try Hearthline before paying?",
    a: <>We offer a 14-day pilot — same setup, same Anna, no card required. We only invoice if you decide to keep her after two weeks.</>,
  },
  {
    q: "Can I host Hearthline myself?",
    a: <>Yes — the whole stack is open source under MIT. See the <a href="/docs">docs</a> for the self-host quick start.</>,
  },
];

export default function FaqPage() {
  return (
    <>
      <MarketingTopbar />
      <main>
        <section className="shell hero hero-tight">
          <span className="hero-meet">
            <span className="hero-meet-avatar">?</span>
            <span>Frequently asked questions</span>
          </span>
          <h1 className="hero-title">
            Honest answers.<br />
            <span className="hero-title-em">No marketing fluff.</span>
          </h1>
          <p className="hero-sub">
            Setup, pricing, integrations, security — the things home-service teams actually ask before signing up.
          </p>
        </section>

        <section className="shell section-tight">
          <div className="faq-list">
            {FAQS.map((item, i) => (
              <details key={item.q} className="faq-item" open={i === 0}>
                <summary className="faq-q">
                  <span>{item.q}</span>
                  <span className="faq-toggle" aria-hidden>+</span>
                </summary>
                <div className="faq-a">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="shell section-tight">
          <div className="final-cta">
            <h2 className="final-cta-title">Still have a question?</h2>
            <p className="final-cta-sub">Book a 30-minute call and ask Anna's team directly.</p>
            <div className="final-cta-actions">
              <a href="https://calendly.com/contact-codewithmuh/30min" target="_blank" rel="noreferrer" className="btn btn-onDark btn-lg">
                Book a demo <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </main>
    </>
  );
}
