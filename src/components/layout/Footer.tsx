import { BrainCircuit } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold text-slate-800 font-sans text-sm">knowledgekol</span>
          <span>• Stellar Soroban Peer-to-Peer Knowledge Sharing</span>
        </div>

        <div>
          <span>Powered by Soroban Smart Contracts</span>
        </div>
      </div>
    </footer>
  );
}
