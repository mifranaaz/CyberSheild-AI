export type ThreatClassification = "SAFE" | "SUSPICIOUS" | "HIGH RISK" | "DANGEROUS";

export type ScanInputType =
  | "screenshot"
  | "message"
  | "email"
  | "url"
  | "phone_upi"
  | "qr";

export type AttackStageName =
  | "Impersonation"
  | "Fear"
  | "Urgency"
  | "Click"
  | "Credential Theft";

export interface VisualRedFlag {
  id: string;
  label: string;
  iconType: "alert" | "warning" | "safe";
  description: string;
}

export interface ThreatIndicator {
  id: string;
  category: AttackStageName | "URL Structure";
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidence: string;
  explanation: string;
}

export interface AttackChainNode {
  stage: AttackStageName;
  detected: boolean;
  summary: string;
  indicatorCount: number;
}

export interface GroundingSourceLink {
  uri: string;
  title: string;
  type: "web" | "maps";
  reviewSnippets?: string[];
}

export interface ScanResult {
  id: string;
  timestamp: string;
  inputType: ScanInputType;
  inputPreview: string;
  riskScore: number;
  classification: ThreatClassification;
  threatCategory: string;
  extractedText?: string;
  extractedUrls: string[];
  visualRedFlags?: VisualRedFlag[];
  whyIsThisRisky?: string;
  subScores: {
    languageRisk: number;
    urlRisk: number;
    impersonationRisk: number;
    threatIntelRisk: number;
    behavioralRisk: number;
  };
  domainAnalysis: {
    domain: string;
    https: boolean;
    suspiciousTld: boolean;
    typosquatting: boolean;
    redirectDetected: boolean;
    estimatedAge: string;
    ipBased?: boolean;
  };
  indicators: ThreatIndicator[];
  attackChain: AttackChainNode[];
  summaryExplanation: string;
  recommendedActions: string[];
  engine?: string;
  userId?: string;
}

export interface LiveThreatFeedItem {
  id: string;
  indicator: string;
  type: "URL" | "IPv4" | "Domain" | "Malware Payload";
  threatName: string;
  malwareFamily: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  confidenceScore: number;
  source: "abuse.ch URLhaus" | "AlienVault OTX" | "CISA KEV / Feodo Tracker";
  status: "ONLINE" | "BLOCKED" | "MONITORED";
  country: string;
  firstSeen: string;
  tags: string[];
  referenceUrl: string;
}

export interface LiveThreatFeedResponse {
  timestamp: string;
  sources: string[];
  items: LiveThreatFeedItem[];
  stats: {
    activeMaliciousUrls: number;
    botnetC2Nodes: number;
    phishingCampaigns24h: number;
    feedStatus: "LIVE" | "CACHED_FALLBACK";
  };
}

export interface IocLookupResult {
  indicator: string;
  indicatorType: string;
  riskScore: number;
  verdict: "MALICIOUS" | "SUSPICIOUS" | "CLEAN / BENIGN";
  otxPulseCount: number;
  tags: string[];
  country: string;
  asn: string;
  liveQueried: boolean;
  summary: string;
}

export interface SimulatorScenario {
  id: string;
  title: string;
  channel: "SMS" | "WhatsApp" | "Work Email" | "Browser URL" | "Support Chat" | "UPI Request";
  senderDisplay: string;
  senderAddress: string;
  timestamp: string;
  content: string;
  embeddedUrl?: string;
  isScam: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  attackPattern: string;
  redFlags: string[];
  explanation: string;
  safeAction: string;
}

export interface FamilyMemberProtection {
  id: string;
  name: string;
  relation: string;
  phoneMask: string;
  ageGroup: "Senior Citizen" | "Adult" | "Teen / Student";
  protectionStatus: "PROTECTED" | "ALERT_PENDING" | "HIGH_ATTENTION";
  elderlyModeEnabled: boolean;
  recentAlert: string;
  lastCheckTime: string;
}

export interface DepartmentRiskRecord {
  id: string;
  department: string;
  employeeCount: number;
  phishingClickRate: number;
  reportingRate: number;
  trainingCompletion: number;
  riskScore: number;
  status: "OPTIMAL" | "MODERATE" | "ELEVATED" | "CRITICAL";
  recentIncident: string;
}
