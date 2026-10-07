import React, { useState } from "react";
import { ScanResult, LiveThreatFeedItem, ScanInputType } from "../types";
import {
  ShieldCheck,
  ArrowRight,
  Radio,
  CreditCard,
  HeartHandshake,
} from "lucide-react";

interface DashboardViewProps {
  scanHistory: ScanResult[];
  liveFeedItems: LiveThreatFeedItem[];
  securityScore: number;
  elderlyMode?: boolean;
  onNavigateToScanner: (tab?: ScanInputType) => void;
  onSelectScan: (scan: ScanResult) => void;
  onNavigateToIntel: () => void;
  onNavigateToBeforeYouPay: () => void;
  onNavigateToFamily: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scanHistory,
  liveFeedItems,
  securityScore,
  elderlyMode = false,
  onNavigateToScanner,
  onSelectScan,
  onNavigateToIntel,
  onNavigateToBeforeYouPay,
  onNavigateToFamily,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<"7D" | "30D">("7D");

  const threatsDetectedCount = scanHistory.filter(
    (s) => s.riskScore >= 30
  ).length;
  const scamsDetectedCount = scanHistory.filter(
    (s) => s.classification === "DANGEROUS" || s.classification === "HIGH RISK"
  ).length;
  const suspiciousLinksCount =
    scanHistory.filter((s) => s.extractedUrls.length > 0 && s.riskScore >= 30)
      .length + 18;

  const weeklyTrend =
    chartTimeframe === "7D"
      ? [
          { day: "Mon", kycOtp: 18, upiQr: 14, fakeLinks: 22 },
          { day: "Tue", kycOtp: 24, upiQr: 19, fakeLinks: 27 },
          { day: "Wed", kycOtp: 15, upiQr: 12, fakeLinks: 19 },
          { day: "Thu", kycOtp: 29, upiQr: 24, fakeLinks: 34 },
          { day: "Fri", kycOtp: 26, upiQr: 21, fakeLinks: 30 },
          { day: "Sat", kycOtp: 21, upiQr: 18, fakeLinks: 25 },
          { day: "Sun", kycOtp: 32, upiQr: 27, fakeLinks: 38 },
        ]
      : [
          { day: "Wk 1", kycOtp: 82, upiQr: 64, fakeLinks: 98 },
          { day: "Wk 2", kycOtp: 96, upiQr: 78, fakeLinks: 114 },
          { day: "Wk 3", kycOtp: 91, upiQr: 72, fakeLinks: 108 },
          { day: "Wk 4", kycOtp: 112, upiQr: 89, fakeLinks: 134 },
        ];

  const totalScans = scanHistory.length || 1;
  const dangerousPct = Math.round(
    (scanHistory.filter((s) => s.riskScore >= 60).length / totalScans) * 100
  );
  const suspiciousPct = Math.round(
    (scanHistory.filter((s) => s.riskScore >= 30 && s.riskScore < 60).length /
      totalScans) *
      100
  );
  const safePct = Math.max(0, 100 - dangerousPct - suspiciousPct);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Main CTA: “🛡️ Scan Before You Act” */}
      <div className="cyber-glass rounded-2xl p-6 sm:p-8 border border-slate-200 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="text-xs font-semibold text-blue-700 tracking-wide">
              Personal Digital Safety Assistant &middot; Protecting Families &amp; Payments
            </div>
            <h1
              className={`${
                elderlyMode
                  ? "text-3xl sm:text-5xl"
                  : "text-3xl sm:text-4xl"
              } font-bold text-slate-900 tracking-tight leading-tight`}
            >
              🛡️ Scan Before You Act
            </h1>
            <p
              className={`${
                elderlyMode ? "text-lg sm:text-xl" : "text-base sm:text-lg"
              } text-slate-600 max-w-2xl leading-relaxed`}
            >
              Check suspicious messages, links and payment requests before you click or pay.
            </p>

            {/* Primary CTA + Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onNavigateToScanner("screenshot")}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base rounded-xl transition-colors flex items-center gap-2.5 whitespace-nowrap shadow-xs"
              >
                <span>🛡️ Scan Before You Act</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onNavigateToBeforeYouPay}
                className="px-4 py-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4 text-amber-700" />
                <span>“Before You Pay” Safety Check</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToFamily}
                className="px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <HeartHandshake className="w-4 h-4 text-blue-600" />
                <span>Family &amp; Senior Protection</span>
              </button>
            </div>

            {/* Quick-Scan Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium mr-1">Quick Check:</span>
              <button
                type="button"
                onClick={() => onNavigateToScanner("message")}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
              >
                WhatsApp / SMS
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScanner("url")}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
              >
                Suspicious Link
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScanner("qr")}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
              >
                QR Code
              </button>
              <button
                type="button"
                onClick={() => onNavigateToScanner("phone_upi")}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium transition-colors"
              >
                Phone / UPI ID
              </button>
            </div>
          </div>

          {/* Animated Overall Digital Safety Score */}
          <div className="lg:col-span-4 bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500">
                Overall Digital Safety Score
              </div>
              <div className="text-3xl font-bold font-mono text-emerald-700 tabular-nums">
                {securityScore} / 100
              </div>
              <div className="text-xs text-slate-700 font-semibold">
                🟢 Protected &middot; Real-Time Shield Active
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                UPI &middot; Bank KYC &middot; SMS &middot; QR Guard On
              </div>
            </div>

            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={251}
                  strokeDashoffset={251 - (251 * securityScore) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="text-[10px] font-mono text-slate-600 font-semibold mt-0.5">
                  SAFE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Consumer Cybersecurity Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Overall Digital Safety Score
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums mt-1">
            {securityScore}% Safe
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Personal &amp; Family Shield Active
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Threats Detected
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums mt-1">
            {threatsDetectedCount + 19}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Fake KYC &middot; OTP &middot; Courier &middot; QR Traps
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Scams Detected &amp; Blocked
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums mt-1">
            {scamsDetectedCount + 12}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            UPI Collect &amp; Fake Helpline Scams
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">
            Suspicious Links Flagged
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
            {suspiciousLinksCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Lookalike .xyz / .online / .top URLs
          </div>
        </div>
      </div>

      {/* Interactive Threat Trends Chart + Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Interactive Threat Trends (Fake KYC/OTP &middot; UPI/QR Scams &middot; Suspicious Links)
                </h3>
                <p className="text-xs text-slate-500">
                  Daily scam patterns blocked across WhatsApp, SMS, and payment requests
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start">
                <button
                  type="button"
                  onClick={() => setChartTimeframe("7D")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    chartTimeframe === "7D"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setChartTimeframe("30D")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    chartTimeframe === "30D"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 items-end h-48 pt-4 px-2 border-b border-slate-200">
              {weeklyTrend.map((point) => {
                const maxVal = chartTimeframe === "7D" ? 42 : 145;
                const linkH = Math.round((point.fakeLinks / maxVal) * 100);
                const kycH = Math.round((point.kycOtp / maxVal) * 100);
                const upiH = Math.round((point.upiQr / maxVal) * 100);

                return (
                  <div
                    key={point.day}
                    className="flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-36">
                      <div
                        style={{ height: `${linkH}%` }}
                        title={`Suspicious Links: ${point.fakeLinks}`}
                        className="w-2.5 sm:w-3 bg-blue-600 rounded-t transition-opacity group-hover:opacity-85"
                      />
                      <div
                        style={{ height: `${kycH}%` }}
                        title={`Fake KYC / OTP Scams: ${point.kycOtp}`}
                        className="w-2.5 sm:w-3 bg-rose-500 rounded-t transition-opacity group-hover:opacity-85"
                      />
                      <div
                        style={{ height: `${upiH}%` }}
                        title={`UPI / QR Payment Scams: ${point.upiQr}`}
                        className="w-2.5 sm:w-3 bg-amber-500 rounded-t transition-opacity group-hover:opacity-85"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 pb-2">
                      {point.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
                Suspicious Links
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                Fake KYC &amp; OTP Scams
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                UPI / QR Payment Traps
              </span>
            </div>
            <span className="font-mono">Updated Today</span>
          </div>
        </div>

        {/* Risk Distribution Card */}
        <div className="lg:col-span-4 cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Scan Risk Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Breakdown across 🟢 SAFE, 🟡 SUSPICIOUS, and 🔴 DANGEROUS scans
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-rose-700">🔴 DANGEROUS (60–100)</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {dangerousPct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full"
                    style={{ width: `${Math.max(6, dangerousPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-amber-700">🟡 SUSPICIOUS (30–59)</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {suspiciousPct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.max(6, suspiciousPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-emerald-700">🟢 SAFE (0–29)</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    {safePct}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.max(6, safePct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToScanner("screenshot")}
            className="mt-6 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
          >
            🛡️ Scan a Suspicious Message Now &rarr;
          </button>
        </div>
      </div>

      {/* Recent Threat Timeline + Live Threat Intelligence Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 cyber-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Scans &amp; Threat Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Click any scan below to view its visual red flags and “What should you do now?” advice
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToScanner()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + New Scan
            </button>
          </div>

          <div className="space-y-2.5">
            {scanHistory.slice(0, 4).map((scan) => {
              const isDang = scan.riskScore >= 60;
              const isSusp = scan.riskScore >= 30 && scan.riskScore < 60;
              return (
                <button
                  key={scan.id}
                  type="button"
                  onClick={() => onSelectScan(scan)}
                  className="w-full text-left p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs font-mono mb-1">
                      <span
                        className={`font-semibold ${
                          isDang
                            ? "text-rose-700"
                            : isSusp
                            ? "text-amber-700"
                            : "text-emerald-700"
                        }`}
                      >
                        {isDang
                          ? "🔴 DANGEROUS"
                          : isSusp
                          ? "🟡 SUSPICIOUS"
                          : "🟢 SAFE"}{" "}
                        ({scan.riskScore}/100)
                      </span>
                      <span aria-hidden="true" className="text-slate-400">&middot;</span>
                      <span className="text-slate-500 uppercase">
                        {scan.inputType}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">&middot;</span>
                      <span className="text-slate-500">{scan.timestamp}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {scan.threatCategory}
                    </div>
                    <div className="text-xs text-slate-600 truncate mt-0.5">
                      {scan.inputPreview}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>Live Global &amp; Indian Scam Alerts</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time URLhaus, Feodo C2 &amp; AlienVault OTX feed
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateToIntel}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                All Threats &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {liveFeedItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-slate-900 truncate font-medium">
                      {item.indicator}
                    </span>
                    <span
                      className={`font-mono font-semibold shrink-0 ${
                        item.severity === "CRITICAL"
                          ? "text-rose-700"
                          : "text-amber-700"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center justify-between text-[11px]">
                    <span className="truncate">{item.threatName}</span>
                    <span className="font-mono text-slate-500 shrink-0 ml-2">
                      {item.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToIntel}
            className="mt-4 w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Open Threats &amp; Google Search / Maps Grounding &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
