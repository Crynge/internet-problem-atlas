from internet_problem_atlas.generator import build_summary, generate_problem_records
from internet_problem_atlas.search import search_problems


def test_problem_count_exceeds_one_thousand() -> None:
    problems = generate_problem_records()
    assert len(problems) >= 1000


def test_summary_reports_expected_vertical_count() -> None:
    problems = generate_problem_records()
    summary = build_summary(problems)
    assert summary["vertical_count"] >= 40
    assert summary["macro_theme_count"] >= 6


def test_search_returns_refund_related_results() -> None:
    problems = generate_problem_records()
    matches = search_problems(problems, "refund delay", limit=12)
    assert matches
    assert any("refund" in item["problem_title"].lower() for item in matches)


def test_top_problem_scores_are_sorted_high() -> None:
    problems = generate_problem_records()
    summary = build_summary(problems)
    assert summary["top_problems"][0]["opportunity_score"] >= summary["top_problems"][-1]["opportunity_score"]
