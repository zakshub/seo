# Local Development

Prerequisites: Node 26+, pnpm 11+, Git, Docker Desktop (for PostgreSQL/Redis/Temporal), and an authenticated GitHub CLI only for repository operations. Copy `.env.example` to `.env` locally; never commit it. Start infrastructure with Compose, install with `pnpm install`, then run the API, worker, and Control Center via workspace scripts.

No external provider configuration is needed for the repository foundation. Database migrations and test data must be explicit and local; do not substitute production services.
