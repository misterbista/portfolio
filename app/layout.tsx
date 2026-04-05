import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://piyushrajbista.com.np"),
  title: {
    default: "Piyushraj Bista | Full Stack Developer",
    template: "%s | Piyushraj Bista",
  },
  description:
    "Piyushraj Bista — Full Stack Developer specializing in modern web technologies. Explore my portfolio, skills, experience, and writing.",
  authors: [{ name: "Piyushraj Bista", url: "https://piyushrajbista.com.np" }],
  creator: "Piyushraj Bista",
  openGraph: {
    title: "Piyushraj Bista | Full Stack Developer",
    description:
      "Full Stack Developer portfolio showcasing skills in web development, projects, and experience.",
    url: "https://piyushrajbista.com.np",
    siteName: "Piyushraj Bista",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Piyushraj Bista",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Piyushraj Bista | Full Stack Developer",
    description:
      "Full Stack Developer portfolio showcasing skills in web development, projects, and experience.",
    images: ["/favicon.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
