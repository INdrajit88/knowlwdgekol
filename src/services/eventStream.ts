import { currentNetwork } from "./stellar";

export interface ContractEvent {
  id: string;
  contractId: string;
  topic: "QuestionCreated" | "AnswerSubmitted" | "QuestionResolved" | "ReputationUpdated" | "EscrowReleased";
  txHash: string;
  timestamp: string;
  data: {
    questionId?: number;
    answerId?: number;
    actor: string;
    bountyXlm?: number;
    category?: string;
    points?: number;
    recipient?: string;
    citationsCount?: number;
    prompt?: string;
    teaser?: string;
    fullArticle?: string;
  };
}

export type EventCallback = (event: ContractEvent) => void;

class SorobanEventStreamService {
  private listeners: Set<EventCallback> = new Set();
  private channel: BroadcastChannel | null = null;
  private isStreaming = false;

  constructor() {
    if (typeof window !== "undefined") {
      if ("BroadcastChannel" in window) {
        this.channel = new BroadcastChannel("lumina_event_channel");
        this.channel.onmessage = (msgEvent) => {
          if (msgEvent.data) {
            this.notifyLocalListeners(msgEvent.data);
          }
        };
      }

      window.addEventListener("storage", (e) => {
        if (e.key === "lumina_event_broadcast" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyLocalListeners(parsed);
          } catch (err) {}
        }
      });
    }
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public emitEvent(event: ContractEvent) {
    // 1. Notify local listeners in current tab
    this.notifyLocalListeners(event);

    // 2. Broadcast to other open browser tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (err) {}
    }

    // 3. Storage fallback broadcast for cross-origin or non-BroadcastChannel environments
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("lumina_event_broadcast", JSON.stringify({ ...event, _ts: Date.now() }));
      } catch (err) {}
    }
  }

  private notifyLocalListeners(event: ContractEvent) {
    this.listeners.forEach((callback) => callback(event));
  }
}

export const eventStreamService = new SorobanEventStreamService();
