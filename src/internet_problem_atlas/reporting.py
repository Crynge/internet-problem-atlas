from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any


def write_json(data: Any, path: str | Path) -> None:
    Path(path).write_text(json.dumps(data, indent=2), encoding="utf-8")


def write_csv(problems: list[dict[str, Any]], path: str | Path) -> None:
    fieldnames = [
        "id",
        "vertical",
        "sector",
        "macro_theme",
        "problem_title",
        "severity_score",
        "urgency_score",
        "frequency_score",
        "opportunity_score",
        "ai_fit_score",
        "solution_direction",
    ]
    with Path(path).open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for problem in problems:
            writer.writerow({key: problem[key] for key in fieldnames})
