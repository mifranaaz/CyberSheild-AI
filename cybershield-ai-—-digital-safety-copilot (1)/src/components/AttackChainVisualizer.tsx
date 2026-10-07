import React, { useState } from "react";
import { AttackChainNode, ThreatIndicator } from "../types";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  MousePointerClick,
  KeyRound,
  CheckCircle2,
  Info,
} from "lucide-react";

interface AttackChainVisualizerProps {
  attackChain: AttackChainNode[];
  indicators: ThreatIndicator[];
}

export const AttackChainVisualizer: React.FC<AttackChainVisualizerProps> = ({
  attackChain,
  indicators,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>(
    attackChain.find((n) => n.detected)?.stage || "Impersonation"
  );
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(
    indicators[0]?.id || null
  );

  const stageIcons: Record<string, React.ReactNode> = {
    Impersonation: <ShieldAlert className="w-5 h-5" />,
    Fear: <AlertTriangle className="w-5 h-5" />,
    Urgency: <Clock className="w-5 h-5" />,
    Click: <MousePointerClick className="w-5 h-5" />,
    "Credential Theft": <KeyRound className="w-5 h-5" />,
  };

  const activeNode =
    attackChain.find((n) => n.stage === selectedStage) || attackChain[0];

  const activeIndicator =
    indicators.find((i) => i.id === selectedIndicatorId) || indicators[0];

  return (
    <div className="space-y-6">
      {/* 5-Stage Psychological Kill Chain Diagram */}
      <div className="cyber-glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Attack Psychology &amp; Social-Engineering Kill Chain
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage in the sequence below to inspect how the attacker manipulates human decision-making
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Active Stages:{" "}
            <span className="text-blue-700 font-semibold">
              {attackChain.filter((s) => s.detected).length} / 5
            </span>
          </div>
        </div>

        {/* Horizontal Interactive Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {attackChain.map((node, index) => {
            const isSelected = node.stage === selectedStage;
            return (
              <button
                key={node.stage}
                type="button"
                onClick={() => setSelectedStage(node.stage)}
                className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? node.detected
                      ? "bg-rose-50/70 border-rose-400 shadow-xs"
                      : "bg-blue-50/70 border-blue-400 shadow-xs"
                    : node.detected
                    ? "bg-white border-rose-200 hover:border-rose-300"
                    : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-slate-500 tabular-nums">
                      0{index + 1}. Stage
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        node.detected ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {node.detected ? "DETECTED" : "CLEAR"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        node.detected
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {stageIcons[node.stage] || (
                        <ShieldAlert className="w-5 h-5" />
                      )}
                    </div>
                    <div className="font-bold text-sm text-slate-900 leading-tight">
                      {node.stage}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {node.summary}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Signals matched</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {node.indicatorCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Deep-Dive Banner */}
        {activeNode && (
          <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs text-blue-700 font-semibold">
                Stage Inspection &middot; {activeNode.stage}
              </div>
              <p className="text-sm text-slate-800">{activeNode.summary}</p>
            </div>
            <div className="text-xs text-slate-500 shrink-0 font-mono">
              Status:{" "}
              <span
                className={
                  activeNode.detected
                    ? "text-rose-700 font-semibold"
                    : "text-emerald-700 font-semibold"
                }
              >
                {activeNode.detected ? "TRIGGERED IN SUBMISSION" : "NOT OBSERVED"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Clickable Detected Indicators Grid + Explanation Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 cyber-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Detected Evidence &amp; Manipulation Indicators
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {indicators.length} Indicator{indicators.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2.5">
            {indicators.map((ind) => {
              const isSelected = activeIndicator?.id === ind.id;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => setSelectedIndicatorId(ind.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-blue-50/60 border-blue-400"
                      : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {ind.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                      <span className="text-slate-500">{ind.category}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span
                        className={`font-semibold ${
                          ind.severity === "CRITICAL"
                            ? "text-rose-700"
                            : ind.severity === "HIGH"
                            ? "text-amber-700"
                            : ind.severity === "MEDIUM"
                            ? "text-amber-600"
                            : "text-emerald-700"
                        }`}
                      >
                        {ind.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-600 truncate">
                    {ind.evidence}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explainable AI Inspector Card */}
        <div className="lg:col-span-5 cyber-glass rounded-xl p-6 flex flex-col justify-between">
          {activeIndicator ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
                  <Info className="w-4 h-4" />
                  <span>Explainable Evidence Breakdown</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {activeIndicator.category}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {activeIndicator.title}
                </h4>
                <div className="text-xs text-slate-500">
                  Severity Rating:{" "}
                  <span className="font-mono font-semibold text-slate-800">
                    {activeIndicator.severity}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500 mb-1 font-mono">
                  Extracted Technical / Linguistic Signal:
                </div>
                <div className="text-xs font-mono text-slate-900 break-words">
                  {activeIndicator.evidence}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1">
                  Why Attackers Use This Tactic:
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeIndicator.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Select any indicator card on the left to inspect its psychological and technical explanation.
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-2 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              CyberShield AI grounds every risk score in verifiable linguistic and structural evidence.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
