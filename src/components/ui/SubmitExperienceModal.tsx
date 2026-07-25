"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { useKnowledgeStore } from "@/store/knowledgeStore";
import { useTxStore } from "@/store/txStore";
import { currentNetwork, invokeSorobanTestnetTransaction } from "@/services/stellar";
import { Sparkles, X, Loader2, ArrowRight, Lock, Eye } from "lucide-react";

interface SubmitExperienceModalProps {
  isOpen: boolean;
  questionId: number;
  questionPrompt: string;
  onClose: () => void;
}

export function SubmitExperienceModal({
  isOpen,
  questionId,
  questionPrompt,
  onClose,
}: SubmitExperienceModalProps) {
  const { isConnected, publicKey, connectWallet } = useWalletStore();
  const { submitAnswer } = useKnowledgeStore();
  const { addTransaction, updateTxStatus } = useTxStore();

  const [teaser, setTeaser] = useState("");
  const [fullArticle, setFullArticle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teaser.trim() || !fullArticle.trim()) return;

    if (!isConnected || !publicKey) {
      await connectWallet();
      return;
    }

    setIsSubmitting(true);

    const txId = addTransaction({
      txHash: "",
      operationName: "submit_answer (Teaser + Gated Article)",
      contractInvolved: currentNetwork.marketContractId,
      status: "Preparing",
      timestamp: "Just now",
    });

    try {
      updateTxStatus(txId, "Processing");
      
      // Real Stellar Testnet Soroban transaction invocation
      const realTxHash = await invokeSorobanTestnetTransaction(
        currentNetwork.marketContractId,
        "submit_answer",
        publicKey
      );

      await submitAnswer(questionId, publicKey, teaser, fullArticle);

      updateTxStatus(txId, "Confirmed", realTxHash);
      setIsSubmitting(false);
      setTeaser("");
      setFullArticle("");
      onClose();
    } catch (err: any) {
      updateTxStatus(txId, "Failed", undefined, err?.message || "Submission failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share Your Experience Solution</h2>
              <p className="text-xs text-slate-500">Provide a public teaser preview + locked full article</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-semibold line-clamp-2">
          Question: "{questionPrompt}"
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Teaser / Key Insight (Visible to All)</span>
            </label>
            <textarea
              rows={2}
              value={teaser}
              onChange={(e) => setTeaser(e.target.value)}
              placeholder="e.g. We solved this state archival challenge by deploying an automated TTL monitor daemon..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-xs resize-none outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Full Article & Detailed Solution (Gated until Asker Unlocks)</span>
            </label>
            <textarea
              rows={5}
              value={fullArticle}
              onChange={(e) => setFullArticle(e.target.value)}
              placeholder="Write your complete in-depth experience, code snippets, architecture details, and case study..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 text-xs resize-none outline-none"
              required
            />
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !teaser.trim() || !fullArticle.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Solution to Testnet...</span>
                </>
              ) : (
                <>
                  <span>Submit Solution (+15 Rep Points)</span>
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
