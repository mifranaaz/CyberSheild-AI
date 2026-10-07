import React, { useState } from "react";
import { BUSINESS_DEPARTMENTS } from "../data/mockData";
import { DepartmentRiskRecord } from "../types";
import {
  TrendingDown,
  CheckCircle2,
  Send,
  Search,
} from "lucide-react";

export const BusinessSecurityView: React.FC = () => {
  const [departments, setDepartments] =
    useState<DepartmentRiskRecord[]>(BUSINESS_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [campaignNotice, setCampaignNotice] = useState<string | null>(null);

  const handleLaunchTraining = (deptName: string) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.department === deptName
          ? {
              ...d,
              trainingCompletion: Math.min(100, d.trainingCompletion + 8),
              riskScore: Math.max(15, d.riskScore - 9),
              status:
                d.riskScore - 9 < 35
                  ? "OPTIMAL"
                  : d.riskScore - 9 < 60
                  ? "MODERATE"
                  : "ELEVATED",
            }
          : d
      )
    );
    setCampaignNotice(
      `Assigned targeted Phishing Simulation & Micro-Training to ${deptName}. Department risk score updated.`
    );
    setTimeout(() => setCampaignNotice(null), 5000);
  };

  const filteredDepts = departments.filter((d) =>
    d.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgRisk = Math.round(
    departments.reduce((acc, d) => acc + d.riskScore, 0) / departments.length
  );
  const avgReporting = (
    departments.reduce((acc, d) => acc + d.reportingRate, 0) /
    departments.length
  ).toFixed(1);
  const totalEmployees = departments.reduce((acc, d) => acc + d.employeeCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="cyber-glass rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-blue-700 mb-1">
            Enterprise Human-Risk Command Center
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Business Security &amp; Employee Phishing Readiness
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Privacy-preserving organizational risk telemetry, phishing simulation trends, and awareness campaign controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchTraining(departments[1].department)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 self-start whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Deploy Org-Wide Phishing Drill</span>
        </button>
      </div>

      {campaignNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{campaignNotice}</span>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Protected Workforce</div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums mt-1">
            {totalEmployees} Employees
          </div>
          <div className="text-xs text-emerald-700 mt-1 font-mono font-medium">
            5 Active Business Units
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Org Human Risk Index</div>
          <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums mt-1">
            {avgRisk} / 100
          </div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1 font-mono font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-18% vs Last Quarter</span>
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Phish-Alarm Reporting Rate</div>
          <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
            {avgReporting}%
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            Target Benchmark: &ge; 75.0%
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Intercepted BEC Attempts (30d)</div>
          <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums mt-1">
            47 Blocked
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            CEO Gift Card &amp; Invoice Spoofs
          </div>
        </div>
      </div>

      {/* Department Risk Matrix Table */}
      <div className="cyber-glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Phishing Susceptibility &amp; Awareness Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated metrics protect individual employee privacy while highlighting high-risk teams
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter department..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-500">
                <th className="py-3 px-3">DEPARTMENT</th>
                <th className="py-3 px-3 text-right">HEADCOUNT</th>
                <th className="py-3 px-3 text-right">SIMULATED CLICK RATE</th>
                <th className="py-3 px-3 text-right">REPORTING RATE</th>
                <th className="py-3 px-3 text-right">TRAINING COMPLETION</th>
                <th className="py-3 px-3 text-right">RISK SCORE</th>
                <th className="py-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredDepts.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">
                      {dept.department}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {dept.recentIncident}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    {dept.employeeCount}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={
                        dept.phishingClickRate >= 15
                          ? "text-rose-700 font-bold"
                          : dept.phishingClickRate >= 10
                          ? "text-amber-700 font-semibold"
                          : "text-emerald-700"
                      }
                    >
                      {dept.phishingClickRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-blue-700 font-medium">
                    {dept.reportingRate}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums text-slate-800">
                    {dept.trainingCompletion}%
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-bold ${
                        dept.status === "CRITICAL"
                          ? "text-rose-700"
                          : dept.status === "ELEVATED"
                          ? "text-amber-700"
                          : dept.status === "MODERATE"
                          ? "text-amber-600"
                          : "text-emerald-700"
                      }`}
                    >
                      {dept.riskScore}/100 &middot; {dept.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleLaunchTraining(dept.department)}
                      className="px-3 py-1.5 rounded-md bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                    >
                      Assign Drill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
