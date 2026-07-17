import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IAA Digital — Ikatan Arsiparis ANRI",
  description:
    "Platform Digital Organisasi Ikatan Arsiparis ANRI. Manajemen anggota, perpustakaan digital, arsip organisasi, kegiatan, dan e-certificate dalam satu sistem.",
  keywords: [
    "IAA",
    "Ikatan Arsiparis ANRI",
    "Arsiparis",
    "ANRI",
    "Kearsipan",
    "Organisasi Profesional",
    "Digital Platform",
  ],
  authors: [{ name: "IAA Digital" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "IAA Digital — Ikatan Arsiparis ANRI",
    description:
      "Platform Digital Organisasi Ikatan Arsiparis ANRI",
    siteName: "IAA Digital",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
