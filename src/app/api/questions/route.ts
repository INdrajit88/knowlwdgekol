import { NextResponse } from "next/server";

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

// Global in-memory questions storage on Next.js server runtime
let globalQuestions: QuestionModel[] = [
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

export async function GET() {
  return NextResponse.json({ questions: globalQuestions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, category, bountyXlm, asker } = body;

    if (!prompt || !category || !bountyXlm || !asker) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = Date.now();
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

    globalQuestions = [newQuestion, ...globalQuestions];

    return NextResponse.json({ success: true, id, questions: globalQuestions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to post question" }, { status: 500 });
  }
}
