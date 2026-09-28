# Phase Status

| Phase | Status | Evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation | In progress | Documentation constitution; typed contracts; policy engine; PostgreSQL migration/outbox boundary; provider-unavailable adapters; reference-aligned responsive Next.js Control Center; Docker/WSL installed; PostgreSQL, Redis and Temporal healthy; foundation migration applied; authenticated idempotent run creation; Temporal dispatch; worker activity; PostgreSQL-backed dashboard projection; production build and 6 workflow/policy tests passing | Approve and implement the first permitted free-public-web research source adapter |
| 1 — Control Center/workflows | In progress | Real overview, runtime health, workflow state and immutable event projections render from the API; verified run transitioned `created` → `queued` → `waiting` with a genuine `provider.unavailable` event | Owner-facing authenticated start/pause/resume/stop controls and SSE live updates |
| 2 — Opportunity research | Not started | — | Phase 1 workflow |
| 3 — Product strategy | Not started | — | Phase 2 evidence |
| 4 — Figma/design review | Not started | — | Verified Figma/designer access and license review |
| 5–12 | Not started | — | Earlier phase acceptance |

Known constraints: no external research/LLM provider is configured, so research runs stop honestly in `waiting` and cannot yet produce opportunities. The Control Center uses request-time API projections; SSE and owner-facing command controls are not implemented. The verified local run created no fabricated evidence, metrics, opportunities, or projects. GitHub is canonical and receives coherent commits before local handoff.
