"use client";

import { useTxStore, TransactionItem } from "@/store/txStore";
import { formatAddress } from "@/services/stellar";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase">
            {latestTx.operationName}
          </h4>
          <p className="text-xs text-slate-500 font-mono">
            Status: <span className="font-semibold text-slate-800">{latestTx.status}</span> • {latestTx.timestamp}
          </p>
          {latestTx.txHash && (
            <p className="text-[11px] font-mono text-slate-600">
              Tx Hash: <span className="font-semibold text-slate-800">{formatAddress(latestTx.txHash, 5)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
