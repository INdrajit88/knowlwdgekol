"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { useKnowledgeStore } from "@/store/knowledgeStore";
import { useTxStore } from "@/store/txStore";
import { currentNetwork, invokeSorobanTestnetTransaction } from "@/services/stellar";
import { HelpCircle, X, Loader2, Coins, ArrowRight } from "lucide-react";

interface RAGSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RAGSearchModal({ isOpen, onClose }: RAGSearchModalProps) {
  const { isConnected, publicKey, connectWallet } = useWalletStore();
  const { askQuestion } = useKnowledgeStore();
  const { addTransaction, updateTxStatus } = useTxStore();

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Architecture");
  const [bountyXlm, setBountyXlm] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
      operationName: "ask_question (Escrow Bounty Deposit)",
      contractInvolved: currentNetwork.marketContractId,
      status: "Preparing",
      timestamp: "Just now",
    });

    try {
      updateTxStatus(txId, "Processing");

      // Pass bountyXlm to trigger real Operation.payment deduction on Stellar Testnet via Freighter
      const realTxHash = await invokeSorobanTestnetTransaction(
        currentNetwork.marketContractId,
        "ask_question",
        publicKey,
        bountyXlm
      );

      const qId = await askQuestion(prompt, category, bountyXlm, publicKey);

      updateTxStatus(txId, "Confirmed", realTxHash);
      setIsSubmitting(false);
      setPrompt("");
      onClose();
    } catch (err: any) {
      updateTxStatus(txId, "Failed", undefined, err?.message || "Transaction failed");
      setIsSubmitting(false);
    }
  };

  const categories = ["Architecture", "Smart Contracts", "DeFi & SDKs", "Performance"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Post Experience Question</h2>
              <p className="text-xs text-slate-500">Deposit XLM bounty into Soroban Treasury Escrow</p>
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Technical Experience Request
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. How did your engineering team optimize Soroban CPU instruction limits in production?"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-xs resize-none outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Category Tag
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                    category === cat
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                XLM Bounty Escrow Amount
              </label>
              <span className="font-mono text-xs font-bold text-amber-600 flex items-center space-x-1">
                <Coins className="w-3.5 h-3.5 inline mr-1" />
                {bountyXlm} XLM
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={bountyXlm}
              onChange={(e) => setBountyXlm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
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
                  <span>Submitting to Soroban Escrow...</span>
                </>
              ) : (
                <>
                  <span>Deposit Escrow & Post Question ({bountyXlm} XLM)</span>
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
