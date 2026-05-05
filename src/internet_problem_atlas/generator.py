from __future__ import annotations

from collections import Counter
from pathlib import Path
from typing import Any

from .catalog import ARCHETYPES, SOURCES, VERTICALS


def _vertical_modifier(index: int) -> float:
    return 0.84 + (index % 7) * 0.035


def _clamp_score(value: float) -> int:
    return max(1, min(100, round(value)))


def generate_problem_records() -> list[dict[str, Any]]:
    problems: list[dict[str, Any]] = []

    for vertical_index, (vertical_slug, vertical_label, sector) in enumerate(VERTICALS):
        modifier = _vertical_modifier(vertical_index)
        for archetype_index, archetype in enumerate(ARCHETYPES):
            severity = _clamp_score(archetype["severity"] * modifier)
            urgency = _clamp_score(archetype["urgency"] * (0.9 + (archetype_index % 5) * 0.03))
            frequency = _clamp_score(archetype["frequency"] * (0.92 + (vertical_index % 4) * 0.025))
            opportunity = _clamp_score((severity * 0.34) + (urgency * 0.23) + (frequency * 0.20) + (archetype["opportunity"] * 0.23))
            ai_fit = _clamp_score(archetype["ai_fit"] * (0.94 + (vertical_index % 3) * 0.03))

            problem_id = f"{vertical_slug}--{archetype['slug']}"
            title = archetype["title"].format(vertical_label=vertical_label)
            phrase = archetype["phrase"].format(vertical_label=vertical_label)
            keywords = [
                vertical_slug,
                vertical_label.lower(),
                archetype["slug"].replace("_", " "),
                archetype["macro_theme"],
                sector,
            ]

            problems.append(
                {
                    "id": problem_id,
                    "vertical_slug": vertical_slug,
                    "vertical": vertical_label,
                    "sector": sector,
                    "macro_theme": archetype["macro_theme"],
                    "problem_slug": archetype["slug"],
                    "problem_title": title,
                    "user_phrase": phrase,
                    "why_now_2026": archetype["why_now"],
                    "severity_score": severity,
                    "urgency_score": urgency,
                    "frequency_score": frequency,
                    "opportunity_score": opportunity,
                    "ai_fit_score": ai_fit,
                    "evidence_sources": archetype["sources"],
                    "evidence_links": [SOURCES[source_id]["url"] for source_id in archetype["sources"]],
                    "solution_direction": archetype["solution"],
                    "keywords": keywords,
                }
            )

    return problems


def build_summary(problems: list[dict[str, Any]]) -> dict[str, Any]:
    macro_counts = Counter(problem["macro_theme"] for problem in problems)
    vertical_counts = Counter(problem["vertical"] for problem in problems)
    top_problems = sorted(
        problems,
        key=lambda item: (item["opportunity_score"], item["severity_score"], item["urgency_score"]),
        reverse=True,
    )[:30]

    return {
        "generated_at": "2026-05-06",
        "total_problems": len(problems),
        "vertical_count": len(vertical_counts),
        "macro_theme_count": len(macro_counts),
        "macro_theme_counts": dict(macro_counts),
        "average_opportunity_score": round(sum(item["opportunity_score"] for item in problems) / len(problems), 2),
        "average_ai_fit_score": round(sum(item["ai_fit_score"] for item in problems) / len(problems), 2),
        "top_problems": top_problems,
        "sources": SOURCES,
    }


def ensure_parent(path: str | Path) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
