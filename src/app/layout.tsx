// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { VisibleLayout } from "./visibleLayout";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/* ============ SEO METADATA ============ */
export const metadata: Metadata = {
  metadataBase: new URL("https://shonenbuilds.online"),

  title: {
    default: "ShonenBuilds — Level Up Your Calisthenics. Every Day.",
    template: "%s | ShonenBuilds",
  },

  description:
    "Gamified calisthenics training. Unlock skill nodes, earn XP, and climb 10 tiers of anime-inspired ranks from E-Rank to Apex. Choose your discipline: Shinobi, Awakened Hunter, High Seas, or Spirit Warrior.",

  keywords: [
    "calisthenics",
    "bodyweight training",
    "gamified fitness",
    "anime fitness app",
    "skill tree",
    "calisthenics progression",
    "street workout",
    "fitness RPG",
    "power level",
    "shonen",
    "pull-up training",
    "planche progression",
    "muscle-up",
  ],

  authors: [{ name: "ShonenBuilds" }],
  creator: "ShonenBuilds",
  publisher: "ShonenBuilds",

  // Canonical — tells Google this is the official URL
  alternates: {
    canonical: "/",
  },

  // Open Graph — controls how the link looks on Discord, LinkedIn, WhatsApp, iMessage
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shonenbuilds.online",
    siteName: "ShonenBuilds",
    title: "ShonenBuilds — Level Up Your Calisthenics. Every Day.",
    description:
      "Master calisthenics through gamified progression. Unlock skill nodes, earn XP, rise through anime-inspired ranks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShonenBuilds — Level Up. Every Day.",
      },
    ],
  },

  // Twitter/X card
  twitter: {
    card: "summary_large_image",
    title: "ShonenBuilds — Level Up Your Calisthenics. Every Day.",
    description:
      "Gamified calisthenics. Skill trees. Anime ranks. Every rep earns XP.",
    images: ["/og-image.png"],
    creator: "@shonenbuilds",
  },

  // Favicon + touch icons (place these in /public)
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },

  // Tell Google how to crawl
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

  // For sharing to phone/browser UI
  applicationName: "ShonenBuilds",
  category: "Fitness",
};

/* ============ VIEWPORT (separate export in Next 15) ============ */
export const viewport: Viewport = {
  themeColor: "#09080F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ============ ROOT LAYOUT ============ */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col max-w-screen overflow-x-hidden bg-background text-foreground">
        <VisibleLayout>{children}</VisibleLayout>
      </body>
    </html>
  );
}