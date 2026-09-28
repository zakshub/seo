# Local Development

Prerequisites: Node 24+, pnpm 11+, Git, Docker Desktop with WSL 2 (for PostgreSQL/Redis/Temporal), and an authenticated GitHub CLI only for repository operations. Copy `.env.example` to `.env` locally; never commit it. Run `pnpm infra:up`, install with `pnpm install`, then run the API, worker, and Control Center via workspace scripts. Verify the three runtime ports with `pnpm infra:status`: PostgreSQL `5432`, Redis `6379`, and Temporal `7233`.

No external provider configuration is needed for the repository foundation. Apply `packages/db/migrations/0001_foundation.sql` to the local `venture_os` database before running application services. Database migrations and test data must be explicit and local; do not substitute production services.

Set a local-only `LOCAL_OWNER_TOKEN`, then start the API with `pnpm --filter @venture/api dev`, the worker with `pnpm --filter @venture/worker dev`, and the UI with `pnpm --filter @venture/control-center dev`. The API listens on `127.0.0.1:4000`; `GET /api/health`, `GET /api/overview`, and `GET /api/activity` are public local diagnostics. `POST /api/workflows/research` requires the `x-local-owner-token` header matching `LOCAL_OWNER_TOKEN` and an `idempotency-key`. Never commit or log the token.

The UI reads the API server-side through `API_INTERNAL_URL`, defaulting to `http://127.0.0.1:4000/api`. With no approved research adapter, a valid run is dispatched through Temporal and ends in `waiting` with a persisted `provider.unavailable` event. This is the expected honest behavior, not an installation failure.
