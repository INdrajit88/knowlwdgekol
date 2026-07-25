"use client";

import { useState, useEffect } from "react";
import { useKnowledgeStore, QuestionModel } from "@/store/knowledgeStore";
import { useWalletStore } from "@/store/walletStore";
import { useTxStore } from "@/store/txStore";
import { QuestionCard } from "@/components/ui/QuestionCard";
import { AnswerCard } from "@/components/ui/AnswerCard";
import { RAGSearchModal } from "@/components/ui/RAGSearchModal";
import { SubmitExperienceModal } from "@/components/ui/SubmitExperienceModal";
import { currentNetwork, formatAddress, invokeSorobanTestnetTransaction } from "@/services/stellar";
import { Plus, Search, ShieldCheck, HelpCircle, PenTool, Lock, RefreshCw, Compass, UserCheck, MessageSquare, X } from "lucide-react";

type ViewMode = "marketplace" | "my_questions" | "my_answers";

export default function DashboardPage() {
  const { questions, answers, upvoteAnswer, acceptAnswer, syncWithServer } = useKnowledgeStore();
  const { isConnected, publicKey, connectWallet } = useWalletStore();
  const { addTransaction, updateTxStatus } = useTxStore();

  const [viewMode, setViewMode] = useState<ViewMode>("marketplace");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    syncWithServer();
    const timer = setInterval(() => {
      syncWithServer();
    }, 3000);
    return () => clearInterval(timer);
  }, [syncWithServer]);

  // Compute filtered questions list based on active view mode
  const myQuestionsCount = questions.filter((q) => isConnected && publicKey && q.asker === publicKey).length;
  const myAnswersCount = questions.filter((q) => {
    if (!isConnected || !publicKey) return false;
    const qAnswers = answers[q.id] || [];
    return qAnswers.some((ans) => ans.author === publicKey);
  }).length;

  const filteredQuestions = questions.filter((q) => {
    if (viewMode === "my_questions") {
      if (!publicKey || q.asker !== publicKey) return false;
    } else if (viewMode === "my_answers") {
      if (!publicKey) return false;
      const qAnswers = answers[q.id] || [];
      if (!qAnswers.some((ans) => ans.author === publicKey)) return false;
    }

    const matchesSearch = q.prompt.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "All" || q.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const selectedQuestion = selectedQuestionId !== null ? questions.find((q) => q.id === selectedQuestionId) || null : null;
  const questionAnswers = selectedQuestion ? (answers[selectedQuestion.id] || []) : [];

  const categories = ["All", "Architecture", "Smart Contracts", "DeFi & SDKs", "Performance"];

  const handleAcceptAnswer = async (answerId: number) => {
    if (!isConnected || !publicKey || !selectedQuestion) {
      await connectWallet();
      return;
    }

    const txId = addTransaction({
      txHash: "",
      operationName: "accept_answer (Unlock Article & Escrow Payout)",
      contractInvolved: currentNetwork.treasuryContractId,
      status: "Preparing",
      timestamp: "Just now",
    });

    try {
      updateTxStatus(txId, "Processing");

      // Real Soroban Testnet Transaction invocation
      const realTxHash = await invokeSorobanTestnetTransaction(
        currentNetwork.treasuryContractId,
        "accept_answer",
        publicKey,
        selectedQuestion.bountyXlm
      );

      await acceptAnswer(selectedQuestion.id, answerId, publicKey);

      updateTxStatus(txId, "Confirmed", realTxHash);
    } catch (err: any) {
      updateTxStatus(txId, "Failed", undefined, err?.message || "Bounty payout failed");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Top Section View Selector Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => {
              setViewMode("marketplace");
              setSelectedQuestionId(null);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === "marketplace"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore Marketplace ({questions.length})</span>
          </button>

          <button
            onClick={() => {
              if (!isConnected) connectWallet();
              setViewMode("my_questions");
              setSelectedQuestionId(null);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === "my_questions"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>My Asked Questions ({myQuestionsCount})</span>
          </button>

          <button
            onClick={() => {
              if (!isConnected) connectWallet();
              setViewMode("my_answers");
              setSelectedQuestionId(null);
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              viewMode === "my_answers"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>My Submitted Answers ({myAnswersCount})</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => syncWithServer()}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title="Refresh Questions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAskModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white text-xs shadow-sm transition-all flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Experience Question</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Questions */}
        <div className={`${selectedQuestion ? "lg:col-span-5" : "lg:col-span-12 max-w-4xl mx-auto w-full"} space-y-3 min-w-0 transition-all duration-300`}>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search questions or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-xs text-slate-800 outline-none"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredQuestions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No questions found in this view.</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {viewMode === "my_questions"
                    ? "You haven't asked any experience questions yet. Click 'Ask Experience Question' above!"
                    : viewMode === "my_answers"
                    ? "You haven't answered any questions yet. Browse the marketplace and share your expertise!"
                    : "No matching questions found."}
                </p>
              </div>
            ) : (
              filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onSelect={(selected) => setSelectedQuestionId(selected.id)}
                  isSelected={selectedQuestion !== null && q.id === selectedQuestion.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected Details & Answers */}
        {selectedQuestion && (
          <div className="lg:col-span-7 space-y-4 min-w-0 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="space-y-4 min-w-0">
              {/* Question Header & Close Action */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm min-w-0 overflow-hidden relative">
                <button
                  onClick={() => setSelectedQuestionId(null)}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center space-x-1 text-xs font-semibold"
                  title="Close Detail View"
                >
                  <span>Close</span>
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-2 pr-16">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                    {selectedQuestion.category}
                  </span>
                  <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold flex-shrink-0">
                    Bounty Escrow: {selectedQuestion.bountyXlm} XLM
                  </div>
                </div>

                <h2 className="text-base font-bold text-slate-900 leading-snug break-words pr-4">{selectedQuestion.prompt}</h2>

                <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-slate-100 min-w-0">
                  <span className="truncate">Asker: {formatAddress(selectedQuestion.asker, 4)}</span>
                  <span className="flex-shrink-0">{selectedQuestion.createdAt}</span>
                </div>

                {selectedQuestion.status !== "Resolved" && (
                  <div className="pt-1">
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5 text-blue-400" />
                      <span>Share Your Experience Solution (Teaser + Full Article)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Answers List */}
              <div className="space-y-3 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-xs font-bold text-slate-700 uppercase tracking-wider min-w-0">
                  <span className="flex items-center space-x-1.5 min-w-0">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Expert Responses ({questionAnswers.length})</span>
                  </span>
                  <span className="flex items-center space-x-1 text-[11px] font-mono text-amber-700 normal-case font-medium flex-shrink-0">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Select answer to unlock full article</span>
                  </span>
                </div>

                {questionAnswers.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-2">
                    <HelpCircle className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">No responses submitted yet.</p>
                    <p className="text-[11px] text-slate-400">Are you an experienced developer? Share your solution above!</p>
                  </div>
                ) : (
                  <div className="space-y-3 min-w-0">
                    {questionAnswers.map((ans) => (
                      <AnswerCard
                        key={ans.id}
                        answer={ans}
                        bountyXlm={selectedQuestion.bountyXlm}
                        isAsker={publicKey === selectedQuestion.asker}
                        onUpvote={(ansId) => upvoteAnswer(ansId, selectedQuestion.id)}
                        onAccept={handleAcceptAnswer}
                        isQuestionResolved={selectedQuestion.status === "Resolved"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <RAGSearchModal isOpen={isAskModalOpen} onClose={() => setIsAskModalOpen(false)} />
      {selectedQuestion && (
        <SubmitExperienceModal
          isOpen={isSubmitModalOpen}
          questionId={selectedQuestion.id}
          questionPrompt={selectedQuestion.prompt}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      )}
    </div>
  );
}
