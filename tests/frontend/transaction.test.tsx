import { describe, it, expect } from "vitest";
import { useTxStore } from "../../src/store/txStore";
import { getExplorerTxLink } from "../../src/services/stellar";

describe("Production Transaction Management Store", () => {
  it("should add a new transaction record with Preparing status", () => {
    const store = useTxStore.getState();
    const txId = store.addTransaction({
      txHash: "",
      operationName: "ask_question",
      contractInvolved: "CCK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O",
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
      contractInvolved: "CBX12A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z",
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
