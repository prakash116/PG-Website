import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/common/BackToTop";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pzzee.in"),
  title: {
    default: "Pzzee – Find Verified PGs & Rooms Near You",
    template: "%s | Pzzee",
  },
  description:
    "Discover trusted and verified PG accommodation according to your location, room preference and monthly budget with Pzzee.",
  keywords: [
    "PG",
    "paying guest",
    "PG near me",
    "verified PG",
    "rooms for rent",
    "co-living",
    "student accommodation",
  ],
  openGraph: {
    title: "Pzzee – Find Verified PGs & Rooms Near You",
    description:
      "Discover trusted and verified PG accommodation according to your location, room preference and monthly budget with Pzzee.",
    siteName: "Pzzee",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-background font-sans text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3200,
            style: {
              background: "oklch(0.215 0.045 47)",
              color: "#fff",
              borderRadius: "999px",
              padding: "10px 18px",
              fontSize: "14px",
              maxWidth: "420px",
            },
          }}
        />
      </body>
    </html>
  );
}
