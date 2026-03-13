#!/usr/bin/env python3
"""
NEXUS BDR — Master Integration Hub
Connects 30+ external services into a unified intelligence & outreach engine.
All integrations feed the War Room signal bus and enrich the pipeline.
"""

import os
import json
import time
import hashlib
import requests
from datetime import datetime, timedelta
from pathlib import Path

# ─── PATHS ───────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
CONFIG_DIR = BASE_DIR / "config"
OUTPUT_DIR = BASE_DIR / "outputs"
INTEGRATIONS_DIR = OUTPUT_DIR / "integrations"
INTEGRATIONS_DIR.mkdir(parents=True, exist_ok=True)

# ─── CONFIGURATION ──────────────────────────────────────────────────────────
def load_config():
    with open(CONFIG_DIR / "integrations.json") as f:
        return json.load(f)

def get_key(env_var):
    """Get API key from environment, return None if missing."""
    return os.environ.get(env_var)

def has_key(env_var):
    return bool(os.environ.get(env_var))

def api_call(method, url, headers=None, params=None, json_data=None, timeout=30, retries=3):
    """Universal API caller with retry + exponential backoff."""
    for attempt in range(retries):
        try:
            resp = requests.request(method, url, headers=headers, params=params, json=json_data, timeout=timeout)
            if resp.status_code == 429:
                wait = (2 ** attempt) * 2
                print(f"  ⏳ Rate limited, waiting {wait}s...")
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.json() if resp.headers.get("content-type", "").startswith("application/json") else resp.text
        except requests.exceptions.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue
            return {"error": str(e)}
    return {"error": "Max retries exceeded"}


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 1: REVENUE-IMPACT INTEGRATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class ClearbitEnrichment:
    """B2B firmographic + technographic enrichment via Clearbit."""
    
    def __init__(self):
        self.api_key = get_key("CLEARBIT_API_KEY")
        self.base_headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
    
    def enrich_company(self, domain):
        """Get company firmographics: size, revenue, tech stack, industry."""
        if not self.api_key:
            return {"error": "CLEARBIT_API_KEY not set"}
        result = api_call("GET", "https://company.clearbit.com/v2/companies/find",
                         headers=self.base_headers, params={"domain": domain})
        if "error" not in result:
            return {
                "source": "clearbit",
                "domain": domain,
                "name": result.get("name"),
                "industry": result.get("industry"),
                "sub_industry": result.get("subIndustry"),
                "sector": result.get("sector"),
                "employee_count": result.get("metrics", {}).get("employees"),
                "employee_range": result.get("metrics", {}).get("employeesRange"),
                "estimated_annual_revenue": result.get("metrics", {}).get("estimatedAnnualRevenue"),
                "raised": result.get("metrics", {}).get("raised"),
                "tech_stack": result.get("tech", []),
                "tags": result.get("tags", []),
                "description": result.get("description"),
                "founded_year": result.get("foundedYear"),
                "location": result.get("geo", {}),
                "social": {
                    "linkedin": result.get("linkedin", {}).get("handle"),
                    "twitter": result.get("twitter", {}).get("handle"),
                    "facebook": result.get("facebook", {}).get("handle")
                },
                "logo": result.get("logo"),
                "legal_name": result.get("legalName"),
                "enriched_at": datetime.now().isoformat()
            }
        return result
    
    def enrich_person(self, email):
        """Get person data: role, seniority, social profiles."""
        if not self.api_key:
            return {"error": "CLEARBIT_API_KEY not set"}
        result = api_call("GET", "https://person.clearbit.com/v2/people/find",
                         headers=self.base_headers, params={"email": email})
        if "error" not in result:
            return {
                "source": "clearbit",
                "email": email,
                "full_name": result.get("name", {}).get("fullName"),
                "title": result.get("employment", {}).get("title"),
                "role": result.get("employment", {}).get("role"),
                "seniority": result.get("employment", {}).get("seniority"),
                "company": result.get("employment", {}).get("name"),
                "linkedin": result.get("linkedin", {}).get("handle"),
                "twitter": result.get("twitter", {}).get("handle"),
                "location": result.get("geo", {}),
                "avatar": result.get("avatar"),
                "enriched_at": datetime.now().isoformat()
            }
        return result

    def reveal_visitor(self, ip_address):
        """Identify company from website visitor IP."""
        if not self.api_key:
            return {"error": "CLEARBIT_API_KEY not set"}
        return api_call("GET", "https://reveal.clearbit.com/v1/companies/find",
                       headers=self.base_headers, params={"ip": ip_address})


class EmailVerificationChain:
    """Multi-provider email verification: Hunter → Findymail → ZeroBounce → Tomba."""
    
    def __init__(self):
        self.providers = []
        if has_key("HUNTER_API_KEY"):
            self.providers.append(("hunter", self._verify_hunter))
        if has_key("FINDYMAIL_API_KEY"):
            self.providers.append(("findymail", self._verify_findymail))
        if has_key("ZEROBOUNCE_API_KEY"):
            self.providers.append(("zerobounce", self._verify_zerobounce))
        if has_key("TOMBA_API_KEY"):
            self.providers.append(("tomba", self._verify_tomba))
    
    def verify(self, email):
        """Run email through verification chain until confirmed."""
        results = {"email": email, "verifications": []}
        for provider_name, verify_fn in self.providers:
            result = verify_fn(email)
            results["verifications"].append({"provider": provider_name, **result})
            if result.get("status") == "valid":
                results["final_status"] = "valid"
                results["verified_by"] = provider_name
                return results
            if result.get("status") == "invalid":
                results["final_status"] = "invalid"
                results["rejected_by"] = provider_name
                return results
        results["final_status"] = "unverified" if not results["verifications"] else results["verifications"][-1].get("status", "unknown")
        return results
    
    def find_email(self, first_name, last_name, domain):
        """Find email using available providers."""
        # Try Hunter first
        if has_key("HUNTER_API_KEY"):
            result = api_call("GET", "https://api.hunter.io/v2/email-finder",
                            params={"first_name": first_name, "last_name": last_name,
                                    "domain": domain, "api_key": get_key("HUNTER_API_KEY")})
            if "error" not in result and result.get("data", {}).get("email"):
                return {"email": result["data"]["email"], "confidence": result["data"].get("confidence", 0),
                        "source": "hunter"}
        # Try Findymail
        if has_key("FINDYMAIL_API_KEY"):
            result = api_call("POST", "https://app.findymail.com/api/search/name",
                            headers={"Authorization": f"Bearer {get_key('FINDYMAIL_API_KEY')}",
                                     "Content-Type": "application/json"},
                            json_data={"first_name": first_name, "last_name": last_name, "domain": domain})
            if "error" not in result and result.get("email"):
                return {"email": result["email"], "confidence": result.get("confidence", 0), "source": "findymail"}
        # Try Tomba
        if has_key("TOMBA_API_KEY"):
            result = api_call("GET", "https://api.tomba.io/v1/email-finder",
                            headers={"X-Tomba-Key": get_key("TOMBA_API_KEY")},
                            params={"domain": domain, "first_name": first_name, "last_name": last_name})
            if "error" not in result and result.get("data", {}).get("email"):
                return {"email": result["data"]["email"], "confidence": result["data"].get("confidence", 0),
                        "source": "tomba"}
        return {"error": "No email found across all providers"}
    
    def _verify_hunter(self, email):
        result = api_call("GET", "https://api.hunter.io/v2/email-verifier",
                         params={"email": email, "api_key": get_key("HUNTER_API_KEY")})
        if "error" not in result:
            status = result.get("data", {}).get("status", "unknown")
            return {"status": status, "score": result.get("data", {}).get("score", 0)}
        return {"status": "error", "detail": str(result)}
    
    def _verify_findymail(self, email):
        result = api_call("POST", "https://app.findymail.com/api/verify",
                         headers={"Authorization": f"Bearer {get_key('FINDYMAIL_API_KEY')}",
                                  "Content-Type": "application/json"},
                         json_data={"email": email})
        if "error" not in result:
            return {"status": "valid" if result.get("is_valid") else "invalid",
                    "score": 100 if result.get("is_valid") else 0}
        return {"status": "error"}
    
    def _verify_zerobounce(self, email):
        result = api_call("GET", "https://api.zerobounce.net/v2/validate",
                         params={"api_key": get_key("ZEROBOUNCE_API_KEY"), "email": email})
        if "error" not in result:
            zb_status = result.get("status", "").lower()
            mapped = "valid" if zb_status == "valid" else "invalid" if zb_status in ("invalid", "abuse", "do_not_mail") else "unknown"
            return {"status": mapped, "sub_status": result.get("sub_status"),
                    "score": 100 if mapped == "valid" else 0}
        return {"status": "error"}
    
    def _verify_tomba(self, email):
        result = api_call("GET", "https://api.tomba.io/v1/email-verifier",
                         headers={"X-Tomba-Key": get_key("TOMBA_API_KEY")},
                         params={"email": email})
        if "error" not in result:
            status = result.get("data", {}).get("status", "unknown")
            return {"status": status, "score": result.get("data", {}).get("score", 0)}
        return {"status": "error"}


class OutreachEngine:
    """Multi-channel outreach via Instantly + lemlist + SendGrid."""
    
    def __init__(self):
        self.instantly_key = get_key("INSTANTLY_API_KEY")
        self.lemlist_key = get_key("LEMLIST_API_KEY")
        self.sendgrid_key = get_key("SENDGRID_API_KEY")
    
    def add_to_instantly_campaign(self, campaign_id, leads):
        """Add leads to an Instantly cold email campaign."""
        if not self.instantly_key:
            return {"error": "INSTANTLY_API_KEY not set"}
        formatted = [{"email": l["email"], "first_name": l.get("first_name", ""),
                      "last_name": l.get("last_name", ""), "company_name": l.get("company_name", ""),
                      "custom_variables": l.get("custom_variables", {})} for l in leads]
        return api_call("POST", "https://api.instantly.ai/api/v1/lead/add",
                       params={"api_key": self.instantly_key},
                       json_data={"campaign_id": campaign_id, "skip_if_in_workspace": True, "leads": formatted})
    
    def get_instantly_campaigns(self):
        """List all Instantly campaigns with stats."""
        if not self.instantly_key:
            return {"error": "INSTANTLY_API_KEY not set"}
        return api_call("GET", "https://api.instantly.ai/api/v1/campaign/list",
                       params={"api_key": self.instantly_key})
    
    def get_instantly_analytics(self, campaign_id):
        """Get open/reply/bounce rates for a campaign."""
        if not self.instantly_key:
            return {"error": "INSTANTLY_API_KEY not set"}
        return api_call("GET", "https://api.instantly.ai/api/v1/analytics/campaign/summary",
                       params={"api_key": self.instantly_key, "campaign_id": campaign_id})
    
    def add_to_lemlist_campaign(self, campaign_id, lead):
        """Add a lead to a lemlist multi-channel sequence."""
        if not self.lemlist_key:
            return {"error": "LEMLIST_API_KEY not set"}
        return api_call("POST", f"https://api.lemlist.com/api/campaigns/{campaign_id}/leads/{lead['email']}",
                       headers={"Authorization": f"Bearer {self.lemlist_key}", "Content-Type": "application/json"},
                       json_data={"firstName": lead.get("first_name"), "lastName": lead.get("last_name"),
                                  "companyName": lead.get("company_name"),
                                  **{k: v for k, v in lead.get("custom_variables", {}).items()}})
    
    def send_email_sendgrid(self, to_email, subject, html_content, from_email=None):
        """Send a single email via SendGrid."""
        if not self.sendgrid_key:
            return {"error": "SENDGRID_API_KEY not set"}
        from_addr = from_email or os.environ.get("SENDGRID_FROM_EMAIL", "team@terpenebeltfarms.com")
        return api_call("POST", "https://api.sendgrid.com/v3/mail/send",
                       headers={"Authorization": f"Bearer {self.sendgrid_key}", "Content-Type": "application/json"},
                       json_data={"personalizations": [{"to": [{"email": to_email}]}],
                                  "from": {"email": from_addr}, "subject": subject,
                                  "content": [{"type": "text/html", "value": html_content}]})
    
    def send_sms_twilio(self, to_number, message):
        """Send SMS via Twilio."""
        sid = get_key("TWILIO_ACCOUNT_SID")
        token = get_key("TWILIO_AUTH_TOKEN")
        from_number = os.environ.get("TWILIO_FROM_NUMBER")
        if not all([sid, token, from_number]):
            return {"error": "Twilio credentials not fully configured"}
        return api_call("POST", f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                       headers={"Content-Type": "application/x-www-form-urlencoded"},
                       json_data={"To": to_number, "From": from_number, "Body": message})


class CalendlyIntegration:
    """Meeting scheduling via Calendly."""
    
    def __init__(self):
        self.api_key = get_key("CALENDLY_API_KEY")
        self.headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"} if self.api_key else {}
    
    def get_event_types(self):
        """List available meeting types."""
        if not self.api_key:
            return {"error": "CALENDLY_API_KEY not set"}
        user = api_call("GET", "https://api.calendly.com/users/me", headers=self.headers)
        if "error" in user:
            return user
        user_uri = user.get("resource", {}).get("uri", "")
        return api_call("GET", "https://api.calendly.com/event_types",
                       headers=self.headers, params={"user": user_uri})
    
    def get_scheduled_events(self, min_start=None, max_start=None):
        """Get upcoming scheduled meetings."""
        if not self.api_key:
            return {"error": "CALENDLY_API_KEY not set"}
        user = api_call("GET", "https://api.calendly.com/users/me", headers=self.headers)
        if "error" in user:
            return user
        user_uri = user.get("resource", {}).get("uri", "")
        params = {"user": user_uri}
        if min_start:
            params["min_start_time"] = min_start
        if max_start:
            params["max_start_time"] = max_start
        return api_call("GET", "https://api.calendly.com/scheduled_events",
                       headers=self.headers, params=params)
    
    def get_scheduling_link(self, event_type_slug="30min"):
        """Get a scheduling link for outreach emails."""
        event_types = self.get_event_types()
        if "error" in event_types:
            return event_types
        for et in event_types.get("collection", []):
            if event_type_slug in et.get("slug", ""):
                return {"scheduling_url": et.get("scheduling_url"), "name": et.get("name"),
                        "duration": et.get("duration")}
        return {"error": f"No event type matching '{event_type_slug}' found"}


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 2: INTELLIGENCE & RESEARCH INTEGRATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class FirecrawlResearch:
    """AI-powered web crawling for deep company research."""
    
    def __init__(self):
        self.api_key = get_key("FIRECRAWL_API_KEY")
        self.headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"} if self.api_key else {}
    
    def scrape_page(self, url, formats=None):
        """Scrape a single page and return clean markdown."""
        if not self.api_key:
            return {"error": "FIRECRAWL_API_KEY not set"}
        payload = {"url": url, "formats": formats or ["markdown"]}
        return api_call("POST", "https://api.firecrawl.dev/v1/scrape",
                       headers=self.headers, json_data=payload)
    
    def crawl_site(self, url, max_pages=10, include_paths=None):
        """Crawl an entire website for comprehensive intel."""
        if not self.api_key:
            return {"error": "FIRECRAWL_API_KEY not set"}
        payload = {"url": url, "limit": max_pages}
        if include_paths:
            payload["includePaths"] = include_paths
        result = api_call("POST", "https://api.firecrawl.dev/v1/crawl",
                         headers=self.headers, json_data=payload)
        if "error" not in result and result.get("id"):
            # Poll for completion
            crawl_id = result["id"]
            for _ in range(30):
                time.sleep(2)
                status = api_call("GET", f"https://api.firecrawl.dev/v1/crawl/{crawl_id}",
                                 headers=self.headers)
                if status.get("status") == "completed":
                    return status
            return {"status": "timeout", "crawl_id": crawl_id}
        return result
    
    def search(self, query, limit=5):
        """Search the web and return structured results."""
        if not self.api_key:
            return {"error": "FIRECRAWL_API_KEY not set"}
        return api_call("POST", "https://api.firecrawl.dev/v1/search",
                       headers=self.headers, json_data={"query": query, "limit": limit})
    
    def research_company(self, domain):
        """Deep research a company: about page, products, team, pricing."""
        pages = {}
        for path in ["/", "/about", "/products", "/team", "/pricing", "/contact"]:
            url = f"https://{domain}{path}"
            result = self.scrape_page(url)
            if "error" not in result:
                pages[path] = result.get("data", {}).get("markdown", "")[:3000]
        return {"domain": domain, "pages": pages, "scraped_at": datetime.now().isoformat()}


class ApifyScraping:
    """Web scraping via Apify actors for LinkedIn, Google Maps, Instagram."""
    
    def __init__(self):
        self.api_key = get_key("APIFY_API_KEY")
        self.base_url = "https://api.apify.com/v2"
        self.headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"} if self.api_key else {}
    
    def run_actor(self, actor_id, input_data, timeout=120):
        """Run an Apify actor and wait for results."""
        if not self.api_key:
            return {"error": "APIFY_API_KEY not set"}
        result = api_call("POST", f"{self.base_url}/acts/{actor_id}/runs",
                         headers=self.headers, json_data=input_data, timeout=10)
        if "error" in result:
            return result
        run_id = result.get("data", {}).get("id")
        if not run_id:
            return {"error": "Failed to start actor run"}
        # Poll for completion
        start = time.time()
        while time.time() - start < timeout:
            time.sleep(5)
            status = api_call("GET", f"{self.base_url}/actor-runs/{run_id}", headers=self.headers)
            run_status = status.get("data", {}).get("status")
            if run_status == "SUCCEEDED":
                dataset_id = status.get("data", {}).get("defaultDatasetId")
                items = api_call("GET", f"{self.base_url}/datasets/{dataset_id}/items", headers=self.headers)
                return items
            if run_status in ("FAILED", "ABORTED", "TIMED-OUT"):
                return {"error": f"Actor run {run_status}", "run_id": run_id}
        return {"error": "Timeout waiting for actor", "run_id": run_id}
    
    def scrape_google_maps(self, query, location="United States", max_results=20):
        """Find businesses on Google Maps for lead discovery."""
        return self.run_actor("apify/google-maps-scraper", {
            "searchStringsArray": [query], "locationQuery": location,
            "maxCrawledPlacesPerSearch": max_results, "language": "en"
        })
    
    def scrape_linkedin_company(self, company_url):
        """Get company data from LinkedIn."""
        return self.run_actor("apify/linkedin-scraper", {
            "urls": [company_url], "scrapeCompany": True
        })
    
    def scrape_instagram(self, username, max_posts=20):
        """Get Instagram profile and recent posts."""
        return self.run_actor("apify/instagram-scraper", {
            "usernames": [username], "resultsLimit": max_posts
        })
    
    def scrape_website_content(self, url, max_pages=5):
        """Crawl website for content analysis."""
        return self.run_actor("apify/website-content-crawler", {
            "startUrls": [{"url": url}], "maxCrawlPages": max_pages
        })


class CompetitiveIntel:
    """Competitive intelligence via SimilarWeb + Ahrefs."""
    
    def __init__(self):
        self.similarweb_key = get_key("SIMILARWEB_API_KEY")
        self.ahrefs_key = get_key("AHREFS_API_KEY")
    
    def get_traffic_data(self, domain):
        """Get website traffic estimate from SimilarWeb."""
        if not self.similarweb_key:
            return {"error": "SIMILARWEB_API_KEY not set"}
        result = api_call("GET", f"https://api.similarweb.com/v1/similar-ranking/{domain}/rank",
                         params={"api_key": self.similarweb_key})
        return {"domain": domain, "source": "similarweb", **result}
    
    def get_seo_metrics(self, domain):
        """Get SEO metrics from Ahrefs."""
        if not self.ahrefs_key:
            return {"error": "AHREFS_API_KEY not set"}
        result = api_call("GET", "https://apiv2.ahrefs.com",
                         params={"token": self.ahrefs_key, "from": "domain_rating",
                                 "target": domain, "mode": "domain", "output": "json"})
        return {"domain": domain, "source": "ahrefs", **result}
    
    def digital_footprint(self, domain):
        """Combined traffic + SEO + social presence analysis."""
        traffic = self.get_traffic_data(domain)
        seo = self.get_seo_metrics(domain)
        return {"domain": domain, "traffic": traffic, "seo": seo,
                "analyzed_at": datetime.now().isoformat()}


class PineconeKnowledge:
    """Vector database for semantic search across the knowledge graph."""
    
    def __init__(self):
        self.api_key = get_key("PINECONE_API_KEY")
        self.index_name = "nexus-knowledge-graph"
        self.host = os.environ.get("PINECONE_HOST", "")
    
    def upsert_signals(self, signals, namespace="signals"):
        """Store signal embeddings for semantic retrieval."""
        if not self.api_key or not self.host:
            return {"error": "Pinecone not configured (need PINECONE_API_KEY and PINECONE_HOST)"}
        vectors = []
        for sig in signals:
            text = f"{sig.get('type', '')} {sig.get('company', '')} {sig.get('detail', '')}"
            vector_id = hashlib.md5(text.encode()).hexdigest()
            # Note: In production, use an embedding model (OpenAI, Cohere, etc.)
            # For now, store metadata for retrieval
            vectors.append({"id": vector_id, "values": [0.0] * 1536,  # placeholder
                           "metadata": {**sig, "text": text}})
        return api_call("POST", f"https://{self.host}/vectors/upsert",
                       headers={"Api-Key": self.api_key, "Content-Type": "application/json"},
                       json_data={"vectors": vectors, "namespace": namespace})
    
    def query_similar(self, query_text, top_k=10, namespace="signals"):
        """Find similar signals/intel by semantic similarity."""
        if not self.api_key or not self.host:
            return {"error": "Pinecone not configured"}
        # Placeholder — in production, embed query_text first
        return api_call("POST", f"https://{self.host}/query",
                       headers={"Api-Key": self.api_key, "Content-Type": "application/json"},
                       json_data={"vector": [0.0] * 1536, "topK": top_k,
                                  "includeMetadata": True, "namespace": namespace})


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 3: COMMUNICATION & NOTIFICATION INTEGRATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class NotificationHub:
    """Multi-channel notifications: Slack → Telegram → Discord → SMS."""
    
    def __init__(self):
        self.slack_webhook = get_key("SLACK_WEBHOOK_URL")
        self.slack_bot_token = get_key("SLACK_BOT_TOKEN")
        self.telegram_token = get_key("TELEGRAM_BOT_TOKEN")
        self.telegram_chat = get_key("TELEGRAM_CHAT_ID")
        self.discord_webhook = get_key("DISCORD_WEBHOOK_URL")
    
    def send_slack(self, message, channel=None, blocks=None):
        """Send Slack notification (webhook or bot)."""
        if self.slack_webhook:
            payload = {"text": message}
            if blocks:
                payload["blocks"] = blocks
            return api_call("POST", self.slack_webhook, json_data=payload)
        if self.slack_bot_token and channel:
            return api_call("POST", "https://slack.com/api/chat.postMessage",
                          headers={"Authorization": f"Bearer {self.slack_bot_token}",
                                   "Content-Type": "application/json"},
                          json_data={"channel": channel, "text": message, "blocks": blocks})
        return {"error": "No Slack credentials configured"}
    
    def send_telegram(self, message, parse_mode="Markdown"):
        """Send Telegram notification."""
        if not self.telegram_token or not self.telegram_chat:
            return {"error": "Telegram not configured"}
        return api_call("POST", f"https://api.telegram.org/bot{self.telegram_token}/sendMessage",
                       json_data={"chat_id": self.telegram_chat, "text": message,
                                  "parse_mode": parse_mode})
    
    def send_discord(self, message, embeds=None):
        """Send Discord notification via webhook."""
        if not self.discord_webhook:
            return {"error": "DISCORD_WEBHOOK_URL not set"}
        payload = {"content": message}
        if embeds:
            payload["embeds"] = embeds
        return api_call("POST", self.discord_webhook, json_data=payload)
    
    def broadcast(self, message, urgency="normal"):
        """Send notification to all configured channels."""
        results = {}
        if urgency == "critical":
            prefix = "🚨 CRITICAL: "
        elif urgency == "high":
            prefix = "🔥 HOT: "
        else:
            prefix = ""
        
        full_msg = f"{prefix}{message}"
        
        if self.slack_webhook or self.slack_bot_token:
            results["slack"] = self.send_slack(full_msg)
        if self.telegram_token:
            results["telegram"] = self.send_telegram(full_msg)
        if self.discord_webhook:
            results["discord"] = self.send_discord(full_msg)
        
        if not results:
            results["fallback"] = "No notification channels configured"
        return results
    
    def send_hot_lead_alert(self, lead):
        """Formatted hot lead alert across all channels."""
        msg = (f"🔥 HOT LEAD DETECTED\n"
               f"*{lead.get('company_name', 'Unknown')}* — Score: {lead.get('nexus_lead_score', 'N/A')}\n"
               f"Contact: {lead.get('contact_name', 'N/A')} ({lead.get('title', 'N/A')})\n"
               f"Email: {lead.get('email', 'N/A')}\n"
               f"Brand: {lead.get('nexus_brand', 'N/A')}\n"
               f"Signals: {', '.join(lead.get('buying_signals', []))}")
        return self.broadcast(msg, urgency="high")
    
    def send_daily_briefing(self, briefing_data):
        """Send formatted daily briefing to team channels."""
        msg = (f"📊 *NEXUS DAILY BRIEFING — {datetime.now().strftime('%B %d, %Y')}*\n\n"
               f"🎯 Hot leads: {briefing_data.get('hot_count', 0)}\n"
               f"📈 Pipeline value: ${briefing_data.get('pipeline_value', 0):,.0f}\n"
               f"📧 Outreach due: {briefing_data.get('outreach_due', 0)}\n"
               f"🔍 New signals: {briefing_data.get('new_signals', 0)}\n\n"
               f"Top Actions:\n{briefing_data.get('top_actions', 'None')}")
        return self.broadcast(msg)
    
    def send_competitor_alert(self, competitor, vulnerability):
        """Alert team about competitor vulnerability detected."""
        msg = (f"⚡ COMPETITOR VULNERABILITY\n"
               f"*{competitor}*: {vulnerability.get('type', 'Unknown')}\n"
               f"Detail: {vulnerability.get('detail', 'N/A')}\n"
               f"Urgency: {vulnerability.get('urgency', 'MEDIUM')}\n"
               f"Action: {vulnerability.get('recommended_action', 'Review')}")
        return self.broadcast(msg, urgency="high" if vulnerability.get("urgency") == "HIGH" else "normal")


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 4: ANALYTICS & REVENUE TRACKING
# ═══════════════════════════════════════════════════════════════════════════════

class RevenueTracker:
    """Track revenue attribution from outreach to closed deals via Stripe + Klaviyo."""
    
    def __init__(self):
        self.stripe_key = get_key("STRIPE_API_KEY")
        self.klaviyo_key = get_key("KLAVIYO_API_KEY")
    
    def get_recent_payments(self, days=30, limit=100):
        """Get recent Stripe payments for revenue attribution."""
        if not self.stripe_key:
            return {"error": "STRIPE_API_KEY not set"}
        since = int((datetime.now() - timedelta(days=days)).timestamp())
        return api_call("GET", "https://api.stripe.com/v1/charges",
                       headers={"Authorization": f"Bearer {self.stripe_key}"},
                       params={"created[gte]": since, "limit": limit})
    
    def get_customer_revenue(self, email):
        """Get total revenue from a specific customer."""
        if not self.stripe_key:
            return {"error": "STRIPE_API_KEY not set"}
        # Search for customer by email
        customers = api_call("GET", "https://api.stripe.com/v1/customers",
                           headers={"Authorization": f"Bearer {self.stripe_key}"},
                           params={"email": email})
        if "error" in customers or not customers.get("data"):
            return {"email": email, "total_revenue": 0, "transactions": 0}
        customer_id = customers["data"][0]["id"]
        charges = api_call("GET", "https://api.stripe.com/v1/charges",
                          headers={"Authorization": f"Bearer {self.stripe_key}"},
                          params={"customer": customer_id, "limit": 100})
        if "error" in charges:
            return charges
        total = sum(c.get("amount", 0) for c in charges.get("data", []) if c.get("paid"))
        return {"email": email, "total_revenue": total / 100, "transactions": len(charges.get("data", [])),
                "customer_id": customer_id}
    
    def sync_to_klaviyo(self, leads, list_id=None):
        """Push leads to Klaviyo for email marketing sequences."""
        if not self.klaviyo_key:
            return {"error": "KLAVIYO_API_KEY not set"}
        results = []
        for lead in leads:
            profile = {
                "data": {
                    "type": "profile",
                    "attributes": {
                        "email": lead.get("email"),
                        "first_name": lead.get("first_name"),
                        "last_name": lead.get("last_name"),
                        "organization": lead.get("company_name"),
                        "title": lead.get("title"),
                        "properties": {
                            "nexus_lead_score": lead.get("nexus_lead_score"),
                            "nexus_brand": lead.get("nexus_brand"),
                            "prospect_temperature": lead.get("prospect_temperature"),
                            "source": "nexus_bdr"
                        }
                    }
                }
            }
            result = api_call("POST", "https://a.klaviyo.com/api/profiles/",
                            headers={"Authorization": f"Klaviyo-API-Key {self.klaviyo_key}",
                                     "Content-Type": "application/json", "revision": "2024-02-15"},
                            json_data=profile)
            results.append(result)
        return {"synced": len(results), "results": results}
    
    def track_event_klaviyo(self, email, event_name, properties=None):
        """Track a custom event in Klaviyo (brief_completed, email_sent, etc.)."""
        if not self.klaviyo_key:
            return {"error": "KLAVIYO_API_KEY not set"}
        event = {
            "data": {
                "type": "event",
                "attributes": {
                    "profile": {"data": {"type": "profile", "attributes": {"email": email}}},
                    "metric": {"data": {"type": "metric", "attributes": {"name": event_name}}},
                    "properties": properties or {},
                    "time": datetime.now().isoformat()
                }
            }
        }
        return api_call("POST", "https://a.klaviyo.com/api/events/",
                       headers={"Authorization": f"Klaviyo-API-Key {self.klaviyo_key}",
                                "Content-Type": "application/json", "revision": "2024-02-15"},
                       json_data=event)


class GoogleSheetsSync:
    """Export/import pipeline data to Google Sheets for team visibility."""
    
    def __init__(self):
        self.credentials = get_key("GOOGLE_SHEETS_CREDENTIALS")
    
    def export_pipeline(self, spreadsheet_id, leads, sheet_name="Pipeline"):
        """Export scored leads to a Google Sheet."""
        if not self.credentials:
            return {"error": "GOOGLE_SHEETS_CREDENTIALS not set — use a service account JSON"}
        # Note: Full implementation requires google-api-python-client
        # This provides the data transformation layer
        rows = [["Company", "Contact", "Title", "Email", "Score", "Temperature", "Brand", 
                 "Signals", "Last Touch", "Next Action"]]
        for lead in leads:
            rows.append([
                lead.get("company_name", ""),
                lead.get("contact_name", ""),
                lead.get("title", ""),
                lead.get("email", ""),
                lead.get("nexus_lead_score", 0),
                lead.get("prospect_temperature", ""),
                lead.get("nexus_brand", ""),
                ", ".join(lead.get("buying_signals", [])),
                lead.get("last_touch_date", ""),
                lead.get("next_action", "")
            ])
        return {"status": "ready", "rows": len(rows) - 1, "sheet": sheet_name,
                "data": rows, "note": "Install google-api-python-client for full Sheets API support"}


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 5: AI ENHANCEMENT INTEGRATIONS
# ═══════════════════════════════════════════════════════════════════════════════

class AIEnhancementSuite:
    """Enhanced AI capabilities via HuggingFace, Replicate, Deepgram, Leonardo."""
    
    def __init__(self):
        self.hf_key = get_key("HUGGINGFACE_API_KEY")
        self.replicate_key = get_key("REPLICATE_API_KEY")
        self.deepgram_key = get_key("DEEPGRAM_API_KEY")
        self.leonardo_key = get_key("LEONARDO_API_KEY")
    
    def classify_sentiment(self, text):
        """Classify sentiment of a review/post using HuggingFace."""
        if not self.hf_key:
            return {"error": "HUGGINGFACE_API_KEY not set"}
        return api_call("POST", "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
                       headers={"Authorization": f"Bearer {self.hf_key}"},
                       json_data={"inputs": text})
    
    def classify_intent(self, text):
        """Classify buying intent from social media posts."""
        if not self.hf_key:
            return {"error": "HUGGINGFACE_API_KEY not set"}
        return api_call("POST", "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
                       headers={"Authorization": f"Bearer {self.hf_key}"},
                       json_data={"inputs": text,
                                  "parameters": {"candidate_labels": [
                                      "looking to buy terpenes", "complaining about supplier",
                                      "seeking recommendations", "sharing experience",
                                      "asking about pricing", "general discussion"]}})
    
    def transcribe_call(self, audio_url):
        """Transcribe a sales call using Deepgram."""
        if not self.deepgram_key:
            return {"error": "DEEPGRAM_API_KEY not set"}
        return api_call("POST", "https://api.deepgram.com/v1/listen",
                       headers={"Authorization": f"Token {self.deepgram_key}",
                                "Content-Type": "application/json"},
                       json_data={"url": audio_url},
                       params={"model": "nova-2", "smart_format": True,
                               "diarize": True, "detect_topics": True})
    
    def generate_outreach_image(self, prompt):
        """Generate personalized outreach images using Leonardo AI."""
        if not self.leonardo_key:
            return {"error": "LEONARDO_API_KEY not set"}
        result = api_call("POST", "https://cloud.leonardo.ai/api/rest/v1/generations",
                         headers={"Authorization": f"Bearer {self.leonardo_key}",
                                  "Content-Type": "application/json"},
                         json_data={"prompt": prompt, "modelId": "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
                                    "width": 1024, "height": 1024, "num_images": 1})
        return result


# ═══════════════════════════════════════════════════════════════════════════════
# MASTER ORCHESTRATOR — Ties Everything Together
# ═══════════════════════════════════════════════════════════════════════════════

class IntegrationHub:
    """
    Master integration orchestrator for Nexus BDR.
    Connects all tiers into unified workflows.
    """
    
    def __init__(self):
        self.clearbit = ClearbitEnrichment()
        self.email_chain = EmailVerificationChain()
        self.outreach = OutreachEngine()
        self.calendly = CalendlyIntegration()
        self.firecrawl = FirecrawlResearch()
        self.apify = ApifyScraping()
        self.competitive = CompetitiveIntel()
        self.pinecone = PineconeKnowledge()
        self.notifications = NotificationHub()
        self.revenue = RevenueTracker()
        self.sheets = GoogleSheetsSync()
        self.ai = AIEnhancementSuite()
        self._log = []
    
    def _log_action(self, action, details):
        entry = {"timestamp": datetime.now().isoformat(), "action": action, **details}
        self._log.append(entry)
        log_file = OUTPUT_DIR / "integration-activity-log.json"
        try:
            existing = json.loads(log_file.read_text()) if log_file.exists() else []
        except Exception:
            existing = []
        existing.append(entry)
        # Keep last 1000 entries
        log_file.write_text(json.dumps(existing[-1000:], indent=2))
    
    # ─── UNIFIED WORKFLOWS ──────────────────────────────────────────────────
    
    def deep_enrich_lead(self, lead):
        """
        Full enrichment pipeline:
        1. Clearbit firmographics
        2. Email verification chain
        3. Firecrawl website research
        4. Competitive intelligence
        5. AI sentiment/intent classification
        """
        result = {"lead": lead, "enrichments": {}, "enriched_at": datetime.now().isoformat()}
        
        # 1. Clearbit company enrichment
        if lead.get("domain"):
            print(f"  → Clearbit enriching {lead['domain']}...")
            result["enrichments"]["clearbit_company"] = self.clearbit.enrich_company(lead["domain"])
        
        # 2. Clearbit person enrichment
        if lead.get("email"):
            print(f"  → Clearbit person lookup {lead['email']}...")
            result["enrichments"]["clearbit_person"] = self.clearbit.enrich_person(lead["email"])
        
        # 3. Email verification
        if lead.get("email"):
            print(f"  → Verifying email {lead['email']}...")
            result["enrichments"]["email_verification"] = self.email_chain.verify(lead["email"])
        elif lead.get("first_name") and lead.get("last_name") and lead.get("domain"):
            print(f"  → Finding email for {lead['first_name']} {lead['last_name']}@{lead['domain']}...")
            found = self.email_chain.find_email(lead["first_name"], lead["last_name"], lead["domain"])
            result["enrichments"]["email_found"] = found
            if found.get("email"):
                result["lead"]["email"] = found["email"]
                result["enrichments"]["email_verification"] = self.email_chain.verify(found["email"])
        
        # 4. Website research
        if lead.get("domain"):
            print(f"  → Firecrawl researching {lead['domain']}...")
            result["enrichments"]["website_research"] = self.firecrawl.research_company(lead["domain"])
        
        # 5. Competitive digital footprint
        if lead.get("domain"):
            print(f"  → Digital footprint analysis...")
            result["enrichments"]["digital_footprint"] = self.competitive.digital_footprint(lead["domain"])
        
        self._log_action("deep_enrich", {"company": lead.get("company_name"), "domain": lead.get("domain")})
        return result
    
    def launch_outreach_sequence(self, lead, campaign_type="instantly", campaign_id=None):
        """
        Launch multi-channel outreach:
        1. Add to email campaign (Instantly or lemlist)
        2. Get Calendly link for CTA
        3. Notify team on Slack
        """
        result = {"lead": lead, "actions": []}
        
        # Get Calendly link
        cal_link = self.calendly.get_scheduling_link()
        booking_url = cal_link.get("scheduling_url", "")
        
        # Prepare custom variables
        custom_vars = {
            "company_name": lead.get("company_name", ""),
            "personalization_hook": lead.get("personalization_hook", ""),
            "booking_link": booking_url,
            "brand": lead.get("nexus_brand", "TBF")
        }
        lead_data = {**lead, "custom_variables": custom_vars}
        
        # Add to campaign
        if campaign_type == "instantly" and campaign_id:
            r = self.outreach.add_to_instantly_campaign(campaign_id, [lead_data])
            result["actions"].append({"type": "instantly_add", "result": r})
        elif campaign_type == "lemlist" and campaign_id:
            r = self.outreach.add_to_lemlist_campaign(campaign_id, lead_data)
            result["actions"].append({"type": "lemlist_add", "result": r})
        
        # Notify team
        score = lead.get("nexus_lead_score", 0)
        if score >= 80:
            self.notifications.send_hot_lead_alert(lead)
            result["actions"].append({"type": "hot_lead_alert", "channels": "all"})
        
        self._log_action("launch_outreach", {"company": lead.get("company_name"), "campaign_type": campaign_type})
        return result
    
    def run_competitive_scan(self, domains):
        """
        Full competitive intelligence sweep:
        1. Website crawl via Firecrawl
        2. Traffic + SEO metrics
        3. Google Maps presence
        4. Notify team of findings
        """
        results = []
        for domain in domains:
            print(f"\n  Scanning {domain}...")
            data = {"domain": domain}
            
            # Website content
            data["website"] = self.firecrawl.scrape_page(f"https://{domain}")
            
            # Traffic & SEO
            data["digital"] = self.competitive.digital_footprint(domain)
            
            results.append(data)
        
        # Save results
        output_file = INTEGRATIONS_DIR / f"competitive_scan_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        output_file.write_text(json.dumps(results, indent=2, default=str))
        
        self._log_action("competitive_scan", {"domains": domains, "output": str(output_file)})
        return results
    
    def discover_leads_google_maps(self, query, location="United States", max_results=20):
        """
        Discover new leads via Google Maps scraping:
        1. Find businesses matching query
        2. Enrich with Clearbit
        3. Find decision-maker emails
        4. Score and assign brand
        """
        print(f"  🗺️  Searching Google Maps: '{query}' in {location}...")
        maps_results = self.apify.scrape_google_maps(query, location, max_results)
        
        if "error" in maps_results:
            return maps_results
        
        leads = []
        for biz in (maps_results if isinstance(maps_results, list) else []):
            domain = ""
            website = biz.get("website", "")
            if website:
                from urllib.parse import urlparse
                parsed = urlparse(website)
                domain = parsed.netloc.replace("www.", "")
            
            lead = {
                "company_name": biz.get("title", ""),
                "domain": domain,
                "phone": biz.get("phone", ""),
                "address": biz.get("address", ""),
                "rating": biz.get("totalScore"),
                "reviews_count": biz.get("reviewsCount"),
                "category": biz.get("categoryName", ""),
                "source": "google_maps",
                "discovered_at": datetime.now().isoformat()
            }
            leads.append(lead)
        
        output_file = INTEGRATIONS_DIR / f"gmaps_leads_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        output_file.write_text(json.dumps(leads, indent=2))
        
        self._log_action("gmaps_discovery", {"query": query, "leads_found": len(leads)})
        return {"leads": leads, "count": len(leads), "output": str(output_file)}
    
    def morning_intel_blast(self, pipeline_data=None):
        """
        Complete morning intelligence run:
        1. Check outreach campaign analytics
        2. Check recent payments (revenue attribution)
        3. Send daily briefing to all channels
        """
        briefing = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "hot_count": 0,
            "pipeline_value": 0,
            "outreach_due": 0,
            "new_signals": 0,
            "campaign_stats": {},
            "revenue_last_30d": 0,
            "top_actions": ""
        }
        
        # Campaign analytics
        campaigns = self.outreach.get_instantly_campaigns()
        if isinstance(campaigns, list):
            for camp in campaigns[:5]:
                camp_id = camp.get("id", "")
                stats = self.outreach.get_instantly_analytics(camp_id)
                briefing["campaign_stats"][camp.get("name", camp_id)] = stats
        
        # Revenue tracking
        payments = self.revenue.get_recent_payments(days=30)
        if "error" not in payments and payments.get("data"):
            total = sum(c.get("amount", 0) for c in payments["data"] if c.get("paid"))
            briefing["revenue_last_30d"] = total / 100
        
        # Pipeline summary
        if pipeline_data:
            hot = [l for l in pipeline_data if l.get("prospect_temperature") == "Hot"]
            briefing["hot_count"] = len(hot)
            briefing["pipeline_value"] = sum(l.get("estimated_deal_value", 5000) for l in hot)
        
        # Send briefing to all channels
        self.notifications.send_daily_briefing(briefing)
        
        # Save briefing
        output_file = INTEGRATIONS_DIR / f"morning_briefing_{datetime.now().strftime('%Y%m%d')}.json"
        output_file.write_text(json.dumps(briefing, indent=2, default=str))
        
        self._log_action("morning_intel_blast", {"date": briefing["date"]})
        return briefing
    
    def analyze_social_signal(self, text, source="reddit"):
        """
        AI-enhanced social signal analysis:
        1. Classify sentiment
        2. Classify buying intent
        3. Return enriched signal
        """
        sentiment = self.ai.classify_sentiment(text)
        intent = self.ai.classify_intent(text)
        
        return {
            "text": text[:500],
            "source": source,
            "sentiment": sentiment,
            "intent": intent,
            "analyzed_at": datetime.now().isoformat()
        }
    
    # ─── STATUS & DIAGNOSTICS ────────────────────────────────────────────────
    
    def status(self):
        """Check which integrations are active (have API keys configured)."""
        config = load_config()
        status = {"active": [], "inactive": [], "total": 0}
        
        for tier_name, tier in config.get("integrations", {}).items():
            for service_name, service in tier.items():
                status["total"] += 1
                env_vars = []
                for key, val in service.items():
                    if key.endswith("_env") and isinstance(val, str):
                        env_vars.append(val)
                
                active = any(has_key(ev) for ev in env_vars) if env_vars else False
                entry = {"name": service_name, "tier": tier_name, "description": service.get("description", ""),
                         "env_vars": env_vars, "active": active}
                
                if active:
                    status["active"].append(entry)
                else:
                    status["inactive"].append(entry)
        
        return status
    
    def print_status(self):
        """Pretty-print integration status."""
        s = self.status()
        print(f"\n{'='*60}")
        print(f"  NEXUS INTEGRATION HUB — {len(s['active'])}/{s['total']} Active")
        print(f"{'='*60}")
        
        print(f"\n  ✅ ACTIVE ({len(s['active'])})")
        for svc in s["active"]:
            print(f"     {svc['name']:20s} — {svc['description']}")
        
        print(f"\n  ⬚ INACTIVE ({len(s['inactive'])})")
        for svc in s["inactive"]:
            keys = ", ".join(svc["env_vars"])
            print(f"     {svc['name']:20s} — Set: {keys}")
        
        print(f"\n{'='*60}\n")


# ═══════════════════════════════════════════════════════════════════════════════
# CLI INTERFACE
# ═══════════════════════════════════════════════════════════════════════════════

def main():
    import sys
    hub = IntegrationHub()
    
    if len(sys.argv) < 2:
        print("""
NEXUS BDR Integration Hub — Commands:
  status                          Show active/inactive integrations
  enrich <domain>                 Deep-enrich a company
  verify <email>                  Run email through verification chain
  find-email <first> <last> <domain>  Find email across providers
  research <domain>               Firecrawl website research
  competitive <domain1,domain2>   Competitive intelligence scan
  gmaps <query>                   Discover leads via Google Maps
  notify <message>                Broadcast notification
  morning                         Run morning intelligence blast
  campaigns                       List outreach campaigns
  revenue <email>                 Get customer revenue (Stripe)
        """)
        return
    
    cmd = sys.argv[1]
    
    if cmd == "status":
        hub.print_status()
    
    elif cmd == "enrich" and len(sys.argv) > 2:
        domain = sys.argv[2]
        lead = {"domain": domain, "company_name": domain.split(".")[0].title()}
        result = hub.deep_enrich_lead(lead)
        output = INTEGRATIONS_DIR / f"enriched_{domain}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        output.write_text(json.dumps(result, indent=2, default=str))
        print(f"\n  ✅ Enrichment saved to {output}")
        print(json.dumps(result, indent=2, default=str)[:2000])
    
    elif cmd == "verify" and len(sys.argv) > 2:
        email = sys.argv[2]
        result = hub.email_chain.verify(email)
        print(json.dumps(result, indent=2))
    
    elif cmd == "find-email" and len(sys.argv) > 4:
        first, last, domain = sys.argv[2], sys.argv[3], sys.argv[4]
        result = hub.email_chain.find_email(first, last, domain)
        print(json.dumps(result, indent=2))
    
    elif cmd == "research" and len(sys.argv) > 2:
        domain = sys.argv[2]
        result = hub.firecrawl.research_company(domain)
        output = INTEGRATIONS_DIR / f"research_{domain}_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        output.write_text(json.dumps(result, indent=2, default=str))
        print(f"\n  ✅ Research saved to {output}")
    
    elif cmd == "competitive" and len(sys.argv) > 2:
        domains = sys.argv[2].split(",")
        hub.run_competitive_scan(domains)
    
    elif cmd == "gmaps" and len(sys.argv) > 2:
        query = " ".join(sys.argv[2:])
        result = hub.discover_leads_google_maps(query)
        print(json.dumps(result, indent=2, default=str)[:2000])
    
    elif cmd == "notify" and len(sys.argv) > 2:
        message = " ".join(sys.argv[2:])
        result = hub.notifications.broadcast(message)
        print(json.dumps(result, indent=2))
    
    elif cmd == "morning":
        # Load pipeline data
        scored_files = sorted(OUTPUT_DIR.glob("scored_apollo_*.json"), reverse=True)
        pipeline_data = []
        if scored_files:
            with open(scored_files[0]) as f:
                data = json.load(f)
                pipeline_data = data.get("leads", data) if isinstance(data, dict) else data
        result = hub.morning_intel_blast(pipeline_data)
        print(json.dumps(result, indent=2, default=str)[:2000])
    
    elif cmd == "campaigns":
        result = hub.outreach.get_instantly_campaigns()
        print(json.dumps(result, indent=2, default=str)[:2000])
    
    elif cmd == "revenue" and len(sys.argv) > 2:
        email = sys.argv[2]
        result = hub.revenue.get_customer_revenue(email)
        print(json.dumps(result, indent=2))
    
    else:
        print(f"  Unknown command: {cmd}")
        print("  Run without arguments to see available commands.")


if __name__ == "__main__":
    main()
