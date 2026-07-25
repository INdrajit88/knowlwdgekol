import { AnswerModel } from "@/store/knowledgeStore";
import { formatAddress } from "@/services/stellar";
import { ThumbsUp, CheckCircle, Award, Lock, Unlock, Eye, User } from "lucide-react";

interface AnswerCardProps {
  answer: AnswerModel;
  bountyXlm: number;
  isAsker: boolean;
  onUpvote: (answerId: number) => void;
  onAccept: (answerId: number) => void;
  isQuestionResolved: boolean;
}

export function AnswerCard({
  answer,
  bountyXlm,
  isAsker,
  onUpvote,
  onAccept,
  isQuestionResolved,
}: AnswerCardProps) {
  const isUnlocked = answer.isAccepted || answer.isUnlocked;

  const getTierBadge = (tier: AnswerModel["authorTier"]) => {
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
    <div
      className={`rounded-xl p-5 transition-all border overflow-hidden min-w-0 ${
        answer.isAccepted
          ? "bg-emerald-50/60 border-emerald-300 shadow-sm"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 min-w-0 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 truncate">
                {formatAddress(answer.author, 4)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${getTierBadge(answer.authorTier)}`}>
                {answer.authorTier} Expert
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{answer.createdAt}</p>
          </div>
        </div>

        <div className="flex-shrink-0 self-start sm:self-center">
          {answer.isAccepted ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Accepted Solution</span>
            </span>
          ) : isUnlocked ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-mono font-semibold text-blue-700">
              <Unlock className="w-3.5 h-3.5" />
              <span>Full Article Unlocked</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-600">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Teaser Preview</span>
            </span>
          )}
        </div>
      </div>

      {/* Public Teaser Section */}
      <div className="mb-3 bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 min-w-0">
        <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-semibold text-slate-700">
          <Eye className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Public Insight Teaser</span>
        </div>
        <p className="text-slate-700 text-xs leading-relaxed font-sans italic break-words">
          "{answer.teaser}"
        </p>
      </div>

      {/* Full Article Content (Gated) */}
      {isUnlocked ? (
        <div className="space-y-3 pt-1 min-w-0">
          <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans p-4 rounded-xl bg-white border border-slate-200 break-words overflow-hidden shadow-2xs">
            {answer.fullArticle}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-center space-y-1.5 my-3">
          <Lock className="w-5 h-5 text-amber-600 mx-auto" />
          <p className="text-xs font-bold text-amber-900">
            Full In-Depth Article & Code Solution is Locked
          </p>
          <p className="text-[11px] text-amber-700 max-w-sm mx-auto leading-normal">
            Select this expert's response to release the {bountyXlm} XLM bounty escrow and unlock the full experience article.
          </p>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
        <button
          onClick={() => onUpvote(answer.id)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Upvote Teaser ({answer.upvotes})</span>
        </button>

        {isAsker && !isQuestionResolved && !answer.isAccepted && (
          <button
            onClick={() => onAccept(answer.id)}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Unlock Full Article ({bountyXlm} XLM Escrow)</span>
          </button>
        )}
      </div>
    </div>
  );
}
