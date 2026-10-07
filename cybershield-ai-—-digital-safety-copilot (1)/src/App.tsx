import React, { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import { ScanResult, LiveThreatFeedItem, ScanInputType } from "./types";
import { INITIAL_SCAN_HISTORY } from "./data/mockData";
import { DashboardView } from "./components/DashboardView";
import { ThreatScanner } from "./components/ThreatScanner";
import { BeforeYouPayView } from "./components/BeforeYouPayView";
import { ThreatIntelligenceView } from "./components/ThreatIntelligenceView";
import { AwarenessSimulator } from "./components/AwarenessSimulator";
import { FamilyProtectionView } from "./components/FamilyProtectionView";
import { BusinessSecurityView } from "./components/BusinessSecurityView";
import { CyberAssistantDrawer } from "./components/CyberAssistantDrawer";
import { AuthModal, ensureUserProfileInFirestore } from "./components/AuthModal";
import {
  LogIn,
  LogOut,
  Eye,
  Building2,
} from "lucide-react";

type NavSection =
  | "dashboard"
  | "scan"
  | "before_you_pay"
  | "threats"
  | "simulator"
  | "family"
  | "business";

export default function App() {
  const [activeNav, setActiveNav] = useState<NavSection>("dashboard");
  const [elderlyMode, setElderlyMode] = useState<boolean>(false);
  const [assistantForceOpen, setAssistantForceOpen] = useState<boolean>(false);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [userSecurityScore, setUserSecurityScore] = useState<number>(88);
  const [userScansCount, setUserScansCount] = useState<number>(0);

  const [scanHistory, setScanHistory] = useState<ScanResult[]>(
    INITIAL_SCAN_HISTORY
  );
  const [activeScan, setActiveScan] = useState<ScanResult>(
    INITIAL_SCAN_HISTORY[0]
  );
  const [liveFeedItems, setLiveFeedItems] = useState<LiveThreatFeedItem[]>([]);
  const [assistantPrompt, setAssistantPrompt] = useState<string | null>(null);

  // 1. Track Firebase Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        try {
          await ensureUserProfileInFirestore(
            currentUser.uid,
            currentUser.email,
            currentUser.displayName
          );
        } catch (_err) {}
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to Authenticated User's Profile & Associated Scan History in Firestore
  useEffect(() => {
    if (!isAuthReady || !user) {
      setScanHistory(INITIAL_SCAN_HISTORY);
      setUserSecurityScore(88);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubProfile = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.securityScore === "number") {
            setUserSecurityScore(data.securityScore);
          }
          if (typeof data.scansCount === "number") {
            setUserScansCount(data.scansCount);
          }
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    );

    const scansQuery = query(
      collection(db, "scans"),
      where("userId", "==", user.uid)
    );
    const unsubScans = onSnapshot(
      scansQuery,
      (snapshot) => {
        const userScans: ScanResult[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          userScans.push({
            id: docSnap.id,
            userId: d.userId,
            timestamp: d.createdAt?.toDate
              ? d.createdAt.toDate().toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Synced",
            inputType: (d.inputType as ScanInputType) || "message",
            inputPreview: d.inputPreview || "",
            riskScore: d.riskScore ?? 50,
            classification: d.classification || "SUSPICIOUS",
            threatCategory: d.threatCategory || "Analyzed Threat",
            extractedUrls: d.domain ? [d.domain] : [],
            whyIsThisRisky: d.summaryExplanation || "",
            subScores: {
              languageRisk: d.languageRisk ?? 50,
              urlRisk: d.urlRisk ?? 50,
              impersonationRisk: d.impersonationRisk ?? 50,
              threatIntelRisk: d.threatIntelRisk ?? 50,
              behavioralRisk: d.behavioralRisk ?? 50,
            },
            domainAnalysis: {
              domain: d.domain || "Analyzed Content",
              https: true,
              suspiciousTld: (d.urlRisk ?? 0) > 60,
              typosquatting: (d.impersonationRisk ?? 0) > 60,
              redirectDetected: false,
              estimatedAge:
                (d.urlRisk ?? 0) > 60 ? "Newly Registered" : "Established",
            },
            indicators: [
              {
                id: `ind-${docSnap.id}-1`,
                category: "Impersonation",
                title: d.threatCategory || "Detected Manipulation Signal",
                severity:
                  d.classification === "DANGEROUS"
                    ? "CRITICAL"
                    : d.classification === "HIGH RISK"
                    ? "HIGH"
                    : "MEDIUM",
                evidence: d.inputPreview || "Analyzed input",
                explanation: d.summaryExplanation || "",
              },
            ],
            attackChain: [
              {
                stage: "Impersonation",
                detected: (d.impersonationRisk ?? 0) > 35,
                summary:
                  (d.impersonationRisk ?? 0) > 35
                    ? "Authority or brand impersonation detected in scan."
                    : "No explicit brand spoofing observed.",
                indicatorCount: (d.impersonationRisk ?? 0) > 35 ? 1 : 0,
              },
              {
                stage: "Fear",
                detected: (d.languageRisk ?? 0) > 45,
                summary:
                  (d.languageRisk ?? 0) > 45
                    ? "Account freeze or penalty intimidation language detected."
                    : "Low intimidation language.",
                indicatorCount: (d.languageRisk ?? 0) > 45 ? 1 : 0,
              },
              {
                stage: "Urgency",
                detected: (d.behavioralRisk ?? 0) > 40,
                summary:
                  (d.behavioralRisk ?? 0) > 40
                    ? "Artificial time deadline designed to rush action."
                    : "No immediate countdown trap.",
                indicatorCount: (d.behavioralRisk ?? 0) > 40 ? 1 : 0,
              },
              {
                stage: "Click",
                detected: (d.urlRisk ?? 0) > 35,
                summary: `Target domain/handle evaluated: ${d.domain || "N/A"}`,
                indicatorCount: (d.urlRisk ?? 0) > 35 ? 1 : 0,
              },
              {
                stage: "Credential Theft",
                detected: (d.riskScore ?? 0) >= 60,
                summary:
                  (d.riskScore ?? 0) >= 60
                    ? "High likelihood of OTP, UPI PIN, or money theft."
                    : "Low credential theft risk.",
                indicatorCount: (d.riskScore ?? 0) >= 60 ? 1 : 0,
              },
            ],
            summaryExplanation: d.summaryExplanation || "",
            recommendedActions: Array.isArray(d.recommendedActions)
              ? d.recommendedActions
              : ["✅ Verify independently before interacting."],
          });
        });

        setScanHistory([...userScans, ...INITIAL_SCAN_HISTORY]);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "scans");
      }
    );

    return () => {
      unsubProfile();
      unsubScans();
    };
  }, [isAuthReady, user]);

  // 3. Fetch Initial Live Threat Intelligence Feed
  useEffect(() => {
    fetch("/api/threat-intel/live")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setLiveFeedItems(data.items);
        }
      })
      .catch(() => {});
  }, []);

  // 4. Persist Completed Scans to User's Firestore Account
  const handleScanComplete = async (newScan: ScanResult) => {
    setActiveScan(newScan);
    setScanHistory((prev) => [newScan, ...prev]);

    if (user) {
      const scanId =
        newScan.id.replace(/[^a-zA-Z0-9_-]/g, "") || `CS-${Date.now()}`;
      const scanRef = doc(db, "scans", scanId);

      const allowedTypes: ScanInputType[] = [
        "screenshot",
        "message",
        "email",
        "url",
        "phone_upi",
        "qr",
      ];
      const safeInputType: ScanInputType = allowedTypes.includes(
        newScan.inputType
      )
        ? newScan.inputType
        : "message";

      const safeClassification =
        newScan.classification === "SAFE" ||
        newScan.classification === "SUSPICIOUS" ||
        newScan.classification === "HIGH RISK" ||
        newScan.classification === "DANGEROUS"
          ? newScan.classification
          : "SUSPICIOUS";

      const safeActions = (
        newScan.recommendedActions?.length > 0
          ? newScan.recommendedActions
          : ["✅ Verify independently through official channels."]
      )
        .slice(0, 8)
        .map((a) => String(a).slice(0, 500));

      try {
        await setDoc(scanRef, {
          userId: user.uid,
          inputType: safeInputType,
          inputPreview: (newScan.inputPreview || "Analyzed Submission").slice(
            0,
            500
          ),
          riskScore: Math.min(100, Math.max(0, Math.round(newScan.riskScore))),
          classification: safeClassification,
          threatCategory: (
            newScan.threatCategory || "Phishing Analysis"
          ).slice(0, 160),
          domain: (newScan.domainAnalysis?.domain || "No domain").slice(0, 255),
          summaryExplanation: (
            newScan.whyIsThisRisky ||
            newScan.summaryExplanation ||
            "Completed multi-layer scan."
          ).slice(0, 2000),
          languageRisk: Math.min(
            100,
            Math.max(0, Math.round(newScan.subScores.languageRisk))
          ),
          urlRisk: Math.min(
            100,
            Math.max(0, Math.round(newScan.subScores.urlRisk))
          ),
          impersonationRisk: Math.min(
            100,
            Math.max(0, Math.round(newScan.subScores.impersonationRisk))
          ),
          threatIntelRisk: Math.min(
            100,
            Math.max(0, Math.round(newScan.subScores.threatIntelRisk))
          ),
          behavioralRisk: Math.min(
            100,
            Math.max(0, Math.round(newScan.subScores.behavioralRisk))
          ),
          recommendedActions: safeActions,
          createdAt: serverTimestamp(),
        });

        const userRef = doc(db, "users", user.uid);
        const safeName = (
          user.displayName ||
          user.email?.split("@")[0] ||
          "Cyber Defender"
        ).slice(0, 100);
        await updateDoc(userRef, {
          displayName: safeName,
          securityScore: Math.min(100, Math.max(0, userSecurityScore)),
          scansCount: userScansCount + 1,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `scans/${scanId}`);
      }
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "scans", scanId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `scans/${scanId}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems: Array<{
    id: NavSection | "assistant";
    label: string;
  }> = [
    { id: "dashboard", label: "Dashboard" },
    { id: "scan", label: "Scan" },
    { id: "before_you_pay", label: "Before You Pay" },
    { id: "threats", label: "Threats" },
    { id: "simulator", label: "Simulator" },
    { id: "assistant", label: "AI Assistant" },
    { id: "family", label: "Family Protection" },
  ];

  return (
    <div
      className={`min-h-screen bg-[#F8FAFC] text-slate-900 cyber-grid-bg flex flex-col ${
        elderlyMode ? "text-lg" : ""
      }`}
    >
      {/* Top Bar Contract: Zone 1 Brand | Zone 2 Nav Links | Zone 3 Actions */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav("dashboard");
          }}
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          CyberShield AI
        </a>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              item.id === "assistant"
                ? assistantForceOpen
                : activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "assistant") {
                    setAssistantForceOpen(true);
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-blue-700 border-blue-600 font-semibold"
                    : "text-slate-600 border-transparent hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setElderlyMode(!elderlyMode)}
            title="Toggle Elderly-Friendly Large Text Mode"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
              elderlyMode
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{elderlyMode ? "Senior Mode: ON" : "Senior Mode"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveNav("scan")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors whitespace-nowrap shadow-xs"
          >
            <span>🛡️ Scan Before You Act</span>
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Responsive Sub-Navigation Bar for Mobile / Tablet */}
      <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 bg-white border-b border-slate-200">
        {navItems.map((item) => {
          const isActive =
            item.id === "assistant"
              ? assistantForceOpen
              : activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "assistant") {
                  setAssistantForceOpen(true);
                } else {
                  setActiveNav(item.id);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-8 py-8">
        {activeNav === "dashboard" && (
          <DashboardView
            scanHistory={scanHistory}
            liveFeedItems={liveFeedItems}
            securityScore={userSecurityScore}
            elderlyMode={elderlyMode}
            onNavigateToScanner={() => setActiveNav("scan")}
            onSelectScan={(scan) => {
              setActiveScan(scan);
              setActiveNav("scan");
            }}
            onNavigateToIntel={() => setActiveNav("threats")}
            onNavigateToBeforeYouPay={() => setActiveNav("before_you_pay")}
            onNavigateToFamily={() => setActiveNav("family")}
          />
        )}

        {activeNav === "scan" && (
          <ThreatScanner
            activeScan={activeScan}
            elderlyMode={elderlyMode}
            onScanComplete={handleScanComplete}
            onAskAssistant={(prompt) => setAssistantPrompt(prompt)}
            onNavigateToBeforeYouPay={() => setActiveNav("before_you_pay")}
          />
        )}

        {activeNav === "before_you_pay" && (
          <BeforeYouPayView
            elderlyMode={elderlyMode}
            onNavigateToScanner={() => setActiveNav("scan")}
            onAskAssistant={(prompt) => setAssistantPrompt(prompt)}
          />
        )}

        {activeNav === "threats" && (
          <ThreatIntelligenceView
            scanHistory={scanHistory}
            onSelectScan={(scan) => {
              setActiveScan(scan);
              setActiveNav("scan");
            }}
            onDeleteScan={handleDeleteScan}
            isAuthenticated={!!user}
          />
        )}

        {activeNav === "simulator" && (
          <AwarenessSimulator elderlyMode={elderlyMode} />
        )}

        {activeNav === "family" && (
          <FamilyProtectionView
            elderlyMode={elderlyMode}
            onToggleElderlyMode={(val) => setElderlyMode(val)}
            onNavigateToScanner={() => setActiveNav("scan")}
          />
        )}

        {activeNav === "business" && <BusinessSecurityView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-8 text-center sm:flex items-center justify-between text-xs text-slate-500">
        <div className="max-w-[1360px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            CyberShield AI &mdash; Personal Digital Safety Copilot &middot; National Cybercrime Helpline:{" "}
            <strong className="text-slate-900 font-semibold">1930</strong>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setActiveNav("scan")}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              🛡️ Scan Before You Act
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setActiveNav("before_you_pay")}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Before You Pay
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setActiveNav("family")}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              Family & Senior Mode
            </button>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setActiveNav("business")}
              className="hover:text-blue-600 transition-colors font-medium inline-flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise Mode</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating CyberShield AI Assistant */}
      <CyberAssistantDrawer
        activeScan={activeScan}
        externalPrompt={assistantPrompt}
        onClearExternalPrompt={() => setAssistantPrompt(null)}
        forceOpen={assistantForceOpen}
        onCloseForceOpen={() => setAssistantForceOpen(false)}
      />

      {/* User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
