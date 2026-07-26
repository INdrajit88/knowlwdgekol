import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWalletStore } from "../../src/store/walletStore";
import * as stellarService from "../../src/services/stellar";

describe("Wallet Infrastructure & Stellar Helpers", () => {
  beforeEach(() => {
    useWalletStore.getState().disconnectWallet();
    vi.restoreAllMocks();
  });

  it("should initialize with disconnected wallet state", () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.publicKey).toBeNull();
  });

  it("should handle wallet connection flow when Freighter is installed", async () => {
    vi.spyOn(stellarService, "checkFreighterInstalled").mockResolvedValue(true);
    vi.spyOn(stellarService, "getFreighterPublicKey").mockResolvedValue("GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N");
    vi.spyOn(stellarService, "ensureAccountExistsOnTestnet").mockResolvedValue(null as any);
    vi.spyOn(stellarService, "getAccountXlmBalance").mockResolvedValue("1,250.00");

    const store = useWalletStore.getState();
    const success = await store.connectWallet();

    expect(success).toBe(true);
    const updatedState = useWalletStore.getState();
    expect(updatedState.isConnected).toBe(true);
    expect(updatedState.publicKey).toBe("GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N");
  });

  it("should fail connection and set error when Freighter is not installed", async () => {
    vi.spyOn(stellarService, "checkFreighterInstalled").mockResolvedValue(false);

    const store = useWalletStore.getState();
    const success = await store.connectWallet();

    expect(success).toBe(false);
    const updatedState = useWalletStore.getState();
    expect(updatedState.isConnected).toBe(false);
    expect(updatedState.publicKey).toBeNull();
    expect(updatedState.error).toContain("Freighter wallet extension is not installed");
  });

  it("should format Stellar public addresses correctly", () => {
    const fullAddress = "GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N";
    const formatted = stellarService.formatAddress(fullAddress, 4);
    expect(formatted).toBe("GCSK...3M4N");
  });

  it("should convert Stroops to XLM and vice versa accurately", () => {
    const stroops = 500_000_000n; // 50 XLM
    expect(stellarService.stroopToXlm(stroops)).toBe("50.00");
    expect(stellarService.xlmToStroops(50)).toBe(500_000_000n);
  });
});
