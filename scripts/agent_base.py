#!/usr/bin/env python3
"""
Agent Base Classes — Clean Inheritance Hierarchy for BDR Agents
================================================================
Inspired by github.com/karpathy/minbpe

Karpathy's minbpe uses a clean base class (Tokenizer) with shared
functionality, then specialized implementations (Basic, Regex, GPT4)
that override only what differs. We apply the same pattern to agents.

The base Agent class handles:
  - Output directory management
  - JSON load/save
  - Logging
  - Cost tracking
  - Common CLI argument parsing

Specialized agents override only their core logic:
  - ResearchAgent.execute() → harvests and analyzes papers
  - IntelAgent.execute() → scans signals and competitors
  - OutreachAgent.execute() → generates messaging
  - PipelineAgent.execute() → manages CRM and enrichment

Usage:
    class MyAgent(IntelAgent):
        name = "my_scanner"
        description = "Scans something useful"

        def execute(self, **kwargs):
            data = self.scan_source(...)
            self.save_output("scan_results.json", data)
            return data

Also implements nanoGPT-style "single dial" configuration:
    --depth controls model quality, cost, and thoroughness
    depth=1 → cheap/fast    (Llama 8B, minimal passes)
    depth=2 → balanced      (Llama 70B, standard passes)
    depth=3 → thorough      (DeepSeek, extra analysis)
    depth=4 → premium       (Claude, full analysis + synthesis)

Like nanoGPT's single `--depth` that computes width, heads, lr, etc.
"""

import os, sys, json, time, argparse
from datetime import datetime
from pathlib import Path
from abc import ABC, abstractmethod

SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR / "outputs"


# ═══════════════════════════════════════════════════════════
# nanoGPT-STYLE SINGLE DIAL CONFIG
# ═══════════════════════════════════════════════════════════
# One number controls everything — like nanoGPT's --depth

DEPTH_CONFIGS = {
    1: {
        "tier": "cheap",
        "max_tokens": 2048,
        "passes": 1,
        "label": "fast",
        "description": "Quick scan, minimal cost (~$0.01)",
    },
    2: {
        "tier": "research",
        "max_tokens": 4096,
        "passes": 2,
        "label": "balanced",
        "description": "Standard analysis (~$0.05-0.15)",
    },
    3: {
        "tier": "reasoning",
        "max_tokens": 8192,
        "passes": 3,
        "label": "thorough",
        "description": "Deep analysis with reasoning (~$0.15-0.50)",
    },
    4: {
        "tier": "premium",
        "max_tokens": 8192,
        "passes": 4,
        "label": "premium",
        "description": "Full Claude analysis + synthesis (~$0.50-2.00)",
    },
}


def get_depth_config(depth):
    """Get all config from a single depth parameter."""
    depth = max(1, min(4, depth))
    return DEPTH_CONFIGS[depth]


# ═══════════════════════════════════════════════════════════
# BASE AGENT CLASS (like minbpe's Tokenizer)
# ═══════════════════════════════════════════════════════════

class Agent(ABC):
    """
    Base class for all Nexus BDR agents.

    Provides shared infrastructure: output management, logging,
    cost tracking, and CLI argument parsing. Subclasses override
    execute() with their specific logic.
    """

    name = "base_agent"
    description = "Base agent"
    version = "1.0"

    def __init__(self, depth=2, output_dir=None):
        self.depth = depth
        self.config = get_depth_config(depth)
        self.output_dir = Path(output_dir) if output_dir else OUTPUT_DIR / self.name
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.log_entries = []
        self.start_time = None
        self.results = {}

    def log(self, message, level="info"):
        """Log a message with timestamp."""
        ts = datetime.utcnow().strftime("%H:%M:%S")
        entry = {"time": ts, "level": level, "message": message}
        self.log_entries.append(entry)
        prefix = {"info": "  ", "warn": "  ⚠️", "error": "  ❌", "ok": "  ✓"}
        print(f"  [{ts}] {prefix.get(level, '  ')} {message}")

    def save_output(self, filename, data):
        """Save JSON output to the agent's output directory."""
        path = self.output_dir / filename
        path.write_text(json.dumps(data, indent=2, default=str))
        self.log(f"Saved: {path.name} ({path.stat().st_size:,} bytes)")
        return path

    def load_output(self, filename):
        """Load JSON from the agent's output directory."""
        path = self.output_dir / filename
        if path.exists():
            return json.loads(path.read_text())
        return None

    def run(self, **kwargs):
        """
        Run the agent with timing and error handling.
        This is the public API — subclasses override execute().
        """
        self.start_time = time.time()
        self.log(f"{self.name} v{self.version} starting (depth={self.depth}, {self.config['label']})")

        try:
            self.results = self.execute(**kwargs) or {}
            duration = time.time() - self.start_time
            self.log(f"Completed in {duration:.1f}s", "ok")
        except Exception as e:
            duration = time.time() - self.start_time
            self.log(f"Failed after {duration:.1f}s: {e}", "error")
            self.results = {"error": str(e)}

        # Save run metadata
        meta = {
            "agent": self.name,
            "version": self.version,
            "depth": self.depth,
            "config": self.config["label"],
            "duration_s": round(duration, 1),
            "timestamp": datetime.utcnow().isoformat(),
            "log": self.log_entries,
            "success": "error" not in self.results,
        }
        self.save_output(f"_last_run.json", meta)

        return self.results

    @abstractmethod
    def execute(self, **kwargs):
        """Override this with agent-specific logic."""
        pass

    @classmethod
    def cli(cls):
        """Standard CLI interface — all agents get --depth for free."""
        parser = argparse.ArgumentParser(description=f"{cls.name}: {cls.description}")
        parser.add_argument("--depth", type=int, default=2, choices=[1, 2, 3, 4],
                          help="Analysis depth: 1=fast, 2=balanced, 3=thorough, 4=premium")
        parser.add_argument("--output-dir", type=str, default=None)
        cls.add_arguments(parser)  # Subclass-specific args
        args = parser.parse_args()

        agent = cls(depth=args.depth, output_dir=args.output_dir)
        kwargs = {k: v for k, v in vars(args).items() if k not in ("depth", "output_dir")}
        return agent.run(**kwargs)

    @classmethod
    def add_arguments(cls, parser):
        """Override to add subclass-specific CLI arguments."""
        pass


# ═══════════════════════════════════════════════════════════
# SPECIALIZED AGENT TYPES (like minbpe's Basic/Regex/GPT4)
# ═══════════════════════════════════════════════════════════

class ResearchAgent(Agent):
    """Base for agents that harvest and analyze external data."""

    def execute(self, **kwargs):
        sources = self.discover_sources(**kwargs)
        raw_data = self.harvest(sources)
        analyzed = self.analyze(raw_data)
        return analyzed

    def discover_sources(self, **kwargs):
        """Override: find data sources to harvest."""
        return []

    def harvest(self, sources):
        """Override: collect raw data from sources."""
        return []

    def analyze(self, raw_data):
        """Override: analyze harvested data."""
        return {"raw_count": len(raw_data), "data": raw_data}


class IntelAgent(Agent):
    """Base for agents that scan for signals and competitive intelligence."""

    def execute(self, **kwargs):
        targets = self.identify_targets(**kwargs)
        signals = []
        for target in targets[:self.config["passes"] * 5]:  # depth controls breadth
            target_signals = self.scan_target(target)
            signals.extend(target_signals)
        scored = self.score_signals(signals)
        return {"signals": scored, "targets_scanned": len(targets)}

    def identify_targets(self, **kwargs):
        """Override: identify what to scan."""
        return []

    def scan_target(self, target):
        """Override: scan a single target for signals."""
        return []

    def score_signals(self, signals):
        """Override: score and rank signals."""
        return sorted(signals, key=lambda s: s.get("score", 0), reverse=True)


class OutreachAgent(Agent):
    """Base for agents that generate messaging and content."""

    def execute(self, **kwargs):
        context = self.gather_context(**kwargs)
        drafts = self.generate_drafts(context)
        if self.depth >= 3:
            drafts = self.refine_drafts(drafts, context)
        return {"drafts": drafts, "context_used": list(context.keys())}

    def gather_context(self, **kwargs):
        """Override: gather context needed for messaging."""
        return {}

    def generate_drafts(self, context):
        """Override: generate message drafts."""
        return []

    def refine_drafts(self, drafts, context):
        """Override: refine drafts with additional passes (depth >= 3)."""
        return drafts


class PipelineAgent(Agent):
    """Base for agents that manage CRM, enrichment, and pipeline operations."""

    def execute(self, **kwargs):
        records = self.load_records(**kwargs)
        processed = self.process_records(records)
        synced = self.sync_records(processed)
        return {"records_in": len(records), "records_out": len(synced)}

    def load_records(self, **kwargs):
        """Override: load records to process."""
        return []

    def process_records(self, records):
        """Override: transform/enrich records."""
        return records

    def sync_records(self, records):
        """Override: sync records to CRM."""
        return records


# ═══════════════════════════════════════════════════════════
# micrograd-STYLE COMPOSABLE SCORING
# ═══════════════════════════════════════════════════════════
# Like micrograd's Value class that chains operations with gradients,
# SignalScore chains scoring operations with attribution tracking.

class SignalScore:
    """
    Composable signal score with attribution tracking.

    Inspired by micrograd: each operation records what contributed
    to the final score, enabling "gradient-like" attribution for
    understanding which factors drive lead quality.

    Usage:
        score = SignalScore(0.5, "base_score")
        score = score * SignalScore(0.9, "reliability")
        score = score + SignalScore(0.3, "hiring_signal")
        score = score.decay(days=14, half_life=30)
        print(score.value)        # Final numeric score
        print(score.attribution)  # What contributed and how much
    """

    def __init__(self, value, label="", children=None):
        self.value = value
        self.label = label
        self.children = children or []
        self._op = ""

    def __add__(self, other):
        other = other if isinstance(other, SignalScore) else SignalScore(other, "constant")
        out = SignalScore(self.value + other.value, f"({self.label} + {other.label})", [self, other])
        out._op = "+"
        return out

    def __mul__(self, other):
        other = other if isinstance(other, SignalScore) else SignalScore(other, "constant")
        out = SignalScore(self.value * other.value, f"({self.label} * {other.label})", [self, other])
        out._op = "*"
        return out

    def __radd__(self, other):
        return self.__add__(other)

    def __rmul__(self, other):
        return self.__mul__(other)

    def decay(self, days, half_life=14):
        """Apply exponential decay (like signal strength over time)."""
        import math
        factor = 0.5 ** (days / half_life)
        out = SignalScore(
            self.value * factor,
            f"decay({self.label}, {days}d/{half_life}d hl)",
            [self],
        )
        out._op = "decay"
        return out

    def clamp(self, low=0.0, high=1.0):
        """Clamp value to range."""
        out = SignalScore(max(low, min(high, self.value)), f"clamp({self.label})", [self])
        out._op = "clamp"
        return out

    @property
    def attribution(self):
        """Walk the computation graph to build attribution."""
        if not self.children:
            return {self.label: self.value}

        attrs = {}
        for child in self.children:
            for k, v in child.attribution.items():
                if k in attrs:
                    attrs[k] += v
                else:
                    attrs[k] = v
        return attrs

    def __repr__(self):
        return f"SignalScore({self.value:.4f}, '{self.label}')"


def score_lead(lead_data, signal_taxonomy=None):
    """
    Score a lead using composable SignalScore operations.

    This replaces hardcoded scoring with a transparent, attributable
    computation graph — you can see exactly why a lead got its score.
    """
    from reef_server import SIGNAL_TAXONOMY
    taxonomy = signal_taxonomy or SIGNAL_TAXONOMY

    # Base score from lead tier
    tier = lead_data.get("tier", "cold")
    base = SignalScore({"hot": 0.8, "warm": 0.6, "cool": 0.4, "cold": 0.2}.get(tier, 0.3), "tier_base")

    # Contact quality
    contacts = lead_data.get("contacts", 0)
    contact_score = SignalScore(min(1.0, contacts / 10), "contact_coverage")

    # Email verification
    verified = lead_data.get("verified_emails", 0)
    email_score = SignalScore(min(1.0, verified / 3), "email_quality")

    # Signal strength (aggregate from any attached signals)
    signal_total = SignalScore(0, "signals_base")
    for sig in lead_data.get("signals", []):
        sig_type = sig.get("type", "unknown")
        tax = taxonomy.get(sig_type, {"reliability_prior": 0.5, "decay_half_life_days": 14})
        raw = SignalScore(sig.get("strength", 5) / 10, f"signal_{sig_type}")
        reliable = raw * SignalScore(tax["reliability_prior"], f"reliability_{sig_type}")

        days_old = sig.get("age_days", 0)
        decayed = reliable.decay(days_old, tax["decay_half_life_days"])
        signal_total = signal_total + decayed

    # Compose final score
    final = (base * SignalScore(0.3, "base_weight")
             + contact_score * SignalScore(0.2, "contact_weight")
             + email_score * SignalScore(0.15, "email_weight")
             + signal_total * SignalScore(0.35, "signal_weight"))

    return final.clamp(0, 1)


if __name__ == "__main__":
    print("\n  === Nexus Agent Base Classes ===\n")
    print("  Depth configs (nanoGPT-style single dial):")
    for d, cfg in DEPTH_CONFIGS.items():
        print(f"    depth={d}: {cfg['label']:10s} | tier={cfg['tier']:10s} | passes={cfg['passes']} | {cfg['description']}")

    print("\n  Agent hierarchy (minbpe-style):")
    print("    Agent (base)")
    print("    ├── ResearchAgent    → harvest + analyze external data")
    print("    ├── IntelAgent       → scan + score signals")
    print("    ├── OutreachAgent    → generate + refine messaging")
    print("    └── PipelineAgent    → load + process + sync records")

    print("\n  SignalScore example (micrograd-style composable scoring):")
    s = SignalScore(0.7, "base")
    s = s * SignalScore(0.9, "reliability")
    s = s + SignalScore(0.3, "hiring_signal")
    s = s.decay(days=7, half_life=14)
    print(f"    Score: {s.value:.4f}")
    print(f"    Attribution: {s.attribution}")
    print()
