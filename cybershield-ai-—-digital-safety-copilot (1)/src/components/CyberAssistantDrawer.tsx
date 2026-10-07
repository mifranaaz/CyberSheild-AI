import React, { useState, useEffect, useRef } from "react";
import { ScanResult, GroundingSourceLink } from "../types";
import {
  Bot,
  Send,
  Minimize2,
  Globe,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface CyberAssistantDrawerProps {
  activeScan: ScanResult;
  externalPrompt: string | null;
  onClearExternalPrompt: () => void;
  forceOpen?: boolean;
  onCloseForceOpen?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  groundingModeUsed?: "search" | "maps";
  groundingLinks?: GroundingSourceLink[];
}

export const CyberAssistantDrawer: React.FC<CyberAssistantDrawerProps> = ({
  activeScan,
  externalPrompt,
  onClearExternalPrompt,
  forceOpen = false,
  onCloseForceOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [groundingMode, setGroundingMode] = useState<"search" | "maps">("search");
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Namaste! I am **CyberShield AI**, your Personal Digital Safety Assistant.\n\n- Ask me to explain any scan result in simple words.\n- Use **Google Search Grounding** to check latest UPI/KYC scams.\n- Use **Google Maps Grounding** to verify real bank branches or find the nearest Cybercrime Police Station.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      sendMessage(externalPrompt);
      onClearExternalPrompt();
    }
  }, [externalPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleMinimize = () => {
    setIsOpen(false);
    if (onCloseForceOpen) onCloseForceOpen();
  };

  const sendMessage = async (textToSend: string, overrideMode?: "search" | "maps") => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const activeMode = overrideMode || groundingMode;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          activeScanContext: activeScan,
          groundingMode: activeMode,
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            data.reply ||
            "Always verify unexpected requests independently through the official mobile app or website.",
          groundingModeUsed: data.groundingModeUsed || activeMode,
          groundingLinks: Array.isArray(data.groundingLinks)
            ? data.groundingLinks
            : [],
        },
      ]);
    } catch (_e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Remember our golden rule: **🛡️ Scan Before You Act**. Never enter OTPs or your UPI PIN to receive money. Call **1930** immediately if you suspect fraud.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-lg flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <Bot className="w-5 h-5" />
          <span>CyberShield AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[420px] h-[560px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  CyberShield AI
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Personal Digital Safety Assistant
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              aria-label="Minimize assistant"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-500">
              Live Grounding:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setGroundingMode("search")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap ${
                  groundingMode === "search"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3 h-3" />
                <span>Google Search</span>
              </button>
              <button
                type="button"
                onClick={() => setGroundingMode("maps")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors whitespace-nowrap ${
                  groundingMode === "maps"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Google Maps</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-white border border-slate-200 text-slate-800 shadow-2xs"
                  }`}
                >
                  {m.content}

                  {m.groundingLinks && m.groundingLinks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-semibold text-blue-700">
                        {m.groundingModeUsed === "maps"
                          ? "Google Maps Grounding Places:"
                          : "Google Search Grounding Sources:"}
                      </div>
                      {m.groundingLinks.map((lnk, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 p-2 rounded border border-slate-200 space-y-1"
                        >
                          <a
                            href={lnk.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-1.5 text-[11px] font-semibold text-blue-700 hover:underline"
                          >
                            <span className="truncate">{lnk.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          {lnk.reviewSnippets && lnk.reviewSnippets.length > 0 && (
                            <div className="text-[10px] text-slate-600 italic pl-1.5 border-l-2 border-emerald-400">
                              {lnk.reviewSnippets.map((s, si) => (
                                <div key={si} className="line-clamp-2">
                                  "{s}"
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-blue-700 rounded-xl px-3.5 py-2.5 text-xs font-medium">
                  Checking with{" "}
                  {groundingMode === "maps" ? "Google Maps" : "Google Search"}{" "}
                  grounding...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                setGroundingMode("search");
                sendMessage("Explain my latest scan in simple words", "search");
              }}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              Explain My Scan
            </button>
            <button
              type="button"
              onClick={() => {
                setGroundingMode("search");
                sendMessage("What should I do if I lost money in a UPI scam?", "search");
              }}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              UPI Fraud Help (1930)
            </button>
            <button
              type="button"
              onClick={() => {
                setGroundingMode("maps");
                sendMessage(
                  "Find nearest cybercrime reporting police station or verified bank branch",
                  "maps"
                );
              }}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] text-emerald-700 font-medium whitespace-nowrap transition-colors"
            >
              Maps: Cybercrime Cell
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any safety question in simple words..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
