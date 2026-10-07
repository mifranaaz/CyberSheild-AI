import React, { useState } from "react";
import { SIMULATOR_SCENARIOS } from "../data/mockData";
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Terminal,
  Mail,
  MessageSquare,
} from "lucide-react";

interface AwarenessSimulatorProps {
  elderlyMode?: boolean;
}

export const AwarenessSimulator: React.FC<AwarenessSimulatorProps> = ({
  elderlyMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState<{
    userChoiceIsScam: boolean;
    isCorrect: boolean;
  } | null>(null);
  const [completedHistory, setCompletedHistory] = useState<
    Array<{ id: string; correct: boolean }>
  >([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentScenario = SIMULATOR_SCENARIOS[currentIndex];

  const handleDecision = (userChoiceIsScam: boolean) => {
    if (answered) return;
    const isCorrect = userChoiceIsScam === currentScenario.isScam;
    setAnswered({ userChoiceIsScam, isCorrect });

    if (isCorrect) {
      setScore((prev) => prev + 100 + streak * 25);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setCompletedHistory((prev) => [
      ...prev,
      { id: currentScenario.id, correct: isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < SIMULATOR_SCENARIOS.length) {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswered(null);
    setCompletedHistory([]);
    setQuizFinished(false);
  };

  const correctCount = completedHistory.filter((h) => h.correct).length;
  const accuracy =
    completedHistory.length > 0
      ? Math.round((correctCount / completedHistory.length) * 100)
      : 100;

  const earnedBadge =
    accuracy >= 85
      ? "🏆 Cyber Rakshak Gold — Master Scam Spotter"
      : accuracy >= 60
      ? "🛡️ Cyber Defender Silver — Smart Digital Citizen"
      : "🔰 Cyber Cadet — Keep Practicing";

  return (
    <div className="space-y-6">
      {/* Header & Scoreboard */}
      <div className="cyber-glass rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700 mb-1">
            Interactive Indian Scam Awareness Mini-Game
          </div>
          <h2
            className={`${
              elderlyMode ? "text-3xl" : "text-2xl"
            } font-bold text-slate-900 tracking-tight`}
          >
            Scam Awareness Simulator — “Safe” or “Scam”?
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Read real-world Indian SMS, WhatsApp, UPI QR, and Electricity Bill messages and test if you can spot the red flags.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200">
          <div>
            <div className="text-[11px] text-slate-500 font-mono">SCENARIO</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
              {currentIndex + 1} / {SIMULATOR_SCENARIOS.length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-500 font-mono">SCORE</div>
            <div className="text-lg font-bold font-mono text-blue-700 tabular-nums">
              {score} XP
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] text-slate-500 font-mono">ACCURACY</div>
            <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{
            width: `${Math.round(
              ((currentIndex + (answered ? 1 : 0)) / SIMULATOR_SCENARIOS.length) *
                100
            )}%`,
          }}
        />
      </div>

      {quizFinished ? (
        <div className="cyber-glass rounded-xl p-8 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Simulation Complete &middot; Badge Unlocked
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{earnedBadge}</h3>
            <p className="text-sm text-slate-600 mt-2">
              You correctly identified{" "}
              <strong className="text-slate-900">
                {correctCount} out of {SIMULATOR_SCENARIOS.length}
              </strong>{" "}
              scenarios with a final score of{" "}
              <strong className="font-mono text-blue-700">{score} XP</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="text-xs font-bold text-slate-800">
              Golden Rules to Share with Your Family:
            </div>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li>
                Never click <code>.xyz</code> or <code>.online</code> links claiming your Bank PAN/KYC will be blocked.
              </li>
              <li>
                You NEVER need to scan a QR code or enter a UPI PIN to receive money.
              </li>
              <li>
                There is no such thing as 'Digital Arrest' over WhatsApp or Skype video calls.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Simulator Again</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulated Message Artifact */}
          <div className="lg:col-span-7 cyber-glass rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  {currentScenario.channel === "Work Email" ? (
                    <Mail className="w-4 h-4 text-blue-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  )}
                  <span>CHANNEL: {currentScenario.channel.toUpperCase()}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>LEVEL: {currentScenario.difficulty.toUpperCase()}</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Received {currentScenario.timestamp}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Sender Name:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {currentScenario.senderDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Number / ID:</span>
                  <span className="text-xs font-mono text-blue-700 font-medium">
                    {currentScenario.senderAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Scenario:</span>
                  <span className="text-xs font-medium text-slate-700">
                    {currentScenario.title}
                  </span>
                </div>
              </div>

              <div
                className={`p-5 rounded-xl bg-white border border-slate-200 ${
                  elderlyMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
                } text-slate-800 leading-relaxed space-y-4`}
              >
                <p>{currentScenario.content}</p>
                {currentScenario.embeddedUrl && (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 break-all">
                    Link / QR Target: {currentScenario.embeddedUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Choose: "Safe" / "Scam" */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 mb-3">
                What do you think? Choose “Safe” or “Scam”:
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={!!answered}
                  onClick={() => handleDecision(false)}
                  className="py-3.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>🟢 Safe</span>
                </button>
                <button
                  type="button"
                  disabled={!!answered}
                  onClick={() => handleDecision(true)}
                  className="py-3.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>🔴 Scam</span>
                </button>
              </div>
            </div>
          </div>

          {/* Explanation & Red Flags Debrief */}
          <div className="lg:col-span-5 cyber-glass rounded-xl p-6 flex flex-col justify-between">
            {answered ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 ${
                    answered.isCorrect
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  {answered.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="text-sm font-bold">
                      {answered.isCorrect
                        ? "Correct! Great Scam-Spotting Instinct"
                        : "Watch Out! Look at the Red Flags Below"}
                    </div>
                    <div className="text-xs opacity-90">
                      This message is:{" "}
                      <strong>
                        {currentScenario.isScam ? "🔴 SCAM" : "🟢 SAFE"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Red Flags &amp; Signals Explained:
                  </div>
                  <ul className="space-y-2">
                    {currentScenario.redFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-xs sm:text-sm text-slate-800 p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-bold text-blue-700 mb-1">
                    Why?
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentScenario.explanation}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-emerald-700">
                    What should you do?
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {currentScenario.safeAction}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>
                    {currentIndex + 1 < SIMULATOR_SCENARIOS.length
                      ? "Next Scenario"
                      : "Finish & See Your Badge"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
                <Terminal className="w-8 h-8 text-blue-600/70" />
                <div className="text-sm font-semibold text-slate-800">
                  Choose “🟢 Safe” or “🔴 Scam”
                </div>
                <p className="text-xs max-w-xs leading-relaxed">
                  Read the message carefully on the left and click either Safe or Scam to see the visual red flags.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
