# Phase Status

Last verified: 2026-10-04. Git references are added after the implementation commits are created; planned work is not counted as complete.

## Product roadmap

| Product phase | Status | Verified evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation and first vertical slice | Largely complete | PostgreSQL, Redis, Temporal, authenticated API, worker, real public evidence, owner decision controls, responsive Control Center, one-command startup | SSE and pause/resume/stop remain engineering gaps |
| 1 — Market validation and opportunity discovery | In progress | First-class MarketStudy schema/API/workflow/UI; explainable scoring; fact/observation/inference/unknown claims; 3 real Webmasters candidates persisted; comparison screen visually verified | Broader authorized demand, live SERP, competitor, geography, defensibility and maintenance-cost evidence |
| 2 — Minimum Marketable Public Website | Not started | Entry criteria documented in `25_PHASE_2_ENTRY_CRITERIA.md` | Evidence gates plus explicit owner approval |
| 3–15 | Not started | — | Earlier product phases |

## Latest verification

- Start point: local `main` and `origin/main` both at `90ddf54`; unrelated untracked lecture file preserved.
- Baseline: typecheck, 8 tests, and production build passed before changes.
- Current automated suite: 23 tests passed across contracts, provider, API authorization, database migration contract, and worker candidate/idempotency behavior; full typecheck and production build passed.
- Cold start: first attempt exposed a PostgreSQL-ready race; no data loss occurred. `pg_isready` gating fixed it. Second `pnpm dev` run applied `0003_market_studies.sql` and reported UI/API/PostgreSQL/Temporal healthy.
- Real study: `fe8ada8f-8ebb-4c71-ac36-81f056c57321`; workflow `15712745-6d48-48d0-8b02-4ea595b59aa4`; state `awaiting_review` / `awaiting_approval`; 3 opportunities, 24 dimension findings, 3 attributed evidence records, zero paid budget.
- Browser: Market Validation brief, genuine workflow state, comparison table, evidence coverage, classifications, risks/unknowns and runtime health rendered at `http://localhost:3000/`.

## Current limitations

The one official Stack Exchange Webmasters request supplies public Q&A problem-engagement evidence only. It does not validate Google search volume, ranking difficulty, SERP weakness, competitor traffic, backlink counts, geography, commercial intent, defensibility, or product-market fit. All candidates correctly recommend `RESEARCH_MORE`. No opportunity has been selected and Phase 2 has not started. Figma, LLM, analytics, Search Console, deployment, paid providers, revenue, and production infrastructure remain unconfigured.
