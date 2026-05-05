from __future__ import annotations

from pathlib import Path

from internet_problem_atlas.generator import build_summary, generate_problem_records
from internet_problem_atlas.reporting import write_csv, write_json


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    problems = generate_problem_records()
    summary = build_summary(problems)

    public_dir = root / "apps" / "web" / "public"
    results_dir = root / "results"
    public_dir.mkdir(parents=True, exist_ok=True)
    results_dir.mkdir(parents=True, exist_ok=True)

    write_json(problems, public_dir / "problems.json")
    write_json(summary, public_dir / "summary.json")
    write_json(problems, results_dir / "problems.json")
    write_json(summary, results_dir / "summary.json")
    write_csv(problems, results_dir / "problems.csv")


if __name__ == "__main__":
    main()
