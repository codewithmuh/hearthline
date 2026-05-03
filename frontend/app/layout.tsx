import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { I18nProvider } from "./lib/i18n";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "opsz"],
});

const SITE_URL = "https://hearthline.codewithmuh.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hearthline — The 24/7 AI front desk for home-service teams",
    template: "%s · Hearthline",
  },
  description:
    "Phone, SMS, WhatsApp, email, chat — every customer touchpoint qualified, photo-quoted, and dispatched without anyone picking up the phone.",
  applicationName: "Hearthline",
  generator: "Next.js",
  authors: [{ name: "Muhammad Rashid", url: "https://codewithmuh.com" }],
  creator: "Muhammad Rashid (@codewithmuh)",
  publisher: "Hearthline",
  keywords: [
    "AI receptionist",
    "AI front desk",
    "home services AI",
    "HVAC AI",
    "plumbing AI receptionist",
    "Vapi",
    "Twilio AI",
    "missed call automation",
    "open source AI receptionist",
    "Anna AI",
  ],
  category: "business",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Hearthline",
    title: "Hearthline — The 24/7 AI front desk for home-service teams",
    description:
      "Phone, SMS, WhatsApp, email, chat — every customer touchpoint qualified, photo-quoted, and dispatched without anyone picking up the phone.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hearthline — The 24/7 AI front desk for home-service teams",
    description:
      "Anna answers, qualifies, photo-quotes, and books — so your crew sleeps and your calendar fills itself.",
    site: "@codewithmuh",
    creator: "@codewithmuh",
  },
  appleWebApp: {
    capable: true,
    title: "Hearthline",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ee" },
    { media: "(prefers-color-scheme: dark)",  color: "#0b0b0f" },
  ],
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hearthline",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "Open-source 24/7 AI front desk for home-service teams — phone, SMS, WhatsApp, email, chat.",
  founder: {
    "@type": "Person",
    name: "Muhammad Rashid",
    url: "https://codewithmuh.com",
  },
  sameAs: [
    "https://github.com/codewithmuh/hearthline",
    "https://www.youtube.com/@codewithmuh",
    "https://www.linkedin.com/in/muhammad-rashid-daha/",
    "https://x.com/codewithmuh",
    "https://codewithmuh.com",
  ],
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hearthline",
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@type": "Organization", name: "Hearthline" },
};

const THEME_INIT = `(function(){try{var s=localStorage.getItem('hl-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s||(m?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const LANG_INIT = `(function(){try{var RTL={ar:1};var s=localStorage.getItem('hl-lang');if(!s){var n=(navigator.language||'en').slice(0,2).toLowerCase();var supported={en:1,es:1,de:1,fr:1,it:1,pt:1,nl:1,zh:1,ja:1,ar:1};s=supported[n]?n:'en';}document.documentElement.setAttribute('lang',s);document.documentElement.setAttribute('dir',RTL[s]?'rtl':'ltr');if(s!=='en'){var v='/en/'+s;var host=location.hostname;var parts=host.split('.');var root=parts.length>1?'.'+parts.slice(-2).join('.'):host;var exp='expires=Fri, 31 Dec 9999 23:59:59 GMT';document.cookie='googtrans='+v+'; path=/; '+exp;document.cookie='googtrans='+v+'; domain='+host+'; path=/; '+exp;document.cookie='googtrans='+v+'; domain='+root+'; path=/; '+exp;window.__hlNeedsTranslate=true;}}catch(e){}})();`;

const GTRANSLATE_INIT = `function googleTranslateElementInit(){try{new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,es,de,fr,it,pt,nl,zh-CN,ja,ar',autoDisplay:false,layout:google.translate.TranslateElement.InlineLayout.SIMPLE},'google_translate_element');}catch(e){}}`;

const GTRANSLATE_LOAD = `(function(){if(window.__hlNeedsTranslate){var s=document.createElement('script');s.src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';s.async=true;document.body.appendChild(s);}})();`;

const SW_INIT = `if('serviceWorker' in navigator && location.pathname.startsWith('/dashboard')){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
        <div id="google_translate_element" aria-hidden style={{ display: "none" }} />
        <script dangerouslySetInnerHTML={{ __html: GTRANSLATE_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: GTRANSLATE_LOAD }} />
        <script dangerouslySetInnerHTML={{ __html: SW_INIT }} />
      </body>
    </html>
  );
}
