#!/usr/bin/env python3
"""
AutoResearch — Autonomous Agent Loop for BDR Intelligence
============================================================
Inspired by github.com/karpathy/autoresearch

Runs autonomous research experiments within a fixed budget (time + cost).
The agent iteratively:
  1. Picks a research target (company, signal, opportunity)
  2. Runs a research action (brief, scan, enrich)
  3. Evaluates the result against a metric (pipeline value delta)
  4. Decides whether to commit the result or discard it
  5. Repeats until budget exhausted

Key Karpathy insights applied:
  - Fixed time budget per experiment (like autoresearch's 5-min training runs)
  - Single evaluation metric (pipeline_value_delta instead of val_bpb)
  - Agent modifies strategy, not just parameters
  - Human sets direction via program.md, agent executes autonomously

Usage:
    python3 auto_research.py --budget-minutes 60 --max-cost 5.00
    python3 auto_research.py --budget-minutes 30 --strategy aggressive
    python3 auto_research.py --dry-run   # Show what it would do
"""

import os, sys, json, time, argparse, subprocess
from datetime import datetime, timedelta
from pathlib import Path
from model_router import routed_call, tracker, parse_json_response

SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR / "outputs"
AUTO_DIR = OUTPUT_DIR / "auto_research"
AUTO_DIR.mkdir(parents=True, exist_ok=True)

EXPERIMENT_LOG = AUTO_DIR / "experiments.jsonl"
BASELINE_FILE = AUTO_DIR / "baseline.json"


def load_baseline():
    """Load or initialize the baseline metric."""
    if BASELINE_FILE.exists():
        return json.loads(BASELINE_FILE.read_text())
    return {
        "pipeline_value": 0,
        "signals_found": 0,
        "accounts_enriched": 0,
        "briefs_generated": 0,
        "timestamp": datetime.utcnow().isoformat(),
    }


def save_baseline(baseline):
    """Save current baseline."""
    BASELINE_FILE.write_text(json.dumps(baseline, indent=2))


def log_experiment(experiment):
    """Append experiment to log."""
    with open(EXPERIMENT_LOG, "a") as f:
        f.write(json.dumps(experiment, default=str) + "\n")


def measure_pipeline_state():
    """Measure current pipeline state as a single metric."""
    war_room_path = OUTPUT_DIR / "war_room" / "knowledge_graph" / "war_room_graph.json"
    state = {
        "pipeline_value": 0,
        "signals_found": 0,
        "accounts_enriched": 0,
        "briefs_generated": 0,
    }

    if war_room_path.exists():
        try:
            g = json.loads(war_room_path.read_text())
            entities = g.get("entities", {})
            signals = g.get("signals", [])
            state["signals_found"] = len(signals)
            state["accounts_enriched"] = sum(
                1 for e in entities.values()
                if e.get("type") in ("company", "competitor") and e.get("data", {}).get("enriched")
            )
        except Exception:
            pass

    # Count briefs
    briefs_dir = OUTPUT_DIR / "briefs"
    if briefs_dir.exists():
        state["briefs_generated"] = len(list(briefs_dir.glob("*.json")))

    # Estimate pipeline value from scored leads
    for f in sorted(OUTPUT_DIR.glob("scored_*.json"), reverse=True)[:1]:
        try:
            data = json.loads(f.read_text())
            leads = data.get("leads", [])
            state["pipeline_value"] = sum(
                l.get("estimated_value", 0) for l in leads if l.get("tier") in ("hot", "warm")
            )
        except Exception:
            pass

    return state


def compute_delta(before, after):
    """Compute improvement delta as a single score."""
    delta = 0
    delta += (after["signals_found"] - before["signals_found"]) * 1       # 1 pt per signal
    delta += (after["accounts_enriched"] - before["accounts_enriched"]) * 5  # 5 pts per enriched account
    delta += (after["briefs_generated"] - before["briefs_generated"]) * 10   # 10 pts per brief
    delta += (after["pipeline_value"] - before["pipeline_value"]) * 0.001    # 0.001 pts per $ of pipeline
    return round(delta, 2)


# Available autonomous actions
ACTIONS = [
    {
        "id": "signal_scan",
        "description": "Scan for new buying signals across watchlist",
        "script": "trigger_monitor.py",
        "args": ["--scan-all", "--max", "10"],
        "cost_estimate": 0.05,
        "time_estimate_s": 120,
    },
    {
        "id": "social_scan",
        "description": "Harvest Reddit and social signals",
        "script": "social_intel_engine_v2.py",
        "args": ["--scan", "--reddit"],
        "cost_estimate": 0.10,
        "time_estimate_s": 180,
    },
    {
        "id": "competitor_scan",
        "description": "Scan competitor vulnerabilities",
        "script": "competitor_vuln_v2.py",
        "args": ["--scan"],
        "cost_estimate": 0.15,
        "time_estimate_s": 240,
    },
    {
        "id": "war_room_ingest",
        "description": "Ingest new data into war room knowledge graph",
        "script": "war_room_v2.py",
        "args": ["--ingest"],
        "cost_estimate": 0.02,
        "time_estimate_s": 60,
    },
    {
        "id": "war_room_decide",
        "description": "Run decision engine on current state",
        "script": "war_room_v2.py",
        "args": ["--decide"],
        "cost_estimate": 0.10,
        "time_estimate_s": 120,
    },
    {
        "id": "research_harvest",
        "description": "Harvest latest terpene research from PubMed",
        "script": "terpene_research_v2.py",
        "args": ["--harvest", "--days", "7"],
        "cost_estimate": 0.20,
        "time_estimate_s": 300,
    },
]


def pick_action(remaining_budget, remaining_time_s, history, strategy="balanced"):
    """Use LLM to pick the best next action given current state."""
    history_str = "\n".join(
        f"  - {h['action']}: delta={h['delta']}, cost=${h['cost']:.3f}, {h['duration_s']:.0f}s"
        for h in history[-10:]
    ) or "  (no history yet)"

    actions_str = "\n".join(
        f"  - {a['id']}: {a['description']} (est. ${a['cost_estimate']:.2f}, ~{a['time_estimate_s']}s)"
        for a in ACTIONS
        if a["cost_estimate"] <= remaining_budget and a["time_estimate_s"] <= remaining_time_s
    )

    if not actions_str:
        return None

    prompt = f"""You are an autonomous BDR research agent. Pick the best next action.

STRATEGY: {strategy}
BUDGET REMAINING: ${remaining_budget:.2f}
TIME REMAINING: {remaining_time_s:.0f}s

AVAILABLE ACTIONS:
{actions_str}

RECENT HISTORY (action: improvement_delta):
{history_str}

Rules:
- Pick the action with highest expected delta per dollar
- If a recent action had negative or zero delta, don't repeat it
- Favor diversity — don't run the same action twice in a row
- Strategy "aggressive" = prioritize high-delta actions regardless of cost
- Strategy "conservative" = prioritize cheap, reliable actions
- Strategy "balanced" = optimize delta per dollar

Respond with ONLY the action id (e.g., "signal_scan"). Nothing else."""

    response = routed_call(
        phase="scoring",
        system_prompt="You are a decision engine. Respond with a single action id.",
        user_prompt=prompt,
    )

    action_id = response.strip().lower().replace('"', '').replace("'", "")
    for a in ACTIONS:
        if a["id"] == action_id:
            return a

    # Fallback: pick cheapest available
    available = [a for a in ACTIONS if a["cost_estimate"] <= remaining_budget and a["time_estimate_s"] <= remaining_time_s]
    return available[0] if available else None


def run_action(action):
    """Execute an action and return the result."""
    script_path = SCRIPT_DIR / action["script"]
    if not script_path.exists():
        return {"success": False, "error": f"Script not found: {action['script']}"}

    start = time.time()
    try:
        result = subprocess.run(
            ["python3", str(script_path)] + action["args"],
            capture_output=True, text=True, timeout=600,
            env={**os.environ}, cwd=str(SCRIPT_DIR.parent),
        )
        duration = time.time() - start
        return {
            "success": result.returncode == 0,
            "output": result.stdout[-1000:],
            "error": result.stderr[-500:] if result.returncode != 0 else "",
            "duration_s": round(duration, 1),
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Timeout after 600s", "duration_s": 600}
    except Exception as e:
        return {"success": False, "error": str(e), "duration_s": time.time() - start}


def run_autonomous_loop(budget_minutes=60, max_cost=5.0, strategy="balanced", dry_run=False):
    """
    Main autonomous loop. Runs until budget exhausted.

    This is the core Karpathy autoresearch pattern:
    - Fixed time budget (like 5-min training runs)
    - Single evaluation metric (pipeline_value_delta)
    - Agent picks actions, evaluates results, iterates
    """
    deadline = time.time() + budget_minutes * 60
    cost_spent = 0
    history = []
    experiment_num = 0

    print(f"\n{'='*60}")
    print(f"  NEXUS AUTORESEARCH — Autonomous BDR Intelligence Loop")
    print(f"{'='*60}")
    print(f"  Budget: {budget_minutes} minutes / ${max_cost:.2f}")
    print(f"  Strategy: {strategy}")
    print(f"  Dry run: {dry_run}")
    print(f"{'='*60}\n")

    baseline = load_baseline()
    before_state = measure_pipeline_state()

    while True:
        remaining_time = deadline - time.time()
        remaining_budget = max_cost - cost_spent

        if remaining_time <= 0:
            print(f"\n  [TIME] Budget exhausted. {experiment_num} experiments completed.")
            break
        if remaining_budget <= 0:
            print(f"\n  [$$$] Cost budget exhausted. {experiment_num} experiments completed.")
            break

        # Pick next action
        action = pick_action(remaining_budget, remaining_time, history, strategy)
        if action is None:
            print(f"\n  [END] No actions fit remaining budget. {experiment_num} experiments completed.")
            break

        experiment_num += 1
        print(f"\n  ── Experiment #{experiment_num}: {action['id']} ──")
        print(f"     {action['description']}")
        print(f"     Budget: {remaining_time/60:.1f}m / ${remaining_budget:.2f} remaining")

        if dry_run:
            print(f"     [DRY RUN] Would execute: {action['script']} {' '.join(action['args'])}")
            history.append({"action": action["id"], "delta": 0, "cost": 0, "duration_s": 0})
            time.sleep(1)  # Simulate
            continue

        # Measure before
        state_before = measure_pipeline_state()

        # Execute
        result = run_action(action)

        # Measure after
        state_after = measure_pipeline_state()
        delta = compute_delta(state_before, state_after)

        # Track cost
        action_cost = sum(
            c["cost_est"] for c in tracker.calls
            if c["time"] >= datetime.utcnow().isoformat()[:10]
        )[-1:] or [0]
        est_cost = action.get("cost_estimate", 0.05)
        cost_spent += est_cost

        experiment = {
            "num": experiment_num,
            "action": action["id"],
            "success": result.get("success", False),
            "delta": delta,
            "cost": est_cost,
            "duration_s": result.get("duration_s", 0),
            "state_before": state_before,
            "state_after": state_after,
            "timestamp": datetime.utcnow().isoformat(),
        }
        log_experiment(experiment)
        history.append(experiment)

        status = "+" if delta > 0 else ("=" if delta == 0 else "-")
        print(f"     Result: [{status}] delta={delta:+.1f} | ${est_cost:.3f} | {result.get('duration_s', 0):.0f}s")

        if not result.get("success"):
            print(f"     Error: {result.get('error', 'unknown')[:100]}")

    # Final summary
    total_delta = compute_delta(before_state, measure_pipeline_state())
    print(f"\n{'='*60}")
    print(f"  AUTORESEARCH COMPLETE")
    print(f"{'='*60}")
    print(f"  Experiments: {experiment_num}")
    print(f"  Total delta: {total_delta:+.1f}")
    print(f"  Total cost:  ${cost_spent:.3f}")
    if cost_spent > 0:
        print(f"  Delta/dollar: {total_delta/cost_spent:.1f}")
    print(f"  Strategy: {strategy}")
    print(f"{'='*60}\n")

    # Save updated baseline
    save_baseline(measure_pipeline_state())

    return {
        "experiments": experiment_num,
        "total_delta": total_delta,
        "total_cost": cost_spent,
        "history": history,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AutoResearch — Autonomous BDR Intelligence Loop")
    parser.add_argument("--budget-minutes", type=int, default=60, help="Time budget in minutes")
    parser.add_argument("--max-cost", type=float, default=5.0, help="Maximum API cost in USD")
    parser.add_argument("--strategy", choices=["aggressive", "balanced", "conservative"], default="balanced")
    parser.add_argument("--dry-run", action="store_true", help="Show actions without executing")
    args = parser.parse_args()

    run_autonomous_loop(
        budget_minutes=args.budget_minutes,
        max_cost=args.max_cost,
        strategy=args.strategy,
        dry_run=args.dry_run,
    )
