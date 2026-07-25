import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { currentNetwork, formatAddress } from "@/services/stellar";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-800">Lumina</span>
          <span>— Instant Verified Answers on Stellar</span>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-500">
          <span>Market: {formatAddress(currentNetwork.marketContractId, 4)}</span>
          <span>Treasury: {formatAddress(currentNetwork.treasuryContractId, 4)}</span>
          <a
            href="https://developers.stellar.org/docs/build/smart-contracts/overview"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline flex items-center space-x-1 font-sans"
          >
            <span>Stellar Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
