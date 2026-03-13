# NEXUS BDR — Agentic Sales Intelligence System
### Built for Terpene Belt Farms / Duty Free Terpenes

**19 scripts | 13,400+ lines | 15 agents | 30+ integrations | Zero idle data**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      WAR ROOM (war_room.py)                  │
│              Central nervous system — all agents              │
│              feed in, prioritized actions flow out            │
│                                                              │
│  Knowledge Graph → Decision Engine → Learning Engine          │
│  53+ entities     Daily priorities   Outcome tracking         │
│  35+ signals      Cross-pollination  Weight adjustment        │
│  40+ connections  Reddit + Research  Pattern recognition      │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
   INTELLIGENCE    PIPELINE       OUTPUT       INTEGRATION HUB
        │              │              │              │
   Brief Engine    Apollo Import   HeyGen Scripts  Clearbit Enrich
   Competitor Vuln CSV → Score     GHL Workflows   Email Chain (4x)
   Terpene Research Hunter Verify  Daily Briefings Instantly/lemlist
   Reddit Intel    CRM Sync       Word Docs       Firecrawl Research
   Trigger Monitor                 Reports         Apify Scraping
   Free Intel                                      Slack/Telegram/Discord
                                                   Stripe Revenue
                                                   Klaviyo Marketing
                                                   Calendly Scheduling
                                                   HuggingFace ML
                                                   Google Maps Discovery
                                                   Pinecone Vector DB
```

### Integration Hub (integration_hub.py — 30+ services)

```
TIER 1: REVENUE IMPACT          TIER 2: INTELLIGENCE         TIER 3: COMMUNICATION
─────────────────────           ────────────────────         ─────────────────────
Clearbit (firmographics)         Firecrawl (AI web crawl)     Slack (team alerts)
Hunter → Findymail → ZeroBounce Apify (LinkedIn/Maps/IG)     Telegram (mobile alerts)
  → Tomba (email chain)         SimilarWeb (traffic data)    Discord (community)
Instantly (cold email)           Ahrefs (SEO intel)           Twilio (SMS/Voice)
lemlist (multi-channel)          Pinecone (vector search)     SendGrid (email delivery)
Calendly (scheduling)            Google Sheets (export)
HubSpot + GHL (dual CRM)

TIER 4: ANALYTICS               TIER 5: AI ENHANCEMENT       TIER 6: DATA ENRICHMENT
─────────────────               ──────────────────────       ───────────────────────
Stripe (revenue tracking)       HuggingFace (sentiment/NLI)  Lusha (contact data)
Klaviyo (marketing auto)        Deepgram (call transcription) ContactOut (LinkedIn)
PostHog (product analytics)     Leonardo AI (image gen)       Tomba (email finder)
Metabase (BI dashboards)        Replicate (ML models)         LinkupAPI (LinkedIn data)
                                                              Google Maps (Places API)
```

---

## Quick Start

```bash
cd ~/.openclaw/skills/nexus-bdr-agent

# Set API keys
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENROUTER_API_KEY="sk-or-v1-..."
export HUNTER_API_KEY="..."         # optional
export GHL_API_KEY="..."            # optional
export HEYGEN_API_KEY="..."         # optional

# Run the full morning briefing (ingests all data → generates priorities)
python3 scripts/war_room.py brief

# Or run individual agents:
python3 scripts/nexus.py status
```

---

## File Reference

### CORE SYSTEM (4 files)
| File | Lines | Description |
|------|-------|-------------|
| `war_room.py` | 1,167 | Central nervous system. Knowledge graph + decision engine + learning |
| `nexus.py` | 643 | Master CLI orchestrator. Single entry point for all commands |
| `model_router.py` | 401 | Anthropic ↔ OpenRouter cost optimization. Saves ~40-60% per brief |
| `integration_hub.py` | 1,202 | Master integration orchestrator. 30+ services across 6 tiers. Clearbit, Hunter chain, Instantly, Firecrawl, Apify, Slack, Stripe, Klaviyo, Pinecone, HuggingFace, and more |

### INTELLIGENCE AGENTS (6 files)
| File | Lines | Description |
|------|-------|-------------|
| `sales_intel_brief_v4.py` | 506 | 6-phase deep research brief. Phases 1-4 Anthropic+search, Phase 5 DeepSeek, Phase 6 Anthropic no-search. ~$0.40-0.60/brief |
| `brief_to_docx.py` | 347 | Converts any brief JSON → polished Word document |
| `free_intel_sources.py` | 516 | Zero-cost intelligence: Reddit (14 subs), FDA, SEC EDGAR, Google News, competitor websites |
| `competitor_vuln_v2.py` | 748 | Category-based competitor intelligence. Searches for complaints, switching behavior, pricing discussions. 7 competitors tracked |
| `terpene_research.py` | 869 | PubMed harvester, ClinicalTrials.gov, patent monitor. Builds cumulative knowledge base. Generates weekly digest + terpene×effect matrix + sales talking points |
| `social_intel_engine_v2.py` | 1,257 | Deep Reddit intelligence with intent classification and community mapping |

### OPERATIONAL AGENTS (3 files)
| File | Lines | Description |
|------|-------|-------------|
| `trigger_monitor.py` | 650 | Daily buying signal detection across watchlist companies |
| `customer_intel.py` | 629 | Post-onboarding revenue engine: churn prediction, upsell, reactivation |
| `heygen_scripts.py` | 391 | Personalized video outreach script generation from brief data |

### PIPELINE TOOLS (4 files)
| File | Lines | Description |
|------|-------|-------------|
| `apollo_pipeline.py` | 1,056 | Lead discovery → scoring → CRM pipeline |
| `csv_importer_v2.py` | 463 | Apollo CSV → normalized → Nexus-scored contacts |
| `enrich_pipeline_v2.py` | 727 | Hunter.io email verification + data enrichment |
| `ghl_sync_v2.py` | 656 | GoHighLevel CRM sync. 53-field architecture + workflow automation |

### UI / DASHBOARDS (2 files)
| File | Lines | Description |
|------|-------|-------------|
| `nexus_v5.jsx` | 502 | React Command Center artifact. 4 views, chat interface, pipeline viz |
| `command_center.py` | 953 | Local Python HTTP server dashboard at localhost:3141 |

---

## Command Reference

### War Room (the main system)
```bash
python3 scripts/war_room.py brief       # Full morning briefing (ingest + decide)
python3 scripts/war_room.py ingest      # Pull data from all agents
python3 scripts/war_room.py decide      # Generate priority actions
python3 scripts/war_room.py status      # Knowledge graph stats
python3 scripts/war_room.py learn       # Show learning engine
python3 scripts/war_room.py connect     # Cross-agent intelligence map
python3 scripts/war_room.py learn --action-id <id> --outcome reply  # Record outcome
```

### Nexus Master Orchestrator
```bash
python3 scripts/nexus.py status         # System health check
python3 scripts/nexus.py pipeline       # Pipeline overview
python3 scripts/nexus.py sweep          # Free intel sweep
python3 scripts/nexus.py brief "Company" --domain example.com  # Run brief
python3 scripts/nexus.py daily          # Full daily run
python3 scripts/nexus.py costs          # API spend tracker
```

### Intelligence
```bash
# Sales briefs (~$0.50 each with OpenRouter)
python3 scripts/sales_intel_brief_v4.py --company "Mellow Fellow" --domain mellowfellow.fun --state FL
python3 scripts/sales_intel_brief_v4.py --batch outputs/scored_apollo_*.json --top 5

# Brief → Word doc
python3 scripts/brief_to_docx.py --brief outputs/briefs/brief_*.json
python3 scripts/brief_to_docx.py --all

# Free intel (zero cost)
python3 scripts/free_intel_sources.py --all --days 14
python3 scripts/free_intel_sources.py --reddit --days 7

# Competitor scan (zero cost)
python3 scripts/competitor_vuln_v2.py --scan --days 30

# Terpene research (zero cost)
python3 scripts/terpene_research.py --full --days 90
python3 scripts/terpene_research.py --digest
python3 scripts/terpene_research.py --matrix
python3 scripts/terpene_research.py --talking-points
python3 scripts/terpene_research.py --stats

# Social intel
python3 scripts/social_intel_engine_v2.py --target "company" --days 14
```

### Pipeline
```bash
python3 scripts/csv_importer_v2.py --input data.csv --score
python3 scripts/enrich_pipeline_v2.py --input scored.json --verify
python3 scripts/ghl_sync_v2.py --input enriched.json --push
```

### Integration Hub (30+ services)
```bash
# Status — see which integrations are active
python3 scripts/integration_hub.py status
python3 scripts/nexus.py hub status

# Deep enrichment (Clearbit + email chain + Firecrawl + competitive)
python3 scripts/integration_hub.py enrich mellowfellow.fun
python3 scripts/nexus.py hub enrich --domain mellowfellow.fun

# Email verification chain (Hunter → Findymail → ZeroBounce → Tomba)
python3 scripts/integration_hub.py verify john@example.com

# Website research (Firecrawl AI crawl)
python3 scripts/integration_hub.py research mellowfellow.fun

# Competitive intelligence scan
python3 scripts/integration_hub.py competitive trueterpenes.com,abstractat.com

# Google Maps lead discovery
python3 scripts/integration_hub.py gmaps "cannabis extraction company California"

# Broadcast notification to Slack/Telegram/Discord
python3 scripts/integration_hub.py notify "Hot lead detected: Mellow Fellow score 92"

# Morning intelligence blast (campaigns + revenue + briefing)
python3 scripts/integration_hub.py morning

# Outreach campaign analytics (Instantly/lemlist)
python3 scripts/integration_hub.py campaigns

# Revenue tracking (Stripe)
python3 scripts/integration_hub.py revenue john@cookies.com
```

---

## Output Directories

```
outputs/
├── briefs/                    # Company brief JSONs
├── competitor_intel/          # Competitor vulnerability scans + reports
├── free_intel/                # Reddit scans, FDA alerts, news
├── terpene_research/
│   ├── knowledge_base/        # Persistent terpene KB (grows each harvest)
│   └── reports/               # Weekly digests, matrices, talking points
├── war_room/
│   ├── knowledge_graph/       # Central knowledge graph (the brain)
│   ├── decisions/             # Daily briefings + priority actions
│   ├── learning/              # Outcome tracking + weight adjustments
│   └── history/               # Decision history
├── alerts/                    # Trigger monitor alerts
├── integrations/              # Integration Hub outputs (enrichments, scans, briefings)
├── scored_apollo_*.json       # Scored pipeline data
└── mellow_fellow_brief.docx   # Example deliverable
```

---

## API Keys & Costs

### Core System
| Key | Required | Used By | Cost |
|-----|----------|---------|------|
| `ANTHROPIC_API_KEY` | Yes | Brief engine (phases 1-4, 6), synthesis | ~$0.40/brief |
| `OPENROUTER_API_KEY` | Recommended | Brief engine (phase 5), cheap inference | ~$0.001/call |
| `HUNTER_API_KEY` | For enrichment | Email verification | Free tier: 25/mo |
| `GHL_API_KEY` | For CRM sync | GoHighLevel push | Included in GHL |
| `HEYGEN_API_KEY` | For video | Personalized video scripts | Pay per video |

### Integration Hub (all optional — activate as needed)
| Key | Tier | Used By | Cost |
|-----|------|---------|------|
| `CLEARBIT_API_KEY` | T1 Revenue | Company firmographics, person enrichment | Credits-based |
| `FINDYMAIL_API_KEY` | T1 Revenue | Email finder (backup to Hunter) | Credits-based |
| `ZEROBOUNCE_API_KEY` | T1 Revenue | Email validation & deliverability | Free: 100/mo |
| `INSTANTLY_API_KEY` | T1 Revenue | Cold email campaigns & warmup | $30/mo |
| `LEMLIST_API_KEY` | T1 Revenue | Multi-channel outreach sequences | $59/mo |
| `CALENDLY_API_KEY` | T1 Revenue | Meeting scheduling links | Free tier |
| `HUBSPOT_API_KEY` | T1 Revenue | HubSpot CRM (secondary) | Free tier |
| `APIFY_API_KEY` | T2 Intel | Web scraping (LinkedIn, Maps, IG) | $49/mo |
| `FIRECRAWL_API_KEY` | T2 Intel | AI website crawling & research | $16/mo |
| `SIMILARWEB_API_KEY` | T2 Intel | Website traffic analytics | Free tier |
| `AHREFS_API_KEY` | T2 Intel | SEO intelligence & backlinks | $99/mo |
| `PINECONE_API_KEY` | T2 Intel | Vector DB for semantic search | Free: 1 index |
| `SLACK_WEBHOOK_URL` | T3 Comms | Team notifications & alerts | Free |
| `TELEGRAM_BOT_TOKEN` | T3 Comms | Mobile alerts (+ `TELEGRAM_CHAT_ID`) | Free |
| `DISCORD_WEBHOOK_URL` | T3 Comms | Discord team notifications | Free |
| `TWILIO_ACCOUNT_SID` | T3 Comms | SMS/Voice (+ `TWILIO_AUTH_TOKEN`) | $0.0079/SMS |
| `SENDGRID_API_KEY` | T3 Comms | Email delivery for outreach | Free: 100/day |
| `STRIPE_API_KEY` | T4 Analytics | Revenue tracking & attribution | 2.9%+$0.30 |
| `KLAVIYO_API_KEY` | T4 Analytics | Marketing automation & segments | Free tier |
| `POSTHOG_API_KEY` | T4 Analytics | Product analytics | Free tier |
| `HUGGINGFACE_API_KEY` | T5 AI | Sentiment analysis, intent classification | Free tier |
| `DEEPGRAM_API_KEY` | T5 AI | Sales call transcription | Pay per minute |
| `REPLICATE_API_KEY` | T5 AI | ML model inference | Pay per run |
| `LEONARDO_API_KEY` | T5 AI | AI image generation for outreach | Pay per image |
| `LUSHA_API_KEY` | T6 Data | B2B contact enrichment | Credits-based |
| `CONTACTOUT_API_KEY` | T6 Data | LinkedIn email/phone finder | Credits-based |
| `TOMBA_API_KEY` | T6 Data | Email finder & verifier | Free tier |
| `LINKUP_API_KEY` | T6 Data | LinkedIn data access | Credits-based |
| `GOOGLE_MAPS_API_KEY` | T6 Data | Places API for business discovery | Pay per call |

**Zero-cost tools (no API needed):** War Room, free intel, competitor vuln, terpene research, CSV importer, brief-to-docx

---

## CDT Pricing (Corrected)

All scripts use corrected market pricing:
- **Premium single-source CDT:** $5,000-8,000/L
- **Mid-grade CDT blends:** $2,000-4,000/L
- **Self-extraction (vertically integrated):** $1,500-3,000/L
- **DFT Botanical:** $45-80/L
- **Savings:** 25-100x cost difference

---

## Recursive Learning

The War Room's learning engine adjusts signal weights based on outcomes:

```
Signal Type                          Default Weight
────────────────────────────────────────────────
trustpilot_below_3.5                 15.0
quality_complaint_about_competitor   12.0
regulatory_change                    12.0
reddit_supplier_seeking              10.0
leadership_change                     9.0
trustpilot_below_4.0                  8.0
funding_news                          8.0
reddit_complaint                      7.0
price_discussion                      7.0
new_product_launch                    6.0
competitor_weakness                   6.0
research_breakthrough                 5.0
reddit_comparison                     5.0
hiring_signal                         4.0
clinical_trial                        3.0
brief_completed                       3.0
email_verified                        2.0
```

When you record outcomes (`war_room.py learn --action-id X --outcome reply`), weights adjust:
- Positive outcomes (reply, meeting, closed): signal weight × 1.1
- Negative outcomes (no_response): signal weight × 0.95
- Over time, the system learns which signals predict real opportunities

---

## Daily Workflow

```
7:00 AM  — python3 scripts/war_room.py brief
           (Ingests overnight data, generates priorities)

7:15 AM  — Review daily briefing markdown
           (Top 10 companies, Reddit opportunities, research angles)

8:00 AM  — Sales team executes priority actions
           (Calls, emails, Reddit engagement, LinkedIn)

5:00 PM  — Record outcomes
           python3 scripts/war_room.py learn --action-id X --outcome reply

Weekly   — python3 scripts/terpene_research.py --full --days 7
           python3 scripts/competitor_vuln_v2.py --scan
           python3 scripts/free_intel_sources.py --all

Monthly  — python3 scripts/sales_intel_brief_v4.py --batch scored.json --top 10
```

---

*Nexus BDR System v5 — Built by Growth Legend × Claude*
*18 scripts | 12,281 lines | 15 agents | $0.40/brief | Learning system*
