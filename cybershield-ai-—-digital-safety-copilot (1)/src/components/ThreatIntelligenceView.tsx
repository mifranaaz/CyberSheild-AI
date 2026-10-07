import React, { useState, useEffect } from "react";
import {
  LiveThreatFeedResponse,
  IocLookupResult,
  ScanResult,
  GroundingSourceLink,
} from "../types";
import {
  Globe,
  RefreshCw,
  Search,
  Radio,
  ArrowUpRight,
  Trash2,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface ThreatIntelligenceViewProps {
  scanHistory: ScanResult[];
  onSelectScan: (scan: ScanResult) => void;
  onDeleteScan?: (scanId: string) => void;
  isAuthenticated: boolean;
}

export const ThreatIntelligenceView: React.FC<ThreatIntelligenceViewProps> = ({
  scanHistory,
  onSelectScan,
  onDeleteScan,
  isAuthenticated,
}) => {
  const [liveFeed, setLiveFeed] = useState<LiveThreatFeedResponse | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");

  const [iocQuery, setIocQuery] = useState("hdfc-kyc-instant-verify.xyz");
  const [iocLoading, setIocLoading] = useState(false);
  const [iocResult, setIocResult] = useState<IocLookupResult | null>(null);
  const [iocError, setIocError] = useState<string | null>(null);

  const [searchGroundingQuery, setSearchGroundingQuery] = useState(
    "Latest UPI & bank KYC SMS phishing scams 2026"
  );
  const [searchGroundingLoading, setSearchGroundingLoading] = useState(false);
  const [searchGroundingResult, setSearchGroundingResult] = useState<{
    text: string;
    links: GroundingSourceLink[];
  } | null>(null);

  const [mapsGroundingQuery, setMapsGroundingQuery] = useState(
    "Nearest Cybercrime Reporting Police Station or HDFC Bank Official Branch"
  );
  const [mapsGroundingLoading, setMapsGroundingLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapsGroundingResult, setMapsGroundingResult] = useState<{
    text: string;
    links: GroundingSourceLink[];
  } | null>(null);

  const fetchLiveFeed = async (force = false) => {
    setLoadingFeed(true);
    try {
      const res = await fetch(
        `/api/threat-intel/live${force ? "?refresh=true" : ""}`
      );
      if (res.ok) {
        const data = await res.json();
        setLiveFeed(data);
      }
    } catch (e) {
      console.error("Failed to fetch live threat intelligence:", e);
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed(false);
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

  const handleIocLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iocQuery.trim()) return;
    setIocLoading(true);
    setIocError(null);
    try {
      const res = await fetch("/api/threat-intel/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indicator: iocQuery.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lookup failed");
      }
      setIocResult(data);
    } catch (err: any) {
      setIocError(err?.message || "Could not complete IOC lookup.");
    } finally {
      setIocLoading(false);
    }
  };

  const handleGoogleSearchGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchGroundingQuery.trim()) return;
    setSearchGroundingLoading(true);
    try {
      const res = await fetch("/api/grounding/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchGroundingQuery.trim() }),
      });
      const data = await res.json();
      setSearchGroundingResult({
        text: data.text || "",
        links: Array.isArray(data.links) ? data.links : [],
      });
    } catch (_err) {
      setSearchGroundingResult({
        text: "Could not complete Google Search grounding request.",
        links: [],
      });
    } finally {
      setSearchGroundingLoading(false);
    }
  };

  const handleGoogleMapsGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsGroundingQuery.trim()) return;
    setMapsGroundingLoading(true);
    try {
      const res = await fetch("/api/grounding/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: mapsGroundingQuery.trim(),
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
        }),
      });
      const data = await res.json();
      setMapsGroundingResult({
        text: data.text || "",
        links: Array.isArray(data.links) ? data.links : [],
      });
    } catch (_err) {
      setMapsGroundingResult({
        text: "Could not complete Google Maps grounding request.",
        links: [],
      });
    } finally {
      setMapsGroundingLoading(false);
    }
  };

  const filteredFeedItems =
    liveFeed?.items.filter((item) =>
      sourceFilter === "ALL" ? true : item.source.includes(sourceFilter)
    ) || [];

  const totalScans = scanHistory.length || 1;
  const dangerousCount = scanHistory.filter(
    (s) => s.classification === "DANGEROUS"
  ).length;
  const highRiskCount = scanHistory.filter(
    (s) => s.classification === "HIGH RISK"
  ).length;
  const suspiciousCount = scanHistory.filter(
    (s) => s.classification === "SUSPICIOUS"
  ).length;
  const safeCount = scanHistory.filter((s) => s.classification === "SAFE").length;

  return (
    <div className="space-y-8">
      {/* Live Global Threat Intelligence Header */}
      <div className="cyber-glass rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <Radio className="w-4 h-4 text-blue-600" />
              <span>Real-Time OSINT Threat Intelligence Stream</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Global Threat Feeds, Search &amp; Maps Grounding
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              Connected to <strong className="text-slate-900">abuse.ch URLhaus</strong>,{" "}
              <strong className="text-slate-900">Feodo Tracker Botnet C2</strong>,{" "}
              <strong className="text-slate-900">AlienVault OTX</strong>,{" "}
              <strong className="text-blue-700">Google Search Grounding</strong>, and{" "}
              <strong className="text-emerald-700">Google Maps Grounding</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start">
            {liveFeed && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Last Synced: {liveFeed.timestamp}
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchLiveFeed(true)}
              disabled={loadingFeed}
              className="px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingFeed ? "animate-spin" : ""}`}
              />
              <span>Sync Live Feeds</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500">
              Active Malicious URLs (URLhaus)
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 tabular-nums mt-1">
              {liveFeed?.stats.activeMaliciousUrls.toLocaleString() || "1,420"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Verified payload droppers &amp; credential harvesters
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500">
              Active Botnet C2 Nodes (Feodo)
            </div>
            <div className="text-2xl font-bold font-mono text-amber-600 tabular-nums mt-1">
              {liveFeed?.stats.botnetC2Nodes.toLocaleString() || "318"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tracked Pikabot, Qakbot, Emotet &amp; AsyncRAT servers
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-medium text-slate-500">
              AlienVault OTX Active Pulses (24h)
            </div>
            <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums mt-1">
              {liveFeed?.stats.phishingCampaigns24h.toLocaleString() || "894"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Global community-contributed threat indicators
            </div>
          </div>
        </div>
      </div>

      {/* Google Search Grounding & Google Maps Grounding Dual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Google Search Grounding Panel */}
        <div className="cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                <Globe className="w-4 h-4" />
                <span>Google Search Grounding</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Live Web Advisories &amp; CVEs
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Search Live Web for Emerging Scams &amp; Phishing Campaigns
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Uses Gemini with Google Search grounding to retrieve up-to-date scam alerts, domain reports, and security advisories with source links.
            </p>

            <form
              onSubmit={handleGoogleSearchGrounding}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="text"
                value={searchGroundingQuery}
                onChange={(e) => setSearchGroundingQuery(e.target.value)}
                placeholder="Search recent phishing campaigns, CVEs, or scam alerts..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={searchGroundingLoading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                {searchGroundingLoading ? "Searching Web..." : "Search Grounding"}
              </button>
            </form>

            {searchGroundingResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {searchGroundingResult.text}
                </div>

                {searchGroundingResult.links.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-semibold text-blue-700">
                      Verified Google Search Grounding Sources:
                    </div>
                    <div className="space-y-1">
                      {searchGroundingResult.links.map((lnk, idx) => (
                        <a
                          key={idx}
                          href={lnk.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-2 text-xs text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded border border-slate-200"
                        >
                          <span className="truncate">{lnk.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Google Maps Grounding Panel */}
        <div className="cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <MapPin className="w-4 h-4" />
                <span>Google Maps Grounding</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {userCoords ? "GPS Location Active" : "Global Place Verification"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Verify Physical Bank Branches &amp; Nearest Cybercrime Cells
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Uses Gemini with Google Maps grounding to verify physical institution addresses or locate nearby cybercrime reporting centers.
            </p>

            <form
              onSubmit={handleGoogleMapsGrounding}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="text"
                value={mapsGroundingQuery}
                onChange={(e) => setMapsGroundingQuery(e.target.value)}
                placeholder="Find official bank branch or nearest cybercrime police station..."
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={mapsGroundingLoading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                {mapsGroundingLoading ? "Locating..." : "Maps Grounding"}
              </button>
            </form>

            {mapsGroundingResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {mapsGroundingResult.text}
                </div>

                {mapsGroundingResult.links.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="text-[11px] font-semibold text-emerald-700">
                      Verified Google Maps Places &amp; Review Snippets:
                    </div>
                    <div className="space-y-2">
                      {mapsGroundingResult.links.map((lnk, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded border border-slate-200 space-y-1"
                        >
                          <a
                            href={lnk.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                          >
                            <span className="truncate">{lnk.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                          {lnk.reviewSnippets && lnk.reviewSnippets.length > 0 && (
                            <div className="text-[11px] text-slate-600 italic space-y-0.5 pl-2 border-l-2 border-emerald-300">
                              {lnk.reviewSnippets.map((snip, sIdx) => (
                                <p key={sIdx} className="line-clamp-2">
                                  "{snip}"
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live AlienVault OTX / Threat Intelligence IOC Lookup */}
      <div className="cyber-glass rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live AlienVault OTX &amp; Heuristic IOC Reputation Lookup
            </h3>
            <p className="text-xs text-slate-600">
              Query any domain, hostname, or IPv4 address against AlienVault OTX indicator API and CyberShield rules
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Endpoint: /api/v1/indicators/&#123;domain|IPv4&#125;/general
          </span>
        </div>

        <form onSubmit={handleIocLookup} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={iocQuery}
              onChange={(e) => setIocQuery(e.target.value)}
              placeholder="Enter domain or IP (e.g., hdfc-kyc-instant-verify.xyz or 194.180.174.109)"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={iocLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
          >
            {iocLoading ? "Querying OTX..." : "Query Threat Intel"}
          </button>
        </form>

        {iocError && (
          <div className="mt-3 text-xs text-rose-700">{iocError}</div>
        )}

        {iocResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-4 space-y-1 border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-4">
              <div className="text-xs text-slate-500 font-mono">
                {iocResult.indicatorType} &middot; {iocResult.country}
              </div>
              <div className="text-sm font-mono font-bold text-slate-900 truncate">
                {iocResult.indicator}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`text-xs font-bold font-mono ${
                    iocResult.verdict === "MALICIOUS"
                      ? "text-rose-700"
                      : iocResult.verdict === "SUSPICIOUS"
                      ? "text-amber-700"
                      : "text-emerald-700"
                  }`}
                >
                  {iocResult.verdict} ({iocResult.riskScore}/100)
                </span>
                <span aria-hidden="true" className="text-slate-400">&middot;</span>
                <span className="text-xs font-mono text-slate-600 tabular-nums">
                  {iocResult.otxPulseCount} OTX Pulses
                </span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-2">
              <p className="text-xs text-slate-700 leading-relaxed">
                {iocResult.summary}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
                <span>Telemetry Signals:</span>
                {iocResult.tags.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 && <span aria-hidden="true">&middot;</span>}
                    <span className="text-blue-700 font-medium">{t}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time Threat Feed Table */}
      <div className="cyber-glass rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Live Threat Feed Indicators (URLhaus &middot; Feodo C2 &middot; AlienVault OTX)
            </h3>
            <p className="text-xs text-slate-500">
              Click any external reference to inspect the upstream threat report
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start">
            {["ALL", "URLhaus", "Feodo", "AlienVault"].map((flt) => (
              <button
                key={flt}
                type="button"
                onClick={() => setSourceFilter(flt)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  sourceFilter === flt
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {loadingFeed ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-12 rounded-lg bg-slate-100 border border-slate-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-500">
                  <th className="py-3 px-3">INDICATOR (IOC)</th>
                  <th className="py-3 px-3">THREAT / MALWARE FAMILY</th>
                  <th className="py-3 px-3">INTEL SOURCE</th>
                  <th className="py-3 px-3">SEVERITY</th>
                  <th className="py-3 px-3 text-right">CONFIDENCE</th>
                  <th className="py-3 px-3 text-right">REPORT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredFeedItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-900 max-w-[260px] truncate">
                      <div className="truncate font-semibold">{item.indicator}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.type} &middot; {item.country} &middot; {item.firstSeen}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {item.threatName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Family: {item.malwareFamily} &middot; {item.tags.join(" / ")}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {item.source}
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          item.severity === "CRITICAL"
                            ? "text-rose-700"
                            : item.severity === "HIGH"
                            ? "text-amber-700"
                            : "text-amber-600"
                        }`}
                      >
                        {item.severity}
                      </span>
                      <span className="text-slate-400"> &middot; {item.status}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 font-semibold">
                      {item.confidenceScore}%
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-mono text-[11px] font-semibold"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Analytics & User Scan History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 cyber-glass rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Scan Risk Severity Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Breakdown across {scanHistory.length} analyzed submissions
            </p>

            <div className="space-y-4">
              {[
                {
                  label: "DANGEROUS (80–100)",
                  count: dangerousCount,
                  pct: Math.round((dangerousCount / totalScans) * 100),
                  color: "bg-rose-600",
                  textColor: "text-rose-700",
                },
                {
                  label: "HIGH RISK (60–79)",
                  count: highRiskCount,
                  pct: Math.round((highRiskCount / totalScans) * 100),
                  color: "bg-amber-500",
                  textColor: "text-amber-700",
                },
                {
                  label: "SUSPICIOUS (30–59)",
                  count: suspiciousCount,
                  pct: Math.round((suspiciousCount / totalScans) * 100),
                  color: "bg-amber-400",
                  textColor: "text-amber-700",
                },
                {
                  label: "SAFE / LOW (0–29)",
                  count: safeCount,
                  pct: Math.round((safeCount / totalScans) * 100),
                  color: "bg-emerald-600",
                  textColor: "text-emerald-700",
                },
              ].map((tier) => (
                <div key={tier.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-semibold ${tier.textColor}`}>
                      {tier.label}
                    </span>
                    <span className="font-mono text-slate-600 tabular-nums">
                      {tier.count} scans ({tier.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tier.color}`}
                      style={{ width: `${Math.max(4, tier.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Cloud Persistence Status:</span>
            <span className="font-mono text-slate-800 font-semibold">
              {isAuthenticated
                ? "SYNCED TO ACCOUNT (FIRESTORE)"
                : "LOCAL SESSION (SIGN IN TO SYNC)"}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 cyber-glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Scan History &amp; Domain Evidence
              </h3>
              <p className="text-xs text-slate-500">
                Click any scan record to load its full 5-stage attack explanation
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {scanHistory.length} Records
            </span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {scanHistory.map((scan) => (
              <div
                key={scan.id}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
              >
                <button
                  type="button"
                  onClick={() => onSelectScan(scan)}
                  className="text-left flex-1 min-w-0"
                >
                  <div className="flex items-center gap-2 text-xs font-mono mb-1">
                    <span
                      className={`font-semibold ${
                        scan.classification === "DANGEROUS"
                          ? "text-rose-700"
                          : scan.classification === "HIGH RISK"
                          ? "text-amber-700"
                          : scan.classification === "SUSPICIOUS"
                          ? "text-amber-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {scan.riskScore}/100 {scan.classification}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">&middot;</span>
                    <span className="text-slate-500 uppercase">{scan.inputType}</span>
                    <span aria-hidden="true" className="text-slate-400">&middot;</span>
                    <span className="text-slate-500">{scan.timestamp}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {scan.threatCategory}
                  </div>
                  <div className="text-xs font-mono text-slate-600 truncate mt-0.5">
                    {scan.inputPreview}
                  </div>
                </button>

                {onDeleteScan && scan.userId && (
                  <button
                    type="button"
                    onClick={() => onDeleteScan(scan.id)}
                    title="Delete scan record"
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
