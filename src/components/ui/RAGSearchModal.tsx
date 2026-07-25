"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { useKnowledgeStore } from "@/store/knowledgeStore";
import { useTxStore } from "@/store/txStore";
import { currentNetwork } from "@/services/stellar";
import { Sparkles, Coins, X, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

interface RAGSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RAGSearchModal({ isOpen, onClose }: RAGSearchModalProps) {
  const { isConnected, publicKey, connectWallet } = useWalletStore();
  const { askQuestion } = useKnowledgeStore();
  const { addTransaction, updateTxStatus } = useTxStore();

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Smart Contracts");
  const [bountyXlm, setBountyXlm] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    "Smart Contracts",
    "Consensus Mechanism",
    "DeFi & SDKs",
    "State Archival",
    "Security & Audit",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!isConnected || !publicKey) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);

    const txId = addTransaction({
      txHash: "",
      operationName: "ask_question (Escrow Bounty)",
      contractInvolved: currentNetwork.marketContractId,
      status: "Preparing",
      timestamp: "Just now",
    });

    try {
      updateTxStatus(txId, "Processing");
      await new Promise((res) => setTimeout(res, 1000));

      const mockTxHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      await askQuestion(prompt, category, bountyXlm, publicKey);

      updateTxStatus(txId, "Confirmed", mockTxHash);
      setIsSubmitting(false);
      setPrompt("");
      onClose();
    } catch (err: any) {
      updateTxStatus(txId, "Failed", undefined, err?.message || "Execution failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Ask Question with XLM Bounty</h2>
              <p className="text-xs text-slate-500">Stellar Soroban Escrow & AI RAG Synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Question Prompt
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How does Soroban state archival & TTL extension work?"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-sm resize-none outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    category === cat
                      ? "bg-blue-600 text-white font-semibold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Escrow Bounty Amount</span>
              </label>
              <span className="font-mono text-sm font-bold text-amber-600">{bountyXlm} XLM</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={bountyXlm}
              onChange={(e) => setBountyXlm(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Funds are held safely in escrow until you approve the best cited answer.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !prompt.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Escrowing Bounty...</span>
                </>
              ) : (
                <>
                  <span>Post Question ({bountyXlm} XLM)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
