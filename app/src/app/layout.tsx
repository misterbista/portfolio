import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piyushraj Bista | Full Stack Developer",
  description:
    "Piyushraj Bista - Full Stack Developer specializing in modern web technologies. Explore my portfolio, skills, experience, and projects.",
  authors: [{ name: "Piyushraj Bista" }],
  openGraph: {
    title: "Piyushraj Bista | Full Stack Developer",
    description:
      "Full Stack Developer portfolio showcasing skills in web development, projects, and experience.",
    url: "https://piyushrajbista.com.np",
    type: "website",
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary",
    title: "Piyushraj Bista | Full Stack Developer",
    description:
      "Full Stack Developer portfolio showcasing skills in web development, projects, and experience.",
    images: ["/favicon.png"],
  },
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script id="portfolio-session-check" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("portfolio-loaded")==="true"){document.documentElement.classList.add("portfolio-session-loaded");}}catch(_){};`}
        </Script>
        {children}
      </body>
    </html>
  );
}
