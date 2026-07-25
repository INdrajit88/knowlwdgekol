"use client";

import { useKnowledgeStore } from "@/store/knowledgeStore";
import { formatAddress } from "@/services/stellar";
import { BarChart3, Award, Coins, Trophy, Sparkles } from "lucide-react";

export default function AnalyticsPage() {
  const { leaderboard } = useKnowledgeStore();

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Platinum":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Gold":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Silver":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900">Contributor Leaderboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            On-chain Soroban reputation scores & earned bounties
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Contributors</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900">380+</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Tiered reputation profiles</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Escrow Volume</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold font-mono text-amber-600">14,850 XLM</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Distributed to answer authors</p>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">RAG Citation Accuracy</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-emerald-600">97.8%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified web documentation</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Top Knowledge Contributors</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Ranked by Reputation Treasury Points</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Contributor Address</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Reputation Points</th>
                <th className="py-2.5 px-3">Accepted Answers</th>
                <th className="py-2.5 px-3">Total Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-800">
              {leaderboard.map((item, index) => (
                <tr key={item.address} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-400">#{index + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{formatAddress(item.address)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getTierBadge(item.tier)}`}>
                      {item.tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-blue-600">{item.reputationPoints} pts</td>
                  <td className="py-3 px-3">{item.acceptedCount} / {item.answeredCount}</td>
                  <td className="py-3 px-3 font-bold text-amber-600">{item.totalEarnedXlm} XLM</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
