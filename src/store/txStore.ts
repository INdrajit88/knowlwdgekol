import { create } from "zustand";
import { getExplorerTxLink, currentNetwork } from "../services/stellar";

export type TxStatus = "Preparing" | "Pending" | "Processing" | "Confirmed" | "Failed";

export interface TransactionItem {
  id: string;
  txHash: string;
  operationName: string;
  contractInvolved: string;
  status: TxStatus;
  timestamp: string;
  explorerLink: string;
  errorMessage?: string;
  retryAction?: () => Promise<void>;
}

export interface TxState {
  transactions: TransactionItem[];
  addTransaction: (tx: Omit<TransactionItem, "id" | "explorerLink">) => string;
  updateTxStatus: (id: string, status: TxStatus, hash?: string, error?: string) => void;
  clearTransactions: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  transactions: [
    {
      id: "tx-demo-1",
      txHash: "7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
      operationName: "ask_question (Bounty Escrow Deposit)",
      contractInvolved: currentNetwork.marketContractId,
      status: "Confirmed",
      timestamp: "2 mins ago",
      explorerLink: getExplorerTxLink("7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a"),
    },
    {
      id: "tx-demo-2",
      txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      operationName: "accept_answer (Escrow Release + Reputation Bonus)",
      contractInvolved: currentNetwork.treasuryContractId,
      status: "Confirmed",
      timestamp: "12 mins ago",
      explorerLink: getExplorerTxLink("1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"),
    },
  ],

  addTransaction: (tx) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: TransactionItem = {
      ...tx,
      id,
      explorerLink: tx.txHash ? getExplorerTxLink(tx.txHash) : "#",
    };
    set((state) => ({
      transactions: [newItem, ...state.transactions],
    }));
    return id;
  },

  updateTxStatus: (id, status, hash, error) => {
    set((state) => ({
      transactions: state.transactions.map((tx) => {
        if (tx.id === id) {
          const updatedHash = hash || tx.txHash;
          return {
            ...tx,
            status,
            txHash: updatedHash,
            explorerLink: updatedHash ? getExplorerTxLink(updatedHash) : tx.explorerLink,
            errorMessage: error || tx.errorMessage,
          };
        }
        return tx;
      }),
    }));
  },

  clearTransactions: () => set({ transactions: [] }),
}));
