import React, { useState } from "react";
import { RotateCcw, ArrowRight } from "lucide-react";

interface BeforeYouPayViewProps {
  elderlyMode?: boolean;
  onNavigateToScanner: () => void;
  onAskAssistant: (prompt: string) => void;
}

interface QuestionItem {
  id: string;
  question: string;
  subtext: string;
  yesIsRisky: boolean;
  riskWeight: number;
  redFlagText: string;
}

const PAYMENT_QUESTIONS: QuestionItem[] = [
  {
    id: "unexpected_contact",
    question: "1. Did someone contact you unexpectedly (via Call, WhatsApp, SMS, or OLX/Facebook)?",
    subtext: "For example: an unknown buyer, bank officer, electricity staff, customs officer, or job recruiter.",
    yesIsRisky: true,
    riskWeight: 20,
    redFlagText: "🚨 Unexpected contact from an unknown caller or sender",
  },
  {
    id: "creating_urgency",
    question: "2. Are they rushing you or creating urgency right now?",
    subtext: "For example: 'Account will be blocked in 2 hours', 'Power cut tonight at 9:30 PM', or staying on the phone call while you pay.",
    yesIsRisky: true,
    riskWeight: 25,
    redFlagText: "🚨 High urgency / pressure tactics to stop you from thinking calmly",
  },
  {
    id: "asking_otp_pin",
    question: "3. Are they asking for your OTP, UPI PIN, ATM PIN, or asking you to install AnyDesk?",
    subtext: "Remember: No bank, government office, or genuine buyer ever needs your OTP or screen-sharing access.",
    yesIsRisky: true,
    riskWeight: 35,
    redFlagText: "🚨 Asking for secret OTP, UPI PIN, or remote screen-sharing app",
  },
  {
    id: "scan_qr_to_receive",
    question: "4. Are they asking you to scan a QR code or approve a UPI request to RECEIVE money?",
    subtext: "Golden Rule: You NEVER scan a QR code or enter a UPI PIN to receive money or get a refund.",
    yesIsRisky: true,
    riskWeight: 35,
    redFlagText: "🚨 Fake 'Scan QR to Receive Money' UPI debit trap",
  },
  {
    id: "know_recipient",
    question: "5. Do you personally know and trust the recipient (and have you verified them on a normal voice call)?",
    subtext: "Even if a message looks like a friend or relative in an emergency, always call their known phone number first.",
    yesIsRisky: false,
    riskWeight: 20,
    redFlagText: "⚠️ Unverified recipient — you have not confirmed their identity",
  },
];

export const BeforeYouPayView: React.FC<BeforeYouPayViewProps> = ({
  elderlyMode = false,
  onNavigateToScanner,
  onAskAssistant,
}) => {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    unexpected_contact: null,
    creating_urgency: null,
    asking_otp_pin: null,
    scan_qr_to_receive: null,
    know_recipient: null,
  });

  const handleSelect = (id: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setAnswers({
      unexpected_contact: null,
      creating_urgency: null,
      asking_otp_pin: null,
      scan_qr_to_receive: null,
      know_recipient: null,
    });
  };

  let accumulatedRisk = 0;
  const triggeredFlags: string[] = [];

  for (const q of PAYMENT_QUESTIONS) {
    const val = answers[q.id];
    if (val !== null) {
      const isRiskyAnswer = q.yesIsRisky ? val === true : val === false;
      if (isRiskyAnswer) {
        accumulatedRisk += q.riskWeight;
        triggeredFlags.push(q.redFlagText);
      }
    }
  }

  if (answers.asking_otp_pin === true || answers.scan_qr_to_receive === true) {
    accumulatedRisk = Math.max(accumulatedRisk, 88);
  }

  const boundedRisk = Math.min(98, accumulatedRisk);
  const paymentSafetyScore = Math.max(2, 100 - boundedRisk);
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  const statusTier =
    paymentSafetyScore <= 35
      ? "DANGEROUS"
      : paymentSafetyScore <= 70
      ? "SUSPICIOUS"
      : "SAFE";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="cyber-glass rounded-xl p-6 sm:p-8 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Pre-Payment Safety Checklist &middot; UPI / Bank / QR Protection
            </div>
            <h2
              className={`${
                elderlyMode ? "text-3xl" : "text-2xl sm:text-3xl"
              } font-bold text-slate-900 tracking-tight`}
            >
              🛑 “Before You Pay” — 30-Second Payment Safety Check
            </h2>
            <p
              className={`${
                elderlyMode ? "text-base" : "text-sm"
              } text-slate-600 mt-1 max-w-2xl`}
            >
              About to send money via UPI, scan a QR code, or pay a fee? Answer these 5 simple questions first to get an instant{" "}
              <strong className="text-slate-900">Payment Safety Score</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 self-start whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Answers</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 5 Interactive Yes / No Questions */}
        <div className="lg:col-span-7 space-y-4">
          {PAYMENT_QUESTIONS.map((item) => {
            const currentVal = answers[item.id];
            const isRisky =
              currentVal !== null &&
              (item.yesIsRisky ? currentVal === true : currentVal === false);

            return (
              <div
                key={item.id}
                className={`cyber-glass rounded-xl p-5 border transition-all ${
                  currentVal === null
                    ? "border-slate-200"
                    : isRisky
                    ? "border-rose-300 bg-rose-50/40"
                    : "border-emerald-300 bg-emerald-50/40"
                }`}
              >
                <div className="space-y-1.5">
                  <h3
                    className={`${
                      elderlyMode ? "text-lg" : "text-base"
                    } font-bold text-slate-900 leading-snug`}
                  >
                    {item.question}
                  </h3>
                  <p
                    className={`${
                      elderlyMode ? "text-sm" : "text-xs"
                    } text-slate-600 leading-relaxed`}
                  >
                    {item.subtext}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id, true)}
                    className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                      currentVal === true
                        ? item.yesIsRisky
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect(item.id, false)}
                    className={`py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border ${
                      currentVal === false
                        ? !item.yesIsRisky
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    NO
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Payment Safety Score & Clear Recommendation Card */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div
            className={`cyber-glass rounded-xl p-6 border ${
              statusTier === "DANGEROUS"
                ? "border-rose-300 neon-glow-danger"
                : statusTier === "SUSPICIOUS"
                ? "border-amber-300 neon-glow-warning"
                : "border-emerald-300 neon-glow-safe"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <div className="text-xs font-mono text-slate-500">
                  PAYMENT SAFETY SCORE
                </div>
                <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  {statusTier === "DANGEROUS"
                    ? "🔴 STOP! DO NOT PAY"
                    : statusTier === "SUSPICIOUS"
                    ? "🟡 WAIT & VERIFY FIRST"
                    : "🟢 LOOKS SAFE TO PROCEED"}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-4xl font-bold font-mono tabular-nums ${
                    statusTier === "DANGEROUS"
                      ? "text-rose-600"
                      : statusTier === "SUSPICIOUS"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {paymentSafetyScore}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  / 100 SAFETY
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-mono text-slate-500 mb-1.5">
                <span>Checklist Progress: {answeredCount}/5 answered</span>
                <span>Risk Level: {boundedRisk}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    statusTier === "DANGEROUS"
                      ? "bg-rose-600"
                      : statusTier === "SUSPICIOUS"
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${paymentSafetyScore}%` }}
                />
              </div>
            </div>

            {/* Triggered Red Flags */}
            {triggeredFlags.length > 0 ? (
              <div className="space-y-2 mb-5">
                <div className="text-xs font-bold text-rose-700">
                  Warning Signs Detected in This Payment:
                </div>
                {triggeredFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-900 font-medium"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 mb-5">
                🟢 No major payment scam traps selected so far. Answer all 5 questions above to be 100% sure before sending money.
              </div>
            )}

            {/* What Should You Do Now */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                What Should You Do Now?
              </div>
              {statusTier === "DANGEROUS" ? (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    🛑 <strong>Do not transfer money</strong> or enter your UPI PIN
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    🛑 <strong>Do not scan the QR code</strong> or share any OTP
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    ✅ <strong>Hang up the phone call</strong> and talk to a family member
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    ✅ <strong>Report/block the sender</strong> on WhatsApp or your UPI app
                  </li>
                </ul>
              ) : statusTier === "SUSPICIOUS" ? (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    🛑 Pause the payment for 5 minutes—never pay in a rush
                  </li>
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    ✅ Call the person or company on their official phone number to verify
                  </li>
                </ul>
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    ✅ Double-check the UPI registered name shown on screen before entering your PIN
                  </li>
                </ul>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onNavigateToScanner}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Scan Message / QR Screenshot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onAskAssistant(
                    `Someone is asking me to make a payment. My Payment Safety Score is ${paymentSafetyScore}/100 with these flags: ${
                      triggeredFlags.join(", ") || "None"
                    }. What should I do?`
                  )
                }
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                Ask AI Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
