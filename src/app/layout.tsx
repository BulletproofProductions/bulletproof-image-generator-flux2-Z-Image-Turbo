import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderWrapper } from "@/components/site-header-wrapper";
import { GenerationProvider } from "@/components/generation-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Bulletproof Productions",
    template: "%s | Bulletproof Productions",
  },
  description:
    "AI-powered image generation by Bulletproof Productions. Create stunning images with text-to-image and image-to-image capabilities, customizable prompts, and reusable avatars.",
  keywords: [
    "AI Image Generation",
    "Bulletproof Productions",
    "Text to Image",
    "Image Generation",
    "Bulletproof Productions",
    "Next.js",
    "React",
  ],
  authors: [{ name: "Bulletproof Productions" }],
  creator: "Bulletproof Productions",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Bulletproof Productions",
    title: "Bulletproof Productions",
    description:
      "AI-powered image generation by Bulletproof Productions. Create stunning images with customizable prompts.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "Bulletproof Productions Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bulletproof Productions",
    description:
      "AI-powered image generation by Bulletproof Productions. Create stunning images with customizable prompts.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Bulletproof Productions",
  description:
    "AI-powered image generation by Bulletproof Productions. Create stunning images with text-to-image and image-to-image capabilities.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Bulletproof Productions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GenerationProvider>
            <SiteHeaderWrapper />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <Toaster richColors position="top-right" />
          </GenerationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
