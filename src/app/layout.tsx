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
    default: "ShonenBuilds — Gamified Calisthenics Skill Tree",
    template: "%s | ShonenBuilds",
  },

  description:
    "Level up your bodyweight fitness. Train Planche, Front Lever, and Muscle-Ups with gamified skill trees, XP progression, and anime-inspired ranks.",

  keywords: [
    "gamified calisthenics app",
    "calisthenics skill tree",
    "planche progression",
    "front lever training",
    "bodyweight training app",
    "anime fitness app",
    "ShonenBuilds",
  ],

  authors: [{ name: "ShonenBuilds" }],
  creator: "ShonenBuilds",
  publisher: "ShonenBuilds",

  // ❌ NO canonical here.
  // Inherited by every child page → de-indexes them.
  // Set canonical per-page in each page.tsx instead.

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shonenbuilds.online",
    siteName: "ShonenBuilds",
    title: "ShonenBuilds — Gamified Calisthenics App",
    description:
      "Unlock elite bodyweight skills like Planche & Front Lever. Earn XP, climb anime ranks, and compete on global leaderboards.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShonenBuilds Gamified Calisthenics Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ShonenBuilds — Gamified Calisthenics App",
    description:
      "Master Planche, Front Lever, and Human Flag with gamified skill trees and XP ranks.",
    images: ["/og-image.png"],
    creator: "@shonenbuilds",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
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

  applicationName: "ShonenBuilds",
  category: "Health & Fitness",
};

/* ============ VIEWPORT ============ */
export const viewport: Viewport = {
  themeColor: "#09080F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/* ============ STRUCTURED DATA — @graph ============ */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://shonenbuilds.online/#organization",
      name: "ShonenBuilds",
      url: "https://shonenbuilds.online",
      logo: "https://shonenbuilds.online/icon-512.png",
      sameAs: [
        "https://x.com/shonenbuilds",
        "https://github.com/Zurriyatt/ShonenBuilds",
        "https://linkedin.com/company/shonenbuilds",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://shonenbuilds.online/#website",
      url: "https://shonenbuilds.online",
      name: "ShonenBuilds",
      publisher: { "@id": "https://shonenbuilds.online/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://shonenbuilds.online/#software",
      name: "ShonenBuilds",
      applicationCategory: "HealthApplication",
      applicationSubCategory: "Fitness",
      operatingSystem: "Web",
      url: "https://shonenbuilds.online",
      description:
        "Gamified calisthenics skill tree for mastering Planche, Front Lever, Handstand Push-Ups, Muscle-Up, and Human Flag.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Gamified calisthenics skill tree",
        "XP and progression tracking",
        "10 anime-inspired rank tiers (E-Rank to Apex)",
        "Global leaderboard",
        "Squad challenges",
        "Real-time workout chat",
      ],
      audience: {
        "@type": "Audience",
        audienceType:
          "Calisthenics athletes, bodyweight fitness enthusiasts, anime fans",
      },
      publisher: { "@id": "https://shonenbuilds.online/#organization" },
    },
  ],
};

/* ============ ROOT LAYOUT ============ */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="min-h-full flex flex-col max-w-screen overflow-x-hidden bg-background text-foreground">
        <VisibleLayout>{children}</VisibleLayout>
      </body>
    </html>
  );
}