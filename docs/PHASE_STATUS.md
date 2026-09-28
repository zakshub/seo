# Phase Status

| Phase | Status | Evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation | In progress | Documentation constitution; typed contracts; policy engine; PostgreSQL migration/outbox boundary; provider-unavailable adapters; reference-aligned responsive Next.js Control Center; Docker/WSL installed; PostgreSQL, Redis and Temporal ports healthy; foundation migration applied; NestJS API health/overview and authenticated idempotent research-run command verified; production build, live browser QA, and 6 workflow/policy tests passing | Temporal worker dispatch and Control Center API projection wiring |
| 1 — Control Center/workflows | Not started | — | Phase 0 contracts/persistence |
| 2 — Opportunity research | Not started | — | Phase 1 workflow |
| 3 — Product strategy | Not started | — | Phase 2 evidence |
| 4 — Figma/design review | Not started | — | Verified Figma/designer access and license review |
| 5–12 | Not started | — | Earlier phase acceptance |

Known constraints: no external research/LLM provider is configured; research runs can be persisted but cannot perform source work; the Control Center transport and Temporal worker are not yet wired to the API. GitHub is canonical and receives coherent commits before local handoff.
