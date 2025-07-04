import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import SchemaMarkup from "@/components/schema-markup";
import Analytics from "@/components/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HireGenie - Get More Interviews with AI-Powered Cover Letters",
  description: "Create ATS-optimized, personalized cover letters in under 2 minutes. AI analyzes your resume and job descriptions to generate professional letters that land interviews.",
  keywords: ["ATS cover letters", "AI cover letter generator", "job application", "resume optimization", "interview preparation", "cover letter writing", "job search tools"],
  authors: [{ name: "HireGenie" }],
  creator: "HireGenie",
  publisher: "HireGenie",
  metadataBase: new URL("https://hiregenie.io"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiregenie.io",
    siteName: "HireGenie",
    title: "HireGenie - Get More Interviews with AI-Powered Cover Letters",
    description: "Create ATS-optimized, personalized cover letters in under 2 minutes. AI analyzes your resume and job descriptions to generate professional letters that land interviews.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HireGenie - AI-Powered Cover Letter Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireGenie - Get More Interviews with AI-Powered Cover Letters",
    description: "Create ATS-optimized, personalized cover letters in under 2 minutes. AI analyzes your resume and job descriptions to generate professional letters that land interviews.",
    images: ["/twitter-image.png"],
    creator: "@hiregenie",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "your-google-site-verification-code",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
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
        <SchemaMarkup />
      </head>
      <body className={inter.className}>
        <Analytics />
        <PostHogProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <TempoInit />
        </PostHogProvider>
      </body>
    </html>
  );
}
