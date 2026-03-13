// ═══════════════════════════════════════════════════════════
// NEXUS BDR v6 — Definitive Intelligence Dashboard
// Merged command center + pitch dashboard
// 7 tabs: Dashboard | Priorities | Competitors | Signals | Research | Learning | Agents
// ═══════════════════════════════════════════════════════════

// ─── THEME ───
const C = {
  gold: "#C5A55A", goldDim: "rgba(197,165,90,0.12)", goldBg: "rgba(197,165,90,0.06)", goldGlow: "rgba(197,165,90,0.15)",
  bg: "#0A0A0A", void: "#020208", surface: "rgba(255,255,255,0.02)", surface2: "#14142a",
  surfaceHover: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.06)", borderGold: "rgba(197,165,90,0.25)", borderHover: "#2a2a4e",
  text: "#E8E0D0", dim: "#AAA", muted: "#666", textDark: "#444",
  hot: "#ff2d2d", warm: "#ff8c00", cool: "#2d7fff", cold: "#555570",
  red: "#FF4136", orange: "#FF851B", blue: "#0074D9", green: "#2ECC40",
  tbf: "#2D5016", dft: "#ff3333",
};

const FONT = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Outfit', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
};

const tierColors = { hot: C.red, warm: C.orange, cool: C.blue, cold: "#AAA" };
const riskColors = { HIGH: C.red, MEDIUM: C.orange, LOW: C.green };
const playbookLabels = {
  COMPETITOR_STRIKE: { label: "Competitor Strike", color: C.red, icon: "\u2694" },
  VAPE_MARGIN_DEFENSE: { label: "Vape Margin Defense", color: C.orange, icon: "\u25C8" },
  BEVERAGE_INNOVATION: { label: "Beverage Innovation", color: C.blue, icon: "\u25C9" },
  COMAN_ENABLEMENT: { label: "Co-Man Enablement", color: C.green, icon: "\u25CE" },
  REGULATORY_READINESS: { label: "Regulatory Ready", color: "#9B59B6", icon: "\u25B3" },
};

// ─── BRAND CONFIG ───
const BRANDS = {
  ALL: { label:"NEXUS", sublabel:"All Brands", color:C.gold, accent:C.gold },
  TBF: { label:"TBF", sublabel:"Terpene Belt Farms", color:"#2D5016", accent:"#4a8a2a", desc:"Premium \u00b7 Science-backed \u00b7 Enterprise" },
  DFT: { label:"DFT", sublabel:"Duty Free Terpenes", color:"#cc2222", accent:C.dft, desc:"Rebellious \u00b7 No minimums \u00b7 Creator-to-creator" },
};

// ─── BOOT SEQUENCE ───
const BOOT_LINES = [
  { text:"NEXUS BDR Intelligence System v6.0", color:C.gold },
  { text:"Loading 19 agent scripts...", color:C.dim },
  { text:"Scanning outputs/briefs/ ... 2 briefs loaded", color:C.dim },
  { text:"Scanning outputs/scored_apollo_*.json ... pipeline ready", color:C.dim },
  { text:"Connecting to Integration Hub (30+ services)...", color:C.dim },
  { text:"Apollo \u2713 | HubSpot \u2713 | Instantly \u2713 | Reddit \u2713 | PubMed \u2713", color:C.green },
  { text:"Kill Shot Bundle engine: ARMED", color:C.gold },
  { text:"Signal learning engine: ACTIVE", color:C.gold },
  { text:"Brand context loaded: TBF + DFT", color:C.green },
  { text:"Competitor monitoring: 7 tracked", color:C.green },
  { text:"SYSTEM READY \u2014 All agents operational", color:C.gold },
];

const TICKER_ITEMS = [
  "MELLOW FELLOW: Score 96 \u00b7 Bundle ARMED \u00b7 JJ Coombs (CEO)",
  "TRUE TERPENES: Trustpilot 3.0/5 \u00b7 Vulnerability HIGH",
  "PIPELINE: 53 entities \u00b7 35 signals \u00b7 12 actions queued",
  "CDT ADVANTAGE: 40-80% savings vs market rate",
  "RESEARCH: 121 papers indexed \u00b7 35 active trials",
  "COALITION: Good Fellows (Urb, Zombi, Pushin P\u2019s) = 4 accounts",
  "REDDIT: 4 supplier-seeking signals detected",
  "LEARNING ENGINE: 10 signal weights active",
];

// ─── DEMO DATA: BUNDLES (Kill Shot Outreach Packages) ───
const DEMO_BUNDLES = {
  "mellow_fellow": {
    company: "Mellow Fellow",
    generatedAt: "2026-03-04T06:21:00Z",
    playbook: "COMPETITOR_STRIKE",
    confidence: "HIGH",
    confidenceScore: 87,
    actionId: "9387eb0d51dd",
    triggerSignals: [
      { id: "sig_tp01", type: "trustpilot_below_3.5", source: "Trustpilot", summary: "True Terpenes rated 3.0/5 (below displacement threshold)", timestamp: "2026-03-03T14:22:00Z", strength: 8, url: "https://trustpilot.com/review/trueterpenes.com" },
      { id: "sig_sw01", type: "switching_triggers", source: "Sales Intel Brief", summary: "3 switching triggers: batch consistency, CDT pricing, scaling supply", timestamp: "2026-03-04T05:45:00Z", strength: 7 },
    ],
    artifacts: {
      whyNow: "# Why now: Mellow Fellow\n\nGenerated: 2026-03-04T06:21:00Z\n\n## Top triggers\n- **trustpilot_below_3.5** | w=15 s=8 | True Terpenes 3.0/5 Trustpilot\n- **switching_triggers** | w=12 s=7 | Batch consistency, CDT pricing, scaling supply\n- **brief_completed** | w=3 s=3 | Full 6-phase brief available\n\n## Supplier vulnerability\nTrue Terpenes: 3.0/5 Trustpilot, 14 news articles (brand noise), active hiring (churn signal)\n\n## Switch economics\n- CDT market: $5,000\u20138,000/L\n- TBF CDT: $1,500\u20133,000/L (vertically integrated)\n- Savings: 40\u201380% on CDT alone\n- Botanical (DFT): $45\u201380/L vs competitor $80\u2013150/L",
      email: "Subject: Quick question on terpene consistency for Mellow Fellow\n\nHi JJ,\n\nI pulled a quick brief on Mellow Fellow and noticed a few signals that usually show up right before teams re-evaluate their terpene/flavor stack \u2014 specifically around batch consistency and CDT pricing at scale.\n\nIf you're open to it, we can send a small R&D kit plus a 2-week validation plan so your team can compare:\n- sensory consistency batch-to-batch\n- lead times / supply reliability\n- documentation readiness (COAs/specs)\n\nWorth a 10-minute call this week to see if it's relevant?\n\n\u2014 Shareef",
      linkedinDm: "Hey JJ \u2014 I put together a quick brief on Mellow Fellow and a short validation plan for terpene/flavor consistency. Based on your current direction with proprietary blends (Creativity, Dream, Euphoria), our CDT profiles might be worth a side-by-side. Want the 1-pager?",
      callOpener: "Call opener:\n\"Hey JJ \u2014 quick one. We pulled an account brief on Mellow Fellow and saw a few signals that usually show up right before teams re-check their terpene supplier \u2014 batch consistency at scale, CDT pricing, and documentation readiness.\n\nIf I send a small R&D kit + a 2-week validation plan, would you be the right person to compare it to what you're using now?\"\n\nObjection handling:\n- \"We're happy with our supplier\" \u2192 \"Totally fair. Most of our best customers said the same thing before they did a side-by-side. The kit is free \u2014 worst case you validate that your current setup is solid.\"\n- \"What's your pricing?\" \u2192 \"Depends on volume and profile type. For CDT at your scale, we're typically 40-80% below market. But the real differentiator is batch consistency \u2014 that's what the validation plan tests.\"\n- \"Send me info\" \u2192 \"Will do. I'll include the brief, a comparison matrix, and the 2-week pilot plan. What email should I use?\"",
      heygenScript: "Hey JJ \u2014 Shareef here from Terpene Belt Farms.\n\nI'm reaching out because we pulled a quick account brief on Mellow Fellow and saw a few signals that usually show up right before teams re-evaluate their terpene supplier.\n\nYour proprietary blends \u2014 Creativity, Dream, Euphoria \u2014 those are effects-based profiles. That's exactly where CDT consistency matters most.\n\nRather than pitch, I'd rather make this easy: we can send a small R&D kit plus a 2-week validation plan so your team can compare sensory consistency, lead times, and documentation readiness side-by-side.\n\nIf it's relevant, open to a quick 10 minutes this week?",
      competitorWedge: "# Supplier Wedge: Mellow Fellow\n\n## Current supplier\n- True Terpenes (likely) \u2014 3.0/5 Trustpilot, vulnerability HIGH\n\n## Displacement strategy\nLead with: batch consistency + CDT pricing advantage + documentation readiness\n\n## 2-week switch plan\n1. Day 1-3: Sensory match validation \u2014 send R&D kit matching their top 3 SKU profiles\n2. Day 4-7: COGS + lead time comparison \u2014 side-by-side pricing matrix\n3. Day 8-11: Small pilot on 1-2 SKUs \u2014 their team validates in-house\n4. Day 12-14: Rollout decision + reorder cadence setup",
      briefDocx: true,
      taskPayload: { campaign: "competitor_strike", steps: ["email_day1", "linkedin_day2", "call_day4", "video_day5", "followup_day8", "break_day12"], ghl_ready: true },
    },
  },
};

// ─── DEMO DATA: CORE ───
const DEMO_DATA = {
  systemStatus: {
    entities: 53, signals: 35, connections: 40, events: 87,
    entitiesTracked: 53, signalsToday: 35, actionsQueued: 12, outcomesRecordedToday: 0,
    lastIngest: "2026-03-04T05:28:00Z",
    learningStats: { actionsTracked: 12, outcomesRecorded: 0, signalsWeightUpdated: 0 },
    researchPapers: 121, activeTrials: 35, competitorsTracked: 7,
  },
  priorities: [
    { rank: 1, company: "Mellow Fellow", domain: "mellowfellow.fun", score: 52.6, tier: "hot", brand: "DFT", contacts: 28, verified: 0, briefComplete: true, topContact: "JJ Coombs", topTitle: "CEO & Co-Founder", features: ["brief_completed", "pipeline_score:96", "switching_triggers:3"], nextAction: "outreach", currentSupplier: "True Terpenes", actionId: "9387eb0d51dd", playbook: "COMPETITOR_STRIKE", playbookConfidence: "HIGH", angle: "supplier_switch_wedge", whyNow: "Brief completed. Current supplier True Terpenes has 3.0/5 Trustpilot. 3 switching triggers identified.", bundleKey: "mellow_fellow",
      whyNowStructured: [
        { signalId: "sig_tp01", type: "trustpilot_below_3.5", source: "Trustpilot", timestamp: "2026-03-03T14:22:00Z", summary: "True Terpenes rated 3.0/5 \u2014 below displacement threshold", strength: 8 },
        { signalId: "sig_sw01", type: "switching_triggers", source: "Sales Intel Brief v4", timestamp: "2026-03-04T05:45:00Z", summary: "3 triggers: batch consistency, CDT pricing, scaling supply", strength: 7 },
        { signalId: "sig_br01", type: "brief_completed", source: "Brief Engine", timestamp: "2026-03-04T05:50:00Z", summary: "Full 6-phase brief generated \u2014 ready for outreach", strength: 3 },
      ],
    },
    { rank: 2, company: "Cannvital", domain: "cannvital.com", score: 26.8, tier: "hot", brand: "TBF", contacts: 4, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:89"], nextAction: "run_brief", currentSupplier: "", actionId: "b2c3d4e5f6a7", whyNow: "High pipeline score. European CBD manufacturer \u2014 potential terpene buyer." },
    { rank: 3, company: "Phytograde Labs", domain: "phytograde.com", score: 26.6, tier: "hot", brand: "TBF", contacts: 4, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:88"], nextAction: "run_brief", currentSupplier: "", actionId: "c3d4e5f6a7b8", whyNow: "Pharmaceutical-grade extraction company. Brief needed." },
    { rank: 4, company: "CBD Alchemy", domain: "cbdalchemy.com", score: 26.5, tier: "hot", brand: "DFT", contacts: 11, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:88", "contacts:11"], nextAction: "run_brief", currentSupplier: "", actionId: "d4e5f6a7b8c9", whyNow: "Large contact pool (11). European CBD brand. Possible DFT customer." },
    { rank: 5, company: "Canatura", domain: "canatura.com", score: 26.3, tier: "hot", brand: "TBF", contacts: 5, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:87"], nextAction: "run_brief", currentSupplier: "", actionId: "e5f6a7b8c9d0", whyNow: "European cannabis brand. Strong pipeline score." },
    { rank: 6, company: "Deli Hemp", domain: "delihemp.com", score: 23.6, tier: "warm", brand: "DFT", contacts: 9, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:78", "contacts:9"], nextAction: "run_brief", currentSupplier: "", actionId: "f6a7b8c9d0e1", whyNow: "Hemp retailer with 9 contacts. Potential DFT customer." },
    { rank: 7, company: "Canna Capital Group", domain: "cannacapital.com", score: 22.5, tier: "warm", brand: "TBF", contacts: 2, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:75"], nextAction: "run_brief", currentSupplier: "", actionId: "a7b8c9d0e1f2", whyNow: "Cannabis investment group. Gateway to portfolio companies." },
    { rank: 8, company: "A-Sense Brand", domain: "a-sense.co", score: 21.9, tier: "warm", brand: "DFT", contacts: 22, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:73", "contacts:22"], nextAction: "run_brief", currentSupplier: "", actionId: "b8c9d0e1f2a3", whyNow: "Largest contact pool (22). Sensory brand \u2014 strong terpene angle." },
    { rank: 9, company: "Alplant", domain: "alplant.ch", score: 21.4, tier: "warm", brand: "TBF", contacts: 4, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:71"], nextAction: "run_brief", currentSupplier: "", actionId: "c9d0e1f2a3b4", whyNow: "Swiss plant-based company. Precision terpene applications." },
    { rank: 10, company: "Euphoria Trade", domain: "euphoria.nl", score: 21.2, tier: "warm", brand: "DFT", contacts: 3, verified: 0, briefComplete: false, topContact: "\u2014", topTitle: "\u2014", features: ["pipeline_score:70"], nextAction: "run_brief", currentSupplier: "", actionId: "d0e1f2a3b4c5", whyNow: "European cannabis accessories/products. Effects-based brand name." },
  ],
  competitors: [
    { name: "True Terpenes", trustpilot: 3.0, risk: "HIGH", score: 15, hiring: true, vulnerability: "Low Trustpilot (3.0/5), active hiring suggests churn, 14 news articles \u2014 brand noise" },
    { name: "Abstrax Tech", trustpilot: 4.7, risk: "LOW", score: 5, hiring: true, vulnerability: "Strong brand but premium pricing. Hiring = growth or backfill?" },
    { name: "Floraplex", trustpilot: null, risk: "LOW", score: 2, hiring: false, vulnerability: "Budget player. Low visibility. Not a direct threat to CDT positioning" },
    { name: "Peak Supply Co", trustpilot: 3.7, risk: "MEDIUM", score: 8, hiring: false, vulnerability: "Below-average reviews (3.7/5). Potential displacement target" },
    { name: "Denver Terpenes", trustpilot: null, risk: "LOW", score: 0, hiring: false, vulnerability: "Regional player. Limited online presence" },
    { name: "Extract Consultants", trustpilot: null, risk: "LOW", score: 0, hiring: false, vulnerability: "Consulting model. Different positioning than supply" },
    { name: "Terps USA", trustpilot: null, risk: "LOW", score: 0, hiring: false, vulnerability: "Limited data available. Small market share" },
  ],
  redditSignals: [
    { type: "SUPPLIER SEEKING", subreddit: "hempflowers", title: "Anxiety & Sensitivity to THC \u2014 looking for alternatives", url: "#", score: 8 },
    { type: "SUPPLIER SEEKING", subreddit: "FLMedicalTrees", title: "What to actually look for in COAs", url: "#", score: 7 },
    { type: "SUPPLIER SEEKING", subreddit: "TheOCS", title: "Looking for Hash Recommendations", url: "#", score: 6 },
    { type: "DISCUSSION", subreddit: "TheOCS", title: "HUT - Dual Z (RS11 & Souffle) 28g", url: "#", score: 4 },
  ],
  researchHighlights: [
    { title: "Therapeutic use of cannabinoids in age-related pain management", journal: "Pharmacological Research", year: 2026, terpenes: ["beta-caryophyllene", "linalool"], score: 89 },
    { title: "Beta-caryophyllene enhances transdermal drug delivery via CB2 activation", journal: "J Pharmaceutical Sciences", year: 2026, terpenes: ["beta-caryophyllene"], score: 78 },
    { title: "Limonene anxiolytic effects in clinical trial settings", journal: "Phytomedicine", year: 2025, terpenes: ["limonene"], score: 72 },
    { title: "Synergistic anti-inflammatory activity of terpene blends", journal: "Cannabis and Cannabinoid Research", year: 2025, terpenes: ["beta-pinene", "alpha-pinene", "linalool"], score: 68 },
    { title: "Entourage effect mechanisms: terpene-cannabinoid interactions", journal: "Frontiers in Pharmacology", year: 2025, terpenes: ["myrcene", "limonene", "beta-caryophyllene"], score: 65 },
  ],
  signalWeights: [
    { signal: "Trustpilot Below 3.5", weight: 15.0 },
    { signal: "Quality Complaint (Competitor)", weight: 12.0 },
    { signal: "Regulatory Change", weight: 12.0 },
    { signal: "Reddit: Supplier Seeking", weight: 10.0 },
    { signal: "Leadership Change", weight: 9.0 },
    { signal: "Trustpilot Below 4.0", weight: 8.0 },
    { signal: "Funding News", weight: 8.0 },
    { signal: "Reddit: Complaint", weight: 7.0 },
    { signal: "Price Discussion", weight: 7.0 },
    { signal: "New Product Launch", weight: 6.0 },
  ],
};

// ─── DEMO DATA: AGENTS ───
const DEMO_AGENTS = [
  { name:"Sales Intel Brief v4", status:"active", desc:"6-phase AI research + cost optimization", file:"sales_intel_brief_v4.py", lines:506 },
  { name:"Free Intel Harvester", status:"active", desc:"Reddit, FDA, news \u2014 zero API cost", file:"free_intel_sources.py", lines:516 },
  { name:"Apollo Importer", status:"active", desc:"CSV \u2192 scored JSON pipeline", file:"apollo_import_score.py", lines:174 },
  { name:"Contact Enricher", status:"active", desc:"Domain \u2192 contacts \u2192 emails", file:"enrich_contacts.py", lines:216 },
  { name:"Email Verifier", status:"active", desc:"Batch verification via MillionVerifier", file:"verify_emails.py", lines:89 },
  { name:"HubSpot Sync", status:"active", desc:"Bi-directional CRM sync", file:"hubspot_sync.py", lines:256 },
  { name:"Terpene Research Engine", status:"active", desc:"10-subagent research orchestrator", file:"terpene_research_engine.py", lines:1156 },
  { name:"Kill Shot Bundle Gen", status:"active", desc:"Multi-channel outreach package builder", file:"nexus.py", lines:892 },
  { name:"War Room", status:"active", desc:"Decision engine + outcome learning", file:"war_room.py", lines:468 },
  { name:"Integration Hub", status:"active", desc:"30+ service connections across 6 tiers", file:"integration_hub.py", lines:1200 },
  { name:"Competitor Monitor", status:"ready", desc:"Trustpilot + hiring + news tracker", file:"competitor_monitor.py", lines:0 },
  { name:"LinkedIn Automator", status:"ready", desc:"DM sequences via Dripify/Expandi", file:"linkedin_auto.py", lines:0 },
  { name:"GHL Pipeline Sync", status:"ready", desc:"GoHighLevel CRM integration", file:"ghl_sync.py", lines:0 },
  { name:"HeyGen Video Gen", status:"ready", desc:"AI video outreach via HeyGen API", file:"heygen_gen.py", lines:0 },
  { name:"Instantly Campaign", status:"deployed", desc:"Cold email warmup + campaigns", file:"instantly_sync.py", lines:0 },
  { name:"Reef Server", status:"active", desc:"Dashboard server + API layer", file:"reef_server.py", lines:280 },
];

// ─── API HELPERS ───
const API = (typeof window !== "undefined" && window.__REEF_API__) || {
  snapshot: "/api/reef/snapshot", run: "/api/reef/run", job: "/api/reef/job", outcome: "/api/reef/outcome",
};

async function jfetch(url, opts = {}) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!res.ok) { const err = new Error((data && (data.error || data.message)) || res.statusText); err.status = res.status; err.payload = data; throw err; }
  return data;
}

// ─── SHARED COMPONENTS ───

function Badge({ color, children }) {
  return <span style={{ display:"inline-block", fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:4, background:`${color}22`, color, border:`1px solid ${color}44`, letterSpacing:0.5, textTransform:"uppercase" }}>{children}</span>;
}

function GoldDivider() {
  return <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #C5A55A 20%, #C5A55A 80%, transparent)", margin: "28px 0", opacity: 0.35 }} />;
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: C.goldBg, border: `1px solid ${C.borderGold}`, borderRadius: 8, padding: "14px 18px", minWidth: 120 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || C.gold, fontFamily: FONT.display }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 3, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} style={{
      padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
      background: copied ? "rgba(46,204,64,0.2)" : "rgba(255,255,255,0.05)",
      color: copied ? C.green : "#888", border: `1px solid ${copied ? "rgba(46,204,64,0.3)" : "rgba(255,255,255,0.1)"}`,
      textTransform: "uppercase", letterSpacing: 0.5, transition: "all 0.2s",
    }}>{copied ? "Copied" : label || "Copy"}</button>
  );
}

function PlaybookBadge({ playbook, confidence }) {
  const info = playbookLabels[playbook];
  if (!info) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 4, letterSpacing: 0.5, background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}33` }}>
        {info.icon} {info.label.toUpperCase()}
      </span>
      {confidence && (
        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 3,
          background: confidence === "HIGH" ? "rgba(46,204,64,0.12)" : confidence === "MEDIUM" ? "rgba(197,165,90,0.12)" : "rgba(255,255,255,0.05)",
          color: confidence === "HIGH" ? C.green : confidence === "MEDIUM" ? C.gold : "#888",
        }}>{confidence}</span>
      )}
    </div>
  );
}

function ProvenancePanel({ signals }) {
  if (!signals || signals.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Trigger Signals (provenance)</div>
      {signals.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", marginBottom: 4, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: s.strength >= 7 ? C.red : s.strength >= 4 ? C.gold : C.blue }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.5 }}>{s.summary}</div>
            <div style={{ fontSize: 10, color: C.textDark, marginTop: 3, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT.mono }}>{s.type.replace(/_/g, " ")}</span>
              <span>src: {s.source}</span>
              <span>{s.timestamp ? new Date(s.timestamp).toLocaleDateString() : ""}</span>
              {s.url && s.url !== "#" && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "none" }}>source link</a>}
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, fontFamily: FONT.mono, flexShrink: 0 }}>s={s.strength}</div>
        </div>
      ))}
    </div>
  );
}

function PipelineBar({ data }) {
  const total = (data.hot||0)+(data.warm||0)+(data.cool||0)+(data.cold||0) || 1;
  return (
    <div style={{ display:"flex", height:28, borderRadius:6, overflow:"hidden", border:`1px solid ${C.border}` }}>
      {[{k:"hot",c:C.hot},{k:"warm",c:C.warm},{k:"cool",c:C.cool},{k:"cold",c:C.cold}].map(s => (
        <div key={s.k} style={{ width:`${(data[s.k]||0)/total*100}%`, background:`${s.c}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:s.c, minWidth: data[s.k] ? 40 : 0 }}>
          {data[s.k]||0} {s.k.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

// ─── BUNDLE VIEWER MODAL ───

function BundleViewer({ bundle, onClose }) {
  const [activeAsset, setActiveAsset] = useState("email");
  if (!bundle) return null;

  const assets = [
    { id: "email", label: "Email", icon: "\u2709", content: bundle.artifacts?.email },
    { id: "linkedinDm", label: "LinkedIn DM", icon: "\uD83D\uDCAC", content: bundle.artifacts?.linkedinDm },
    { id: "callOpener", label: "Call Script", icon: "\uD83D\uDCDE", content: bundle.artifacts?.callOpener },
    { id: "heygenScript", label: "Video Script", icon: "\uD83C\uDFAC", content: bundle.artifacts?.heygenScript },
    { id: "whyNow", label: "Why Now", icon: "\u26A1", content: bundle.artifacts?.whyNow },
    { id: "competitorWedge", label: "Wedge Plan", icon: "\u2694", content: bundle.artifacts?.competitorWedge },
  ].filter(a => a.content);

  const current = assets.find(a => a.id === activeAsset) || assets[0];

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 60, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "90%", maxWidth: 920, maxHeight: "90vh", background: "#111114", border: `1px solid ${C.borderGold}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.borderGold}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.gold, fontFamily: FONT.display }}>Kill Shot Bundle — {bundle.company}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, display: "flex", gap: 16, alignItems: "center" }}>
              {bundle.playbook && <PlaybookBadge playbook={bundle.playbook} confidence={bundle.confidence} />}
              <span>Generated {bundle.generatedAt ? new Date(bundle.generatedAt).toLocaleString() : "\u2014"}</span>
              <span style={{ fontFamily: FONT.mono }}>action: {bundle.actionId || "\u2014"}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 20, padding: "4px 8px" }}>{"\u2715"}</button>
        </div>
        {/* Asset tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", overflowX: "auto" }}>
          {assets.map(a => (
            <button key={a.id} onClick={() => setActiveAsset(a.id)} style={{ padding: "10px 18px", background: "transparent", border: "none", borderBottom: activeAsset === a.id ? `2px solid ${C.gold}` : "2px solid transparent", color: activeAsset === a.id ? C.gold : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.2s" }}>{a.icon} {a.label}</button>
          ))}
          {bundle.artifacts?.briefDocx && <div style={{ padding: "10px 18px", fontSize: 12, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{"\uD83D\uDCC4"} Brief DOCX {"\u2713"}</div>}
        </div>
        {/* Provenance bar */}
        {bundle.triggerSignals && bundle.triggerSignals.length > 0 && (
          <div style={{ padding: "10px 24px", background: "rgba(197,165,90,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "center", overflowX: "auto" }}>
            <span style={{ fontSize: 10, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>Provenance:</span>
            {bundle.triggerSignals.map((s, i) => (
              <span key={i} style={{ fontSize: 10, color: C.dim, padding: "3px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", fontFamily: FONT.mono }}>
                {s.type.replace(/_/g, " ")} {"\u00b7"} s={s.strength} {"\u00b7"} {s.source}
              </span>
            ))}
          </div>
        )}
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {current && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{current.icon} {current.label}</div>
                <CopyButton text={current.content} label={`Copy ${current.label}`} />
              </div>
              <pre style={{ fontFamily: FONT.mono, fontSize: 12, color: C.dim, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, padding: "18px 20px", margin: 0 }}>{current.content}</pre>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10, color: C.textDark }}>{assets.length} assets {"\u00b7"} {bundle.triggerSignals?.length || 0} trigger signals {"\u00b7"} attribution: {bundle.actionId || "none"}</div>
          <CopyButton text={assets.map(a => `--- ${a.label} ---\n${a.content}`).join("\n\n")} label="Copy All" />
        </div>
      </div>
    </div>
  );
}

// ─── ACCOUNT CARD ───

function AccountCard({ p, isExpanded, onToggle, onOutcome, onRun, onOpenBundle }) {
  const [showOutcome, setShowOutcome] = useState(false);
  const actionLabels = { outreach: "Send Outreach", run_brief: "Run Brief", verify_emails: "Verify Emails", outreach_prep: "Prep Outreach" };
  const actionColors = { outreach: C.green, run_brief: C.gold, verify_emails: C.blue, outreach_prep: C.orange };

  return (
    <div style={{ background: isExpanded ? "rgba(197,165,90,0.08)" : C.surface, border: `1px solid ${isExpanded ? "rgba(197,165,90,0.3)" : C.border}`, borderRadius: 10, marginBottom: 8, overflow: "hidden", transition: "all 0.3s ease" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", padding: "14px 20px", cursor: "pointer", gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${p.tier === "hot" ? "255,65,54" : "255,133,27"},0.15)`, color: tierColors[p.tier], fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{p.rank}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{p.company}</span>
            <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>{p.domain}</span>
            {p.brand && <Badge color={p.brand === "TBF" ? "#4a8a2a" : C.dft}>{p.brand}</Badge>}
            {p.briefComplete && <span style={{ fontSize: 10, background: "rgba(46,204,64,0.15)", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>BRIEF {"\u2713"}</span>}
            {p.playbook && <PlaybookBadge playbook={p.playbook} confidence={p.playbookConfidence} />}
          </div>
          <div style={{ fontSize: 12, color: "#777", marginTop: 3 }}>{p.contacts} contacts {"\u00b7"} {p.verified} verified {"\u00b7"} {p.topContact !== "\u2014" ? p.topContact : "No primary contact"}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: p.score >= 50 ? C.red : p.score >= 25 ? C.gold : C.blue, fontFamily: FONT.display }}>{p.score}</div>
          <div style={{ fontSize: 10, color: tierColors[p.tier], textTransform: "uppercase", fontWeight: 700, letterSpacing: 1 }}>{p.tier}</div>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: `${actionColors[p.nextAction]}22`, color: actionColors[p.nextAction], textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>{actionLabels[p.nextAction]}</div>
        <div style={{ color: "#555", fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>{"\u25BE"}</div>
      </div>

      {isExpanded && (
        <div style={{ padding: "0 20px 18px 68px", animation: "fadeIn 0.2s ease" }}>
          {p.whyNowStructured ? <ProvenancePanel signals={p.whyNowStructured} /> : (
            <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7, marginBottom: 12, borderLeft: "2px solid rgba(197,165,90,0.3)", paddingLeft: 14 }}>
              <strong style={{ color: C.gold }}>Why now:</strong> {p.whyNow}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {(p.features || []).map((f, i) => (
              <span key={i} style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: 4, color: "#888", fontFamily: FONT.mono }}>{f}</span>
            ))}
          </div>
          {p.currentSupplier && (
            <div style={{ fontSize: 12, color: C.orange, marginBottom: 12 }}>
              {"\u26A0"} Current supplier: <strong>{p.currentSupplier}</strong>
              {p.currentSupplier === "True Terpenes" && <span style={{ color: C.red }}> — Trustpilot 3.0/5, vulnerability HIGH</span>}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {p.bundleKey && <button onClick={(e) => { e.stopPropagation(); onOpenBundle(p.bundleKey); }} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", background: "rgba(197,165,90,0.18)", color: C.gold, border: `1px solid rgba(197,165,90,0.35)`, textTransform: "uppercase", letterSpacing: 0.5 }}>{"\u26A1"} Open Kill Shot Bundle</button>}
            {p.nextAction === "run_brief" && <button onClick={(e) => { e.stopPropagation(); onRun && onRun("war_room_brief"); }} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", background: "rgba(0,116,217,0.12)", color: C.blue, border: "1px solid rgba(0,116,217,0.25)", textTransform: "uppercase", letterSpacing: 0.5 }}>Run Brief</button>}
            {p.nextAction === "outreach" && !p.bundleKey && <button onClick={(e) => { e.stopPropagation(); onRun && onRun("bundle", p.domain || p.company); }} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer", background: C.goldDim, color: C.gold, border: `1px solid ${C.borderGold}`, textTransform: "uppercase", letterSpacing: 0.5 }}>Generate Bundle</button>}
            {!showOutcome ? (
              <button onClick={(e) => { e.stopPropagation(); setShowOutcome(true); }} style={{ padding: "6px 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "#888", border: "1px solid rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: 0.5 }}>Record Outcome</button>
            ) : (
              ["reply", "meeting", "closed", "no_response"].map(o => (
                <button key={o} onClick={(e) => { e.stopPropagation(); onOutcome(p.actionId, o); setShowOutcome(false); }} style={{
                  padding: "5px 12px", borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: o === "closed" ? "rgba(46,204,64,0.2)" : o === "meeting" ? "rgba(0,116,217,0.2)" : o === "reply" ? "rgba(197,165,90,0.2)" : "rgba(255,255,255,0.05)",
                  color: o === "closed" ? C.green : o === "meeting" ? C.blue : o === "reply" ? C.gold : "#666",
                  border: "1px solid rgba(255,255,255,0.1)", textTransform: "uppercase",
                }}>{o.replace("_", " ")}</button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: DASHBOARD (Overview) ───

function DashboardTab({ uiData, pipeline, competitors, activeBrand }) {
  return (
    <div style={{ padding: 24, overflow: "auto", height: "100%" }}>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Entities" value={uiData.systemStatus?.entitiesTracked ?? 53} sub="companies + contacts" />
        <StatCard label="Signals" value={uiData.systemStatus?.signalsToday ?? 35} sub="last 24h" />
        <StatCard label="Actions" value={uiData.systemStatus?.actionsQueued ?? 12} sub="queued" />
        <StatCard label="Papers" value={uiData.systemStatus?.researchPapers ?? 121} sub="indexed" />
        <StatCard label="Competitors" value={uiData.systemStatus?.competitorsTracked ?? 7} sub="monitored" />
      </div>

      {/* Pipeline Distribution */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 8, fontFamily: FONT.display }}>Pipeline Distribution</div>
        <PipelineBar data={pipeline} />
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{pipeline.total} total contacts across {pipeline.companies} companies</div>
      </div>

      <GoldDivider />

      {/* Coalition */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 12, fontFamily: FONT.display }}>Good Fellows Coalition</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { name: "Mellow Fellow", status: "BUNDLE ARMED", rev: "$25-50M", color: C.green },
            { name: "Urb", status: "WARM INTRO", rev: "$10-25M", color: C.orange },
            { name: "Zombi", status: "WARM INTRO", rev: "$5-15M", color: C.orange },
            { name: "Pushin P's", status: "WARM INTRO", rev: "$5-10M", color: C.orange },
          ].map(c => (
            <div key={c.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</div>
              <Badge color={c.color}>{c.status}</Badge>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Est. revenue: {c.rev}</div>
            </div>
          ))}
        </div>
      </div>

      <GoldDivider />

      {/* Competitor Vulnerability Quick View */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 12, fontFamily: FONT.display }}>Competitor Vulnerability</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {(competitors || []).filter(c => c.risk !== "LOW").map(c => (
            <div key={c.name} style={{ background: c.risk === "HIGH" ? "rgba(255,65,54,0.06)" : C.surface, border: `1px solid ${c.risk === "HIGH" ? "rgba(255,65,54,0.2)" : C.border}`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</span>
                {c.trustpilot && <span style={{ fontSize: 18, fontWeight: 800, color: c.trustpilot < 3.5 ? C.red : C.orange, fontFamily: FONT.display }}>{c.trustpilot}<span style={{ fontSize: 11, color: C.muted }}>/5</span></span>}
              </div>
              <div style={{ fontSize: 11, color: "#777", marginTop: 4 }}>{c.vulnerability}</div>
            </div>
          ))}
        </div>
      </div>

      <GoldDivider />

      {/* CDT Pricing Advantage */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 12, fontFamily: FONT.display }}>CDT Pricing Advantage</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "CDT Premium (Market)", price: "$5,000-8,000/L", note: "Cannabis-derived terpenes", color: C.red },
            { label: "TBF CDT", price: "$1,500-3,000/L", note: "Vertically integrated", color: C.gold },
            { label: "DFT Botanical", price: "$45-80/L", note: "No minimums", color: C.green },
          ].map(p => (
            <div key={p.label} style={{ background: `${p.color}08`, border: `1px solid ${p.color}25`, borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: FONT.display }}>{p.price}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 4 }}>{p.label}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{p.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: AGENTS ───

function AgentsTab() {
  return (
    <div style={{ padding: 24, overflow: "auto", height: "100%" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display, color: C.text }}>Agent Fleet</h2>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>19 scripts {"\u00b7"} 13,400+ lines {"\u00b7"} autonomous intelligence pipeline</p>
      <div style={{ display: "grid", gap: 8 }}>
        {DEMO_AGENTS.map(a => {
          const statusColors = { active: C.green, ready: C.gold, deployed: C.blue, standby: C.muted };
          return (
            <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[a.status] || C.muted, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{a.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{a.desc}</div>
              </div>
              <Badge color={statusColors[a.status]}>{a.status}</Badge>
              <div style={{ fontSize: 10, color: C.textDark, fontFamily: FONT.mono }}>{a.file} {a.lines > 0 ? `(${a.lines}L)` : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════

function NexusDashboard() {
  const [booted, setBooted] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeBrand, setActiveBrand] = useState("ALL");
  const [data, setData] = useState(null);
  const [dataError, setDataError] = useState("");
  const [expandedCard, setExpandedCard] = useState(0);
  const [outcomes, setOutcomes] = useState({});
  const [jobs, setJobs] = useState([]);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeBundleKey, setActiveBundleKey] = useState(null);

  // Boot sequence
  useEffect(() => {
    let i = 0; let cleared = false;
    const timer = setInterval(() => {
      if (cleared) return;
      if (i < BOOT_LINES.length) { const line = BOOT_LINES[i]; i++; if (line) setBootLines(prev => [...prev, line]); }
      else { cleared = true; clearInterval(timer); setTimeout(() => setBooted(true), 500); }
    }, 180);
    return () => { cleared = true; clearInterval(timer); };
  }, []);

  const showToast = useCallback((kind, message) => {
    setToast({ kind, message, ts: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch + merge live data
  const refreshSnapshot = useCallback(async () => {
    try {
      setDataError("");
      const payload = await jfetch(API.snapshot);
      if (payload) {
        const merged = { ...DEMO_DATA };
        if (payload.priorities?.length > 0) merged.priorities = payload.priorities;
        if (payload.competitors?.length > 0) merged.competitors = payload.competitors;
        if (payload.redditSignals?.length > 0) merged.redditSignals = payload.redditSignals;
        if (payload.researchHighlights?.length > 0) merged.researchHighlights = payload.researchHighlights;
        if (payload.synthesisInsights) merged.synthesisInsights = payload.synthesisInsights;
        if (payload.researchTrends) merged.researchTrends = payload.researchTrends;
        if (payload.regulatoryHits) merged.regulatoryHits = payload.regulatoryHits;
        if (payload.businessInsights) merged.businessInsights = payload.businessInsights;
        if (payload.systemStatus) merged.systemStatus = { ...merged.systemStatus, ...payload.systemStatus };
        if (payload.learning && Object.keys(payload.learning.signalWeights || {}).length > 0) merged.learning = payload.learning;
        setData(merged);
      } else { setData(DEMO_DATA); }
    } catch { setData(DEMO_DATA); setDataError("Live snapshot unavailable \u2014 using demo data"); }
  }, []);

  useEffect(() => { if (booted) refreshSnapshot(); }, [booted, refreshSnapshot]);

  const pollJob = useCallback(async (job_id) => {
    for (let i = 0; i < 120; i++) {
      await new Promise(r => setTimeout(r, 1000));
      try {
        const payload = await jfetch(`${API.job}?job_id=${encodeURIComponent(job_id)}`);
        setJobs(prev => { const next = prev.slice(); const idx = next.findIndex(j => j.job_id === job_id); if (idx >= 0) next[idx] = payload; else next.unshift(payload); return next.slice(0, 12); });
        if (payload.status && payload.status !== "running") { await refreshSnapshot(); return payload; }
      } catch { /* transient */ }
    }
    return null;
  }, [refreshSnapshot]);

  const runAgent = useCallback(async (command, company = "") => {
    try {
      showToast("info", `Queued: ${command}${company ? ` (${company})` : ""}`);
      const resp = await jfetch(API.run, { method: "POST", body: JSON.stringify({ command, company }) });
      const job_id = resp.job_id;
      setJobDrawerOpen(true);
      setJobs(prev => [{ job_id, run_key: command, status: "running", started_at: new Date().toISOString() }, ...prev].slice(0, 12));
      const final = await pollJob(job_id);
      if (final && final.status === "succeeded") showToast("success", `Completed: ${command}`);
      if (final && final.status === "failed") showToast("error", `Failed: ${command}`);
    } catch (e) { showToast("error", String(e.message || e)); }
  }, [pollJob, showToast]);

  const handleOutcome = useCallback(async (actionId, outcome) => {
    setOutcomes(prev => ({ ...prev, [actionId]: outcome }));
    try {
      await jfetch(API.outcome, { method: "POST", body: JSON.stringify({ action_id: actionId, outcome, notes: "" }) });
      showToast("success", `Outcome saved: ${outcome.toUpperCase()}`);
      await refreshSnapshot();
    } catch (e) { showToast("error", `Outcome not persisted (demo mode): ${String(e.message || e)}`); }
  }, [refreshSnapshot, showToast]);

  // Derived data
  const uiData = useMemo(() => data || DEMO_DATA, [data]);

  const priorities = useMemo(() => {
    const all = uiData.priorities || [];
    if (activeBrand === "ALL") return all;
    return all.filter(p => p.brand === activeBrand);
  }, [uiData, activeBrand]);

  const competitors = useMemo(() => uiData.competitors || DEMO_DATA.competitors, [uiData]);

  const pipeline = useMemo(() => {
    const hot = priorities.filter(c => c.tier === "hot").length;
    const warm = priorities.filter(c => c.tier === "warm").length;
    const cool = priorities.filter(c => c.tier === "cool").length;
    const cold = priorities.filter(c => c.tier === "cold").length;
    return { total: priorities.reduce((s, p) => s + (p.contacts || 0), 0), hot, warm, cool, cold, companies: priorities.length, verified: priorities.reduce((s, p) => s + (p.verified || 0), 0) };
  }, [priorities]);

  const weightRows = useMemo(() => {
    const live = uiData.learning && uiData.learning.signalWeights;
    if (live && !Array.isArray(live) && typeof live === "object") {
      return Object.entries(live).map(([k, v]) => ({ signal: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), weight: Number(v) || 0 })).sort((a, b) => b.weight - a.weight).slice(0, 12);
    }
    return (uiData.signalWeights || []).slice(0, 12);
  }, [uiData]);

  const activeBundle = activeBundleKey ? DEMO_BUNDLES[activeBundleKey] : null;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: "\u25C9" },
    { id: "priorities", label: "Priorities", icon: "\u25C9" },
    { id: "competitors", label: "Competitors", icon: "\u2694" },
    { id: "signals", label: "Signals", icon: "\u25C8" },
    { id: "research", label: "Research", icon: "\u25CE" },
    { id: "learning", label: "Learning", icon: "\u25B3" },
    { id: "agents", label: "Agents", icon: "\u2699" },
  ];

  // ── Boot Screen ──
  if (!booted) {
    return (
      <div style={{ background: C.void, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT.mono, padding: 24 }}>
        <div style={{ fontSize: 36, fontWeight: 800, background: `linear-gradient(135deg, ${C.gold}, #e8c55a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, letterSpacing: 6 }}>NEXUS</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 32, letterSpacing: 2 }}>BDR INTELLIGENCE SYSTEM</div>
        <div style={{ maxWidth: 640, width: "100%" }}>
          {bootLines.filter(Boolean).map((line, i) => (
            <div key={i} style={{ color: line.color, fontSize: 13, padding: "3px 0", opacity: 0, animation: "fadeIn 0.3s forwards", animationDelay: `${i * 0.05}s` }}>
              <span style={{ color: C.muted, marginRight: 8 }}>[{String(i).padStart(2, "0")}]</span>{line.text}
            </div>
          ))}
        </div>
        <style>{`@keyframes fadeIn { to { opacity: 1 } }`}</style>
      </div>
    );
  }

  // ── Main Interface ──
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FONT.body, color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Bundle Viewer Modal */}
      {activeBundle && <BundleViewer bundle={activeBundle} onClose={() => setActiveBundleKey(null)} />}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 14, right: 14, zIndex: 50, padding: "10px 14px", borderRadius: 10,
          background: toast.kind === "success" ? "rgba(46,204,64,0.15)" : toast.kind === "error" ? "rgba(155,60,60,0.20)" : C.goldDim,
          border: "1px solid rgba(255,255,255,0.10)", color: C.text, fontSize: 12, maxWidth: 360 }}>
          <div style={{ fontWeight: 800, marginBottom: 2, color: toast.kind === "success" ? C.green : toast.kind === "error" ? "#E07171" : C.gold }}>
            {toast.kind === "success" ? "Success" : toast.kind === "error" ? "Error" : "Info"}
          </div>
          <div style={{ color: "#BBB" }}>{toast.message}</div>
        </div>
      )}

      {/* Job Drawer */}
      {jobDrawerOpen && (
        <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: 420, background: "rgba(10,10,10,0.98)", borderLeft: `1px solid ${C.borderGold}`, zIndex: 40, padding: 16, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: C.gold }}>Jobs</div>
            <button onClick={() => setJobDrawerOpen(false)} style={{ background: "transparent", border: "none", color: "#AAA", cursor: "pointer" }}>{"\u2715"}</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={() => runAgent("war_room_brief")} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.borderGold}`, background: C.goldBg, color: C.gold, cursor: "pointer", fontSize: 11, fontWeight: 800 }}>Run War Room Brief</button>
            <button onClick={() => runAgent("daily")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: "#AAA", cursor: "pointer", fontSize: 11, fontWeight: 800 }}>Run Daily</button>
          </div>
          {jobs.length === 0 ? <div style={{ color: C.muted, fontSize: 12 }}>No jobs yet.</div> : jobs.map(j => (
            <div key={j.job_id} style={{ padding: 10, marginBottom: 10, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{j.run_key || "job"}</div>
                <div style={{ fontSize: 11, color: j.status === "succeeded" ? C.green : j.status === "failed" ? "#E07171" : C.gold }}>{j.status || "running"}</div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4, fontFamily: FONT.mono }}>{j.job_id}</div>
              {j.log_tail && <pre style={{ marginTop: 8, padding: 10, borderRadius: 8, background: "rgba(0,0,0,0.35)", color: C.dim, fontSize: 10, whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>{j.log_tail}</pre>}
            </div>
          ))}
        </div>
      )}

      {/* Ticker */}
      <div style={{ background: C.void, borderBottom: `1px solid ${C.border}`, overflow: "hidden", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 48, whiteSpace: "nowrap", animation: "ticker 60s linear infinite", paddingLeft: "100%" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((text, i) => (
            <span key={i} style={{ fontSize: 11, fontFamily: FONT.mono }}>
              <span style={{ color: C.gold, marginRight: 6 }}>{"\u25CF"}</span>
              <span style={{ color: C.muted }}>{text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${C.borderGold}`, background: C.void }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 22, fontWeight: 800, background: `linear-gradient(135deg, ${BRANDS[activeBrand].accent}, ${activeBrand === "ALL" ? "#e8c55a" : BRANDS[activeBrand].color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 4, fontFamily: FONT.display }}>{activeBrand === "ALL" ? "NEXUS" : BRANDS[activeBrand].label}</span>
          <span style={{ color: C.muted, fontSize: 12, letterSpacing: 1 }}>{activeBrand === "ALL" ? "BDR Intelligence System v6.0" : BRANDS[activeBrand].sublabel}</span>
          {data && <Badge color={C.green}>LIVE</Badge>}
          {!data && <Badge color={C.orange}>DEMO</Badge>}
          {dataError && <span style={{ fontSize: 10, color: C.red }}>{dataError}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => refreshSnapshot()} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${C.borderGold}`, background: C.goldBg, color: C.gold, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: FONT.mono }}>Refresh</button>
          <button onClick={() => setJobDrawerOpen(true)} style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)", color: C.dim, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: FONT.mono }}>Jobs ({jobs.length})</button>
        </div>
      </div>

      {/* Brand Selector + Tab Navigation */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 24px", borderBottom: `1px solid ${C.border}`, background: "rgba(0,0,0,0.3)" }}>
        {/* Brand pills */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginRight: 20, padding: "8px 0" }}>
          <span style={{ color: C.muted, fontSize: 10, fontFamily: FONT.mono, marginRight: 6, letterSpacing: 1 }}>BRAND:</span>
          {Object.entries(BRANDS).map(([key, b]) => (
            <button key={key} onClick={() => setActiveBrand(key)} style={{
              background: activeBrand === key ? (b.accent || b.color) : "transparent",
              color: activeBrand === key ? "#fff" : C.muted,
              border: `1px solid ${activeBrand === key ? (b.accent || b.color) : C.border}`,
              padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 700,
              cursor: "pointer", fontFamily: FONT.mono, letterSpacing: 1, transition: "all 0.2s"
            }}>{b.label}</button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: C.border, marginRight: 12 }} />
        {/* Tab navigation */}
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "12px 20px", background: "transparent", border: "none",
            borderBottom: activeTab === t.id ? `2px solid ${C.gold}` : "2px solid transparent",
            color: activeTab === t.id ? C.gold : C.muted, cursor: "pointer",
            fontSize: 12, fontWeight: 600, transition: "all 0.2s", letterSpacing: 0.5,
          }}><span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ height: "calc(100vh - 120px)", overflow: "hidden" }}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && <DashboardTab uiData={uiData} pipeline={pipeline} competitors={competitors} activeBrand={activeBrand} />}

        {/* PRIORITIES TAB */}
        {activeTab === "priorities" && (
          <div style={{ padding: "24px 40px 60px", overflow: "auto", height: "100%", maxWidth: 1100 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text, fontFamily: FONT.display }}>Priority Accounts</h2>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>Ranked by composite intelligence: pipeline score x signals x source reliability + competitor vulnerability + recency</p>
              </div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: "right" }}>
                {priorities.filter(p => p.briefComplete).length}/{priorities.length} briefed {"\u00b7"} {priorities.filter(p => p.bundleKey).length} bundles ready
              </div>
            </div>
            {priorities.map((p, i) => (
              <AccountCard key={i} p={p} isExpanded={expandedCard === i} onToggle={() => setExpandedCard(expandedCard === i ? -1 : i)}
                onOutcome={handleOutcome} onRun={runAgent} onOpenBundle={(key) => setActiveBundleKey(key)} />
            ))}
            {Object.keys(outcomes).length > 0 && (
              <div style={{ marginTop: 20, padding: 16, background: "rgba(46,204,64,0.08)", border: "1px solid rgba(46,204,64,0.2)", borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>Outcomes Recorded</div>
                {Object.entries(outcomes).map(([id, outcome]) => {
                  const pr = priorities.find(p => p.actionId === id);
                  return (
                    <div key={id} style={{ fontSize: 12, color: C.dim, marginBottom: 4 }}>
                      {pr?.company}: <strong style={{ color: outcome === "closed" ? C.green : outcome === "meeting" ? C.blue : C.gold }}>{outcome.toUpperCase()}</strong>
                      <span style={{ color: C.muted, marginLeft: 8 }}>{"\u2192"} Signal weights adjusting</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* COMPETITORS TAB */}
        {activeTab === "competitors" && (
          <div style={{ padding: "24px 40px 60px", overflow: "auto", height: "100%", maxWidth: 1100 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display }}>Competitor Vulnerability Map</h2>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>7 competitors tracked via Trustpilot, hiring signals, news, and Reddit complaints</p>
            {(competitors || []).map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 20px", marginBottom: 6, background: c.risk === "HIGH" ? "rgba(255,65,54,0.06)" : C.surface, border: `1px solid ${c.risk === "HIGH" ? "rgba(255,65,54,0.2)" : C.border}`, borderRadius: 8, gap: 16 }}>
                <div style={{ width: 110, flexShrink: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</div></div>
                <div style={{ width: 70, textAlign: "center", flexShrink: 0 }}>
                  {c.trustpilot ? <div style={{ fontSize: 18, fontWeight: 800, color: c.trustpilot < 3.5 ? C.red : c.trustpilot < 4.0 ? C.orange : C.green, fontFamily: FONT.display }}>{c.trustpilot}<span style={{ fontSize: 11, color: C.muted }}>/5</span></div> : <div style={{ fontSize: 11, color: C.textDark }}>No data</div>}
                </div>
                <div style={{ padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 800, background: `${riskColors[c.risk]}22`, color: riskColors[c.risk], textTransform: "uppercase", letterSpacing: 1, flexShrink: 0 }}>{c.risk}</div>
                <div style={{ fontSize: 12, color: "#777", flex: 1 }}>{c.vulnerability}</div>
                {c.hiring && <div style={{ fontSize: 10, background: "rgba(0,116,217,0.15)", color: C.blue, padding: "3px 10px", borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>HIRING</div>}
              </div>
            ))}
            <GoldDivider />
            <div style={{ fontSize: 12, color: C.muted }}>
              <strong style={{ color: C.gold }}>Displacement strategy:</strong> True Terpenes customers are the primary target. Lead with quality consistency, batch-to-batch reliability, and CDT pricing advantage. Peak Supply Co customers are secondary {"\u2014"} lead with Trustpilot comparison and COA transparency.
            </div>
          </div>
        )}

        {/* SIGNALS TAB */}
        {activeTab === "signals" && (
          <div style={{ padding: "24px 40px 60px", overflow: "auto", height: "100%", maxWidth: 1100 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display }}>Active Signals</h2>
            <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Reddit Intelligence</h3>
            {(uiData.redditSignals || []).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", marginBottom: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 3, background: s.type.includes("SUPPLIER") ? "rgba(255,65,54,0.15)" : "rgba(255,255,255,0.05)", color: s.type.includes("SUPPLIER") ? C.red : C.muted, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.type}</span>
                <span style={{ fontSize: 11, color: "#888", flexShrink: 0 }}>r/{s.subreddit}</span>
                <span style={{ fontSize: 12, color: C.dim, flex: 1 }}>{s.title}</span>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono, flexShrink: 0 }}>s={s.score}</span>
              </div>
            ))}
            <GoldDivider />
            <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Competitor Signals</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(competitors || []).filter(c => c.trustpilot && c.trustpilot < 4.0).map((c, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,65,54,0.05)", border: "1px solid rgba(255,65,54,0.15)", borderRadius: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{c.name} {"\u2014"} Trustpilot {c.trustpilot}/5</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Active vulnerability. Look for their customers in pipeline.</div>
                </div>
              ))}
              {(competitors || []).filter(c => c.hiring).map((c, i) => (
                <div key={`h${i}`} style={{ padding: "12px 16px", background: "rgba(0,116,217,0.05)", border: "1px solid rgba(0,116,217,0.15)", borderRadius: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.blue }}>{c.name} {"\u2014"} Hiring Activity</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>May indicate growth, churn backfill, or strategy shift.</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESEARCH TAB */}
        {activeTab === "research" && (
          <div style={{ padding: "24px 40px 60px", overflow: "auto", height: "100%", maxWidth: 1100 }}>

            {/* This Week's Bets */}
            {(uiData.businessInsights || []).filter(b => b.type === "weekly_bet").length > 0 && (<>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display }}>This Week's Bets</h2>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Evidence-backed commercial opportunities {"\u00b7"} compliance-safe framing {"\u00b7"} citation-backed</p>
              {(uiData.businessInsights || []).filter(b => b.type === "weekly_bet").slice(0, 4).map((bet, i) => (
                <div key={"bet"+i} style={{ padding: "16px 20px", marginBottom: 10, background: "linear-gradient(135deg, rgba(197,165,90,0.08), rgba(197,165,90,0.02))", border: "1px solid rgba(197,165,90,0.25)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10, background: C.goldDim, color: C.gold, padding: "2px 10px", borderRadius: 4, fontWeight: 700 }}>{bet.terpene}</span>
                        <span style={{ fontSize: 10, color: C.dim }}>{bet.category}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.5, marginBottom: 6 }}>{bet.safe_framing}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                        <div><strong style={{ color: C.gold }}>Product angle:</strong> {bet.product_angle}</div>
                        <div><strong style={{ color: C.gold }}>Sales angle:</strong> {bet.sales_angle}</div>
                        <div style={{ marginTop: 4, fontSize: 10, color: C.dim }}>{bet.why_we_can_say_it}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: bet.confidence >= 5 ? C.green : bet.confidence >= 3 ? C.gold : C.dim, fontFamily: FONT.display, flexShrink: 0 }}>{bet.confidence}<span style={{ fontSize: 10, color: C.dim }}>/6</span></div>
                  </div>
                  {(bet.citations || []).length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {bet.citations.map((url, j) => (<a key={j} href={url} target="_blank" rel="noopener" style={{ fontSize: 9, color: C.blue, textDecoration: "none" }}>PubMed [{j+1}]</a>))}
                    </div>
                  )}
                </div>
              ))}
              <GoldDivider />
            </>)}

            {/* Research Convergences */}
            {(uiData.synthesisInsights || []).length > 0 && (<>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display }}>Research Convergences</h2>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Cross-paper synthesis {"\u2014"} where multiple studies converge on the same terpene {"\u00d7"} effect {"\u00d7"} mechanism triple</p>
              {(uiData.synthesisInsights || []).slice(0, 6).map((ins, i) => {
                const confColor = ins.confidence_1to6 >= 5 ? C.green : ins.confidence_1to6 >= 3 ? C.gold : C.dim;
                return (
                  <div key={i} style={{ padding: "14px 18px", marginBottom: 8, background: C.surface, border: `1px solid ${ins.contradiction ? "rgba(255,65,54,0.3)" : C.border}`, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{ins.statement}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: 10, background: C.goldDim, color: C.gold, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{ins.terpene}</span>
                          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", color: C.dim, padding: "2px 8px", borderRadius: 4 }}>{(ins.effect_category || "").replace(/_/g, " ")}</span>
                          {ins.mechanism && ins.mechanism !== "unknown_mechanism" && <span style={{ fontSize: 10, background: "rgba(0,116,217,0.15)", color: C.blue, padding: "2px 8px", borderRadius: 4 }}>{(ins.mechanism || "").replace(/_/g, " ")}</span>}
                          {ins.contradiction && <span style={{ fontSize: 10, background: "rgba(255,65,54,0.15)", color: C.red, padding: "2px 8px", borderRadius: 4 }}>{"\u26A0"} mixed outcomes</span>}
                        </div>
                        {(ins.implications || []).length > 0 && (
                          <div style={{ fontSize: 11, color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
                            {ins.implications.map((imp, j) => <div key={j}>{"\u2192"} {imp}</div>)}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: confColor, fontFamily: FONT.display }}>{ins.confidence_1to6}<span style={{ fontSize: 10, color: C.dim }}>/6</span></div>
                        <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>{ins.paper_count} papers {"\u00b7"} {ins.human_count} human</div>
                        <div style={{ fontSize: 9, color: C.dim }}>{ins.positive}{"\u2191"} {ins.negative}{"\u2193"} {ins.neutral}{"\u2014"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <GoldDivider />
            </>)}

            {/* Trend Velocity */}
            {uiData.researchTrends && !uiData.researchTrends.error && (<>
              <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Trend Velocity (90-day)</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {Object.entries(uiData.researchTrends.terpene_velocity_top || {}).slice(0, 8).map(([terp, v]) => (
                  <div key={terp} style={{ padding: "8px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, minWidth: 120 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{terp}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT.display, color: v.velocity > 0.2 ? C.green : v.velocity < -0.2 ? C.red : C.dim }}>{v.velocity > 0 ? "+" : ""}{v.velocity}</div>
                    <div style={{ fontSize: 9, color: C.dim }}>{v.recent_count} recent {"\u00b7"} {v.trend}</div>
                  </div>
                ))}
              </div>
              <GoldDivider />
            </>)}

            {/* Top Papers */}
            <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Top Papers by Relevance</h3>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{uiData.systemStatus?.researchPapers || (uiData.researchHighlights || []).length} papers indexed {"\u00b7"} evidence-graded {"\u00b7"} ranked by commercial relevance</p>
            {(uiData.researchHighlights || []).slice(0, 10).map((r, i) => {
              const _gc = {"A": C.green, "B": C.gold, "C": C.blue, "D": C.dim};
              const _gl = {"A": "Human/RCT", "B": "Cohort", "C": "Animal/In-vitro", "D": "Review"};
              const gradeColor = _gc[r.evidenceGrade] || C.dim;
              const gradeLabel = _gl[r.evidenceGrade] || r.studyType || "";
              return (
                <div key={i} style={{ padding: "14px 18px", marginBottom: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, cursor: r.url ? "pointer" : "default" }} onClick={() => r.url && window.open(r.url, "_blank")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{r.journal} {"\u00b7"} {r.year}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: r.score >= 80 ? C.red : r.score >= 60 ? C.gold : C.blue, fontFamily: FONT.display }}>{r.score}</div>
                      {r.evidenceGrade && <div style={{ fontSize: 9, padding: "1px 6px", background: gradeColor + "22", color: gradeColor, borderRadius: 3, fontWeight: 700, marginTop: 2 }}>{r.evidenceGrade} {"\u00b7"} {gradeLabel}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                    {(r.terpenes || []).map((t, j) => (<span key={j} style={{ fontSize: 10, background: C.goldDim, color: C.gold, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{t}</span>))}
                  </div>
                </div>
              );
            })}

            {/* Regulatory Radar */}
            {(uiData.regulatoryHits || []).length > 0 && (<>
              <GoldDivider />
              <h3 style={{ fontSize: 14, color: C.red, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Regulatory Radar</h3>
              {(uiData.regulatoryHits || []).slice(0, 5).map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: C.muted, marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${C.red}` }}>
                  <span style={{ color: C.text, fontWeight: 600 }}>{h.title}</span>
                  <span style={{ color: C.dim }}> {"\u00b7"} {(h.topics || []).join(", ")}</span>
                </div>
              ))}
            </>)}

            <GoldDivider />
            <div style={{ fontSize: 12, color: C.muted }}>
              <strong style={{ color: C.gold }}>Engine:</strong> 10 subagents {"\u00b7"} evidence grading (A-D) {"\u00b7"} synthesis convergence {"\u00b7"} trend velocity {"\u00b7"} effect profiling {"\u00b7"} gap analysis {"\u00b7"} regulatory radar
            </div>
          </div>
        )}

        {/* LEARNING TAB */}
        {activeTab === "learning" && (
          <div style={{ padding: "24px 40px 60px", overflow: "auto", height: "100%", maxWidth: 1100 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, fontFamily: FONT.display }}>Learning Engine</h2>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Signal weights adjust automatically based on outcomes. Positive outcomes boost the signals that triggered the recommendation.</p>

            <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Signal Weights (Current)</h3>
            <div style={{ marginBottom: 24 }}>
              {weightRows.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 200, fontSize: 12, color: C.dim, textAlign: "right", flexShrink: 0 }}>{s.signal}</div>
                  <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, (s.weight / 25) * 100)}%`, height: "100%", background: `linear-gradient(90deg, rgba(197,165,90,0.4), rgba(197,165,90,0.8))`, borderRadius: 4, transition: "width 0.5s ease" }} />
                  </div>
                  <div style={{ width: 36, fontSize: 12, color: C.gold, fontWeight: 700, fontFamily: FONT.mono, textAlign: "right", flexShrink: 0 }}>{s.weight}</div>
                </div>
              ))}
            </div>

            <GoldDivider />

            <h3 style={{ fontSize: 14, color: C.gold, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>How It Works</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                { step: "1", title: "Signals Collected", desc: "Reddit, Trustpilot, PubMed, news, competitor websites \u2014 all fed into the knowledge graph daily" },
                { step: "2", title: "Actions Recommended", desc: "Decision engine cross-pollinates intelligence and ranks companies. Each action links to its trigger signals." },
                { step: "3", title: "Outcomes Recorded", desc: "When you get a reply, meeting, or close \u2014 record it. Signal weights adjust: winners get amplified, losers get dampened." },
              ].map((s, i) => (
                <div key={i} style={{ padding: "16px", background: "rgba(197,165,90,0.05)", border: `1px solid ${C.goldDim}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: C.gold, fontFamily: FONT.display, marginBottom: 8 }}>{s.step}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: "#777", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {Object.keys(outcomes).length > 0 && (
              <>
                <GoldDivider />
                <div style={{ padding: 16, background: "rgba(46,204,64,0.06)", border: "1px solid rgba(46,204,64,0.15)", borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>Live Weight Updates</div>
                  <div style={{ fontSize: 12, color: C.dim }}>
                    {Object.keys(outcomes).length} outcomes recorded this session. Signal weights are recalculating.
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === "agents" && <AgentsTab />}

      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 40px", background: "linear-gradient(transparent, #0A0A0A 40%)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "#333", pointerEvents: "none" }}>
        <span>NEXUS BDR v6 {"\u2014"} 19 scripts {"\u00b7"} 13,400+ lines {"\u00b7"} Kill Shot Bundle + 5 Playbooks</span>
        <span>War Room v2 {"\u2014"} Source reliability {"\u00b7"} Learning attribution {"\u00b7"} Playbook engine</span>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ticker { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(197,165,90,0.3); border-radius: 3px; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </div>
  );
}
