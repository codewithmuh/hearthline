// Decorative SVG layer for the hero — blueprint grid + sketched home-service motifs.
// All elements are aria-hidden and pointer-events: none.

const SKETCHES: Array<{
  top: string;
  left?: string;
  right?: string;
  rotate: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  el: React.ReactNode;
}> = [
  { top: "60px",  left: "-30px", rotate: -14, size: 110, duration: 7,   delay: 0,    drift: 26, el: <Wrench /> },
  { top: "40px",  right: "-30px", rotate: 16,  size: 100, duration: 8.4, delay: -2,   drift: 30, el: <Ladder /> },
  { top: "210px", left: "-40px", rotate: -6,  size: 130, duration: 9,   delay: -4,   drift: 34, el: <Roof /> },
  { top: "190px", right: "-40px", rotate: 10,  size: 110, duration: 6.8, delay: -1.2, drift: 28, el: <Drill /> },
  { top: "380px", left: "-20px", rotate: 18,  size: 96,  duration: 7.6, delay: -3,   drift: 30, el: <Pipe /> },
  { top: "360px", right: "-20px", rotate: -18, size: 100, duration: 8,   delay: -5,   drift: 24, el: <HardHat /> },
];

export default function HeroBackdrop() {
  return (
    <div className="hero-backdrop" aria-hidden>
      <div className="hero-grid" />
      <div className="hero-house" aria-hidden>
        <House />
      </div>
      {SKETCHES.map((s, i) => (
        <span
          key={i}
          className="sketch"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            ["--rot" as string]: `${s.rotate}deg`,
            ["--drift" as string]: `${s.drift}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.el}
        </span>
      ))}
    </div>
  );
}

function strokeProps(width = 2.2) {
  return {
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: width,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function Wrench() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <path d="M40 8a14 14 0 0 0-12 22l-22 22a4 4 0 0 0 6 6l22-22a14 14 0 0 0 6-28zM41 12a10 10 0 0 1 7 17l-7-7 4-4-4-4-4 4-7-7a10 10 0 0 1 11-1z" />
      </g>
    </svg>
  );
}

function Ladder() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <path d="M18 4v56M46 4v56" />
        <path d="M18 14h28M18 26h28M18 38h28M18 50h28" />
      </g>
    </svg>
  );
}

function Roof() {
  return (
    <svg viewBox="0 0 80 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <path d="M4 50 L40 12 L76 50" />
        <path d="M14 50 L20 42M22 50 L28 42M30 50 L36 42M38 50 L44 42M46 50 L52 42M54 50 L60 42M62 50 L68 42" />
        <path d="M40 12 L40 50" />
      </g>
    </svg>
  );
}

function Drill() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <rect x="14" y="20" width="22" height="14" rx="2" />
        <path d="M36 24h10l4 3-4 3H36z" />
        <path d="M50 27h6" />
        <path d="M14 34v8a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-8" />
        <path d="M22 46v6" />
      </g>
    </svg>
  );
}

function Pipe() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <path d="M4 26h28a8 8 0 0 1 8 8v18" />
        <rect x="2" y="22" width="6" height="10" rx="1" />
        <rect x="36" y="50" width="10" height="6" rx="1" />
        <circle cx="40" cy="34" r="6" />
        <path d="M40 26v-6M34 34h-4M50 34h-4" />
      </g>
    </svg>
  );
}

function HardHat() {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <g {...strokeProps(2)}>
        <path d="M8 44h48" />
        <path d="M12 44a20 20 0 0 1 40 0" />
        <path d="M22 28v-6M32 26v-8M42 28v-6" />
        <path d="M28 44v-6M36 44v-6" />
      </g>
    </svg>
  );
}

function House() {
  // Faint architectural cross-section behind the hero
  return (
    <svg viewBox="0 0 1200 600" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <g {...strokeProps(1.4)}>
        {/* roof */}
        <path d="M200 280 L600 80 L1000 280" />
        <path d="M260 280 L600 110 L940 280" />
        {/* main outline */}
        <path d="M250 280 L250 540 L950 540 L950 280" />
        {/* chimney */}
        <path d="M780 220 L780 160 L820 160 L820 240" />
        {/* windows */}
        <rect x="320" y="320" width="90" height="90" />
        <rect x="510" y="320" width="90" height="90" />
        <rect x="700" y="320" width="90" height="90" />
        <rect x="510" y="450" width="90" height="90" />
        {/* window crosses */}
        <path d="M320 365h90M365 320v90M510 365h90M555 320v90M700 365h90M745 320v90" />
        {/* door */}
        <rect x="320" y="440" width="80" height="100" />
        <circle cx="385" cy="495" r="2" />
        {/* HVAC unit */}
        <rect x="850" y="470" width="60" height="50" />
        <circle cx="880" cy="495" r="14" />
        <path d="M870 495 L880 480 L890 495 M870 495 L880 510 L890 495" />
        {/* solar panels */}
        <path d="M380 215 L530 140 L560 175 L410 250 Z" />
        <path d="M380 215 L410 250M395 207 L425 242M410 200 L440 235M425 192 L455 227M440 185 L470 220M455 178 L485 213M470 170 L500 205M485 163 L515 198M500 155 L530 190" />
        {/* foundation */}
        <path d="M230 540 L970 540" strokeWidth="2.4" />
        <path d="M250 555 L950 555" strokeDasharray="6 4" />
      </g>
    </svg>
  );
}
