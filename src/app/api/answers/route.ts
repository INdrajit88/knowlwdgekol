import { NextResponse } from "next/server";

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

// Global in-memory answers storage on Next.js server runtime
let globalAnswers: Record<number, AnswerModel[]> = {
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
      citations: [
        {
          id: 1,
          title: "Soroban State Archival Guide",
          url: "https://developers.stellar.org/docs/build/guides/archival",
          sourceDomain: "developers.stellar.org",
          snippet: "Understanding storage TTL, persistent keys, and state restoration on Stellar.",
        },
      ],
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
      citations: [
        {
          id: 1,
          title: "Soroban Inter-Contract Authorization",
          url: "https://developers.stellar.org/docs/build/guides/auth",
          sourceDomain: "developers.stellar.org",
          snippet: "Authentication propagation and permission verification in cross-contract calls.",
        },
      ],
    },
  ],
};

export async function GET() {
  return NextResponse.json({ answers: globalAnswers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, questionId, author, teaser, fullArticle, answerId } = body;

    if (action === "accept") {
      const list = globalAnswers[questionId] || [];
      globalAnswers[questionId] = list.map((a) =>
        a.id === answerId ? { ...a, isAccepted: true, isUnlocked: true } : a
      );
      return NextResponse.json({ success: true, answers: globalAnswers });
    }

    if (!questionId || !author || !teaser || !fullArticle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || Date.now();
    const ipfsCid = `bafybei${Math.random().toString(36).substring(2, 12)}`;
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
      ipfsCid,
      createdAt: "Just now",
      citations: [
        {
          id: 1,
          title: "Verified Stellar Architecture Reference",
          url: "https://developers.stellar.org/docs",
          sourceDomain: "developers.stellar.org",
          snippet: "Primary documentation and ecosystem best practices.",
        },
      ],
    };

    const list = globalAnswers[questionId] || [];
    if (!list.some((a) => a.id === id)) {
      globalAnswers[questionId] = [newAnswer, ...list];
    }

    return NextResponse.json({ success: true, id, answers: globalAnswers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit answer" }, { status: 500 });
  }
}
