# Phase Status

| Phase | Status | Evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation | In progress | Documentation constitution; typed contracts; policy engine; PostgreSQL migration/outbox boundary; provider-unavailable adapters; responsive Next.js Control Center; production build and 6 workflow/policy tests passing | Docker Desktop and runtime application wiring |
| 1 — Control Center/workflows | Not started | — | Phase 0 contracts/persistence |
| 2 — Opportunity research | Not started | — | Phase 1 workflow |
| 3 — Product strategy | Not started | — | Phase 2 evidence |
| 4 — Figma/design review | Not started | — | Verified Figma/designer access and license review |
| 5–12 | Not started | — | Earlier phase acceptance |

Known constraints: Docker is not installed on this machine; no external provider is configured; the Control Center transport and Temporal worker are defined but not yet runnable. GitHub is canonical and receives coherent commits before local handoff.
