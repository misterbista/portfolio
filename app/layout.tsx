import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "./site-config";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("portfolio-theme");
      const systemTheme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      const theme = savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : systemTheme;

      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", theme === "dark" ? "#111210" : "#ffffff");
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: { url: "/code.png", type: "image/png", sizes: "512x512" },
    apple: { url: "/code.png", sizes: "512x512" },
  },
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  keywords: [
    "Piyushraj Bista",
    "Full Stack Developer Nepal",
    ".NET Developer Nepal",
    "React Developer Nepal",
    "Enterprise Software Engineer",
    "ASP.NET Core",
    "Azure",
    "SQL Server",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    firstName: "Piyushraj",
    lastName: "Bista",
    username: "misterbista",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}, ${siteConfig.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/opengraph-image"],
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
  category: "technology",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={geistMono.variable}>{children}</body>
    </html>
  );
}
