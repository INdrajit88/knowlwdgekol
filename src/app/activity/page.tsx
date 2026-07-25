"use client";

import { useState, useEffect } from "react";
import { eventStreamService, ContractEvent } from "@/services/eventStream";
import { formatAddress, getExplorerTxLink } from "@/services/stellar";
import { Activity, Sparkles, HelpCircle, Award, CheckCircle2, ExternalLink } from "lucide-react";

export default function ActivityFeedPage() {
  const [events, setEvents] = useState<ContractEvent[]>([
    {
      id: "evt-1",
      contractId: "CCK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O",
      topic: "QuestionResolved",
      txHash: "7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
      timestamp: "Just now",
      data: {
        questionId: 2,
        answerId: 101,
        actor: "GBS91A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z",
        bountyXlm: 100,
        recipient: "GBS91A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z",
      },
    },
    {
      id: "evt-2",
      contractId: "CBX12A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z",
      topic: "ReputationUpdated",
      txHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      timestamp: "2 mins ago",
      data: {
        actor: "GDQ82M1L0K9J8H7G6F5D4S3A2P1O0I9U8Y7T6R5E4W3Q2A1B0C9D8E7F",
        points: 50,
      },
    },
    {
      id: "evt-3",
      contractId: "CCK54V3Z27Q6V2R7F3C6W8Y9X0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O",
      topic: "AnswerSubmitted",
      txHash: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      timestamp: "5 mins ago",
      data: {
        questionId: 1,
        answerId: 10,
        actor: "GDQ82M1L0K9J8H7G6F5D4S3A2P1O0I9U8Y7T6R5E4W3Q2A1B0C9D8E7F",
        citationsCount: 3,
      },
    },
  ]);

  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  useEffect(() => {
    const unsubscribe = eventStreamService.subscribe((newEvent) => {
      setEvents((prev) => [newEvent, ...prev]);
    });
    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter(
    (e) => selectedTopic === "All" || e.topic === selectedTopic
  );

  const getTopicBadge = (topic: ContractEvent["topic"]) => {
    switch (topic) {
      case "QuestionResolved":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>QuestionResolved</span>
          </span>
        );
      case "ReputationUpdated":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Award className="w-3 h-3" />
            <span>ReputationUpdated</span>
          </span>
        );
      case "AnswerSubmitted":
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3" />
            <span>AnswerSubmitted</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle className="w-3 h-3" />
            <span>QuestionCreated</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
            <h1 className="text-xl font-extrabold text-slate-900">Activity Stream</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time Soroban RPC contract events
          </p>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Streaming</span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {["All", "QuestionCreated", "AnswerSubmitted", "QuestionResolved", "ReputationUpdated"].map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedTopic === topic
                ? "bg-slate-900 text-white font-semibold"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
          >
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                {getTopicBadge(evt.topic)}
                <span className="text-[11px] font-mono text-slate-400">
                  Contract: {formatAddress(evt.contractId, 4)}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-mono">
                {evt.topic === "QuestionCreated" && (
                  <span>
                    Question #{evt.data.questionId} posted by {formatAddress(evt.data.actor)} with {evt.data.bountyXlm} XLM bounty
                  </span>
                )}
                {evt.topic === "AnswerSubmitted" && (
                  <span>
                    RAG Answer #{evt.data.answerId} submitted for Question #{evt.data.questionId} by {formatAddress(evt.data.actor)}
                  </span>
                )}
                {evt.topic === "QuestionResolved" && (
                  <span>
                    Escrow payout released: {evt.data.bountyXlm} XLM awarded to {formatAddress(evt.data.recipient || "")}
                  </span>
                )}
                {evt.topic === "ReputationUpdated" && (
                  <span>
                    Contributor {formatAddress(evt.data.actor)} earned +{evt.data.points} reputation points
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-0.5 text-xs font-mono text-slate-500">
              <span>{evt.timestamp}</span>
              <a
                href={getExplorerTxLink(evt.txHash)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:underline text-[11px]"
              >
                <span>Tx: {formatAddress(evt.txHash, 4)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
