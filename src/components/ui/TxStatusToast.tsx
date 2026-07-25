"use client";

import { useTxStore, TransactionItem } from "@/store/txStore";
import { formatAddress } from "@/services/stellar";
import { ExternalLink, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function TxStatusToast() {
  const { transactions } = useTxStore();
  const latestTx = transactions[0];

  if (!latestTx) return null;

  const getStatusIcon = (status: TransactionItem["status"]) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "Failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "Processing":
      case "Pending":
      default:
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200 rounded-xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex items-start space-x-2.5">
        <div className="mt-0.5">{getStatusIcon(latestTx.status)}</div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase">
            {latestTx.operationName}
          </h4>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Status: <span className="font-semibold text-slate-800">{latestTx.status}</span> • {latestTx.timestamp}
          </p>
          {latestTx.txHash && (
            <a
              href={latestTx.explorerLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-[11px] font-mono text-blue-600 hover:underline mt-1"
            >
              <span>Hash: {formatAddress(latestTx.txHash, 5)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
