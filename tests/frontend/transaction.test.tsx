import { describe, it, expect } from "vitest";
import { useTxStore } from "../../src/store/txStore";
import { getExplorerTxLink } from "../../src/services/stellar";

describe("Production Transaction Management Store", () => {
  it("should add a new transaction record with Preparing status", () => {
    const store = useTxStore.getState();
    const txId = store.addTransaction({
      txHash: "",
      operationName: "ask_question",
      contractInvolved: "CAKCIXGBEJTTQEVOVM3TPPQIP5WWUJEHUMOW2X322C4KZYBTBGSIAGHP",
      status: "Pending",
      timestamp: "Just now",
    });

    const tx = useTxStore.getState().transactions.find((t) => t.id === txId);
    expect(tx).toBeDefined();
    expect(tx?.status).toBe("Pending");
    expect(tx?.operationName).toBe("ask_question");
  });

  it("should update transaction status and set valid transaction hash with explorer link", () => {
    const store = useTxStore.getState();
    const txId = store.addTransaction({
      txHash: "",
      operationName: "accept_answer",
      contractInvolved: "CCCFGPBJOHDGK6OQ54I4JZH5ZYA4FSSUMITRMOOGZMZYTT42A44YQ6AU",
      status: "Pending",
      timestamp: "Just now",
    });

    const mockHash = "8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
    store.updateTxStatus(txId, "Confirmed", mockHash);

    const updatedTx = useTxStore.getState().transactions.find((t) => t.id === txId);
    expect(updatedTx?.status).toBe("Confirmed");
    expect(updatedTx?.txHash).toBe(mockHash);
    expect(updatedTx?.explorerLink).toContain(mockHash);
  });

  it("should generate proper Stellar Expert explorer URLs", () => {
    const hash = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const link = getExplorerTxLink(hash);
    expect(link).toBe(`https://stellar.expert/explorer/testnet/tx/${hash}`);
  });
});
