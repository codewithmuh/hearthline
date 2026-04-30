// Cartoon-style horizontal pipeline showing how a home-service call flows through Hearthline.
// Five stages connected by animated dashed paths.

const STAGES = [
  {
    label: "Customer calls",
    sub: "Phone · SMS · WhatsApp",
    color: "#2563eb",
    el: <Caller />,
  },
  {
    label: "Anna picks up",
    sub: "AI receptionist · 24/7",
    color: "#d2532b",
    el: <AnnaHub />,
  },
  {
    label: "Lead qualified",
    sub: "Trade · urgency · value",
    color: "#7c3aed",
    el: <LeadCard />,
  },
  {
    label: "Quote drafted",
    sub: "Photo → PDF in 60s",
    color: "#16a34a",
    el: <QuoteDoc />,
  },
  {
    label: "Tech dispatched",
    sub: "Routed · ETA texted",
    color: "#0891b2",
    el: <Truck />,
  },
];

export default function HeroPipeline() {
  return (
    <div className="hpipe" aria-hidden>
      <div className="hpipe-track">
        {STAGES.map((s, i) => (
          <div className="hpipe-stage" key={s.label}>
            <div className="hpipe-stage-art" style={{ color: s.color }}>{s.el}</div>
            <div className="hpipe-stage-label">{s.label}</div>
            <div className="hpipe-stage-sub">{s.sub}</div>
            {i < STAGES.length - 1 && (
              <svg className="hpipe-arrow" viewBox="0 0 80 24" aria-hidden>
                <path
                  d="M 4 12 H 70"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="2 4"
                />
                <path
                  d="M 64 6 L 72 12 L 64 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Caller() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <g {...stroke}>
        {/* speech bubble */}
        <path d="M14 14 H50 a4 4 0 0 1 4 4 V36 a4 4 0 0 1 -4 4 H30 l-8 8 V40 a4 4 0 0 1 -4 -4 V18 a4 4 0 0 1 4 -4 z" />
        <path d="M22 24 H46 M22 30 H40" strokeOpacity="0.5" />
        {/* phone with rings */}
        <rect x="44" y="50" width="22" height="22" rx="3" />
        <path d="M50 56 H60 M50 60 H60" strokeOpacity="0.5" />
        <circle cx="55" cy="68" r="1.4" />
        {/* ringing waves */}
        <path d="M70 48 q4 -4 4 -10 M68 44 q3 -3 3 -7" strokeOpacity="0.6" className="hpipe-wave" />
      </g>
    </svg>
  );
}

function AnnaHub() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <g {...stroke}>
        {/* Anna circle */}
        <circle cx="40" cy="40" r="22" />
        {/* flame inside */}
        <path d="M37 46 a3 3 0 0 0 3 3 c2 0 3 -1 4 -2 1 -2 0.7 -4 -1 -6 -2 -2 -2.5 -4 -1 -6 0.5 -1 0 -2 -1 -3 -2 -1 -4 0 -5 1 -2 2 -2.5 5 -1 7 0.6 1 0.6 2 -0.5 3 z" strokeWidth="1.4" />
        {/* halo / pulse */}
        <circle cx="40" cy="40" r="30" strokeOpacity="0.4" strokeDasharray="3 4" className="hpipe-halo" />
        {/* nodes around */}
        <circle cx="14" cy="40" r="3" strokeOpacity="0.7" />
        <circle cx="66" cy="40" r="3" strokeOpacity="0.7" />
        <circle cx="40" cy="14" r="3" strokeOpacity="0.7" />
        <circle cx="40" cy="66" r="3" strokeOpacity="0.7" />
      </g>
    </svg>
  );
}

function LeadCard() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <g {...stroke}>
        <rect x="12" y="14" width="56" height="52" rx="4" />
        {/* avatar circle */}
        <circle cx="22" cy="24" r="4" />
        {/* lines */}
        <path d="M30 22 H58 M30 27 H50" strokeOpacity="0.7" />
        <path d="M14 38 H66" strokeOpacity="0.4" />
        {/* tags */}
        <rect x="18" y="46" width="18" height="9" rx="4.5" strokeOpacity="0.7" />
        <rect x="40" y="46" width="22" height="9" rx="4.5" strokeOpacity="0.7" />
        {/* checkmark */}
        <path d="M50 56 l3 3 l5 -6" strokeWidth="2" />
      </g>
    </svg>
  );
}

function QuoteDoc() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <g {...stroke}>
        <path d="M20 10 H50 L62 22 V70 H20 z" />
        <path d="M50 10 V22 H62" />
        <path d="M26 32 H56 M26 38 H50 M26 44 H56 M26 50 H46" strokeOpacity="0.55" />
        {/* totals divider */}
        <path d="M26 56 H56" />
        <path d="M40 62 H56" strokeWidth="2.2" />
        {/* sparkle */}
        <path d="M70 14 l2 -4 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 z" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

function Truck() {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%">
      <g {...stroke}>
        {/* truck body */}
        <path d="M6 28 H44 V58 H6 z" />
        <path d="M44 36 H56 L66 46 V58 H44 z" />
        {/* wheels */}
        <circle cx="20" cy="60" r="6" />
        <circle cx="56" cy="60" r="6" />
        <circle cx="20" cy="60" r="2" />
        <circle cx="56" cy="60" r="2" />
        {/* window */}
        <rect x="48" y="40" width="12" height="8" />
        {/* door panel */}
        <path d="M22 36 V52 M28 32 V52" strokeOpacity="0.5" />
        {/* motion lines */}
        <path d="M70 24 H78 M68 30 H74" strokeOpacity="0.5" className="hpipe-wave" />
      </g>
    </svg>
  );
}
