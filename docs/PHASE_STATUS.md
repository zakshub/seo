# Phase Status

| Phase | Status | Evidence | Next dependency |
|---|---|---|---|
| 0 — Foundation | In progress | Documentation constitution; typed contracts; policy engine; PostgreSQL migrations/outbox boundary; provider adapters; responsive Next.js Control Center; Docker/WSL; PostgreSQL, Redis and Temporal; authenticated idempotent run creation; Temporal worker; API-backed projections; production build | Owner-facing command controls and SSE |
| 1 — Control Center/workflows | In progress | Real overview, runtime health, workflow state, candidates and immutable events render from the API; verified workflow reached `awaiting_approval` | Authenticated start/pause/resume/stop and approve/reject controls; SSE live updates |
| 2 — Opportunity research | In progress | Official Stack Exchange API adapter; source policy/backoff handling; provenance and integrity hashes; three real candidates and evidence URLs persisted; transparent scorecards; one pending approval; 8 policy/provider tests passing | Add broader SEO/SERP evidence before treating any candidate as build-worthy |
| 3 — Product strategy | Not started | — | Phase 2 evidence |
| 4 — Figma/design review | Not started | — | Verified Figma/designer access and license review |
| 5–12 | Not started | — | Earlier phase acceptance |

Known constraints: Stack Exchange evidence covers developer problem engagement only; it does not establish Google search demand, SERP weakness, or commercial viability. No LLM, keyword-volume, SERP, analytics, Figma, deployment, or paid provider is configured. The Control Center uses request-time projections; SSE and owner-facing command controls are not implemented. The three current candidates are research fixtures backed by live captured evidence, not approved projects. GitHub is canonical.
