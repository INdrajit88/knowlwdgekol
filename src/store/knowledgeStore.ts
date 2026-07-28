import { create } from "zustand";
import { eventStreamService, ContractEvent } from "@/services/eventStream";
import { currentNetwork } from "@/services/stellar";
import { useWalletStore } from "@/store/walletStore";

export interface QuestionModel {
  id: number;
  asker: string;
  prompt: string;
  category: string;
  bountyXlm: number;
  status: "Open" | "Answered" | "Resolved";
  answerCount: number;
  selectedAnswerId?: number;
  createdAt: string;
}

export interface AnswerModel {
  id: number;
  questionId: number;
  author: string;
  authorTier: "Novice" | "Bronze" | "Silver" | "Gold" | "Platinum";
  teaser: string;
  fullArticle: string;
  isUnlocked: boolean;
  upvotes: number;
  isAccepted: boolean;
  ipfsCid: string;
  createdAt: string;
  citations: Array<{
    id: number;
    title: string;
    url: string;
    sourceDomain: string;
    snippet: string;
  }>;
}

export interface ContributorLeaderboardItem {
  address: string;
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  reputationPoints: number;
  totalEarnedXlm: number;
  answeredCount: number;
  acceptedCount: number;
}

export interface KnowledgeState {
  questions: QuestionModel[];
  answers: Record<number, AnswerModel[]>;
  leaderboard: ContributorLeaderboardItem[];
  askQuestion: (prompt: string, category: string, bountyXlm: number, asker: string) => Promise<number>;
  submitAnswer: (questionId: number, author: string, teaser: string, fullArticle: string) => Promise<number>;
  upvoteAnswer: (answerId: number, questionId: number) => void;
  acceptAnswer: (questionId: number, answerId: number, asker: string) => Promise<void>;
  applyExternalEvent: (event: ContractEvent) => void;
  syncWithServer: () => Promise<void>;
}

const STORAGE_KEY = "knowledgekol_store_v3";

const initialDefaultQuestions: QuestionModel[] = [
  {
    id: 1,
    asker: "GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N",
    prompt: "How did your team scale Soroban state archival & TTL rent extension in production?",
    category: "Architecture",
    bountyXlm: 50,
    status: "Answered",
    answerCount: 2,
    createdAt: "15 mins ago",
  },
  {
    id: 2,
    asker: "GAX93R2W81V7X6C5V4B3N2M1K0J9H8G7F6D5S4A3P2O1I0U9Y8T7R6E5",
    prompt: "What real-world edge cases did you encounter when implementing cross-contract calls on Soroban Testnet?",
    category: "Smart Contracts",
    bountyXlm: 100,
    status: "Resolved",
    answerCount: 3,
    selectedAnswerId: 101,
    createdAt: "1 hour ago",
  },
  {
    id: 3,
    asker: "GBY72E6R5T4Y3U2I1O0P9A8S7D6F5G4H3J2K1L0M9N8B7V6C5X4Z3A2B",
    prompt: "How do you sponsor gasless user transactions on Stellar using SEP-0029 fee bumps in mobile dApps?",
    category: "DeFi & SDKs",
    bountyXlm: 75,
    status: "Open",
    answerCount: 0,
    createdAt: "3 hours ago",
  },
];

const initialDefaultAnswers: Record<number, AnswerModel[]> = {
  1: [
    {
      id: 10,
      questionId: 1,
      author: "GDQ82M1L0K9J8H7G6F5D4S3A2P1O0I9U8Y7T6R5E4W3Q2A1B0C9D8E7F",
      authorTier: "Gold",
      teaser: "We automated TTL extensions by implementing an off-chain indexer that monitors storage entry rent thresholds 500 ledgers prior to expiration...",
      fullArticle: `### Production Architecture & Case Study

Our engineering team deployed a dual-layer strategy for Soroban state rent optimization:

1. **Automated Rent Monitor Service**:
   - We run a daemon indexing persistent storage keys.
   - When key TTL falls below 500 ledgers, a fee-sponsored transaction invokes \`extend_ttl(key, 100, 10_000)\`.

2. **Storage Type Optimization**:
   - Temporary keys are used for transient session state to avoid persistent archival rent.
   - Instance keys store core admin and token contract configuration.

\`\`\`rust
// Production TTL Extension Pattern
let key = DataKey::ContributorScore(contributor);
env.storage().persistent().extend_ttl(&key, 500, 10_000);
\`\`\``,
      isUnlocked: false,
      upvotes: 8,
      isAccepted: false,
      ipfsCid: "bafybeic5a76xvwz89y67u5k4a3m2n1o0p9q8r7s6t5u4v3w2x1y0z",
      createdAt: "10 mins ago",
      citations: [],
    },
  ],
  2: [
    {
      id: 101,
      questionId: 2,
      author: "GBS91A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z",
      authorTier: "Platinum",
      teaser: "The biggest edge case in cross-contract calls was return type signature mismatch between client interfaces and WASM host functions...",
      fullArticle: `### Cross-Contract Call Lessons Learned

When building inter-contract communication between our Marketplace and Treasury contracts:

1. **Interface Return Types**:
   - Both contracts must strictly match return types. If Contract A expects \`()\` but Contract B returns a custom struct, the WASM host will throw an unhandled type mismatch error.

2. **Authentication Scoping**:
   - Contract addresses do not use \`require_auth()\`. Inter-contract security must be verified by matching the caller address against stored contract IDs.`,
      isUnlocked: true,
      upvotes: 24,
      isAccepted: true,
      ipfsCid: "bafybeigk987x6v5c4b3n2m1l0k9j8h7g6f5d4s3a2p1o0i9u8y7t6r5e4w",
      createdAt: "45 mins ago",
      citations: [],
    },
  ],
};

const initialDefaultLeaderboard: ContributorLeaderboardItem[] = [
  {
    address: "GBS91A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z",
    tier: "Platinum",
    reputationPoints: 1250,
    totalEarnedXlm: 3450,
    answeredCount: 48,
    acceptedCount: 39,
  },
  {
    address: "GDQ82M1L0K9J8H7G6F5D4S3A2P1O0I9U8Y7T6R5E4W3Q2A1B0C9D8E7F",
    tier: "Gold",
    reputationPoints: 780,
    totalEarnedXlm: 1820,
    answeredCount: 32,
    acceptedCount: 22,
  },
];

function mergeQuestions(local: QuestionModel[], server: QuestionModel[]): QuestionModel[] {
  const map = new Map<number, QuestionModel>();
  (server || []).forEach((q) => {
    if (q && q.id) map.set(q.id, q);
  });
  (local || []).forEach((q) => {
    if (q && q.id) {
      const existing = map.get(q.id);
      if (!existing) {
        map.set(q.id, q);
      } else {
        map.set(q.id, {
          ...existing,
          ...q,
          answerCount: Math.max(existing.answerCount || 0, q.answerCount || 0),
          status: q.status === "Resolved" || existing.status === "Resolved" ? "Resolved" : (q.status === "Answered" || existing.status === "Answered" ? "Answered" : "Open"),
        });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
}

function mergeAnswers(local: Record<number, AnswerModel[]>, server: Record<number, AnswerModel[]>): Record<number, AnswerModel[]> {
  const result: Record<number, AnswerModel[]> = { ...(server || {}) };
  Object.keys(local || {}).forEach((qIdStr) => {
    const qId = Number(qIdStr);
    const localList = local[qId] || [];
    const serverList = result[qId] || [];
    const map = new Map<number, AnswerModel>();
    serverList.forEach((a) => map.set(a.id, a));
    localList.forEach((a) => {
      const existing = map.get(a.id);
      if (!existing) {
        map.set(a.id, a);
      } else {
        map.set(a.id, { ...existing, ...a });
      }
    });
    result[qId] = Array.from(map.values()).sort((a, b) => b.id - a.id);
  });
  return result;
}

function saveState(questions: QuestionModel[], answers: Record<number, AnswerModel[]>, leaderboard: ContributorLeaderboardItem[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, answers, leaderboard }));
    } catch (e) {}
  }
}

function loadInitialState() {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          const mergedQ = mergeQuestions(parsed.questions, initialDefaultQuestions);
          const mergedA = mergeAnswers(parsed.answers || {}, initialDefaultAnswers);
          return {
            questions: mergedQ,
            answers: mergedA,
            leaderboard: parsed.leaderboard || initialDefaultLeaderboard,
          };
        }
      }
    } catch (e) {}
  }
  return {
    questions: initialDefaultQuestions,
    answers: initialDefaultAnswers,
    leaderboard: initialDefaultLeaderboard,
  };
}

const initialState = loadInitialState();

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  questions: initialState.questions,
  answers: initialState.answers,
  leaderboard: initialState.leaderboard,

  syncWithServer: async () => {
    try {
      const [qRes, aRes] = await Promise.all([
        fetch("/api/questions"),
        fetch("/api/answers"),
      ]);
      if (qRes.ok && aRes.ok) {
        const qData = await qRes.json();
        const aData = await aRes.json();
        if (qData.questions && aData.answers) {
          const currentQuestions = get().questions;
          const currentAnswers = get().answers;
          const mergedQ = mergeQuestions(currentQuestions, qData.questions);
          const mergedA = mergeAnswers(currentAnswers, aData.answers);
          set({ questions: mergedQ, answers: mergedA });
          saveState(mergedQ, mergedA, get().leaderboard);
        }
      }
    } catch (err) {}
  },

  askQuestion: async (prompt, category, bountyXlm, asker) => {
    const id = Date.now();

    // Deduct bounty XLM from asking user's balance
    useWalletStore.getState().deductBalance(bountyXlm);

    const newQuestion: QuestionModel = {
      id,
      asker,
      prompt,
      category,
      bountyXlm,
      status: "Open",
      answerCount: 0,
      createdAt: "Just now",
    };

    set((state) => {
      const updated = mergeQuestions([newQuestion], state.questions);
      saveState(updated, state.answers, state.leaderboard);
      return { questions: updated };
    });

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, prompt, category, bountyXlm, asker }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          set((state) => {
            const merged = mergeQuestions(state.questions, data.questions);
            saveState(merged, state.answers, state.leaderboard);
            return { questions: merged };
          });
        }
      }
    } catch (e) {}

    eventStreamService.emitEvent({
      id: `evt-${id}`,
      contractId: currentNetwork.marketContractId,
      topic: "QuestionCreated",
      txHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: "Just now",
      data: {
        questionId: id,
        actor: asker,
        bountyXlm,
        category,
        prompt,
      },
    });

    return id;
  },

  submitAnswer: async (questionId, author, teaser, fullArticle) => {
    const id = Date.now();
    const newAnswer: AnswerModel = {
      id,
      questionId,
      author,
      authorTier: "Silver",
      teaser,
      fullArticle,
      isUnlocked: false,
      upvotes: 1,
      isAccepted: false,
      ipfsCid: `bafybei${Math.random().toString(36).substring(2, 12)}`,
      createdAt: "Just now",
      citations: [],
    };

    set((state) => {
      const existingAnswers = state.answers[questionId] || [];
      const updatedAnswers = { ...state.answers, [questionId]: [newAnswer, ...existingAnswers.filter((a) => a.id !== id)] };
      const updatedQuestions = state.questions.map((q) =>
        q.id === questionId ? { ...q, answerCount: q.answerCount + 1, status: (q.status === "Open" ? "Answered" : q.status) as any } : q
      );
      saveState(updatedQuestions, updatedAnswers, state.leaderboard);
      return { answers: updatedAnswers, questions: updatedQuestions };
    });

    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, questionId, author, teaser, fullArticle }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answers) {
          set((state) => {
            const mergedA = mergeAnswers(state.answers, data.answers);
            saveState(state.questions, mergedA, state.leaderboard);
            return { answers: mergedA };
          });
        }
      }
    } catch (e) {}

    eventStreamService.emitEvent({
      id: `evt-${id}`,
      contractId: currentNetwork.marketContractId,
      topic: "AnswerSubmitted",
      txHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: "Just now",
      data: {
        questionId,
        answerId: id,
        actor: author,
        teaser,
        fullArticle,
      },
    });

    return id;
  },

  upvoteAnswer: (answerId, questionId) => {
    set((state) => {
      const list = state.answers[questionId] || [];
      const updatedList = list.map((a) => (a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a));
      const updatedAnswers = { ...state.answers, [questionId]: updatedList };
      saveState(state.questions, updatedAnswers, state.leaderboard);
      return { answers: updatedAnswers };
    });
  },

  acceptAnswer: async (questionId, answerId, asker) => {
    const question = get().questions.find((q) => q.id === questionId);
    const bountyXlm = question ? question.bountyXlm : 50;

    try {
      await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", questionId, answerId }),
      });
    } catch (e) {}

    set((state) => {
      const list = state.answers[questionId] || [];
      const targetAnswer = list.find((a) => a.id === answerId);
      const authorAddress = targetAnswer ? targetAnswer.author : "";

      // Credit bounty XLM to answer author's balance
      if (authorAddress === useWalletStore.getState().publicKey) {
        useWalletStore.getState().creditBalance(bountyXlm);
      }

      // Update Leaderboard earnings
      const updatedLeaderboard = state.leaderboard.map((item) => {
        if (item.address === authorAddress) {
          return {
            ...item,
            reputationPoints: item.reputationPoints + 50,
            totalEarnedXlm: item.totalEarnedXlm + bountyXlm,
            acceptedCount: item.acceptedCount + 1,
          };
        }
        return item;
      });

      const updatedList = list.map((a) => (a.id === answerId ? { ...a, isAccepted: true, isUnlocked: true } : a));
      const updatedAnswers = { ...state.answers, [questionId]: updatedList };
      const updatedQuestions = state.questions.map((q) =>
        q.id === questionId ? { ...q, status: "Resolved" as const, selectedAnswerId: answerId } : q
      );

      saveState(updatedQuestions, updatedAnswers, updatedLeaderboard);

      return {
        answers: updatedAnswers,
        questions: updatedQuestions,
        leaderboard: updatedLeaderboard,
      };
    });

    eventStreamService.emitEvent({
      id: `evt-${Date.now()}`,
      contractId: currentNetwork.treasuryContractId,
      topic: "QuestionResolved",
      txHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
      timestamp: "Just now",
      data: {
        questionId,
        answerId,
        actor: asker,
      },
    });
  },

  applyExternalEvent: (evt: ContractEvent) => {
    if (evt.topic === "QuestionCreated" && evt.data.questionId && evt.data.prompt) {
      const qId = evt.data.questionId;
      set((state) => {
        if (state.questions.some((q) => q.id === qId)) return state;
        const newQ: QuestionModel = {
          id: qId,
          asker: evt.data.actor,
          prompt: evt.data.prompt || "New Experience Question",
          category: evt.data.category || "Architecture",
          bountyXlm: evt.data.bountyXlm || 50,
          status: "Open",
          answerCount: 0,
          createdAt: "Just now",
        };
        const updatedQuestions = [newQ, ...state.questions];
        saveState(updatedQuestions, state.answers, state.leaderboard);
        return { questions: updatedQuestions };
      });
    } else if (evt.topic === "AnswerSubmitted" && evt.data.questionId && evt.data.answerId) {
      const qId = evt.data.questionId;
      const aId = evt.data.answerId;
      set((state) => {
        const existingList = state.answers[qId] || [];
        if (existingList.some((a) => a.id === aId)) return state;

        const newA: AnswerModel = {
          id: aId,
          questionId: qId,
          author: evt.data.actor,
          authorTier: "Silver",
          teaser: evt.data.teaser || "Key insight preview",
          fullArticle: evt.data.fullArticle || "Detailed solution content",
          isUnlocked: false,
          upvotes: 1,
          isAccepted: false,
          ipfsCid: `bafybei${Math.random().toString(36).substring(2, 12)}`,
          createdAt: "Just now",
          citations: [],
        };

        const updatedAnswers = { ...state.answers, [qId]: [newA, ...existingList] };
        const updatedQuestions = state.questions.map((q) =>
          q.id === qId ? { ...q, answerCount: q.answerCount + 1, status: (q.status === "Open" ? "Answered" : q.status) as any } : q
        );
        saveState(updatedQuestions, updatedAnswers, state.leaderboard);
        return { answers: updatedAnswers, questions: updatedQuestions };
      });
    } else if (evt.topic === "QuestionResolved" && evt.data.questionId && evt.data.answerId) {
      const qId = evt.data.questionId;
      const aId = evt.data.answerId;
      set((state) => {
        const list = state.answers[qId] || [];
        const updatedList = list.map((a) => (a.id === aId ? { ...a, isAccepted: true, isUnlocked: true } : a));
        const updatedAnswers = { ...state.answers, [qId]: updatedList };
        const updatedQuestions = state.questions.map((q) =>
          q.id === qId ? { ...q, status: "Resolved" as const, selectedAnswerId: aId } : q
        );
        saveState(updatedQuestions, updatedAnswers, state.leaderboard);
        return { answers: updatedAnswers, questions: updatedQuestions };
      });
    }
  },
}));

if (typeof window !== "undefined") {
  eventStreamService.subscribe((evt) => {
    useKnowledgeStore.getState().applyExternalEvent(evt);
  });
}
