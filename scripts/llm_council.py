#!/usr/bin/env python3
"""
LLM Council — Multi-Model Consensus for High-Stakes BDR Decisions
===================================================================
Inspired by github.com/karpathy/llm-council

Instead of trusting a single LLM for critical decisions (deal scoring,
outreach strategy, competitive positioning), we assemble a "council"
of diverse models that independently evaluate, cross-review, and
synthesize a consensus answer.

Three-Stage Process:
  Stage 1: Independent Responses — each model answers independently
  Stage 2: Peer Review — models anonymously rank each other's answers
  Stage 3: Synthesis — chairman model produces final consensus

Usage:
    from llm_council import Council
    council = Council()
    result = council.deliberate(
        question="Should we position DFT vs CDT for Mellow Fellow's edible line?",
        context={"company": "Mellow Fellow", "products": "edibles", ...},
        decision_type="positioning"
    )
    print(result["consensus"])
    print(result["confidence"])
    print(result["dissenting_views"])
"""

import json, time, hashlib
from datetime import datetime
from model_router import routed_call, tracker, parse_json_response, MODELS

# Council member configurations — diverse models for diverse perspectives
COUNCIL_MEMBERS = [
    {"id": "analyst", "tier": "reasoning", "persona": "You are a sharp market analyst. Focus on data, competitive dynamics, and market positioning. Be quantitative."},
    {"id": "strategist", "tier": "premium", "persona": "You are a B2B sales strategist. Focus on relationship building, objection handling, and deal velocity. Be practical."},
    {"id": "researcher", "tier": "research", "persona": "You are a domain expert in terpenes and botanical products. Focus on technical accuracy, regulatory compliance, and product-market fit."},
]

CHAIRMAN_TIER = "premium"

# Decision types that warrant council deliberation (high-stakes only)
COUNCIL_WORTHY = {
    "positioning",       # How to position product for a specific account
    "deal_strategy",     # Which deal structure / pricing to propose
    "outreach_angle",    # What message angle for first contact
    "competitive_play",  # How to displace a specific competitor
    "qualification",     # Whether an account is worth pursuing
    "risk_assessment",   # Regulatory or reputational risk evaluation
}


class Council:
    """Multi-model deliberation for high-stakes BDR decisions."""

    def __init__(self, members=None, chairman_tier=None):
        self.members = members or COUNCIL_MEMBERS
        self.chairman_tier = chairman_tier or CHAIRMAN_TIER
        self.deliberation_log = []

    def deliberate(self, question, context=None, decision_type="general"):
        """
        Run a full three-stage council deliberation.

        Returns:
            {
                "consensus": str,           # Final synthesized answer
                "confidence": float,        # 0-1 consensus confidence
                "dissenting_views": list,   # Minority opinions worth noting
                "member_responses": list,   # Individual responses
                "rankings": list,           # Peer review rankings
                "cost_usd": float,          # Total cost of deliberation
                "duration_s": float,        # Wall-clock time
            }
        """
        start = time.time()
        ctx_str = json.dumps(context, default=str, indent=2) if context else "No additional context."

        # ── Stage 1: Independent Responses ──
        responses = []
        for member in self.members:
            prompt = f"""QUESTION: {question}

CONTEXT:
{ctx_str}

Provide your analysis and recommendation. Be specific and actionable.
Structure your response as:
1. KEY INSIGHT (one sentence)
2. RECOMMENDATION (what to do)
3. REASONING (why, with evidence)
4. RISKS (what could go wrong)
5. CONFIDENCE (1-10)"""

            text = routed_call(
                phase=f"council_{member['id']}",
                system_prompt=member["persona"],
                user_prompt=prompt,
            )
            responses.append({"member": member["id"], "response": text})

        # ── Stage 2: Peer Review (Anonymous) ──
        rankings = []
        for i, reviewer in enumerate(self.members):
            other_responses = ""
            for j, resp in enumerate(responses):
                if j != i:
                    label = chr(65 + j)  # A, B, C...
                    other_responses += f"\n--- Response {label} ---\n{resp['response']}\n"

            review_prompt = f"""You are reviewing anonymous responses to this question:
QUESTION: {question}

Here are the responses from other analysts:
{other_responses}

Rank these responses by accuracy and insight. For each, give a score 1-10 and brief justification.
Respond as JSON: {{"rankings": [{{"label": "A", "score": 8, "justification": "..."}}]}}"""

            review_text = routed_call(
                phase=f"council_{reviewer['id']}",
                system_prompt="You are a critical peer reviewer. Be honest and specific about strengths and weaknesses.",
                user_prompt=review_prompt,
            )
            parsed = parse_json_response(review_text)
            if parsed:
                rankings.append({"reviewer": reviewer["id"], "rankings": parsed.get("rankings", [])})

        # ── Stage 3: Synthesis (Chairman) ──
        all_responses = ""
        for r in responses:
            all_responses += f"\n--- {r['member'].upper()} ---\n{r['response']}\n"

        review_summary = ""
        if rankings:
            review_summary = "\nPEER REVIEW SUMMARY:\n"
            for rank in rankings:
                review_summary += f"  Reviewer {rank['reviewer']}:\n"
                for r in rank.get("rankings", []):
                    review_summary += f"    {r.get('label', '?')}: {r.get('score', '?')}/10 — {r.get('justification', '')}\n"

        synthesis_prompt = f"""You are the chairman synthesizing a council deliberation.

ORIGINAL QUESTION: {question}

CONTEXT:
{ctx_str}

COUNCIL RESPONSES:
{all_responses}
{review_summary}

Synthesize the best elements of all responses into a single, actionable recommendation.

Respond as JSON:
{{
    "consensus": "The unified recommendation (2-3 paragraphs, actionable)",
    "confidence": 0.85,
    "key_points": ["point 1", "point 2", "point 3"],
    "dissenting_views": ["any important minority opinions worth noting"],
    "recommended_action": "Single next step",
    "risk_mitigation": "How to handle the main risk"
}}"""

        synthesis_text = routed_call(
            phase="phase_6_synthesis",
            system_prompt="You are a senior decision-maker synthesizing diverse expert opinions into clear, actionable guidance.",
            user_prompt=synthesis_prompt,
        )
        synthesis = parse_json_response(synthesis_text) or {
            "consensus": synthesis_text,
            "confidence": 0.5,
            "key_points": [],
            "dissenting_views": [],
        }

        duration = time.time() - start
        cost = sum(c["cost_est"] for c in tracker.calls[-len(self.members)*2 - 1:])

        result = {
            "question": question,
            "decision_type": decision_type,
            "consensus": synthesis.get("consensus", ""),
            "confidence": synthesis.get("confidence", 0.5),
            "key_points": synthesis.get("key_points", []),
            "dissenting_views": synthesis.get("dissenting_views", []),
            "recommended_action": synthesis.get("recommended_action", ""),
            "risk_mitigation": synthesis.get("risk_mitigation", ""),
            "member_responses": responses,
            "rankings": rankings,
            "cost_usd": round(cost, 4),
            "duration_s": round(duration, 1),
            "timestamp": datetime.utcnow().isoformat(),
        }

        self.deliberation_log.append(result)
        return result

    def quick_check(self, question, context=None):
        """
        Lightweight check: is this decision council-worthy?
        Returns True if the stakes justify multi-model deliberation.
        """
        high_value_signals = [
            "should we", "best approach", "how to position",
            "risk", "competitor", "pricing", "strategy",
            "displacement", "qualify", "worth pursuing",
        ]
        q_lower = question.lower()
        return any(sig in q_lower for sig in high_value_signals)


# Update PHASE_ROUTING to include council tiers
from model_router import PHASE_ROUTING
PHASE_ROUTING.update({
    "council_analyst": "reasoning",
    "council_strategist": "premium",
    "council_researcher": "research",
})


if __name__ == "__main__":
    print("\n  === LLM Council — Karpathy-Inspired Multi-Model Consensus ===\n")
    print("  Usage:")
    print("    from llm_council import Council")
    print("    council = Council()")
    print('    result = council.deliberate("Should we target Mellow Fellow with DFT?")')
    print("\n  Council Members:")
    for m in COUNCIL_MEMBERS:
        tier = MODELS.get(m["tier"], {})
        print(f"    {m['id']:12s} → {tier.get('label', m['tier']):15s} | ${tier.get('cost_per_1m_in', 0):.2f}/1M tok")
    print()
