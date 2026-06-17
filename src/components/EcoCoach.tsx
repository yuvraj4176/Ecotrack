/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CarbonProfile, EmissionBreakdown, AIAnalysisResult, PledgeAction } from "../types";
import { Send, Sparkles, MessageSquare, HelpCircle, GraduationCap, CheckCircle } from "lucide-react";

interface EcoCoachProps {
  profile: CarbonProfile;
  emissions: EmissionBreakdown;
  onAddPledgeFromAI: (title: string, category: "transport" | "home" | "food" | "shopping", description: string, impactKg: number) => void;
  savedAnalysis: AIAnalysisResult | null;
  onSaveAnalysis: (result: AIAnalysisResult) => void;
}

export default function EcoCoach({
  profile,
  emissions,
  onAddPledgeFromAI,
  savedAnalysis,
  onSaveAnalysis,
}: EcoCoachProps) {
  // Chat state
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your Climate Coach. Ask me any details about your footprint, carbon coefficients, target values, or local grid options.",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Analysis Loader state
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [addedRoadmapIndex, setAddedRoadmapIndex] = useState<Record<number, boolean>>({});

  // Quiz evaluation state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState<Record<number, boolean>>({});

  const handleRunAnalysis = async () => {
    setAnalyzeLoading(true);
    setQuizAnswers({});
    setQuizChecked({});
    setAddedRoadmapIndex({});
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, emissions }),
      });
      if (response.ok) {
        const result = await response.json();
        onSaveAnalysis(result);
      } else {
        console.error("Analysis response failed");
      }
    } catch (err) {
      console.error("Failed to run profile analysis", err);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || chatLoading) return;

    const userMsg = inputVal.trim();
    setInputVal("");
    const newMsgs = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMsgs);
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          profile,
          emissions,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setMessages((prev) => [...prev, { role: "assistant" as const, content: result.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant" as const, content: "My server-side connection is busy. Let's try that again shortly!" },
        ]);
      }
    } catch (err) {
      console.error("Chat communication error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "My connection took a bit too long. Please ensure your setup is online." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddAIPledge = (index: number, action: any) => {
    onAddPledgeFromAI(action.title, action.category, action.description, action.potentialReductionKg);
    setAddedRoadmapIndex((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans" id="eco-coach-root">
      
      {/* Left Column: AI Diagnostics, Analysis Roadmap & Quiz */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Run Analysis Trigger Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)] space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl" />
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-[#1E293B] flex items-center gap-2">
              <Sparkles className="text-[#10B981]" size={18} />
              <span>Personalized AI Climate Advisor</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Gemini will process your lifestyle parameters, compute peak carbon hot-spots, structure custom actions, and generate a personalized quiz.
            </p>
          </div>

          <button
            id="btn-run-ai-check"
            disabled={analyzeLoading}
            onClick={handleRunAnalysis}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-2 ${
              analyzeLoading
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-150-strong"
            }`}
          >
            {analyzeLoading ? (
              <span className="flex items-center gap-2 animate-pulse font-bold">
                <span>Connecting to Gemini, evaluating options...</span>
              </span>
            ) : (
              <span>Start Profile Diagnostic</span>
            )}
          </button>
        </div>

        {/* Dynamic Analysis Presentation */}
        {savedAnalysis && !analyzeLoading && (
          <div className="space-y-6" id="ai-active-analysis-report">
            
            {/* Feedback card */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-3 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-[#059669]">Advisor Assessment</h5>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                {savedAnalysis.coachFeedback}
              </p>
            </div>

            {/* Quick Tailored Stats list */}
            {savedAnalysis.tailoredInsights && savedAnalysis.tailoredInsights.length > 0 && (
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Sustained Insights</h5>
                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside font-medium leading-relaxed">
                  {savedAnalysis.tailoredInsights.map((insight, idx) => (
                    <li key={idx} className="leading-relaxed">{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI-Suggested Carbon Roadmap and Quick Pledging */}
            {savedAnalysis.roadmap && savedAnalysis.roadmap.length > 0 && (
              <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 pb-2 border-b border-slate-100 flex justify-between items-center">
                  <span>Carbon Mitigation Roadmap</span>
                  <span className="text-[10px] text-slate-400 normal-case font-semibold">Add directly to your active list</span>
                </h5>

                <div className="space-y-3">
                  {savedAnalysis.roadmap.map((act, idx) => (
                    <div key={idx} className="bg-slate-50/80 p-4 border border-slate-100 rounded-2xl flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase font-bold">
                          {act.category}
                        </span>
                        <h6 className="text-xs font-bold text-slate-800 mt-1">{act.title}</h6>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{act.description}</p>
                        <span className="inline-block mt-1 text-[11px] text-[#059669] font-extrabold font-mono">
                          -{act.potentialReductionKg} kg CO₂ / yr
                        </span>
                      </div>

                      <button
                        id={`btn-add-ai-pledge-${idx}`}
                        disabled={addedRoadmapIndex[idx]}
                        onClick={() => handleAddAIPledge(idx, act)}
                        className={`text-[10px] py-1.5 px-3 rounded-lg shrink-0 transition font-bold cursor-pointer ${
                          addedRoadmapIndex[idx]
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed flex items-center gap-1"
                            : "bg-emerald-100 text-[#059669] hover:bg-emerald-250"
                        }`}
                      >
                        {addedRoadmapIndex[idx] ? (
                          <>
                            <CheckCircle size={11} />
                            <span>Pledged</span>
                          </>
                        ) : (
                          "Take Pledge"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Eco Trivia Quiz */}
            {savedAnalysis.personalizedQuiz && savedAnalysis.personalizedQuiz.length > 0 && (
              <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-blue-600 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  <span>Personalized Eco-Intellectual Quiz</span>
                </h5>

                {savedAnalysis.personalizedQuiz.map((q, qIdx) => {
                  const hasChecked = quizChecked[qIdx];
                  const chosenIdx = quizAnswers[qIdx];
                  const isCorrect = chosenIdx === q.correctIndex;

                  return (
                    <div key={qIdx} className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 flex gap-2 items-start">
                        <HelpCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{q.question}</span>
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionChosen = chosenIdx === oIdx;
                          let btnClass = "bg-white border-slate-200 text-slate-700 hover:border-[#10B981] font-semibold cursor-pointer";
                          if (hasChecked) {
                            if (oIdx === q.correctIndex) {
                              btnClass = "bg-emerald-100 border-emerald-400 text-emerald-800 font-bold";
                            } else if (isOptionChosen) {
                              btnClass = "bg-red-100 border-red-300 text-red-800 font-bold";
                            } else {
                              btnClass = "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed font-medium";
                            }
                          } else if (isOptionChosen) {
                            btnClass = "bg-emerald-50 border-[#10B981] text-[#059669] font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              id={`quiz-${qIdx}-opt-${oIdx}`}
                              disabled={hasChecked}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))}
                              className={`p-2.5 rounded-xl border text-left text-xs transition duration-200 ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {!hasChecked && chosenIdx !== undefined && (
                        <button
                          id={`btn-check-answer-${qIdx}`}
                          type="button"
                          onClick={() => setQuizChecked((prev) => ({ ...prev, [qIdx]: true }))}
                          className="bg-[#10B981] hover:bg-[#059669] text-white text-[10px] font-bold px-3.5 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                        >
                          Submit Answer
                        </button>
                      )}

                      {hasChecked && (
                        <div className="p-3 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-500 mt-2 space-y-1 leading-relaxed font-semibold">
                          <p className={`font-extrabold ${isCorrect ? "text-[#059669]" : "text-red-500"}`}>
                            {isCorrect ? "Correct answer!" : "Incorrect option matched."}
                          </p>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Converse with Carbon Coach Chat */}
      <div className="lg:col-span-5 flex flex-col h-[650px] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_15px_30px_-5px_rgba(0,0,0,0.03)]" id="chat-section-container">
        
        {/* Chat header */}
        <div className="bg-slate-50/85 border-b border-slate-100 p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-[#10B981]" size={18} />
            <div>
              <p className="text-xs font-bold text-slate-800">Live Carbon Coach Chat</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Active Advisor</span>
              </div>
            </div>
          </div>
          <button
            id="btn-reset-chat"
            className="text-[10px] text-slate-400 hover:text-[#059669] font-bold transition cursor-pointer"
            onClick={() => setMessages([
              {
                role: "assistant",
                content: "Chat initialized. Ask me any details regarding carbon coefficients or footprint minimization.",
              },
            ])}
          >
            Reset Thread
          </button>
        </div>

        {/* Bubbles log layout */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/20 scrollbar-none" id="chat-scroller">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <span className="text-[9px] text-slate-400 uppercase mb-1 font-mono font-semibold">
                {m.role === "user" ? "You" : "Climate Coach"}
              </span>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold transition ${
                  m.role === "user"
                    ? "bg-[#10B981] text-white rounded-tr-none shadow-sm shadow-emerald-100"
                    : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.01)]"
                }`}
              >
                <div className="whitespace-pre-wrap selection:bg-[#059669]">{m.content}</div>
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex flex-col items-start mr-auto max-w-[85%] animate-pulse">
              <span className="text-[9px] text-slate-400 uppercase mb-1 font-mono">Climate Coach</span>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 text-xs text-slate-400 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 border-t border-slate-150 shrink-0 flex gap-2">
          <input
            id="input-chat-query"
            type="text"
            placeholder="Ask about reducing emissions, offsets, etc..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] hover:border-slate-300 outline-none transition shadow-sm"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button
            id="btn-chat-submit"
            type="submit"
            className="bg-[#10B981] hover:bg-[#059669] text-white p-2.5 rounded-xl transition shadow cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
