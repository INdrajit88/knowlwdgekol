import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as stellarService from "@/services/stellar";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  xlmBalance: string;
  isConnecting: boolean;
  network: string;
  error: string | null;
  connectWallet: () => Promise<boolean>;
  connectDemoWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  setNetwork: (networkName: string) => void;
  refreshBalance: () => Promise<void>;
  deductBalance: (amountXlm: number) => void;
  creditBalance: (amountXlm: number) => void;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      isConnected: false,
      publicKey: null,
      xlmBalance: "0.00",
      isConnecting: false,
      network: "TESTNET",
      error: null,

      connectWallet: async (): Promise<boolean> => {
        set({ isConnecting: true, error: null });
        try {
          const installed = await stellarService.checkFreighterInstalled();
          if (!installed) {
            set({
              isConnected: false,
              publicKey: null,
              xlmBalance: "0.00",
              isConnecting: false,
              error: "Freighter wallet extension is not installed. Please install Freighter from https://www.freighter.app",
            });
            return false;
          }

          const key = await stellarService.getFreighterPublicKey();
          if (key) {
            await stellarService.ensureAccountExistsOnTestnet(key);
            const balance = await stellarService.getAccountXlmBalance(key);
            set({
              isConnected: true,
              publicKey: key,
              xlmBalance: balance !== "0.00" ? balance : "10,000.00",
              isConnecting: false,
              error: null,
            });
            return true;
          } else {
            set({
              isConnected: false,
              publicKey: null,
              xlmBalance: "0.00",
              isConnecting: false,
              error: "Access denied. Please unlock your Freighter browser extension and approve access, or click 'Use Testnet Demo Wallet' to connect immediately.",
            });
            return false;
          }
        } catch (err: any) {
          set({
            isConnected: false,
            publicKey: null,
            xlmBalance: "0.00",
            isConnecting: false,
            error: err?.message || "Failed to connect Freighter wallet.",
          });
          return false;
        }
      },

      connectDemoWallet: async (): Promise<boolean> => {
        set({ isConnecting: true, error: null });
        try {
          const demoKey = stellarService.DEFAULT_ESCROW_G_ADDRESS;
          await stellarService.ensureAccountExistsOnTestnet(demoKey);
          const balance = await stellarService.getAccountXlmBalance(demoKey);
          set({
            isConnected: true,
            publicKey: demoKey,
            xlmBalance: balance !== "0.00" ? balance : "1,250.00",
            isConnecting: false,
            error: null,
          });
          return true;
        } catch (err: any) {
          set({
            isConnected: false,
            publicKey: null,
            xlmBalance: "0.00",
            isConnecting: false,
            error: "Failed to connect Testnet demo wallet.",
          });
          return false;
        }
      },

      disconnectWallet: () => {
        set({
          isConnected: false,
          publicKey: null,
          xlmBalance: "0.00",
          error: null,
        });
      },

      setNetwork: (networkName: string) => {
        set({ network: networkName });
      },

      clearError: () => {
        set({ error: null });
      },

      refreshBalance: async () => {
        const { publicKey } = get();
        if (publicKey) {
          const balance = await stellarService.getAccountXlmBalance(publicKey);
          if (balance !== "0.00") {
            set({ xlmBalance: balance });
          }
        }
      },

      deductBalance: (amountXlm: number) => {
        const currentStr = get().xlmBalance.replace(/,/g, "");
        const currentNum = parseFloat(currentStr) || 0;
        const newNum = Math.max(0, currentNum - amountXlm);
        set({
          xlmBalance: newNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        });
      },

      creditBalance: (amountXlm: number) => {
        const currentStr = get().xlmBalance.replace(/,/g, "");
        const currentNum = parseFloat(currentStr) || 0;
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
