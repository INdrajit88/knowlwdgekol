import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TxStatusToast } from "@/components/ui/TxStatusToast";

export const metadata: Metadata = {
  title: "Lumina | AI Knowledge Marketplace on Stellar Soroban",
  description:
    "Perplexity + Web3: Decentralized Retrieval-Augmented Generation (RAG) AI marketplace with Soroban smart contracts, inter-contract escrow, and reputation rewards.",
  keywords: ["Stellar", "Soroban", "RAG AI", "Smart Contracts", "Web3", "Knowledge Marketplace"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-stellar-primary selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
        <TxStatusToast />
      </body>
    </html>
  );
}
