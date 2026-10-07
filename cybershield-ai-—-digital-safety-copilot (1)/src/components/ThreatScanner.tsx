import React, { useState, useRef } from "react";
import { ScanResult, ScanInputType } from "../types";
import { PRESET_SCAN_SAMPLES } from "../data/mockData";
import { AttackChainVisualizer } from "./AttackChainVisualizer";
import {
  Upload,
  Link2,
  MessageSquareWarning,
  Image as ImageIcon,
  Sparkles,
  FileText,
  ArrowRight,
  Globe,
  RefreshCw,
  Mail,
  Phone,
  QrCode,
  HelpCircle,
} from "lucide-react";

interface ThreatScannerProps {
  activeScan: ScanResult;
  elderlyMode?: boolean;
  onScanComplete: (result: ScanResult) => void;
  onAskAssistant: (prompt: string) => void;
  onNavigateToBeforeYouPay?: () => void;
}

export const ThreatScanner: React.FC<ThreatScannerProps> = ({
  activeScan,
  elderlyMode = false,
  onScanComplete,
  onAskAssistant,
  onNavigateToBeforeYouPay,
}) => {
  const [activeTab, setActiveTab] = useState<ScanInputType>("screenshot");

  const [messageInput, setMessageInput] = useState(
    "Dear Customer, your SBI/HDFC Bank Account & UPI will be blocked today in 2 hours as your PAN Card KYC is expired. Click immediately to update PAN KYC: https://hdfc-kyc-instant-verify.xyz/login"
  );
  const [emailInput, setEmailInput] = useState(
    "Subject: URGENT Customs Parcel Hold #IN8492019\nFrom: customs.clearance.india@gmail.com\n\nDear Citizen, your parcel is held at Mumbai Customs. Pay ₹49 address verification fee immediately at https://indiapost-parcel-track-update.online/pay or face legal action."
  );
  const [urlInput, setUrlInput] = useState(
    "https://hdfc-kyc-instant-verify.xyz/login"
  );
  const [phoneUpiInput, setPhoneUpiInput] = useState(
    "+91 89201 44912 / refund.helpdesk.sbi@ybl — 'Call our customer care & install AnyDesk app to get your ₹2,499 failed UPI refund'"
  );
  const [qrPayloadInput, setQrPayloadInput] = useState(
    "upi://pay?pa=merchant.olx.buyer882@okaxis&pn=Army+Officer+Buyer&am=15000.00&tn=Scan+and+Enter+PIN+to+Receive+Rs+15000"
  );

  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>("image/png");
  const [simulatedOcrText, setSimulatedOcrText] = useState<string>(
    PRESET_SCAN_SAMPLES[0].ocrText || ""
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStageText, setScanStageText] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const [toastBanner, setToastBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File, targetMode?: ScanInputType) => {
    setScanError(null);
    if (!file.type.startsWith("image/")) {
      setScanError("Please upload a valid PNG, JPG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setScanError("Image size must be under 10 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImagePreview(dataUrl);
      setSelectedImageMime(file.type || "image/png");
      if ((targetMode || activeTab) === "qr") {
        setQrPayloadInput(
          `[Uploaded QR Image: ${file.name}] upi://pay?pa=merchant.olx.buyer882@okaxis&pn=Verified+Buyer&am=15000.00&tn=Enter+UPI+PIN+to+Receive+Payment`
        );
      } else {
        setSimulatedOcrText(
          `[Uploaded Screenshot: ${file.name}] Evaluating visual text via Gemini Vision OCR + Threat Fusion...`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerScan = async (overridePayload?: {
    inputType: ScanInputType;
    content: string;
    ocrText?: string;
  }) => {
    setScanError(null);
    const targetType = overridePayload?.inputType || activeTab;
    const rawContent =
      overridePayload?.content !== undefined
        ? overridePayload.content
        : targetType === "url"
        ? urlInput.trim()
        : targetType === "message"
        ? messageInput.trim()
        : targetType === "email"
        ? emailInput.trim()
        : targetType === "phone_upi"
        ? phoneUpiInput.trim()
        : targetType === "qr"
        ? qrPayloadInput.trim()
        : simulatedOcrText.trim();

    if (!rawContent && !selectedImagePreview) {
      setScanError("Please provide content or upload an image to scan.");
      return;
    }

    setIsScanning(true);
    const stages = [
      "Step 1: Reading message, URL, phone/UPI handle, or QR code...",
      "Step 2: Checking for Fake KYC, OTP traps, UPI collect requests & urgency...",
      "Step 3: Calculating 0–100 Risk Score & plain-language explanation...",
      "Step 4: Preparing your 'What should you do now?' safety checklist...",
    ];

    let stepIdx = 0;
    setScanStageText(stages[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % stages.length;
      setScanStageText(stages[stepIdx]);
    }, 420);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: targetType,
          content: rawContent,
          imageBase64:
            targetType === "screenshot" || targetType === "qr"
              ? selectedImagePreview
              : undefined,
          imageMimeType:
            targetType === "screenshot" || targetType === "qr"
              ? selectedImageMime
              : undefined,
          simulatedOcrText:
            overridePayload?.ocrText ||
            (targetType === "screenshot"
              ? simulatedOcrText
              : targetType === "qr"
              ? qrPayloadInput
              : undefined),
        }),
      });

      if (!response.ok) {
        throw new Error("Threat analysis service returned an error.");
      }

      const data = await response.json();
      const newScanResult: ScanResult = {
        id: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: "Just now",
        inputType: targetType,
        inputPreview: (
          data.extractedText ||
          rawContent ||
          "Uploaded Image Analysis"
        ).slice(0, 140),
        riskScore: typeof data.riskScore === "number" ? data.riskScore : 75,
        classification: data.classification || "SUSPICIOUS",
        threatCategory:
          data.threatCategory || "Social Engineering / Phishing Analysis",
        extractedText:
          data.extractedText ||
          (targetType === "screenshot"
            ? simulatedOcrText
            : targetType === "qr"
            ? qrPayloadInput
            : undefined),
        extractedUrls: Array.isArray(data.extractedUrls)
          ? data.extractedUrls
          : [],
        visualRedFlags: Array.isArray(data.visualRedFlags)
          ? data.visualRedFlags
          : [],
        whyIsThisRisky:
          data.whyIsThisRisky ||
          data.summaryExplanation ||
          "Completed multi-layer security evaluation.",
        subScores: data.subScores || {
          languageRisk: 50,
          urlRisk: 50,
          impersonationRisk: 50,
          threatIntelRisk: 50,
          behavioralRisk: 50,
        },
        domainAnalysis: data.domainAnalysis || {
          domain: targetType === "url" ? rawContent : "Analyzed Content",
          https: true,
          suspiciousTld: false,
          typosquatting: false,
          redirectDetected: false,
          estimatedAge: "Unknown",
        },
        indicators: Array.isArray(data.indicators) ? data.indicators : [],
        attackChain: Array.isArray(data.attackChain) ? data.attackChain : [],
        summaryExplanation:
          data.summaryExplanation ||
          "Completed multi-layer security evaluation.",
        recommendedActions: Array.isArray(data.recommendedActions)
          ? data.recommendedActions
          : [
              "🛑 Do not click any unverified links",
              "✅ Verify using the official app/website",
            ],
        engine: data.engine || "CyberShield AI Smart Threat Engine",
      };

      onScanComplete(newScanResult);
      setToastBanner(
        `🛡️ Scan Complete: ${
          newScanResult.riskScore >= 60
            ? "🔴 DANGEROUS"
            : newScanResult.riskScore >= 30
            ? "🟡 SUSPICIOUS"
            : "🟢 SAFE"
        } (${newScanResult.riskScore}/100) — ${newScanResult.threatCategory}`
      );
      setTimeout(() => setToastBanner(null), 5000);
    } catch (err: any) {
      setScanError(err?.message || "Failed to complete scan. Please try again.");
    } finally {
      clearInterval(interval);
      setIsScanning(false);
      setScanStageText("");
    }
  };

  const handlePresetClick = (preset: (typeof PRESET_SCAN_SAMPLES)[0]) => {
    setActiveTab(preset.type);
    setSelectedImagePreview(null);
    if (preset.type === "screenshot") {
      setSimulatedOcrText(preset.ocrText || "");
      triggerScan({
        inputType: "screenshot",
        content: preset.ocrText || "",
        ocrText: preset.ocrText,
      });
    } else if (preset.type === "qr") {
      setQrPayloadInput(preset.ocrText || "");
      triggerScan({
        inputType: "qr",
        content: preset.ocrText || "",
        ocrText: preset.ocrText,
      });
    } else if (preset.type === "url") {
      setUrlInput(preset.content || "");
      triggerScan({
        inputType: "url",
        content: preset.content || "",
      });
    } else if (preset.type === "phone_upi") {
      setPhoneUpiInput(preset.content || "");
      triggerScan({
        inputType: "phone_upi",
        content: preset.content || "",
      });
    } else if (preset.type === "email") {
      setEmailInput(preset.content || "");
      triggerScan({
        inputType: "email",
        content: preset.content || "",
      });
    } else {
      setMessageInput(preset.content || "");
      triggerScan({
        inputType: "message",
        content: preset.content || "",
      });
    }
  };

  const isDangerous =
    activeScan.classification === "DANGEROUS" ||
    activeScan.classification === "HIGH RISK" ||
    activeScan.riskScore >= 60;
  const isSuspicious =
    !isDangerous &&
    (activeScan.classification === "SUSPICIOUS" || activeScan.riskScore >= 30);

  const statusBadgeLabel = isDangerous
    ? "🔴 DANGEROUS"
    : isSuspicious
    ? "🟡 SUSPICIOUS"
    : "🟢 SAFE";

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {toastBanner && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm font-semibold text-blue-900 flex items-center justify-between shadow-sm">
          <span>{toastBanner}</span>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            className="text-xs text-blue-700 hover:text-blue-950 ml-4 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Scanner Console */}
      <div className="cyber-glass rounded-xl p-6 sm:p-8 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-blue-700 mb-1">
              Personal Digital Safety Assistant &middot; Scan Anything
            </div>
            <h2
              className={`${
                elderlyMode ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              } font-bold text-slate-900 tracking-tight`}
            >
              🛡️ Scan Before You Act
            </h2>
            <p
              className={`${
                elderlyMode ? "text-base sm:text-lg" : "text-sm"
              } text-slate-600 mt-1`}
            >
              Check suspicious messages, links, phone numbers, QR codes, and payment requests before you click or pay.
            </p>
          </div>

          {onNavigateToBeforeYouPay && (
            <button
              type="button"
              onClick={onNavigateToBeforeYouPay}
              className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold text-xs flex items-center gap-2 self-start whitespace-nowrap"
            >
              <span>About to send money? Try “Before You Pay” Check &rarr;</span>
            </button>
          )}
        </div>

        {/* 6 Input Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 my-5">
          {[
            { id: "screenshot", label: "Screenshot", icon: ImageIcon },
            { id: "message", label: "WhatsApp / SMS", icon: MessageSquareWarning },
            { id: "email", label: "Email", icon: Mail },
            { id: "url", label: "Website / URL", icon: Link2 },
            { id: "phone_upi", label: "Phone / UPI ID", icon: Phone },
            { id: "qr", label: "QR Code Scan", icon: QrCode },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as ScanInputType)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-semibold text-xs transition-all border whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Indian Scam Preset Samples */}
        <div className="py-4 border-y border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-2.5">
            Try a Real-World Indian Scam Example in 1 Click:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_SCAN_SAMPLES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    {preset.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Result: <span className="text-slate-700 font-semibold">{preset.badge}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form Area by Active Tab */}
        <div className="mt-6">
          {activeTab === "screenshot" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileSelection(e.dataTransfer.files[0], "screenshot");
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors flex flex-col items-center justify-center min-h-[210px] ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-300 hover:border-blue-400 bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelection(e.target.files[0], "screenshot");
                      }
                    }}
                    className="hidden"
                  />

                  {selectedImagePreview ? (
                    <div className="space-y-3 w-full">
                      <img
                        src={selectedImagePreview}
                        alt="Uploaded screenshot preview"
                        referrerPolicy="no-referrer"
                        className="max-h-40 mx-auto rounded-lg border border-slate-200 object-contain"
                      />
                      <div className="text-xs text-blue-700 font-medium">
                        Screenshot ready for OCR scan &mdash; Click to change image
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        Upload or Drag &amp; Drop a Screenshot Image
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload any suspicious WhatsApp, SMS, Bank KYC, or UPI screenshot
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Extracted Text from Screenshot (Editable)</span>
                  </label>
                  <textarea
                    rows={5}
                    value={simulatedOcrText}
                    onChange={(e) => setSimulatedOcrText(e.target.value)}
                    placeholder="Upload a screenshot on the left or paste text here..."
                    className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => triggerScan()}
                    disabled={isScanning}
                    className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scanning Now...</span>
                      </>
                    ) : (
                      <span>🛡️ Scan Before You Act</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "message" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Paste Suspicious WhatsApp or SMS Message
                </label>
                <textarea
                  rows={4}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Paste the WhatsApp or SMS message here (e.g., Bank KYC block, Electricity bill disconnect, Part-time job offer, Fake courier link)..."
                  className="w-full p-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Detects Fake KYC, OTP scams, Courier scams, Electricity bill threats &amp; Job/Loan scams.
                </span>
                <button
                  type="button"
                  onClick={() => triggerScan()}
                  disabled={isScanning}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
                >
                  {isScanning ? "Scanning..." : "🛡️ Scan Before You Act"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Paste Suspicious Email Subject, Sender &amp; Body
                </label>
                <textarea
                  rows={5}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Paste the email content here..."
                  className="w-full p-4 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-blue-600"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => triggerScan()}
                  disabled={isScanning}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
                >
                  {isScanning ? "Scanning Email..." : "🛡️ Scan Before You Act"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "url" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Paste Suspicious Website Link (URL) Before Clicking
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://hdfc-kyc-instant-verify.xyz/login"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerScan()}
                    disabled={isScanning}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isScanning ? "Checking Link..." : "🛡️ Scan Before You Act"}
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Checks for fake bank/courier lookalike spelling, dangerous `.xyz` / `.top` / `.online` domains, and hidden redirects.
              </div>
            </div>
          )}

          {activeTab === "phone_upi" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Enter Suspicious Phone Number, Customer-Care Number, or UPI ID
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phoneUpiInput}
                      onChange={(e) => setPhoneUpiInput(e.target.value)}
                      placeholder="e.g., +91 89201 44912 or refund.helpdesk@ybl"
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => triggerScan()}
                    disabled={isScanning}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isScanning ? "Checking..." : "🛡️ Scan Before You Act"}
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Detects fake customer-care numbers found on Google Search, electricity officer scam numbers, and fraudulent refund UPI handles.
              </div>
            </div>
          )}

          {activeTab === "qr" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 p-6 text-center flex flex-col items-center justify-center min-h-[190px]"
                >
                  <QrCode className="w-10 h-10 text-blue-600 mb-2" />
                  <p className="text-sm font-semibold text-slate-900">
                    Upload a Payment QR Code Image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Check if a QR code sent on WhatsApp is a trap to deduct money from your UPI account
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Decoded QR Code Payload / Payment Context
                  </label>
                  <textarea
                    rows={4}
                    value={qrPayloadInput}
                    onChange={(e) => setQrPayloadInput(e.target.value)}
                    placeholder="upi://pay?pa=..."
                    className="w-full p-3.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-amber-800 font-medium">
                    ⚠️ Remember: You NEVER need to scan a QR code or enter a UPI PIN to receive money!
                  </span>
                  <button
                    type="button"
                    onClick={() => triggerScan()}
                    disabled={isScanning}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors whitespace-nowrap"
                  >
                    {isScanning ? "Inspecting QR..." : "🛡️ Scan Before You Act"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanError && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {scanError}
            </div>
          )}

          {isScanning && (
            <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-900">
                  CyberShield AI Smart Threat Analysis Running...
                </div>
                <div className="text-xs font-mono text-slate-600 mt-0.5">
                  {scanStageText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animated 0-100 Risk Score + Visual Red Flags + "Why is this risky?" + "What should you do now?" */}
      <div
        className={`cyber-glass rounded-xl p-6 sm:p-8 border ${
          isDangerous
            ? "border-rose-300 neon-glow-danger"
            : isSuspicious
            ? "border-amber-300 neon-glow-warning"
            : "border-emerald-300 neon-glow-safe"
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-200">
          {/* Animated 0-100 Gauge */}
          <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-200 pb-5 lg:pb-0 lg:pr-6">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={
                    isDangerous
                      ? "#E11D48"
                      : isSuspicious
                      ? "#D97706"
                      : "#059669"
                  }
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * activeScan.riskScore) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  {activeScan.riskScore}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  / 100 RISK
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div
                className={`${
                  elderlyMode ? "text-2xl" : "text-xl"
                } font-bold tracking-tight ${
                  isDangerous
                    ? "text-rose-700"
                    : isSuspicious
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {statusBadgeLabel}
              </div>
              <div
                className={`${
                  elderlyMode ? "text-base" : "text-sm"
                } font-bold text-slate-900`}
              >
                {activeScan.threatCategory}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Scan {activeScan.id} &middot; {activeScan.timestamp}
              </div>
            </div>
          </div>

          {/* "Why is this risky?" Section for Common Users */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Why is this risky? (Plain-Language Explanation)</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  onAskAssistant(
                    `Please explain scan ${activeScan.id} (${statusBadgeLabel}, Risk Score ${activeScan.riskScore}/100) in very simple words and tell me what to do.`
                  )
                }
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 self-start"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask CyberShield AI to Explain More</span>
              </button>
            </div>

            <p
              className={`${
                elderlyMode ? "text-base sm:text-lg" : "text-sm sm:text-base"
              } text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200`}
            >
              {activeScan.whyIsThisRisky || activeScan.summaryExplanation}
            </p>
          </div>
        </div>

        {/* Visual Red Flags + "What should you do now?" Safe Action Advisor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Visual Red Flags */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Visual Red Flags Detected
            </div>
            <div className="space-y-2.5">
              {(activeScan.visualRedFlags && activeScan.visualRedFlags.length > 0
                ? activeScan.visualRedFlags
                : activeScan.indicators.map((ind) => ({
                    id: ind.id,
                    label:
                      ind.severity === "CRITICAL" || ind.severity === "HIGH"
                        ? `🚨 ${ind.title}`
                        : `⚠️ ${ind.title}`,
                    iconType: "alert" as const,
                    description: ind.explanation,
                  }))
              ).map((rf) => (
                <div
                  key={rf.id}
                  className={`p-3.5 rounded-xl border ${
                    rf.iconType === "safe"
                      ? "bg-emerald-50/70 border-emerald-200"
                      : rf.iconType === "warning"
                      ? "bg-amber-50/70 border-amber-200"
                      : "bg-rose-50/70 border-rose-200"
                  }`}
                >
                  <div
                    className={`${
                      elderlyMode ? "text-base" : "text-sm"
                    } font-bold text-slate-900`}
                  >
                    {rf.label}
                  </div>
                  <p
                    className={`${
                      elderlyMode ? "text-sm" : "text-xs"
                    } text-slate-700 mt-1 leading-relaxed`}
                  >
                    {rf.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Action Advisor: "What should you do now?" */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              What should you do now? (Safe Action Advisor)
            </div>
            <div className="space-y-2.5">
              {activeScan.recommendedActions.map((act, idx) => (
                <div
                  key={idx}
                  className={`${
                    elderlyMode ? "text-base" : "text-sm"
                  } font-semibold text-slate-800 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5`}
                >
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 5-Stage Attack Chain & Clickable Indicator Cards */}
      <AttackChainVisualizer
        attackChain={activeScan.attackChain}
        indicators={activeScan.indicators}
      />
    </div>
  );
};
