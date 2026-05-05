import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import './App.css'

type Problem = {
  id: string
  vertical_slug: string
  vertical: string
  sector: string
  macro_theme: string
  problem_slug: string
  problem_title: string
  user_phrase: string
  why_now_2026: string
  severity_score: number
  urgency_score: number
  frequency_score: number
  opportunity_score: number
  ai_fit_score: number
  evidence_sources: string[]
  evidence_links: string[]
  solution_direction: string
  keywords: string[]
}

type Summary = {
  generated_at: string
  total_problems: number
  vertical_count: number
  macro_theme_count: number
  macro_theme_counts: Record<string, number>
  average_opportunity_score: number
  average_ai_fit_score: number
  top_problems: Problem[]
  sources: Record<string, { label: string; date: string; url: string }>
}

async function loadJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`)
  }
  return response.json() as Promise<T>
}

function App() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [macroTheme, setMacroTheme] = useState('all')
  const [vertical, setVertical] = useState('all')

  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    async function load() {
      try {
        const [loadedProblems, loadedSummary] = await Promise.all([
          loadJson<Problem[]>('/problems.json'),
          loadJson<Summary>('/summary.json'),
        ])
        startTransition(() => {
          setProblems(loadedProblems)
          setSummary(loadedSummary)
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load atlas data.')
      }
    }

    void load()
  }, [])

  const macroThemes = useMemo(
    () => ['all', ...Object.keys(summary?.macro_theme_counts ?? {}).sort()],
    [summary],
  )
  const verticals = useMemo(
    () => ['all', ...Array.from(new Set(problems.map((problem) => problem.vertical))).sort()],
    [problems],
  )

  const filteredProblems = useMemo(() => {
    const queryWords = deferredQuery
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    return problems.filter((problem) => {
      if (macroTheme !== 'all' && problem.macro_theme !== macroTheme) return false
      if (vertical !== 'all' && problem.vertical !== vertical) return false
      if (!queryWords.length) return true

      const haystack = [
        problem.problem_title,
        problem.user_phrase,
        problem.why_now_2026,
        problem.vertical,
        problem.macro_theme,
        ...problem.keywords,
      ]
        .join(' ')
        .toLowerCase()

      return queryWords.every((word) => haystack.includes(word))
    })
  }, [deferredQuery, macroTheme, problems, vertical])

  const topFiltered = useMemo(
    () =>
      [...filteredProblems]
        .sort(
          (left, right) =>
            right.opportunity_score - left.opportunity_score ||
            right.severity_score - left.severity_score,
        )
        .slice(0, 18),
    [filteredProblems],
  )

  const visibleThemeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const problem of filteredProblems) {
      counts.set(problem.macro_theme, (counts.get(problem.macro_theme) ?? 0) + 1)
    }
    return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]).slice(0, 6)
  }, [filteredProblems])

  if (error) {
    return (
      <main className="shell shell--centered">
        <p className="eyebrow">Internet Problem Atlas</p>
        <h1>Atlas load failed</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!summary) {
    return (
      <main className="shell shell--centered">
        <p className="eyebrow">Internet Problem Atlas</p>
        <h1>Loading atlas</h1>
      </main>
    )
  }

  return (
    <main className="shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">May 6, 2026 internet pain synthesis</p>
          <h1>1,296 ranked internet problems across many verticals, grounded in current scam, trust, CX, and identity signals.</h1>
          <p className="body-copy">
            This atlas turns repeated public 2026 pain patterns into an explorable product surface. It is meant for founders,
            operators, researchers, and product teams who need to see where the internet still hurts most.
          </p>
          <div className="hero-stats">
            <article>
              <span>Problems</span>
              <strong>{summary.total_problems}</strong>
            </article>
            <article>
              <span>Verticals</span>
              <strong>{summary.vertical_count}</strong>
            </article>
            <article>
              <span>Macro themes</span>
              <strong>{summary.macro_theme_count}</strong>
            </article>
            <article>
              <span>Avg opportunity</span>
              <strong>{summary.average_opportunity_score}</strong>
            </article>
          </div>
        </div>
        <div className="source-board">
          {Object.values(summary.sources)
            .slice(0, 6)
            .map((source) => (
              <article key={source.label} className="source-card">
                <span>{source.date}</span>
                <strong>{source.label}</strong>
                <a href={source.url} target="_blank" rel="noreferrer">
                  Open source
                </a>
              </article>
            ))}
        </div>
      </section>

      <section className="control-panel">
        <label>
          Search problems
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="refund delay, fake seller, deepfake voice, account takeover"
          />
        </label>
        <label>
          Macro theme
          <select value={macroTheme} onChange={(event) => setMacroTheme(event.target.value)}>
            {macroThemes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          Vertical
          <select value={vertical} onChange={(event) => setVertical(event.target.value)}>
            {verticals.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="overview-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Top 2026 queues</p>
              <h2>Highest-opportunity pain clusters</h2>
            </div>
            <span className="tag">{filteredProblems.length} visible</span>
          </div>
          <div className="top-list">
            {topFiltered.slice(0, 8).map((problem) => (
              <article key={problem.id} className="problem-card">
                <div className="problem-card__header">
                  <span className={`theme-pill theme-pill--${problem.macro_theme}`}>{problem.macro_theme}</span>
                  <span className="score-pill">{problem.opportunity_score}</span>
                </div>
                <h3>{problem.problem_title}</h3>
                <p>{problem.user_phrase}</p>
                <div className="problem-card__meta">
                  <span>{problem.vertical}</span>
                  <span>AI fit {problem.ai_fit_score}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Theme pressure</p>
              <h2>Most repeated filtered themes</h2>
            </div>
          </div>
          <div className="theme-bars">
            {visibleThemeCounts.map(([theme, count]) => (
              <article key={theme} className="theme-row">
                <div className="theme-row__header">
                  <strong>{theme}</strong>
                  <span>{count}</span>
                </div>
                <div className="meter">
                  <span style={{ width: `${(count / filteredProblems.length) * 100}%` }}></span>
                </div>
              </article>
            ))}
          </div>
          <div className="source-note">
            <p>
              The fraud-heavy skew is intentional. Current May 2026 public signals strongly over-index on scam, identity,
              and trust erosion, while support and billing pain stay structurally persistent.
            </p>
          </div>
        </article>
      </section>

      <section className="problem-grid">
        {topFiltered.map((problem) => (
          <article key={problem.id} className="detail-card">
            <div className="detail-card__header">
              <span className={`theme-pill theme-pill--${problem.macro_theme}`}>{problem.macro_theme}</span>
              <span className="score-pill">Opp {problem.opportunity_score}</span>
            </div>
            <h3>{problem.problem_title}</h3>
            <p className="detail-card__quote">{problem.user_phrase}</p>
            <p className="detail-card__why">{problem.why_now_2026}</p>
            <div className="score-grid">
              <span>Severity {problem.severity_score}</span>
              <span>Urgency {problem.urgency_score}</span>
              <span>Frequency {problem.frequency_score}</span>
              <span>AI fit {problem.ai_fit_score}</span>
            </div>
            <div className="detail-card__footer">
              <strong>{problem.vertical}</strong>
              <p>{problem.solution_direction}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
