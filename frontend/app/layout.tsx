import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Hearthline — The 24/7 AI front-desk for home-service teams",
  description:
    "Phone, SMS, WhatsApp, email, chat — every customer touchpoint qualified, photo-quoted, and dispatched without anyone picking up the phone.",
  applicationName: "Hearthline",
  appleWebApp: {
    capable: true,
    title: "Hearthline",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#0b0b0f",
};

const THEME_INIT = `(function(){try{var s=localStorage.getItem('hl-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=s||(m?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const LANG_INIT = `(function(){try{var RTL={ar:1};var s=localStorage.getItem('hl-lang');if(!s){var n=(navigator.language||'en').slice(0,2).toLowerCase();var supported={en:1,es:1,de:1,fr:1,it:1,pt:1,nl:1,zh:1,ja:1,ar:1};s=supported[n]?n:'en';}document.documentElement.setAttribute('lang',s);document.documentElement.setAttribute('dir',RTL[s]?'rtl':'ltr');var v=s==='en'?'':'/en/'+s;var host=location.hostname;var parts=host.split('.');var root=parts.length>1?'.'+parts.slice(-2).join('.'):host;var exp='expires=Fri, 31 Dec 9999 23:59:59 GMT';document.cookie='googtrans='+v+'; path=/; '+exp;document.cookie='googtrans='+v+'; domain='+host+'; path=/; '+exp;document.cookie='googtrans='+v+'; domain='+root+'; path=/; '+exp;}catch(e){}})();`;

const GTRANSLATE_INIT = `function googleTranslateElementInit(){try{new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,es,de,fr,it,pt,nl,zh-CN,ja,ar',autoDisplay:false,layout:google.translate.TranslateElement.InlineLayout.SIMPLE},'google_translate_element');}catch(e){}}`;

const SW_INIT = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
        <div id="google_translate_element" aria-hidden style={{ display: "none" }} />
        <script dangerouslySetInnerHTML={{ __html: GTRANSLATE_INIT }} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
        <script dangerouslySetInnerHTML={{ __html: SW_INIT }} />
      </body>
    </html>
  );
}
