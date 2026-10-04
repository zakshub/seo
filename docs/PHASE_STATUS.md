# Phase Status

Last verified: 2026-10-04. Git references are added after the implementation commits are created; planned work is not counted as complete.

## Product roadmap

| Product phase | Status | Verified evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation and first vertical slice | Largely complete | PostgreSQL, Redis, Temporal, authenticated API, worker, real public evidence, owner decision controls, responsive Control Center, one-command startup | SSE and pause/resume/stop remain engineering gaps |
| 1 — Market validation and opportunity discovery | In progress | Phase 1.5 capability model; Stack Exchange problem evidence; Wikimedia topic-interest evidence; official Pakistan context; direct/proxy, confidence, freshness and conflict rules; persisted provider attempts; 11-dimension scoring; Phase 2 readiness gate | Credentials/approval for direct search demand and lawful live SERP evidence; bounded competitor, click-potential, commercial-intent and authority evidence; stronger Urdu evidence |
| 2 — Minimum Marketable Public Website | Not started | Entry criteria documented in `25_PHASE_2_ENTRY_CRITERIA.md` | Evidence gates plus explicit owner approval |
| 3–15 | Not started | — | Earlier product phases |

## Latest verification

### Brave SERP readiness and keyword-demand decision

- Continuation start point: local and `origin/main` at `3881053`; the interrupted Phase 1.5 working tree was reviewed in place and the unrelated untracked lecture file was preserved.
- Migration `0006_brave_serp_readiness.sql` applied cleanly to the existing database. Its live schema has the expanded attempt-status constraint, non-negative study budget, rate-limit/error/cost fields, raw-artifact table and bounded competitor-observation fields.
- Brave state is **ADAPTER READY / CREDENTIAL MISSING**. It is not `AVAILABLE`. A credential alone would change the next blocker to **BUDGET APPROVAL MISSING**; only a real successful approved request may mark live SERP evidence available.
- The adapter preflights a non-empty approval reference, positive cents, positive maximum request count, projected batch cost and request count before any egress. Temporal automatically retries the combined billable activity zero times (`maximumAttempts: 1`), so a failure cannot silently repeat a paid call beyond its approved boundary.
- Contract coverage verifies missing credential, missing/zero approval, insufficient budget, excessive request count, normalized ranks/result types, repeated domains, SERP features, intent, bounded specialization, sanitized raw provenance, provider failure, rate limiting and retained partial batches.
- Local no-credential study `5bbfd85f-413c-44cd-bd5e-716d637da497` persisted Brave as `unavailable` with zero requests, zero estimated/paid cost, no raw artifacts and no competitor rows. Its broad verification brief produced too few problem-source candidates, so the study honestly failed rather than fabricating three opportunities.
- The Control Center renders `CREDENTIAL MISSING`, the provider limitation, and `Build remains locked`. `pnpm dev:status` reports UI, API, PostgreSQL and Temporal healthy.
- ADR 0009 recommends exactly one initial demand provider: DataForSEO Google Ads Search Volume Live. It is proposed only—not implemented or called—and requires owner/provider/budget approval before development or credential use.
- Final automated results: 43 tests passed across contracts, providers, API, database and worker; workspace typecheck passed; production build passed. Phase 2 remains **NOT STARTED**.

- Continuation start point: local and `origin/main` at `c1196aa`; unrelated untracked lecture file preserved.
- Migration `0005_evidence_quality_and_provider_attempts.sql` applied cleanly. It adds direct/proxy nature, observation and freshness times, geography, idempotent provider-run attempts, and bounded competitor-observation storage.
- Real study: `2e116374-5e20-4767-8785-1ce9aa641613`; workflow `8153ad20-3626-4c24-99f7-b611a591bf70`; `awaiting_review` / `awaiting_approval`; zero paid cost; three `RESEARCH_MORE` candidates scoring 27, 23 and 23.
- Provider outcomes were persisted, including `available` Stack Exchange, `partial` Wikimedia (Urdu article HTTP 404), `available` World Bank Pakistan context, and explicit `unavailable` outcomes for Brave Search, Google Ads Keyword Planner, Google Trends alpha, Search Console, keyword discovery and authority evidence.
- The official World Bank indicator recorded 57.253% of Pakistan's population using the internet for 2024 at 0.80 confidence. This is stored and displayed as a geographic-context proxy, never as search demand or willingness to pay.
- Every candidate remains blocked by UNKNOWN demand, SERP reality, competitor quality and click potential. A live approval attempt returned HTTP 409; project count remained zero.
- Final automated verification: 38 tests passed across contracts, providers, API, database and worker; the full workspace typecheck and production build passed.
- Runtime health reports UI, API, PostgreSQL and Temporal available. Server-rendered Control Center HTML contains the Build lock, candidate blockers, evidence nature, provider availability/limitations and provider documentation links.

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

The official Stack Exchange and Wikimedia observations supply public problem engagement and directional topic interest only. The World Bank observation supplies Pakistan digital-access context only. None validates Google search volume, keyword difficulty, SERP weakness/composition, competitor traffic/quality, backlink counts, click potential, commercial intent, authority requirements, defensibility, or product-market fit. The provider-independent Brave Search adapter is **ADAPTER READY / CREDENTIAL MISSING**, while DataForSEO is only the proposed demand-provider decision; neither has produced evidence. No call or metric substitution occurs. All candidates correctly recommend `RESEARCH_MORE`. No opportunity has been selected and Phase 2 has not started. Figma, LLM, analytics, Search Console, deployment, paid providers, revenue, and production infrastructure remain unconfigured.
