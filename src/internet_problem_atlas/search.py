from __future__ import annotations

from typing import Any


def search_problems(problems: list[dict[str, Any]], query: str, limit: int = 10) -> list[dict[str, Any]]:
    query_words = [word.lower() for word in query.split() if word.strip()]
    if not query_words:
        return []

    scored: list[tuple[int, dict[str, Any]]] = []
    for problem in problems:
        haystack = " ".join(
            [
                problem["problem_title"],
                problem["user_phrase"],
                problem["why_now_2026"],
                " ".join(problem["keywords"]),
            ]
        ).lower()
        match_score = sum(1 for word in query_words if word in haystack)
        if match_score:
            scored.append((match_score * 100 + problem["opportunity_score"], problem))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [problem for _, problem in scored[:limit]]
