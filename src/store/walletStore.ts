import { create } from "zustand";
import { persist } from "zustand/middleware";
import { checkFreighterInstalled, getFreighterPublicKey, getAccountXlmBalance, currentNetwork } from "@/services/stellar";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  xlmBalance: string;
  isConnecting: boolean;
  network: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setNetwork: (networkName: string) => void;
  refreshBalance: () => Promise<void>;
  deductBalance: (amountXlm: number) => void;
  creditBalance: (amountXlm: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      publicKey: null,
      xlmBalance: "1,250.00",
      isConnecting: false,
      network: "TESTNET",

      connectWallet: async () => {
        set({ isConnecting: true });
        try {
          const installed = await checkFreighterInstalled();
          if (installed) {
            const key = await getFreighterPublicKey();
            if (key) {
              const balance = await getAccountXlmBalance(key);
              set({
                isConnected: true,
                publicKey: key,
                xlmBalance: balance !== "0.00" ? balance : "1,250.00",
                isConnecting: false,
              });
              return;
            }
          }
        } catch (err) {}

        // Demo fallback wallet connection
        const mockPublicKey = "GCFD54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N";
        set({
          isConnected: true,
          publicKey: mockPublicKey,
          xlmBalance: "1,250.00",
          isConnecting: false,
        });
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          publicKey: null,
          xlmBalance: "0.00",
        });
      },

      setNetwork: (networkName: string) => {
        set({ network: networkName });
      },

      refreshBalance: async () => {
        const { publicKey } = get();
        if (publicKey) {
          const balance = await getAccountXlmBalance(publicKey);
          if (balance !== "0.00") {
            set({ xlmBalance: balance });
          }
        }
      },

      deductBalance: (amountXlm: number) => {
        const currentStr = get().xlmBalance.replace(/,/g, "");
        const currentNum = parseFloat(currentStr) || 1250;
        const newNum = Math.max(0, currentNum - amountXlm);
        set({
          xlmBalance: newNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
      },

      creditBalance: (amountXlm: number) => {
        const currentStr = get().xlmBalance.replace(/,/g, "");
        const currentNum = parseFloat(currentStr) || 1250;
        const newNum = currentNum + amountXlm;
        set({
          xlmBalance: newNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
      },
    }),
    {
      name: "knowledgekol-wallet-storage",
      partialize: (state) => ({
        isConnected: state.isConnected,
        publicKey: state.publicKey,
        xlmBalance: state.xlmBalance,
        network: state.network,
      }),
    }
  )
);
