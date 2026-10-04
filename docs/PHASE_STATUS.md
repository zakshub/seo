# Phase Status

Last verified: 2026-10-04. Git references are added after the implementation commits are created; planned work is not counted as complete.

## Product roadmap

| Product phase | Status | Verified evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation and first vertical slice | Largely complete | PostgreSQL, Redis, Temporal, authenticated API, worker, real public evidence, owner decision controls, responsive Control Center, one-command startup | SSE and pause/resume/stop remain engineering gaps |
| 1 — Market validation and opportunity discovery | In progress | Phase 1.5 capability model; Stack Exchange problem evidence; Wikimedia topic-interest evidence; 11-dimension scoring; Phase 2 readiness gate; provider-status and open-source review UI | Authorized search demand, live SERP, competitor, click-potential, Urdu/local-market and authority evidence |
| 2 — Minimum Marketable Public Website | Not started | Entry criteria documented in `25_PHASE_2_ENTRY_CRITERIA.md` | Evidence gates plus explicit owner approval |
| 3–15 | Not started | — | Earlier product phases |

## Latest verification

- Phase 1.5 start point: local and `origin/main` at `aa0c512`; implementation commit `7874d69`; unrelated untracked lecture file preserved.
- Baseline and final automated verification: 30 tests passed, workspace typecheck passed, and production build passed.
- Migration `0004_market_evidence_expansion.sql` applied cleanly. It records normalized evidence measurements, per-study provider availability, modern score/readiness, 12 open-source reviews, and seven explicitly non-binding historical heuristics.
- Real study: `60621e55-52d0-403e-8de1-ea12bba84dba`; workflow `6e21b667-3b25-4580-a721-cebd1dbe4a21`; `awaiting_review` / `awaiting_approval`; zero paid cost; three `RESEARCH_MORE` candidates.
- Real evidence: official Stack Exchange source-page observations (63,139; 42,464; 20,773 views) plus official Wikimedia 29-day article pageview sums for Search engine optimization (57,241) and Google Search Console (7,619). These are explicitly stored with `absoluteSearchDemand: false`. The requested Urdu article returned HTTP 404 and is retained as a partial-source limitation.
- Missing capabilities are persisted rather than simulated: Google Trends alpha, keyword demand, live SERP, competitors/click potential, and Search Console are unavailable. Every new candidate has Phase 2 readiness false; a direct approval attempt was rolled back and project count remained zero.
- Runtime health reports UI, API, PostgreSQL and Temporal available. Server-rendered Control Center HTML contains the exact study brief, evidence capability status, research-more gate, Wikimedia provider and 12-tool open-source review. Automated in-app browser attachment was blocked by local-URL browser policy, so no unsupported visual-verification claim is made.

- Start point: local `main` and `origin/main` both at `90ddf54`; unrelated untracked lecture file preserved.
- Baseline: typecheck, 8 tests, and production build passed before changes.
- Current automated suite: 23 tests passed across contracts, provider, API authorization, database migration contract, and worker candidate/idempotency behavior; full typecheck and production build passed.
- Cold start: first attempt exposed a PostgreSQL-ready race; no data loss occurred. `pg_isready` gating fixed it. Second `pnpm dev` run applied `0003_market_studies.sql` and reported UI/API/PostgreSQL/Temporal healthy.
- Real study: `fe8ada8f-8ebb-4c71-ac36-81f056c57321`; workflow `15712745-6d48-48d0-8b02-4ea595b59aa4`; state `awaiting_review` / `awaiting_approval`; 3 opportunities, 24 dimension findings, 3 attributed evidence records, zero paid budget.
- Browser: Market Validation brief, genuine workflow state, comparison table, evidence coverage, classifications, risks/unknowns and runtime health rendered at `http://localhost:3000/`.

## Current limitations

The official Stack Exchange and Wikimedia observations supply public problem engagement and directional topic interest only. They do not validate Google search volume, keyword difficulty, SERP weakness/composition, competitor traffic/quality, backlink counts, click potential, geography, commercial intent, authority requirements, defensibility, or product-market fit. All new candidates correctly recommend `RESEARCH_MORE`. No opportunity has been selected and Phase 2 has not started. Figma, LLM, analytics, Search Console, deployment, paid providers, revenue, and production infrastructure remain unconfigured.
