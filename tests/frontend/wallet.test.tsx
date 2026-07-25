import { describe, it, expect, beforeEach } from "vitest";
import { useWalletStore } from "../../src/store/walletStore";
import { formatAddress, stroopToXlm, xlmToStroops } from "../../src/services/stellar";

describe("Wallet Infrastructure & Stellar Helpers", () => {
  beforeEach(() => {
    useWalletStore.getState().disconnectWallet();
  });

  it("should initialize with disconnected wallet state", () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.publicKey).toBeNull();
  });

  it("should handle wallet connection flow and update store state", async () => {
    const store = useWalletStore.getState();
    await store.connectWallet();

    const updatedState = useWalletStore.getState();
    expect(updatedState.isConnected).toBe(true);
    expect(updatedState.publicKey).not.toBeNull();
  });

  it("should format Stellar public addresses correctly", () => {
    const fullAddress = "GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N";
    const formatted = formatAddress(fullAddress, 4);
    expect(formatted).toBe("GCSK...3M4N");
  });

  it("should convert Stroops to XLM and vice versa accurately", () => {
    const stroops = 500_000_000n; // 50 XLM
    expect(stroopToXlm(stroops)).toBe("50.00");
    expect(xlmToStroops(50)).toBe(500_000_000n);
  });
});
