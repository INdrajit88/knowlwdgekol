import { QuestionModel } from "@/store/knowledgeStore";
import { formatAddress } from "@/services/stellar";
import { Coins, MessageSquare, CheckCircle2, Clock, Sparkles, ChevronRight } from "lucide-react";

interface QuestionCardProps {
  question: QuestionModel;
  onSelect: (question: QuestionModel) => void;
  isSelected?: boolean;
}

export function QuestionCard({ question, onSelect, isSelected }: QuestionCardProps) {
  const getStatusBadge = (status: QuestionModel["status"]) => {
    switch (status) {
      case "Resolved":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
            <CheckCircle2 className="w-3 h-3" />
            <span>Awarded</span>
          </span>
        );
      case "Answered":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>{question.answerCount} Answers</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>Open</span>
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onSelect(question)}
      className={`group cursor-pointer rounded-xl p-4 transition-all border overflow-hidden min-w-0 ${
        isSelected
          ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20"
          : "bg-white hover:bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 truncate">
            {question.category}
          </span>
          {getStatusBadge(question.status)}
        </div>
        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono text-xs font-bold flex-shrink-0">
          <Coins className="w-3.5 h-3.5" />
          <span>{question.bountyXlm} XLM</span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2 break-words">
        {question.prompt}
      </h3>

      <div className="flex items-center justify-between text-xs text-slate-500 font-mono pt-2.5 border-t border-slate-100 min-w-0">
        <span className="truncate">Asked by {formatAddress(question.asker, 4)}</span>
        <div className="flex items-center space-x-1 text-slate-600 flex-shrink-0">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{question.answerCount}</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
