# Autonomous Web Venture Operating System

A safety-first control plane for researching, deciding, building, operating, and learning from web ventures. This repository is deliberately not an SEO dashboard or a fake agent demo: every displayed action must be backed by persisted workflow state, events, evidence, or an explicit unavailable status.

## Run locally

From `D:\\codex\\seo`, run `pnpm dev`. This single command starts Docker Desktop when needed, starts PostgreSQL/Redis/Temporal, applies local migrations, generates an in-memory owner session token, and launches the API, worker, and Control Center. Open `http://localhost:3000`. Press `Ctrl+C` in that terminal to stop application processes. Run `pnpm dev:status` for a quick health check.

## Current status

Phase 0's first vertical slice is largely complete. Phase 1.5 Market Evidence Expansion is active: the authenticated Control Center creates durable Market Studies, records official/public problem and topic-interest evidence plus Pakistan geographic context, distinguishes direct evidence from proxies, persists partial and failed provider attempts, displays freshness/confidence/limitations, compares candidates with an 11-dimension score and blocks project creation while Phase 2 evidence is incomplete. The provider-neutral Brave adapter is execution-ready but cannot make a request without a credential plus explicit scoped budget approval. DataForSEO is proposed—not integrated—as the initial keyword-demand provider pending owner approval. No paid call, deployment, DNS change, Figma action, analytics connection, Search Console property, or model provider is configured by default. Phase 2 has not started.

## Stack

TypeScript, pnpm workspaces, Next.js, NestJS, Temporal, PostgreSQL, Redis, Zod, Vitest, and Playwright. PostgreSQL is the system of record; events use a transactional outbox. See [architecture](docs/ARCHITECTURE.md) and [local development](docs/LOCAL_DEVELOPMENT.md).

## Safety principles

- Never invent research, metrics, provider work, deployment, or agent activity.
- No secret belongs in source, logs, events, UI payloads, fixtures, or documentation.
- Manual, Supervised, and Auto Pilot are policy modes; hard-gated actions remain gated in every mode.
- Production, DNS, domains, paid services, secrets, major infrastructure, and high-risk categories require explicit authorization.

## Repository map

`apps/` contains deployable services; `packages/` shared contracts, persistence, UI, and adapters; `docs/` is the product and architecture source; `infrastructure/` contains local/runtime topology; `tests/` holds cross-package acceptance tests.

Read [docs/00_READ_ME_FIRST.md](docs/00_READ_ME_FIRST.md) before changing the system.
