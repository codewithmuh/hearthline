import type { Metadata } from "next";
import Link from "next/link";

import AnnaDemoLauncher from "./AnnaDemoLauncher";
import ChatWidget from "./ChatWidget";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import HeroBackdrop from "./HeroBackdrop";
import LiveTicker from "./LiveTicker";
import MissedCallStory from "./MissedCallStory";
import MockDashboard from "./MockDashboard";
import FeaturesSwitcher from "./FeaturesSwitcher";
import { tEn as t } from "./lib/strings-en";

const SITE_URL = "https://hearthline.codewithmuh.com";
const DEMO_URL = "https://calendly.com/contact-codewithmuh/30min";
const REPO_URL = "https://github.com/codewithmuh/hearthline";

export const metadata: Metadata = {
  title: "Hearthline — The 24/7 AI front desk for home-service teams",
  description:
    "Anna answers, qualifies, photo-quotes, and books — so your crew sleeps and your calendar fills itself. Open-source AI receptionist for HVAC, plumbing, roofing, solar, and more.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Hearthline — The 24/7 AI front desk for home-service teams",
    description:
      "Anna answers, qualifies, photo-quotes, and books — so your crew sleeps and your calendar fills itself.",
    url: SITE_URL,
  },
};

const SOFTWARE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hearthline",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "AI Receptionist",
  operatingSystem: "Web, Linux, Docker",
  description:
    "Open-source 24/7 AI front desk for home-service teams — phone, SMS, WhatsApp, email, chat. Anna qualifies leads, drafts photo-based quotes, and books appointments automatically.",
  url: SITE_URL,
  license: "https://www.gnu.org/licenses/agpl-3.0.html",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Self-host under AGPL-3.0. Done-for-you setup available.",
  },
  author: {
    "@type": "Person",
    name: "Muhammad Rashid",
    url: "https://codewithmuh.com",
  },
  publisher: {
    "@type": "Organization",
    name: "Hearthline",
  },
  aggregateRating: undefined,
  featureList: [
    "AI phone receptionist (Vapi + Twilio)",
    "AI chat assistant (web, SMS, WhatsApp)",
    "Photo-to-quote vision pipeline",
    "CRM integration (HubSpot, Pipedrive, Salesforce, ServiceTitan)",
    "Configurable per-trade pricing rules",
    "Live analytics dashboards",
  ],
};

export default function HomePage() {
  const FEATURES = [
    { name: t("features.f1.name"), body: t("features.f1.body") },
    { name: t("features.f2.name"), body: t("features.f2.body") },
    { name: t("features.f3.name"), body: t("features.f3.body") },
    { name: t("features.f4.name"), body: t("features.f4.body") },
    { name: t("features.f5.name"), body: t("features.f5.body") },
    { name: t("features.f6.name"), body: t("features.f6.body") },
  ];

  const INDUSTRIES = [
    { name: t("industries.i1.name"), sketch: <SkPipe />,       body: t("industries.i1.body"), tint: "water" },
    { name: t("industries.i2.name"), sketch: <SkWindow />,     body: t("industries.i2.body"), tint: "glass" },
    { name: t("industries.i3.name"), sketch: <SkSolar />,      body: t("industries.i3.body"), tint: "sun" },
    { name: t("industries.i4.name"), sketch: <SkInsulation />, body: t("industries.i4.body"), tint: "earth" },
    { name: t("industries.i5.name"), sketch: <SkGarage />,     body: t("industries.i5.body"), tint: "slate" },
    { name: t("industries.i6.name"), sketch: <SkBolt />,       body: t("industries.i6.body"), tint: "spark" },
    { name: t("industries.i7.name"), sketch: <SkLeaf />,       body: t("industries.i7.body"), tint: "leaf" },
    { name: t("industries.i8.name"), sketch: <SkSpray />,      body: t("industries.i8.body"), tint: "foam" },
    { name: t("industries.i9.name"), sketch: <SkBug />,        body: t("industries.i9.body"), tint: "moss" },
  ];

  return (
    <div translate="no" className="notranslate">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSONLD) }}
      />
      <div className="topbar-wrap">
        <header className="topbar">
          <div className="brand-cluster">
            <Link href="/" className="brand" aria-label="Hearthline home">
              <span className="brand-mark"><Flame /></span>
              <span>Hearthline</span>
            </Link>
            <a
              href="https://codewithmuh.com"
              target="_blank"
              rel="noreferrer author"
              className="built-by-pill"
              title="Built by codewithmuh"
            >
              {t("topbar.builtBy")} <strong>codewithmuh</strong>
            </a>
          </div>
          <nav className="nav-links" aria-label="Primary">
            <Link href="#flow" className="nav-link">{t("nav.how")}</Link>
            <Link href="#features" className="nav-link">{t("nav.features")}</Link>
            <Link href="#industries" className="nav-link">{t("nav.industries")}</Link>
            <Link href="#impact" className="nav-link">{t("nav.impact")}</Link>
            <Link href="/docs" className="nav-link">{t("nav.docs")}</Link>
          </nav>
          <div className="topbar-right">
            <LanguageSwitcher />
            <ThemeToggle />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="topbar-icon-link"
              aria-label="Star Hearthline on GitHub"
              title="Star on GitHub"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </a>
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">{t("btn.bookDemo")}</a>
          </div>
        </header>
      </div>

      <main>
        {/* HERO */}
        <section className="shell hero hero-illustrated">
          <HeroBackdrop />
          <p className="hero-eyebrow-trades">
            <span className="hero-eyebrow-trades-label">{t("hero.tradesLabel")}</span>
            <span className="hero-eyebrow-trades-list">{t("hero.tradesList")}</span>
          </p>
          <h1 className="hero-title">
            {t("hero.title1")}<br />
            <span className="hero-title-em">{t("hero.title2")}</span>
          </h1>
          <p className="hero-sub">{t("hero.sub")}</p>
          <div className="hero-actions">
            <AnnaDemoLauncher />
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              {t("btn.bookDemo")}
            </a>
          </div>

          <LiveTicker />

          <MockDashboard />

          <a href={REPO_URL} target="_blank" rel="noreferrer" className="gh-strip">
            <span>{t("hero.oss")}</span>
            <span className="sep" aria-hidden />
            <strong>{t("hero.star")}</strong>
            <span className="sep" aria-hidden />
            <span>{t("hero.selfHost")}</span>
          </a>
        </section>

        <div className="ember-line" aria-hidden />

        <MissedCallStory />

        <div className="ember-line" aria-hidden />

        <section className="shell section-tight" id="features">
          <div className="section-head">
            <span className="section-flourish">{t("features.eyebrow")}</span>
            <h2 className="section-title">{t("features.title")}</h2>
            <p className="section-sub">{t("features.sub")}</p>
          </div>
          <FeaturesSwitcher features={FEATURES} exploreLabel={t("btn.explore")} />
        </section>

        <div className="ember-line" aria-hidden />

        <section className="shell section-tight" id="industries">
          <div className="section-head">
            <span className="section-flourish">{t("industries.eyebrow")}</span>
            <h2 className="section-title">{t("industries.title")}</h2>
            <p className="section-sub">{t("industries.sub")}</p>
          </div>
          <div className="industries-grid industries-grid-wide">
            {INDUSTRIES.map((it) => (
              <div className={`industry-card tint-${it.tint}`} key={it.name}>
                <span className="industry-sketch" aria-hidden>{it.sketch}</span>
                <h3>{it.name}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
          <p className="industries-note">
            {t("industries.note")}
            <a href={DEMO_URL} target="_blank" rel="noreferrer">{t("btn.tellUs")}</a>.
          </p>
        </section>

        <section className="shell section" id="impact">
          <div className="stats-band">
            <div>
              <span className="section-flourish" style={{ color: "rgba(255,255,255,0.55)" }}>
                {t("stats.eyebrow")}
              </span>
              <h2 className="stats-band-title">{t("stats.title")}</h2>
              <p className="stats-band-body">{t("stats.body")}</p>
              <ul>
                <li>{t("stats.li1")}</li>
                <li>{t("stats.li2")}</li>
                <li>{t("stats.li3")}</li>
              </ul>
            </div>
            <div className="stats-band-right">
              <div className="stats-card night">
                <div className="stats-card-num">{t("stats.card1.num")}</div>
                <div className="stats-card-label">{t("stats.card1.label")}</div>
              </div>
              <div className="stats-card ember">
                <div className="stats-card-num">{t("stats.card2.num")}</div>
                <div className="stats-card-label">{t("stats.card2.label")}</div>
              </div>
              <div className="stats-card">
                <div className="stats-card-num">{t("stats.card3.num")}</div>
                <div className="stats-card-label">{t("stats.card3.label")}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="shell section-tight">
          <div className="config-band">
            <div className="config-band-text">
              <p className="section-eyebrow">{t("config.eyebrow")}</p>
              <h2 className="config-band-title">{t("config.title")}</h2>
              <p className="config-band-body">{t("config.body")}</p>
            </div>
            <ul className="config-knobs">
              <li><span>{t("config.k1.l")}</span><strong>{t("config.k1.v")}</strong></li>
              <li><span>{t("config.k2.l")}</span><strong>{t("config.k2.v")}</strong></li>
              <li><span>{t("config.k3.l")}</span><strong>{t("config.k3.v")}</strong></li>
              <li><span>{t("config.k4.l")}</span><strong>{t("config.k4.v")}</strong></li>
              <li><span>{t("config.k5.l")}</span><strong>{t("config.k5.v")}</strong></li>
              <li><span>{t("config.k6.l")}</span><strong>{t("config.k6.v")}</strong></li>
            </ul>
          </div>
        </section>

        <div className="ember-line" aria-hidden />

        <section className="shell section-tight">
          <div className="final-cta">
            <span className="final-cta-mark"><Flame /></span>
            <h2 className="final-cta-title">{t("finalCta.title")}</h2>
            <p className="final-cta-sub">{t("finalCta.sub")}</p>
            <div className="final-cta-actions">
              <AnnaDemoLauncher variant="onDark" />
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-onDark-ghost">
                {t("btn.bookDemo")}
              </a>
            </div>
          </div>
        </section>

        <footer className="shell footer">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <span className="brand-mark"><Flame /></span>
              <span>Hearthline</span>
            </div>
            <p className="footer-tag">{t("footer.tag")}</p>
          </div>
          <div className="footer-col">
            <h5>{t("footer.product")}</h5>
            <a href="#features">{t("nav.features")}</a>
            <a href="#industries">{t("nav.industries")}</a>
            <Link href="/login">{t("btn.signIn")}</Link>
          </div>
          <div className="footer-col">
            <h5>{t("footer.resources")}</h5>
            <Link href="/faq">{t("footer.faq")}</Link>
            <Link href="/docs">{t("nav.docs")}</Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer">{t("btn.bookDemo")}</a>
          </div>
          <div className="footer-col">
            <h5>{t("footer.legal")}</h5>
            <Link href="/privacy">{t("footer.privacy")}</Link>
            <Link href="/terms">{t("footer.terms")}</Link>
          </div>

          <div className="creator-credit">
            <div className="creator-credit-text">
              <p className="creator-credit-eyebrow">{t("footer.builtBy")}</p>
              <a href="https://codewithmuh.com" target="_blank" rel="noreferrer author" className="creator-credit-name">
                Muhammad Rashid Daha · <span>codewithmuh.com</span>
              </a>
              <p className="creator-credit-bio">{t("footer.bio")}</p>
            </div>
            <div className="creator-credit-socials">
              <a href="https://codewithmuh.com" target="_blank" rel="noreferrer author" className="social-btn" aria-label="codewithmuh.com">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <span>codewithmuh.com</span>
              </a>
              <a href="https://www.linkedin.com/in/muhammad-rashid-daha/" target="_blank" rel="noreferrer" className="social-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
                <span>LinkedIn</span>
              </a>
              <a href="https://www.youtube.com/@codewithmuh" target="_blank" rel="noreferrer" className="social-btn" aria-label="YouTube">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.3 31.3 0 0 0 .5-5.8 31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z"/></svg>
                <span>YouTube</span>
              </a>
              <a href="https://x.com/codewithmuh" target="_blank" rel="noreferrer" className="social-btn" aria-label="X / Twitter">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>@codewithmuh</span>
              </a>
              <a href="https://github.com/codewithmuh/hearthline" target="_blank" rel="noreferrer" className="social-btn" aria-label="GitHub">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Hearthline · {t("footer.copyright")}</span>
            <span>
              {t("footer.builtBy")}{" "}
              <a href="https://codewithmuh.com" target="_blank" rel="noreferrer author">@codewithmuh</a>
              {" "}{t("footer.bottomTail")}
            </span>
          </div>
        </footer>
      </main>

      <ChatWidget />
    </div>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}

const sketchProps = {
  viewBox: "0 0 64 64",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SkPipe() {
  return (
    <svg {...sketchProps}>
      <path d="M6 28h22a8 8 0 0 1 8 8v18" />
      <rect x="4" y="24" width="6" height="8" rx="1" />
      <rect x="32" y="52" width="10" height="6" rx="1" />
      <circle cx="36" cy="36" r="6" />
      <path d="M36 28v-6M30 36h-4M46 36h-4" />
    </svg>
  );
}
function SkWindow() {
  return (
    <svg {...sketchProps}>
      <rect x="10" y="8" width="44" height="48" rx="2" />
      <path d="M10 32h44M32 8v48" />
      <path d="M14 12h36M14 36h36" strokeOpacity="0.4" />
    </svg>
  );
}
function SkSolar() {
  return (
    <svg {...sketchProps}>
      <path d="M6 50 L24 14 L52 14 L34 50 Z" />
      <path d="M16 32 L42 32M22 22 L38 50M30 14 L24 50" />
      <circle cx="46" cy="10" r="4" />
      <path d="M46 4v3M46 13v3M40 10h3M52 10h3M42 6l2 2M48 14l2 2" />
    </svg>
  );
}
function SkInsulation() {
  return (
    <svg {...sketchProps}>
      <path d="M6 22 L32 6 L58 22 L58 58 L6 58 Z" />
      <path d="M14 30c4 0 4 4 8 4s4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M14 42c4 0 4 4 8 4s4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M14 54h36" />
    </svg>
  );
}
function SkGarage() {
  return (
    <svg {...sketchProps}>
      <path d="M6 24 L32 8 L58 24 L58 58 L6 58 Z" />
      <rect x="14" y="32" width="36" height="22" />
      <path d="M14 40h36M14 47h36M22 32v22M32 32v22M42 32v22" strokeOpacity="0.6" />
    </svg>
  );
}
function SkBolt() {
  return (
    <svg {...sketchProps}>
      <path d="M30 6 L14 36 L26 36 L20 58 L46 28 L34 28 L40 6 Z" />
    </svg>
  );
}
function SkLeaf() {
  return (
    <svg {...sketchProps}>
      <path d="M10 54c0-22 18-40 44-44 0 26-18 44-44 44z" />
      <path d="M14 50 L48 16" />
      <path d="M22 42q4-2 8-2M28 36q4-2 8-2M34 30q4-2 8-2" strokeOpacity="0.6" />
    </svg>
  );
}
function SkSpray() {
  return (
    <svg {...sketchProps}>
      <rect x="20" y="16" width="20" height="40" rx="2" />
      <rect x="22" y="6" width="16" height="10" rx="1" />
      <path d="M40 18 L52 14 L52 26 L40 22" />
      <path d="M48 16 L56 14M48 18 L56 18M48 20 L56 22" strokeOpacity="0.5" />
      <path d="M22 36h16" />
    </svg>
  );
}
function SkBug() {
  return (
    <svg {...sketchProps}>
      <ellipse cx="32" cy="36" rx="14" ry="18" />
      <circle cx="32" cy="20" r="6" />
      <path d="M26 16 L20 8M38 16 L44 8" />
      <path d="M18 30 L8 26M46 30 L56 26M18 40 L8 40M46 40 L56 40M18 50 L10 56M46 50 L54 56" />
      <path d="M32 22v32M26 30q6 4 12 0M26 42q6 4 12 0" strokeOpacity="0.5" />
    </svg>
  );
}
