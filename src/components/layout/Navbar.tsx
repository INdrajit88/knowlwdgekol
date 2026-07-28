"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletStore } from "@/store/walletStore";
import { formatAddress } from "@/services/stellar";
import { BrainCircuit, Wallet, LogOut, Activity, BarChart3, Settings, HelpCircle, Menu, X, ExternalLink, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, publicKey, xlmBalance, isConnecting, connectWallet, connectDemoWallet, disconnectWallet, network, error, clearError } =
    useWalletStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: HelpCircle },
    { name: "Activity", href: "/activity", icon: Activity },
    { name: "Transactions", href: "/transactions", icon: Wallet },
    { name: "Leaderboard", href: "/analytics", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Wallet Connection Error / Installation Guidance Banner */}
      {error && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={() => connectDemoWallet()}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-all"
            >
              <span>Use Testnet Demo Wallet</span>
            </button>
            <a
              href="https://www.freighter.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-all"
            >
              <span>Get Freighter</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={clearError}
              className="p-1 hover:bg-amber-100 rounded-md text-amber-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Name */}
        <Link href="/" className="flex items-center space-x-2.5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            knowledgekol
          </span>
        </Link>

        {/* Center: Desktop Navigation Segment */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-blue-600 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Unified Wallet Status Pill */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isConnected && publicKey ? (
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-xs">
              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 text-xs font-mono text-slate-600 border-r border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700">{network}</span>
                <span className="text-slate-300">|</span>
                <span className="font-bold text-amber-600">{xlmBalance} XLM</span>
              </div>
              <button
                onClick={disconnectWallet}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 text-slate-800 hover:text-red-600 text-xs font-mono font-bold transition-all"
                title="Disconnect Wallet"
              >
                <span>{formatAddress(publicKey, 4)}</span>
                <LogOut className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connectWallet()}
              disabled={isConnecting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isConnecting ? "Connecting..." : "Connect Freighter"}</span>
            </button>
          )}

          {/* Mobile Navigation Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
