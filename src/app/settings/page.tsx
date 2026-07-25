"use client";

import { useState } from "react";
import { useWalletStore } from "@/store/walletStore";
import { NETWORKS, NetworkConfig } from "@/services/stellar";
import { Settings, Shield, Globe, Cpu, Database, Save, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { network, setNetwork } = useWalletStore();
  const [selectedNetworkKey, setSelectedNetworkKey] = useState<string>(network);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNetwork(selectedNetworkKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const selectedNet = (NETWORKS as Record<string, NetworkConfig>)[selectedNetworkKey] || NETWORKS.TESTNET;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Network & Protocol Settings</h1>
            <p className="text-xs text-slate-500">Configure Stellar Soroban RPC endpoints & contract addresses</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Network Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Stellar Network Selection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedNetworkKey === "TESTNET"
                  ? "bg-blue-50/50 border-blue-500 ring-1 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-slate-900">Stellar Testnet</span>
                </div>
                <input
                  type="radio"
                  name="network"
                  value="TESTNET"
                  checked={selectedNetworkKey === "TESTNET"}
                  onChange={(e) => setSelectedNetworkKey(e.target.value)}
                  className="accent-blue-600"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Recommended for testing Soroban smart contracts and simulated XLM bounties.</p>
            </label>
          </div>
        </div>

        {/* Contract & RPC Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Active Contract & RPC Parameters</span>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Horizon REST Server</label>
              <input
                type="text"
                readOnly
                value={selectedNet.horizonUrl}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Soroban RPC Node</label>
              <input
                type="text"
                readOnly
                value={selectedNet.rpcUrl}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Knowledge Marketplace Contract ID</label>
              <input
                type="text"
                readOnly
                value={selectedNet.marketContractId}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Reputation Treasury Contract ID</label>
              <input
                type="text"
                readOnly
                value={selectedNet.treasuryContractId}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </form>
    </div>
  );
}
