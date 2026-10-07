import React, { useState } from "react";
import { INITIAL_FAMILY_MEMBERS } from "../data/mockData";
import { FamilyMemberProtection } from "../types";
import {
  Plus,
  HeartHandshake,
  Eye,
  CheckCircle2,
} from "lucide-react";

interface FamilyProtectionViewProps {
  elderlyMode: boolean;
  onToggleElderlyMode: (enabled: boolean) => void;
  onNavigateToScanner: () => void;
}

export const FamilyProtectionView: React.FC<FamilyProtectionViewProps> = ({
  elderlyMode,
  onToggleElderlyMode,
  onNavigateToScanner,
}) => {
  const [members, setMembers] = useState<FamilyMemberProtection[]>(
    INITIAL_FAMILY_MEMBERS
  );
  const [newName, setNewName] = useState("");
  const [newRelation, setNewRelation] = useState("Grandmother · 71 yrs");
  const [newPhone, setNewPhone] = useState("+91 98112 •••60");
  const [newAgeGroup, setNewAgeGroup] = useState<
    "Senior Citizen" | "Adult" | "Teen / Student"
  >("Senior Citizen");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const added: FamilyMemberProtection = {
      id: `fam-${Date.now()}`,
      name: newName.trim(),
      relation: newRelation.trim() || "Family Member",
      phoneMask: newPhone.trim() || "+91 98••• •••00",
      ageGroup: newAgeGroup,
      protectionStatus: "PROTECTED",
      elderlyModeEnabled: newAgeGroup === "Senior Citizen",
      recentAlert: "Added to CyberShield Family Protection circle — No active threats",
      lastCheckTime: "Just now",
    };

    setMembers((prev) => [added, ...prev]);
    setNewName("");
    showToast(`🛡️ Added ${added.name} to your Family Protection Circle!`);
  };

  const handleResolveAlert = (id: string, name: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              protectionStatus: "PROTECTED",
              recentAlert: "Verified safe with family member — Scam number blocked",
              lastCheckTime: "Just now",
            }
          : m
      )
    );
    showToast(`✅ Marked ${name}'s safety alert as resolved and safe.`);
  };

  return (
    <div className="space-y-8">
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header + Prominent Elderly-Friendly Mode Toggle */}
      <div className="cyber-glass rounded-xl p-6 sm:p-8 border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-blue-700">
              Protect Parents, Seniors &amp; Loved Ones From Scams
            </div>
            <h2
              className={`${
                elderlyMode ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              } font-bold text-slate-900 tracking-tight`}
            >
              Family Protection &amp; Elderly-Friendly Mode
            </h2>
            <p
              className={`${
                elderlyMode ? "text-base sm:text-lg" : "text-sm"
              } text-slate-600 max-w-2xl leading-relaxed`}
            >
              Senior citizens are the #1 target for fake KYC calls, electricity bill disconnection threats, and 'Digital Arrest' scams. Keep your family protected in one circle.
            </p>
          </div>

          {/* Elderly-Friendly Mode Switch Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 shrink-0">
            <div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>Elderly-Friendly Mode</span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Larger text &amp; ultra-simple step-by-step safety rules
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onToggleElderlyMode(!elderlyMode);
                showToast(
                  !elderlyMode
                    ? "👓 Elderly-Friendly Mode Enabled (Larger text & simplified safety view)"
                    : "Standard View Restored"
                );
              }}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${
                elderlyMode
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {elderlyMode ? "🟢 ENABLED (ON)" : "Turn ON Senior Mode"}
            </button>
          </div>
        </div>
      </div>

      {/* Ultra-Simple Golden Rules Banner for Senior Citizens */}
      <div className="cyber-glass rounded-xl p-6 sm:p-8 border border-amber-200 bg-amber-50/40">
        <div className="flex items-center gap-2.5 mb-4">
          <HeartHandshake className="w-6 h-6 text-amber-700 shrink-0" />
          <h3
            className={`${
              elderlyMode ? "text-2xl" : "text-lg"
            } font-bold text-slate-900`}
          >
            4 Simple Safety Rules for Parents &amp; Senior Citizens
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div
              className={`${
                elderlyMode ? "text-lg" : "text-sm"
              } font-bold text-rose-700`}
            >
              1. 🛑 No 'Digital Arrest' Exists in India
            </div>
            <p
              className={`${
                elderlyMode ? "text-base" : "text-xs"
              } text-slate-700 leading-relaxed`}
            >
              Police, CBI, Customs, or Judges NEVER call on WhatsApp video or Skype to arrest you or ask for money. Hang up immediately and call your family.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div
              className={`${
                elderlyMode ? "text-lg" : "text-sm"
              } font-bold text-rose-700`}
            >
              2. 🛑 Electricity &amp; Bank Never Block via WhatsApp
            </div>
            <p
              className={`${
                elderlyMode ? "text-base" : "text-xs"
              } text-slate-700 leading-relaxed`}
            >
              If an SMS says 'Power cut tonight at 9:30 PM' or 'SBI PAN blocked in 2 hours', do NOT call the mobile number inside that message.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div
              className={`${
                elderlyMode ? "text-lg" : "text-sm"
              } font-bold text-emerald-700`}
            >
              3. ✅ UPI PIN is ONLY for Sending Money
            </div>
            <p
              className={`${
                elderlyMode ? "text-base" : "text-xs"
              } text-slate-700 leading-relaxed`}
            >
              You NEVER need to enter your 4 or 6-digit UPI PIN or scan a QR code to receive pension, refunds, or payments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
            <div
              className={`${
                elderlyMode ? "text-lg" : "text-sm"
              } font-bold text-blue-700`}
            >
              4. ✅ Always Call 1930 for Cyber Help
            </div>
            <p
              className={`${
                elderlyMode ? "text-base" : "text-xs"
              } text-slate-700 leading-relaxed`}
            >
              If you ever click a bad link or share an OTP by mistake, immediately call the official Government Helpline <strong>1930</strong> to freeze the fraud transfer.
            </p>
          </div>
        </div>
      </div>

      {/* Family Members Circle + Add Family Member Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className={`${
                elderlyMode ? "text-xl" : "text-base"
              } font-bold text-slate-900`}
            >
              Protected Family Members ({members.length})
            </h3>
            <span className="text-xs font-mono text-emerald-700 font-semibold">
              Family Guardian Active
            </span>
          </div>

          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className={`cyber-glass rounded-xl p-5 border ${
                  m.protectionStatus === "ALERT_PENDING"
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`${
                          elderlyMode ? "text-lg" : "text-base"
                        } font-bold text-slate-900`}
                      >
                        {m.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        &middot; {m.relation}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {m.phoneMask} &middot; {m.ageGroup} &middot; Checked {m.lastCheckTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <span
                      className={`text-xs font-bold font-mono ${
                        m.protectionStatus === "PROTECTED"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {m.protectionStatus === "PROTECTED"
                        ? "🟢 PROTECTED"
                        : "🟡 ATTENTION NEEDED"}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div
                    className={`${
                      elderlyMode ? "text-sm" : "text-xs"
                    } text-slate-700`}
                  >
                    <strong>Latest Activity:</strong> {m.recentAlert}
                  </div>

                  {m.protectionStatus === "ALERT_PENDING" && (
                    <button
                      type="button"
                      onClick={() => handleResolveAlert(m.id, m.name)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs whitespace-nowrap shrink-0"
                    >
                      Mark Verified &amp; Safe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Family Member Card */}
        <div className="lg:col-span-5 cyber-glass rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Add Family Member to Safety Circle
              </h3>
              <p className="text-xs text-slate-500">
                Share scam alerts &amp; enable Senior Citizen protection
              </p>
            </div>
          </div>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Family Member Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Dadi / Uncle Sharma"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Relationship &amp; Age
              </label>
              <input
                type="text"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                placeholder="e.g., Grandmother · 71 yrs"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number (Optional Mask)
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+91 98112 •••60"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Protection Profile
              </label>
              <select
                value={newAgeGroup}
                onChange={(e) => setNewAgeGroup(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Senior Citizen">
                  Senior Citizen (Auto-Enables Elderly Mode)
                </option>
                <option value="Adult">Adult Family Member</option>
                <option value="Teen / Student">Teen / College Student</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors"
            >
              + Add to Family Protection
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onNavigateToScanner}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              🛡️ Scan a Message Forwarded by Family &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
