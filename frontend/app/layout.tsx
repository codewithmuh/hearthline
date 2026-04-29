import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Hearthline — The 24/7 AI front-desk for home-service teams",
  description:
    "Phone, SMS, WhatsApp, email, chat — every customer touchpoint qualified, photo-quoted, and dispatched without anyone picking up the phone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
