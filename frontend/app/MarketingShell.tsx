import Link from "next/link";

const DEMO_URL = "https://calendly.com/contact-codewithmuh/30min";

export function MarketingTopbar() {
  return (
    <div className="topbar-wrap">
      <header className="topbar">
        <Link href="/" className="brand" aria-label="Hearthline home">
          <span className="brand-mark"><Flame /></span>
          <span>Hearthline</span>
        </Link>
        <nav className="nav-links">
          <Link href="/#features" className="nav-link">Features</Link>
          <Link href="/#industries" className="nav-link">Industries</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/docs" className="nav-link">Docs</Link>
        </nav>
        <div className="topbar-right">
          <Link href="/dashboard" className="btn btn-ghost">Log in</Link>
          <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">Book a demo</a>
        </div>
      </header>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="shell footer">
      <div>
        <div className="brand" style={{ marginBottom: 12 }}>
          <span className="brand-mark"><Flame /></span>
          <span>Hearthline</span>
        </div>
        <p className="footer-tag">
          The 24/7 AI communication hub for home-service teams.
        </p>
      </div>
      <div className="footer-col">
        <h5>Product</h5>
        <Link href="/#features">Features</Link>
        <Link href="/#industries">Industries</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
      <div className="footer-col">
        <h5>Resources</h5>
        <Link href="/faq">FAQ</Link>
        <Link href="/docs">Docs</Link>
        <a href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
      </div>
      <div className="footer-col">
        <h5>Legal</h5>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Hearthline.</span>
        <span>Made with care for home-service teams.</span>
      </div>
    </footer>
  );
}

export function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}
