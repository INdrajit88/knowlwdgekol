import Link from "next/link";
import { StatsOverview } from "@/components/ui/StatsOverview";
import { Sparkles, ArrowRight, ShieldCheck, Coins, Users, Lock, Award, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      {/* Minimal Hero Section */}
      <section className="text-center max-w-3xl mx-auto py-8 space-y-5">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stellar Soroban Peer-to-Peer Knowledge Sharing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Real-World Technical Experience,
          <span className="block text-blue-600 mt-1">
            Unlocked by Stellar Soroban Escrow
          </span>
        </h1>

        <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Ask domain experts real-world technical questions with XLM bounties. Experts share public teasers and locked full solutions—unlocked on-chain when accepted.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md text-sm transition-all group"
          >
            <span>Explore Experience Requests</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/activity"
            className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-sm transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Live Activity Stream</span>
          </Link>
        </div>
      </section>

      {/* 3-Step Experience Sharing Workflow */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-slate-900">How Peer-to-Peer Experience Sharing Works</h2>
          <p className="text-xs text-slate-500 mt-1">Fair incentives for domain experts and askers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Ask & Escrow XLM</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Post an experience request and deposit an XLM bounty into the Soroban treasury escrow.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Teaser + Locked Solution</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Experienced contributors write a public teaser preview alongside their complete locked article.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">Unlock & Release Bounty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select the best answer to trigger cross-contract payouts, unlock the full article, and award reputation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Clean Callout */}
      <section className="rounded-2xl bg-blue-600 text-white p-8 text-center space-y-4 shadow-md">
        <h2 className="text-2xl font-extrabold">Ready to Learn from Experienced Engineers?</h2>
        <p className="text-blue-100 text-xs max-w-md mx-auto">
          Connect your Stellar wallet, post a question, and get real-world answers backed by Soroban smart contract bounties.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 px-6 py-3 rounded-xl bg-white text-blue-600 font-bold hover:bg-slate-100 transition-all text-xs"
          >
            <span>Open Experience Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
