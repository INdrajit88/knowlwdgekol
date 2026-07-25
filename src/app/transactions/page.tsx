"use client";

import { useState } from "react";
import { useTxStore, TransactionItem } from "@/store/txStore";
import { formatAddress } from "@/services/stellar";
import { Wallet, Copy, Check, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function TransactionsPage() {
  const { transactions } = useTxStore();
  const [filter, setFilter] = useState<string>("All");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredTxs = transactions.filter((t) => {
    if (filter === "All") return true;
    return t.status === filter;
  });

  const getStatusBadge = (status: TransactionItem["status"]) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case "Failed":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-extrabold text-slate-900">Transaction Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Soroban smart contract interaction & bounty audit log
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {["All", "Confirmed", "Pending", "Failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filteredTxs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No transactions recorded.
          </div>
        ) : (
          filteredTxs.map((tx) => (
            <div
              key={tx.id}
              className="rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  {getStatusBadge(tx.status)}
                  <h3 className="text-xs font-bold text-slate-900">{tx.operationName}</h3>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                  <span>Contract: {formatAddress(tx.contractInvolved, 5)}</span>
                  <span>•</span>
                  <span>{tx.timestamp}</span>
                </div>
              </div>

              {tx.txHash && (
                <div className="flex items-center space-x-2 flex-shrink-0 font-mono text-xs">
                  <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    Hash: {formatAddress(tx.txHash, 6)}
                  </span>
                  <button
                    onClick={() => handleCopy(tx.txHash!)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                    title="Copy Transaction Hash"
                  >
                    {copiedHash === tx.txHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
