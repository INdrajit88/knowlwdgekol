import { describe, it, expect } from "vitest";
import { useKnowledgeStore } from "../../src/store/knowledgeStore";

describe("End-to-End Experience Sharing Marketplace Integration Flow", () => {
  it("should execute complete question post, expert teaser submission, and escrow release unlock", async () => {
    const store = useKnowledgeStore.getState();
    const asker = "GCSK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N";
    const contributor = "GBS91A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z";

    // Step 1: Post experience request with 100 XLM bounty
    const prompt = "How does Soroban TTL extension prevent state archival in production?";
    const qId = await store.askQuestion(prompt, "Architecture", 100, asker);
    expect(qId).toBeGreaterThan(0);

    const question = useKnowledgeStore.getState().questions.find((q) => q.id === qId);
    expect(question?.status).toBe("Open");
    expect(question?.bountyXlm).toBe(100);

    // Step 2: Expert submits response with public teaser & locked full article
    const teaser = "We automated TTL extensions using a daemon indexing persistent storage keys...";
    const fullArticle = "### Complete Production Solution\n\n1. Automated Daemon\n2. Rent Threshold Triggers\n3. Code Examples";
    
    const aId = await store.submitAnswer(qId, contributor, teaser, fullArticle);
    expect(aId).toBeGreaterThan(0);

    const answersList = useKnowledgeStore.getState().answers[qId];
    expect(answersList.length).toBe(1);
    expect(answersList[0].isUnlocked).toBe(false);

    // Step 3: Asker accepts answer & unlocks full content, releasing bounty escrow
    await store.acceptAnswer(qId, aId, asker);

    const updatedQ = useKnowledgeStore.getState().questions.find((q) => q.id === qId);
    expect(updatedQ?.status).toBe("Resolved");
    expect(updatedQ?.selectedAnswerId).toBe(aId);

    const updatedAnswer = useKnowledgeStore.getState().answers[qId][0];
    expect(updatedAnswer.isUnlocked).toBe(true);
    expect(updatedAnswer.isAccepted).toBe(true);
  });
});
