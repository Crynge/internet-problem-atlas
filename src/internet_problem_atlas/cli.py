from __future__ import annotations

import argparse

from .generator import build_summary, ensure_parent, generate_problem_records
from .reporting import write_csv, write_json
from .search import search_problems


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate and search a large internet problem atlas.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate_parser = subparsers.add_parser("generate", help="Generate atlas artifacts")
    generate_parser.add_argument("--json-out", default=None)
    generate_parser.add_argument("--summary-out", default=None)
    generate_parser.add_argument("--csv-out", default=None)

    search_parser = subparsers.add_parser("search", help="Search atlas records")
    search_parser.add_argument("--query", required=True)
    search_parser.add_argument("--limit", type=int, default=10)

    args = parser.parse_args()
    problems = generate_problem_records()

    if args.command == "generate":
        summary = build_summary(problems)
        if args.json_out:
            ensure_parent(args.json_out)
            write_json(problems, args.json_out)
        if args.summary_out:
            ensure_parent(args.summary_out)
            write_json(summary, args.summary_out)
        if args.csv_out:
            ensure_parent(args.csv_out)
            write_csv(problems, args.csv_out)
        print(f"Generated {len(problems)} problems across {summary['vertical_count']} verticals.")

    if args.command == "search":
        matches = search_problems(problems, args.query, limit=args.limit)
        for item in matches:
            print(f"{item['id']}: {item['problem_title']} ({item['opportunity_score']})")
