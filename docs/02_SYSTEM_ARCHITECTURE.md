# System Architecture

The system separates Control Center UI, API, orchestration, agent runtime, provider adapters, persistent data, event history, knowledge, analytics, and infrastructure. `apps/control-center` is a Next.js read/control client; `apps/api` owns authenticated commands, query projections, OpenAPI and SSE; `apps/worker` runs Temporal workflows; shared boundaries are TypeScript/Zod contracts.

PostgreSQL is authoritative for command state, workflow projections, approvals, budgets, projects, evidence, and audit records. State-changing transactions write an outbox event in the same transaction. A relay publishes persisted events; SSE only streams a projection and is not a source of truth. Temporal supplies durable scheduling/retries; Redis supports its required runtime topology, not durable business truth.

Provider adapters isolate vendor SDKs and expose capability/availability checks. Unconfigured adapters return a typed unavailable result. See `ARCHITECTURE.md` for implementation boundaries.
