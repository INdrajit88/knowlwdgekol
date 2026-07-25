import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TxStatusToast } from "@/components/ui/TxStatusToast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "knowledgekol | Peer-to-Peer Experience Sharing Platform on Stellar Soroban",
  description:
    "Decentralized peer-to-peer technical knowledge and experience sharing marketplace powered by Stellar Soroban smart contracts, gated answer teasers, and escrow bounty unlocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-white text-slate-900 font-sans antialiased min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <Footer />
        <TxStatusToast />
      </body>
    </html>
  );
}
